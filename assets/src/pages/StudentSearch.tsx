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
  imageUrl: string | null;
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
        imageUrl
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

function ItemDetailModal({ item, onClose }: { item: Item; onClose: () => void }) {
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
          <div>
            <p className="font-bold text-base">{item.code}</p>
            {item.category && <p className="text-xs text-base-content/50">{item.category.name}</p>}
          </div>
          <p className="text-sm text-base-content/80 leading-relaxed">
            {item.description ?? "Aguardando descrição..."}
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
          <div className="alert alert-info py-2 text-xs">
            <span className="hero-building-office-2 w-4 h-4 shrink-0" />
            <span>Compareça à secretaria com um documento de identificação para retirar.</span>
          </div>
          <div className="modal-action mt-0">
            <button className="btn btn-primary btn-sm w-full" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}

export default function StudentSearch() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [dateApprox, setDateApprox] = useState<string>("");

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

  const activeFilters = [categoryId !== null, locationId !== null, dateApprox !== ""].filter(Boolean).length;

  const filtered = items.filter((item) => {
    const matchesCategory = categoryId === null || item.category?.id === categoryId;
    const matchesLocation = locationId === null || item.location?.id === locationId;
    const matchesQuery =
      query.trim() === "" ||
      (item.description ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (item.category?.name ?? "").toLowerCase().includes(query.toLowerCase());
    const matchesDate = (() => {
      if (!dateApprox || !item.foundAt) return true;
      const diff = Math.abs(new Date(item.foundAt).getTime() - new Date(dateApprox).getTime());
      return diff <= 3 * 24 * 60 * 60 * 1000;
    })();
    return matchesCategory && matchesLocation && matchesQuery && matchesDate;
  });

  const hasActiveSearch = query.trim() !== "" || activeFilters > 0;

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
      {detailItem && <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />}

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
          Achados e Perdidos
        </p>
        <h1 className="text-2xl font-bold mb-1">Perdeu algo no campus?</h1>
        <p className="text-sm text-base-content/60 mb-5">
          Encontrou seu objeto? Compareça com um documento à secretaria para retirá-lo.
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

        {!loadingData && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex gap-2 items-center">
              <span className="hero-map-pin w-4 h-4 text-base-content/50 shrink-0" />
              <select
                className="select select-bordered select-sm flex-1"
                value={locationId ?? ""}
                onChange={(e) => setLocationId(e.target.value || null)}
              >
                <option value="">Todos os locais</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <span className="hero-calendar w-4 h-4 text-base-content/50 shrink-0" />
              <input
                type="date"
                className="input input-bordered input-sm flex-1"
                value={dateApprox}
                onChange={(e) => setDateApprox(e.target.value)}
                title="Data aproximada em que perdeu o objeto (±3 dias)"
              />
            </div>
          </div>
        )}

        {activeFilters > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <button
              className="btn btn-xs btn-outline btn-error"
              onClick={() => { setCategoryId(null); setLocationId(null); setDateApprox(""); }}
            >
              Limpar filtros ({activeFilters})
            </button>
          </div>
        )}

        {loadingData ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <>
            <p className="text-sm text-base-content/60 mb-3">
              {filtered.length === 0
                ? hasActiveSearch ? "Nenhum objeto encontrado para essa busca" : "Nenhum objeto disponível no momento"
                : `${filtered.length} objeto${filtered.length !== 1 ? "s" : ""} disponíve${filtered.length !== 1 ? "is" : "l"}`}
            </p>
            <div className="flex flex-col gap-3 pb-6">
              {filtered.map((item) => (
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
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-base-content/60">
                          {item.category && (
                            <span className="badge badge-ghost badge-sm">{item.category.name}</span>
                          )}
                          <span className="text-base-content/40">·</span>
                          <span>{item.code}</span>
                        </div>
                        <p className="text-sm leading-snug line-clamp-2">
                          {item.description ?? "Aguardando descrição..."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
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
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        <span className="hero-building-office-2 w-3 h-3" />
                        Retirar na secretaria
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
