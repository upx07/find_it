defmodule FindItWeb.AshTypescriptRpcController do
  use FindItWeb, :controller

  def run(conn, params) do
    result = AshTypescript.Rpc.run_action(:find_it, conn, params)
    json(conn, result)
  end

  def validate(conn, params) do
    result = AshTypescript.Rpc.validate_action(:find_it, conn, params)
    json(conn, result)
  end
end
