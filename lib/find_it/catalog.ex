defmodule FindIt.Catalog do
  use Ash.Domain,
    otp_app: :find_it,
    extensions: [AshAdmin.Domain, AshGraphql.Domain]

  admin do
    show? true
  end

  graphql do
    authorize? false
  end

  resources do
    resource FindIt.Catalog.Category
    resource FindIt.Catalog.Location
  end
end
