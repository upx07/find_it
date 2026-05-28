alias FindIt.Catalog.Category
alias FindIt.Catalog.Location
alias FindIt.Inventory.Item

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

# Itens de exemplo para demo
existing_count = FindIt.Repo.aggregate(Item, :count, :id)

if existing_count == 0 do
  {:ok, eletronicos} = Ash.get(Category, [slug: "eletronicos"], domain: FindIt.Catalog)
  {:ok, documentos}  = Ash.get(Category, [slug: "documentos"],  domain: FindIt.Catalog)
  {:ok, vestuario}   = Ash.get(Category, [slug: "vestuario"],   domain: FindIt.Catalog)
  {:ok, acessorios}  = Ash.get(Category, [slug: "acessorios"],  domain: FindIt.Catalog)
  {:ok, chaves}      = Ash.get(Category, [slug: "chaves"],      domain: FindIt.Catalog)
  {:ok, outros}      = Ash.get(Category, [slug: "outros"],      domain: FindIt.Catalog)

  {:ok, bloco_a}    = Ash.get(Location, [name: "Bloco A"],    domain: FindIt.Catalog)
  {:ok, bloco_b}    = Ash.get(Location, [name: "Bloco B"],    domain: FindIt.Catalog)
  {:ok, bloco_c}    = Ash.get(Location, [name: "Bloco C"],    domain: FindIt.Catalog)
  {:ok, cantina}    = Ash.get(Location, [name: "Cantina"],    domain: FindIt.Catalog)
  {:ok, biblioteca} = Ash.get(Location, [name: "Biblioteca"], domain: FindIt.Catalog)
  {:ok, lab}        = Ash.get(Location, [name: "Laboratório"], domain: FindIt.Catalog)
  {:ok, area_comum} = Ash.get(Location, [name: "Área comum"], domain: FindIt.Catalog)

  items = [
    %{
      description: "Fone de ouvido sem fio preto, modelo over-ear, sem case",
      category_id: eletronicos.id,
      location_id: bloco_a.id,
      found_at: ~D[2026-05-10]
    },
    %{
      description: "Carteira preta masculina com documentos e cartões dentro",
      category_id: documentos.id,
      location_id: cantina.id,
      found_at: ~D[2026-05-11]
    },
    %{
      description: "Moletom cinza tamanho M com capuz, sem identificação",
      category_id: vestuario.id,
      location_id: bloco_b.id,
      found_at: ~D[2026-05-09]
    },
    %{
      description: "Óculos de grau armação preta, sem estojo",
      category_id: acessorios.id,
      location_id: biblioteca.id,
      found_at: ~D[2026-05-12]
    },
    %{
      description: "Molho de chaves com 3 chaves e chaveiro azul",
      category_id: chaves.id,
      location_id: bloco_c.id,
      found_at: ~D[2026-05-08]
    },
    %{
      description: "Carregador USB-C branco com cabo, sem identificação de marca",
      category_id: eletronicos.id,
      location_id: lab.id,
      found_at: ~D[2026-05-13]
    },
    %{
      description: "Garrafa térmica inox prata 500ml",
      category_id: outros.id,
      location_id: area_comum.id,
      found_at: ~D[2026-05-07]
    },
    %{
      description: "RG e CPF em envelope plástico transparente",
      category_id: documentos.id,
      location_id: bloco_a.id,
      found_at: ~D[2026-05-13]
    }
  ]

  for attrs <- items do
    item = Ash.create!(Item, attrs, action: :create, domain: FindIt.Inventory)

    item
    |> Ash.Changeset.for_update(:mark_ai_processed, %{
      description: attrs.description,
      ai_tags: []
    })
    |> Ash.update!(domain: FindIt.Inventory)
  end

  IO.puts("✓ #{length(items)} itens de exemplo criados")
else
  IO.puts("→ Itens já existem, seed ignorado")
end
