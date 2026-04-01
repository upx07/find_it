alias FindIt.Catalog.Category
alias FindIt.Catalog.Location

categories = [
  %{name: "Eletrônicos", slug: "eletronicos"},
  %{name: "Documentos", slug: "documentos"},
  %{name: "Vestuário", slug: "vestuario"},
  %{name: "Acessórios", slug: "acessorios"},
  %{name: "Chaves", slug: "chaves"},
  %{name: "Outros", slug: "outros"}
]

for attrs <- categories do
  case Ash.get(Category, [slug: attrs.slug], domain: FindIt.Catalog) do
    {:ok, _} -> :skip
    {:error, _} -> Ash.create!(Category, attrs, domain: FindIt.Catalog)
  end
end

locations = [
  %{name: "Bloco A", description: "Salas de aula Bloco A"},
  %{name: "Bloco B", description: "Salas de aula Bloco B"},
  %{name: "Bloco C", description: "Salas de aula Bloco C"},
  %{name: "Bloco D", description: "Salas de aula Bloco D"},
  %{name: "Bloco L", description: "Salas de aula Bloco L"},
  %{name: "Cantina", description: "Área de alimentação"},
  %{name: "Biblioteca", description: "Biblioteca central"},
  %{name: "Laboratório", description: "Laboratórios de informática"},
  %{name: "Secretaria", description: "Secretaria acadêmica"},
  %{name: "Estacionamento", description: "Área de estacionamento"},
  %{name: "Área comum", description: "Corredores e áreas de convivência"}
]

for attrs <- locations do
  case Ash.get(Location, [name: attrs.name], domain: FindIt.Catalog) do
    {:ok, _} -> :skip
    {:error, _} -> Ash.create!(Location, attrs, domain: FindIt.Catalog)
  end
end
