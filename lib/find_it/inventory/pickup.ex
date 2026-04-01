defmodule FindIt.Inventory.Pickup do
  use Ash.Resource,
    otp_app: :find_it,
    domain: FindIt.Inventory,
    data_layer: AshPostgres.DataLayer,
    extensions: [AshGraphql.Resource]

  graphql do
    type :pickup

    queries do
      list :list_pickups, :read
    end

    mutations do
      create :create_pickup, :create
    end
  end

  postgres do
    table "pickups"
    repo FindIt.Repo

    references do
      reference :item, on_delete: :restrict
    end
  end

  actions do
    defaults [:read]

    create :create do
      accept [:student_name, :student_ra, :student_cpf, :retrieved_at, :item_id]

      change after_action(fn _changeset, pickup, _context ->
        FindIt.Inventory.Item
        |> Ash.get!(pickup.item_id, domain: FindIt.Inventory)
        |> Ash.Changeset.for_update(:update_status, %{status: :retrieved})
        |> Ash.update!(domain: FindIt.Inventory)

        {:ok, pickup}
      end)
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :student_name, :string do
      allow_nil? false
      public? true
    end

    attribute :student_ra, :string do
      allow_nil? false
      public? true
    end

    attribute :student_cpf, :string do
      allow_nil? false
      public? true
      sensitive? true
    end

    attribute :retrieved_at, :date do
      allow_nil? false
      public? true
    end

    create_timestamp :created_at
  end

  relationships do
    belongs_to :item, FindIt.Inventory.Item do
      allow_nil? false
      public? true
    end
  end
end
