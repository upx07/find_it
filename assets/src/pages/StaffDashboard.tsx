import { useState, useEffect } from "react";
import SideMenu from "../components/SideMenu";
import { gqlFetch } from "../services/graphql";

interface Category {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

interface Item {
  id: string;
  code: string;
  description: string | null;
  imageUrl: string | null;
  status: "available" | "retrieved";
  foundAt: string | null;
  aiProcessed: boolean;
  category: Category | null;
  location: Location | null;
}

const LIST_ITEMS = `
  query {
    listItems {
      results {
        id code description imageUrl status foundAt aiProcessed
        category { id name }
        location { id name }
      }
    }
  }
`;

const LIST_CATEGORIES = `
  query { listCategories { results { id name } } }
`;

const LIST_LOCATIONS = `
  query { listLocations { results { id name } } }
`;

const CREATE_PICKUP = `
  mutation CreatePickup($input: CreatePickupInput!) {
    createPickup(input: $input) {
      result { id }
    }
  }
`;

const REOPEN_ITEM = `
  mutation UpdateItemStatus($id: ID!, $input: UpdateItemStatusInput!) {
    updateItemStatus(id: $id, input: $input) {
      result { id status }
    }
  }
`;

const CREATE_ITEM = `
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      result {
        id code description imageUrl status foundAt aiProcessed
        category { id name }
        location { id name }
      }
    }
  }
`;

// --- Confirm Pickup Modal ---

interface ConfirmPickupModalProps {
  item: Item;
  onClose: () => void;
  onConfirmed: (itemId: string) => void;
}

function ConfirmPickupModal({ item, onClose, onConfirmed }: ConfirmPickupModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ nome: "", ra: "", cpf: "", data: today });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await gqlFetch(CREATE_PICKUP, {
        input: {
          studentName: form.nome,
          studentRa: form.ra,
          studentCpf: form.cpf,
          retrievedAt: form.data,
          itemId: item.id,
        },
      });
      onConfirmed(item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar retirada");
    } finally {
      setLoading(false);
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-1">Confirmar Retirada</h3>
        <p className="text-sm text-base-content/60 mb-4">
          {item.code} · {item.category?.name ?? "Sem categoria"}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="form-control">
            <div className="label"><span className="label-text">Nome completo do aluno</span></div>
            <input
              type="text" className="input input-bordered w-full"
              placeholder="Nome completo" required
              value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </label>
          <label className="form-control">
            <div className="label"><span className="label-text">RA</span></div>
            <input
              type="text" className="input input-bordered w-full"
              placeholder="Ex.: 236085" required
              value={form.ra} onChange={(e) => setForm({ ...form, ra: e.target.value })}
            />
          </label>
          <label className="form-control">
            <div className="label"><span className="label-text">CPF</span></div>
            <input
              type="text" className="input input-bordered w-full"
              placeholder="000.000.000-00" required
              value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            />
          </label>
          <label className="form-control">
            <div className="label"><span className="label-text">Data de retirada</span></div>
            <input
              type="date" className="input input-bordered w-full" required
              value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })}
            />
          </label>
          {error && <div className="alert alert-error py-2 text-sm"><span>{error}</span></div>}
          <div className="modal-action mt-0">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Confirmar entrega"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}

// --- New Item Modal ---

interface NewItemModalProps {
  categories: Category[];
  locations: Location[];
  onClose: () => void;
  onCreated: (item: Item) => void;
}

