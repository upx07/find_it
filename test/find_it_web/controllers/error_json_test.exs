defmodule FindItWeb.ErrorJSONTest do
  use FindItWeb.ConnCase, async: true

  test "renders 404" do
    assert FindItWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{detail: "Not Found"}}
  end

  test "renders 500" do
    assert FindItWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end
