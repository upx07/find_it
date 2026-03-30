defmodule FindIt.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      FindItWeb.Telemetry,
      FindIt.Repo,
      {DNSCluster, query: Application.get_env(:find_it, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: FindIt.PubSub},
      {Finch, name: FindIt.Finch},
      {Oban, Application.fetch_env!(:find_it, Oban)},
      FindItWeb.Endpoint,
      {Absinthe.Subscription, FindItWeb.Endpoint},
      AshGraphql.Subscription.Batcher,
      {AshAuthentication.Supervisor, [otp_app: :find_it]}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: FindIt.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    FindItWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
