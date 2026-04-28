import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gqlFetch } from "../services/graphql";
import SideMenu from "../components/SideMenu";

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
  status: "available" | "retrieved";
  foundAt: string | null;
  category: Category | null;
  location: Location | null;
}

const LIST_ITEMS = `
  query {
    listItems {
      results {
        id
        code
        description
        status
        foundAt
        category { id name }
        location { id name }
      }
    }
  }
`;

const LIST_CATEGORIES = `
  query {
    listCategories {
      results { id name }
    }
  }
`;

const LIST_LOCATIONS = `
  query {
    listLocations {
      results { id name }
    }
  }
`;

const CREATE_PICKUP = `
  mutation CreatePickup($input: CreatePickupInput!) {
    createPickup(input: $input) {
      result { id }
    }
  }
`;

interface PickupModalProps {
  item: Item;
  onClose: () => void;
  onSuccess: () => void;
}

function PickupModal({ item, onClose, onSuccess }: PickupModalProps) {
  const [form, setForm] = useState({ nome: "", ra: "", cpf: "", data: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao solicitar retirada");
    } finally {
      setLoading(false);
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        {submitted ? (
          <div className="text-center py-6">
            <span className="hero-check-circle w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Retirada solicitada!</h3>
            <p className="text-sm text-base-content/70 mb-6">
              Compareça à secretaria com um documento de identificação para retirar o item{" "}
              <strong>{item.code}</strong>.
            </p>
            <button className="btn btn-primary" onClick={onSuccess}>
              Fechar
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg mb-1">Solicitar Retirada</h3>
            <p className="text-sm text-base-content/70 mb-4">
              {item.code} · {item.category?.name}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Nome completo</span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Seu nome completo"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">RA (Registro Acadêmico)</span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Ex.: 236085"
                  required
                  value={form.ra}
                  onChange={(e) => setForm({ ...form, ra: e.target.value })}
                />
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">CPF</span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="000.000.000-00"
                  required
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                />
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Data de retirada</span>
                </div>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  required
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </label>

              {error && (
                <div className="alert alert-error py-2 text-sm">
                  <span>{error}</span>
                </div>
              )}

              <div className="modal-action mt-2">
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading
                    ? <span className="loading loading-spinner loading-sm" />
                    : "Confirmar retirada"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}

export default function StudentSearch() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    Promise.all([
      gqlFetch<{ listItems: { results: Item[] } }>(LIST_ITEMS),
      gqlFetch<{ listCategories: { results: Category[] } }>(LIST_CATEGORIES),
      gqlFetch<{ listLocations: { results: Location[] } }>(LIST_LOCATIONS),
    ])
      .then(([itemsData, categoriesData, locationsData]) => {
        setItems(itemsData.listItems.results.filter((i) => i.status === "available"));
        setCategories(categoriesData.listCategories.results);
        setLocations(locationsData.listLocations.results);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const activeFilters = [categoryId !== null, locationId !== null].filter(Boolean).length;

  const filtered = items.filter((item) => {
    const matchesCategory = categoryId === null || item.category?.id === categoryId;
    const matchesLocation = locationId === null || item.location?.id === locationId;
    const matchesQuery =
      query.trim() === "" ||
      (item.description ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (item.category?.name ?? "").toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesLocation && matchesQuery;
  });

  const hasSearch = query.trim() !== "" || activeFilters > 0;

  function handlePickupSuccess(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setSelectedItem(null);
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <nav className="navbar bg-primary text-primary-content px-4 shadow-md">
        {token && (user?.role === "staff" || user?.role === "admin") ? (
          <button className="btn btn-ghost btn-sm" onClick={() => setDrawerOpen(true)}>
            <span className="hero-bars-3 w-5 h-5" />
          </button>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
            <span className="hero-arrow-left w-5 h-5" />
          </button>
        )}
        <div className="flex-1 flex items-center gap-2 ml-2">
          <span className="hero-magnifying-glass w-5 h-5" />
          <span className="font-bold text-lg tracking-tight">FindIt</span>
        </div>
        {!token && (
          <Link to="/login" className="btn btn-ghost btn-sm text-primary-content">
            Entrar
          </Link>
        )}
      </nav>
      <SideMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
          Achados e Perdidos
        </p>
        <h1 className="text-2xl font-bold mb-1">Perdeu algo no campus?</h1>
        <p className="text-sm text-base-content/60 mb-5">
          Descreva o objeto, selecione o local e a data aproximada.
        </p>

        <div className="relative mb-4">
          <span className="hero-magnifying-glass w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            className="input input-bordered w-full pl-10"
            placeholder="Descreva o que você perdeu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {!loadingData && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            <button
              className={`btn btn-sm whitespace-nowrap ${categoryId === null ? "btn-primary" : "btn-ghost border border-base-300"}`}
              onClick={() => setCategoryId(null)}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`btn btn-sm whitespace-nowrap ${categoryId === cat.id ? "btn-primary" : "btn-ghost border border-base-300"}`}
                onClick={() => setCategoryId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {!loadingData && locations.length > 0 && (
          <div className="flex gap-3 items-center mb-4">
            <span className="hero-map-pin w-4 h-4 text-base-content/50" />
            <select
              className="select select-bordered select-sm flex-1"
              value={locationId ?? ""}
              onChange={(e) => setLocationId(e.target.value || null)}
            >
              <option value="">Todos os locais</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeFilters > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <button
              className="btn btn-xs btn-outline btn-error"
              onClick={() => {
                setCategoryId(null);
                setLocationId(null);
              }}
            >
              Limpar filtros ({activeFilters})
            </button>
          </div>
        )}

        {loadingData ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : hasSearch ? (
          <>
            <p className="text-sm text-base-content/60 mb-3">
              {filtered.length === 0
                ? "Nenhum objeto encontrado"
                : `${filtered.length} objeto${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
            </p>
            <div className="flex flex-col gap-3">
              {filtered.map((item) => (
                <div key={item.id} className="card bg-base-200 shadow-sm">
                  <div className="card-body p-4 gap-2">
                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                      {item.category && (
                        <span className="badge badge-ghost badge-sm">{item.category.name}</span>
                      )}
                      <span className="text-base-content/40">·</span>
                      <span>{item.code}</span>
                    </div>
                    <p className="text-sm leading-snug">
                      {item.description ?? "Aguardando descrição..."}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-base-content/50">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <span className="hero-map-pin w-3 h-3" />
                          {item.location.name}
                        </span>
                      )}
                      {item.foundAt && (
                        <span className="flex items-center gap-1">
                          <span className="hero-calendar w-3 h-3" />
                          {new Date(item.foundAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                    <div className="card-actions justify-end mt-1">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setSelectedItem(item)}
                      >
                        Solicitar Retirada
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="hero-magnifying-glass w-12 h-12 text-base-content/20 mb-4" />
            <p className="font-semibold text-base-content/60 mb-1">Descreva o que você perdeu</p>
            <p className="text-sm text-base-content/40">
              Use a barra de busca, selecione a categoria ou o local para encontrar seu objeto.
            </p>
          </div>
        )}
      </div>

      {selectedItem && (
        <PickupModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSuccess={() => handlePickupSuccess(selectedItem.id)}
        />
      )}
    </div>
  );
}
