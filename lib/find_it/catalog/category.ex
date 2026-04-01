defmodule FindIt.Catalog.Category do
  use Ash.Resource,
    otp_app: :find_it,
    domain: FindIt.Catalog,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshGraphql.Resource]

  graphql do
    type :category

    queries do
      list :list_categories, :read
    end
  end

  postgres do
    table "categories"
    repo FindIt.Repo
  end

  actions do
    defaults [:read, :destroy, create: [:name, :slug], update: [:name, :slug]]
  end

  attributes do
    uuid_primary_key :id

    attribute :name, :string do
      allow_nil? false
      public? true
      description "Display name, e.g. Eletrônicos"
    end

    attribute :slug, :string do
      allow_nil? false
      public? true
      description "URL-safe identifier, e.g. eletronicos"
    end

    timestamps()
  end

  identities do
    identity :unique_slug, [:slug]
  end
end