async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem("findit_auth_token");
  const body = new FormData();
  body.append("image", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) throw new Error(`Upload falhou: ${res.statusText}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.image_url as string;
}

function NewItemModal({ categories, locations, onClose, onCreated }: NewItemModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ description: "", categoryId: "", locationId: "", foundAt: today });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const imageUrl = imageFile ? await uploadImage(imageFile) : null;
      const data = await gqlFetch<{ createItem: { result: Item } }>(CREATE_ITEM, {
        input: {
          description: form.description || null,
          imageUrl,
          categoryId: form.categoryId || null,
          locationId: form.locationId || null,
          foundAt: form.foundAt || null,
        },
      });
      onCreated(data.createItem.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box rounded-t-2xl sm:rounded-2xl">
        <h3 className="font-bold text-base mb-3">Registrar novo objeto</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Foto compacta */}
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-28 object-cover rounded-lg" />
              <button
                type="button" className="btn btn-xs btn-error absolute top-2 right-2"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
              >
                Remover
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-3 h-14 px-4 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
              <span className="hero-camera w-6 h-6 text-base-content/30 shrink-0" />
              <div>
                <p className="text-sm font-medium">Foto do objeto</p>
                <p className="text-xs text-base-content/40">A IA descreverá automaticamente</p>
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
            </label>
          )}

          {/* Descrição */}
          <textarea
            className="textarea textarea-bordered w-full text-sm" rows={2}
            placeholder="Descrição (opcional) — ex.: mochila preta..."
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Categoria + Local lado a lado */}
          <div className="grid grid-cols-2 gap-2">
            <select className="select select-bordered select-sm w-full" value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Categoria</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <select className="select select-bordered select-sm w-full" value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
              <option value="">Local</option>
              {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>

          {/* Data */}
          <input type="date" className="input input-bordered input-sm w-full"
            value={form.foundAt} onChange={(e) => setForm({ ...form, foundAt: e.target.value })} />

          {error && <div className="alert alert-error py-2 text-sm"><span>{error}</span></div>}

          <div className="modal-action mt-1">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-xs" /> : "Cadastrar objeto"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}

// --- Item Detail Modal ---

interface ItemDetailModalProps {
  item: Item;
  onClose: () => void;
  onConfirmPickup: () => void;
  onReopen: () => void;
  reopening: boolean;
}

function ItemDetailModal({ item, onClose, onConfirmPickup, onReopen, reopening }: ItemDetailModalProps) {
  return (
    <dialog className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box rounded-t-2xl sm:rounded-2xl p-0 overflow-hidden max-w-sm">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.description ?? item.code} className="w-full max-h-64 object-cover" />
        ) : (
          <div className="w-full h-24 bg-base-200 flex items-center justify-center">
            <span className="hero-photo w-10 h-10 text-base-content/20" />
          </div>
        )}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-base">{item.code}</p>
              {item.category && <p className="text-xs text-base-content/50">{item.category.name}</p>}
            </div>
            <span className={`badge badge-sm ${item.status === "available" ? "badge-success" : "badge-neutral"}`}>
              {item.status === "available" ? "Disponível" : "Devolvido"}
            </span>
          </div>

          <p className="text-sm text-base-content/80 leading-relaxed">
            {item.description ?? (item.aiProcessed ? "Sem descrição" : "Aguardando descrição da IA...")}
          </p>

          <div className="flex flex-col gap-1 text-xs text-base-content/50">
            {item.location && (
              <span className="flex items-center gap-1">
                <span className="hero-map-pin w-3 h-3" />{item.location.name}
              </span>
            )}
            {item.foundAt && (
              <span className="flex items-center gap-1">
                <span className="hero-calendar w-3 h-3" />
                Encontrado em {new Date(item.foundAt).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>

          <div className="modal-action mt-1 gap-2">
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Fechar</button>
            {item.status === "available" ? (
              <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onConfirmPickup(); }}>
                Confirmar retirada
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" disabled={reopening} onClick={() => { onClose(); onReopen(); }}>
                {reopening ? <span className="loading loading-spinner loading-xs" /> : "Reabrir"}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}

// --- Dashboard ---

export default function StaffDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [confirmItem, setConfirmItem] = useState<Item | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [reopening, setReopening] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      gqlFetch<{ listItems: { results: Item[] } }>(LIST_ITEMS),
      gqlFetch<{ listCategories: { results: Category[] } }>(LIST_CATEGORIES),
      gqlFetch<{ listLocations: { results: Location[] } }>(LIST_LOCATIONS),
    ])
      .then(([itemsData, categoriesData, locationsData]) => {
        setItems(itemsData.listItems.results);
        setCategories(categoriesData.listCategories.results);
        setLocations(locationsData.listLocations.results);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, []);

  function handlePickupConfirmed(itemId: string) {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, status: "retrieved" } : i));
    setConfirmItem(null);
  }

  async function handleReopen(item: Item) {
    setReopening(item.id);
    try {
      await gqlFetch(REOPEN_ITEM, { id: item.id, input: { status: "available" } });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "available" } : i));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reabrir item");
    } finally {
      setReopening(null);
    }
  }

  function handleItemCreated(item: Item) {
    setItems((prev) => [item, ...prev]);
    setNewItemOpen(false);
  }

  const total = items.length;
  const available = items.filter((i) => i.status === "available").length;
  const retrieved = items.filter((i) => i.status === "retrieved").length;
  const rate = total > 0 ? Math.round((retrieved / total) * 100) : 0;

  const stats = [
    { label: "Total Cadastrados", value: total, icon: "hero-archive-box" },
    { label: "Devolvidos", value: retrieved, icon: "hero-check-circle" },
    { label: "Disponíveis", value: available, icon: "hero-clock" },
    { label: "Taxa de Devolução", value: `${rate}%`, icon: "hero-chart-bar" },
  ];

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <nav className="navbar bg-primary text-primary-content px-4 shadow-md">
        <button className="btn btn-ghost btn-sm text-primary-content" onClick={() => setDrawerOpen(true)}>
          <span className="hero-bars-3 w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-2 ml-2">
          <span className="hero-magnifying-glass w-5 h-5" />
          <span className="font-bold text-lg tracking-tight">FindIt Staff</span>
        </div>
      </nav>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">Visão Geral</p>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {error && <div className="alert alert-error mb-4 text-sm"><span>{error}</span></div>}

        <div className="grid grid-cols-2 gap-3 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card bg-base-200 shadow-sm">
              <div className="card-body p-4 gap-1">
                <span className={`${stat.icon} w-5 h-5 text-primary`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-base-content/60">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">Registros</p>
        <h2 className="text-lg font-bold mb-4">Objetos Recentes</h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-base-content/40">
            <span className="hero-archive-box w-12 h-12" />
            <p className="text-sm">Nenhum item cadastrado ainda</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-24">
            {items.map((item) => (
              <div key={item.id} className="card bg-base-200 shadow-sm cursor-pointer" onClick={() => setDetailItem(item)}>
                <div className="card-body p-4 gap-2">
                  <div className="flex gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.description ?? item.code}
                        className="w-16 h-16 object-cover rounded-lg shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-base-content/60 flex-wrap">
                          {item.category && <span className="badge badge-ghost badge-sm">{item.category.name}</span>}
                          <span>{item.code}</span>
                          {!item.aiProcessed && <span className="badge badge-warning badge-sm">Processando IA</span>}
                        </div>
                        <span className={`badge badge-sm shrink-0 ${item.status === "available" ? "badge-success" : "badge-neutral"}`}>
                          {item.status === "available" ? "Disponível" : "Devolvido"}
                        </span>
                      </div>

                      <p className="text-sm leading-snug line-clamp-2">
                        {item.description ?? "Aguardando descrição da IA..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-base-content/50">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <span className="hero-map-pin w-3 h-3" />{item.location.name}
                        </span>
                      )}
                      {item.foundAt && (
                        <span className="flex items-center gap-1">
                          <span className="hero-calendar w-3 h-3" />
                          {new Date(item.foundAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                    {item.status === "available" ? (
                      <button className="btn btn-primary btn-xs" onClick={(e) => { e.stopPropagation(); setConfirmItem(item); }}>
                        Confirmar retirada
                      </button>
                    ) : (
                      <button
                        className="btn btn-ghost btn-xs"
                        disabled={reopening === item.id}
                        onClick={(e) => { e.stopPropagation(); handleReopen(item); }}
                      >
                        {reopening === item.id
                          ? <span className="loading loading-spinner loading-xs" />
                          : "Reabrir"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="fixed bottom-6 right-6 btn btn-primary btn-circle btn-lg shadow-lg"
        title="Registrar novo objeto"
        onClick={() => setNewItemOpen(true)}
      >
        <span className="hero-plus w-6 h-6" />
      </button>

      {confirmItem && (
        <ConfirmPickupModal
          item={confirmItem}
          onClose={() => setConfirmItem(null)}
          onConfirmed={handlePickupConfirmed}
        />
      )}

      {newItemOpen && (
        <NewItemModal
          categories={categories}
          locations={locations}
          onClose={() => setNewItemOpen(false)}
          onCreated={handleItemCreated}
        />
      )}

      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onConfirmPickup={() => setConfirmItem(detailItem)}
          onReopen={() => handleReopen(detailItem)}
          reopening={reopening === detailItem.id}
        />
      )}

      <SideMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
