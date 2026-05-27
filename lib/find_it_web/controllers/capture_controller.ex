defmodule FindItWeb.CaptureController do
  use FindItWeb, :controller

  require Logger

  @request_timeout 10_000
  @max_image_bytes 5_000_000

  def capture(conn, _params) do
    esp32_url = Application.get_env(:find_it, :esp32_url, "http://findit-esp.local")
    url = String.trim_trailing(esp32_url, "/") <> "/capture"

    case fetch_from_esp(url) do
      {:ok, jpeg} ->
        filename = "#{Ecto.UUID.generate()}.jpg"
        uploads_dir = Path.join([:code.priv_dir(:find_it), "static", "uploads"])
        dest = Path.join(uploads_dir, filename)

        File.mkdir_p!(uploads_dir)
        File.write!(dest, jpeg)

        json(conn, %{image_url: "/uploads/#{filename}"})

      {:error, :timeout} ->
        Logger.warning("ESP32 capture timed out at #{url}")

        conn
        |> put_status(504)
        |> json(%{error: "esp_timeout"})

      {:error, :payload_too_large} ->
        Logger.warning("ESP32 returned oversized payload at #{url}")

        conn
        |> put_status(502)
        |> json(%{error: "esp_payload_too_large"})

      {:error, reason} ->
        Logger.warning("ESP32 capture failed at #{url}: #{inspect(reason)}")

        conn
        |> put_status(502)
        |> json(%{error: "esp_unreachable"})
    end
  end

  defp fetch_from_esp(url) do
    request = Finch.build(:get, url)

    case Finch.request(request, FindIt.Finch,
           receive_timeout: @request_timeout,
           pool_timeout: @request_timeout
         ) do
      {:ok, %Finch.Response{status: 200, body: body}}
      when byte_size(body) > 0 and byte_size(body) <= @max_image_bytes ->
        {:ok, body}

      {:ok, %Finch.Response{status: 200, body: body}}
      when byte_size(body) > @max_image_bytes ->
        {:error, :payload_too_large}

      {:ok, %Finch.Response{status: status}} ->
        {:error, {:bad_status, status}}

      {:error, %Mint.TransportError{reason: :timeout}} ->
        {:error, :timeout}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
