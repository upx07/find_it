defmodule FindIt.Workers.AiPipelineWorker do
  use Oban.Worker, queue: :ai_pipeline, max_attempts: 3

  require Logger

  @llm_endpoint "https://api.openai.com/v1/chat/completions"
  @llm_model "gpt-4o-mini"
  @llm_timeout 60_000

  @prompt """
  Analise a imagem de um objeto encontrado em uma universidade brasileira.
  Responda APENAS com JSON válido, sem markdown, no seguinte formato:
  {
    "description": "descrição detalhada do objeto em português",
    "category": "uma das opções: Eletrônicos, Documentos, Vestuário, Acessórios, Chaves, Outros",
    "tags": ["tag1", "tag2", "tag3"]
  }
  """

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"item_id" => item_id}}) do
    item = Ash.get!(FindIt.Inventory.Item, item_id, domain: FindIt.Inventory)

    with {:ok, image_base64} <- read_image(item.image_url),
         {:ok, result} <- call_llm(image_base64) do
      description = if is_nil(item.description) or item.description == "", do: result.description, else: item.description

      item
      |> Ash.Changeset.for_update(:mark_ai_processed, %{
        description: description,
        ai_tags: result.tags
      })
      |> Ash.update!(domain: FindIt.Inventory)

      Logger.info("AI pipeline ok for item #{item_id}")
      :ok
    else
      {:error, reason} ->
        Logger.error("AI pipeline failed for item #{item_id}: #{inspect(reason)}")
        {:error, reason}
    end
  end

  defp read_image(image_url) do
    path =
      Path.join([
        :code.priv_dir(:find_it),
        "static",
        String.trim_leading(image_url, "/")
      ])

    case File.read(path) do
      {:ok, data} -> {:ok, Base.encode64(data)}
      {:error, reason} -> {:error, "failed to read image: #{reason}"}
    end
  end

  defp call_llm(image_base64) do
    api_key = Application.get_env(:find_it, :openai_api_key)

    if is_nil(api_key) or api_key == "" do
      {:error, :missing_openai_api_key}
    else
      do_call_llm(api_key, image_base64)
    end
  end

  defp do_call_llm(api_key, image_base64) do
    body =
      Jason.encode!(%{
        model: @llm_model,
        # Força a OpenAI a devolver JSON puro (sem markdown), senão o parse falha.
        response_format: %{type: "json_object"},
        messages: [
          %{
            role: "user",
            content: [
              %{
                type: "image_url",
                image_url: %{url: "data:image/jpeg;base64,#{image_base64}"}
              },
              %{type: "text", text: @prompt}
            ]
          }
        ],
        max_tokens: 300
      })

    request =
      Finch.build(:post, @llm_endpoint, [
        {"content-type", "application/json"},
        {"authorization", "Bearer #{api_key}"}
      ], body)

    case Finch.request(request, FindIt.Finch, receive_timeout: @llm_timeout) do
      {:ok, %Finch.Response{status: 200, body: body}} ->
        parse_llm_response(body)

      {:ok, %Finch.Response{status: status, body: body}} ->
        {:error, "LLM API error #{status}: #{body}"}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp parse_llm_response(body) do
    with {:ok, response} <- Jason.decode(body),
         content when is_binary(content) <-
           get_in(response, ["choices", Access.at(0), "message", "content"]),
         {:ok, result} <- Jason.decode(strip_code_fences(content)) do
      {:ok, %{description: result["description"], tags: result["tags"] || []}}
    else
      other -> {:error, "failed to parse LLM response: #{inspect(other)}"}
    end
  end

  # Remove cercas ```json ... ``` que alguns modelos adicionam mesmo com
  # response_format=json_object desativado em fallback.
  defp strip_code_fences(content) do
    content
    |> String.trim()
    |> String.replace(~r/^```(?:json)?\s*/i, "")
    |> String.replace(~r/\s*```$/, "")
    |> String.trim()
  end
end
