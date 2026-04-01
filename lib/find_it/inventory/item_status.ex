defmodule FindIt.Inventory.ItemStatus do
  use Ash.Type.Enum, values: [:available, :retrieved]
end
