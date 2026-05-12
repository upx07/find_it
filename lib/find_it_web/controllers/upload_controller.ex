defmodule FindItWeb.UploadController do
  use FindItWeb, :controller

  def upload(conn, %{"image" => %Plug.Upload{} = upload}) do
    filename = "#{Ecto.UUID.generate()}.jpg"
    uploads_dir = Path.join([:code.priv_dir(:find_it), "static", "uploads"])
    dest = Path.join(uploads_dir, filename)

    File.mkdir_p!(uploads_dir)
    File.cp!(upload.path, dest)

    json(conn, %{image_url: "/uploads/#{filename}"})
  end

  def upload(conn, _params) do
    conn
    |> put_status(400)
    |> json(%{error: "missing image field"})
  end
end
