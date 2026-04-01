defmodule FindIt.Catalog.Location do
  use Ash.Resource,
    otp_app: :find_it,
    domain: FindIt.Catalog,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshGraphql.Resource]

  graphql do
    type :location

    queries do
      list :list_locations, :read
    end
  end

  postgres do
    table "locations"
    repo FindIt.Repo
  end

  actions do
    defaults [:read, :destroy, create: [:name, :description], update: [:name, :description]]
  end

  attributes do
    uuid_primary_key :id

    attribute :name, :string do
      allow_nil? false
      public? true
      description "Display name, e.g. Bloco A"
    end

    attribute :description, :string do
      public? true
      description "Optional detail about the location"
    end

    create_timestamp :created_at
    update_timestamp :updated_at
  end

  identities do
    identity :unique_name, [:name]
  end
end
