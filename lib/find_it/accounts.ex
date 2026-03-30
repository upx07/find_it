defmodule FindIt.Accounts do
  use Ash.Domain, otp_app: :find_it, extensions: [AshAdmin.Domain]

  admin do
    show? true
  end

  resources do
    resource FindIt.Accounts.Token
    resource FindIt.Accounts.User
  end
end
