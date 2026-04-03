defmodule FindItWeb.Esp32Controller do
  use FindItWeb, :controller

  def upload(conn, %{"image" => %Plug.Upload{} = upload} = params) do
    filename = "#{Ecto.UUID.generate()}.jpg"
    uploads_dir = Path.join([:code.priv_dir(:find_it), "static", "uploads"])
    dest = Path.join(uploads_dir, filename)

    File.mkdir_p!(uploads_dir)
    File.cp!(upload.path, dest)

    image_url = "/uploads/#{filename}"
    location_name = Map.get(params, "location", "Secretaria")

    case create_item(image_url, location_name) do
      {:ok, item} ->
        %{item_id: item.id}
        |> FindIt.Workers.AiPipelineWorker.new()
        |> Oban.insert()

        json(conn, %{ok: true, item_id: item.id, code: item.code})

      {:error, reason} ->
        conn
        |> put_status(422)
        |> json(%{ok: false, error: inspect(reason)})
    end
  end

  def upload(conn, _params) do
    conn
    |> put_status(400)
    |> json(%{ok: false, error: "missing image field"})
  end

  defp create_item(image_url, location_name) do
    location_id =
      case Ash.get(FindIt.Catalog.Location, [name: location_name], domain: FindIt.Catalog) do
        {:ok, loc} -> loc.id
        _ -> nil
      end

    Ash.create(FindIt.Inventory.Item, %{
      image_url: image_url,
      found_at: Date.utc_today(),
      location_id: location_id
    }, domain: FindIt.Inventory)
  end
end
