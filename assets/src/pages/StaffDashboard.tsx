import { useState, useEffect } from "react";
import SideMenu from "../components/SideMenu";
import { gqlFetch } from "../services/graphql";

interface Item {
  id: string;
  code: string;
  description: string | null;
  imageUrl: string | null;
  status: "available" | "retrieved";
  foundAt: string | null;
  aiProcessed: boolean;
  category: { id: string; name: string } | null;
  location: { id: string; name: string } | null;
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
        aiProcessed
        category { id name }
        location { id name }
      }
    }
  }
`;

const UPDATE_STATUS = `
  mutation UpdateItemStatus($id: ID!, $input: UpdateItemStatusInput!) {
    updateItemStatus(id: $id, input: $input) {
      result {
        id
        status
      }
    }
  }
`;

export default function StaffDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    try {
      const data = await gqlFetch<{ listItems: { results: Item[] } }>(LIST_ITEMS);
      setItems(data.listItems.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar itens");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(item: Item) {
    const newStatus = item.status === "available" ? "retrieved" : "available";
    setUpdating(item.id);
    try {
      await gqlFetch(UPDATE_STATUS, { id: item.id, input: { status: newStatus } });
      setItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, status: newStatus } : i)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar status");
    } finally {
      setUpdating(null);
    }
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
        <button
          className="btn btn-ghost btn-sm text-primary-content"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="hero-bars-3 w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-2 ml-2">
          <span className="hero-magnifying-glass w-5 h-5" />
          <span className="font-bold text-lg tracking-tight">FindIt Staff</span>
        </div>
      </nav>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
          Visão Geral
        </p>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {error && (
          <div className="alert alert-error mb-4 text-sm">
            <span>{error}</span>
          </div>
        )}

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

        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
          Registros
        </p>
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
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="card bg-base-200 shadow-sm">
                <div className="card-body p-4 gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                      {item.category && (
                        <span className="badge badge-ghost badge-sm">{item.category.name}</span>
                      )}
                      <span>{item.code}</span>
                      {!item.aiProcessed && (
                        <span className="badge badge-warning badge-sm">Processando IA</span>
                      )}
                    </div>
                    <span className={`badge badge-sm ${item.status === "available" ? "badge-success" : "badge-neutral"}`}>
                      {item.status === "available" ? "Disponível" : "Devolvido"}
                    </span>
                  </div>

                  <p className="text-sm leading-snug line-clamp-2">
                    {item.description ?? "Aguardando descrição da IA..."}
                  </p>

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
                    <button
                      className="btn btn-ghost btn-xs"
                      disabled={updating === item.id}
                      onClick={() => toggleStatus(item)}
                    >
                      {updating === item.id
                        ? <span className="loading loading-spinner loading-xs" />
                        : item.status === "available" ? "Marcar devolvido" : "Reabrir"}
                    </button>
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
      >
        <span className="hero-plus w-6 h-6" />
      </button>

      <SideMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
