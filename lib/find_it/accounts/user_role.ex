defmodule FindIt.Accounts.UserRole do
  use Ash.Type.Enum, values: [:student, :staff, :admin]
end
