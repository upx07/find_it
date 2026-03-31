import { useState } from "react";

interface Item {
  id: string;
  code: string;
  category: string;
  description: string;
  location: string;
  date: string;
  status: "disponivel" | "devolvido";
}

const MOCK_ITEMS: Item[] = [
  {
    id: "1",
    code: "OBJ-001",
    category: "Eletrônicos",
    description: "Fone de ouvido Bluetooth preto, modelo JBL Tune 510BT. Sem case.",
    location: "Bloco A",
    date: "10/04/2025",
    status: "disponivel",
  },
  {
    id: "2",
    code: "OBJ-002",
    category: "Eletrônicos",
    description:
      "iPhone 14 com capa transparente e protetor de tela. Tela bloqueada com papel de parede de paisagem.",
    location: "Cantina",
    date: "09/04/2025",
    status: "disponivel",
  },
  {
    id: "3",
    code: "OBJ-003",
    category: "Documentos",
    description: "Carteira estudantil em nome de João Silva, RA 235255.",
    location: "Biblioteca",
    date: "07/04/2025",
    status: "devolvido",
  },
];

const STATS = [
  { label: "Total Cadastrados", value: 17, icon: "hero-archive-box" },
  { label: "Devolvidos", value: 3, icon: "hero-check-circle" },
  { label: "Pendentes", value: 14, icon: "hero-clock" },
  { label: "Taxa de Devolução", value: "18%", icon: "hero-chart-bar" },
];

export default function StaffDashboard() {
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function toggleStatus(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "disponivel" ? "devolvido" : "disponivel" }
          : item,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <nav className="navbar bg-primary text-primary-content px-4 shadow-md">
        <button
          className="btn btn-ghost btn-sm text-primary-content"
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <span className="hero-bars-3 w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-2 ml-2">
          <span className="hero-magnifying-glass w-5 h-5" />
          <span className="font-bold text-lg tracking-tight">FindIt Staff</span>
        </div>
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm">
          <span className="hero-user-circle w-6 h-6 text-primary-content" />
        </div>
      </nav>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
          Visão Geral
        </p>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {STATS.map((stat) => (
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

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="card bg-base-200 shadow-sm">
              <div className="card-body p-4 gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-base-content/60">
                    <span className="badge badge-ghost badge-sm">{item.category}</span>
                    <span>{item.code}</span>
                  </div>
                  <span
                    className={`badge badge-sm ${
                      item.status === "disponivel" ? "badge-success" : "badge-neutral"
                    }`}
                  >
                    {item.status === "disponivel" ? "Disponível" : "Devolvido"}
                  </span>
                </div>
                <p className="text-sm leading-snug line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-base-content/50">
                    <span className="flex items-center gap-1">
                      <span className="hero-map-pin w-3 h-3" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="hero-calendar w-3 h-3" />
                      {item.date}
                    </span>
                  </div>
                  <button className="btn btn-ghost btn-xs" onClick={() => toggleStatus(item.id)}>
                    {item.status === "disponivel" ? "Marcar devolvido" : "Reabrir"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="fixed bottom-6 right-6 btn btn-primary btn-circle btn-lg shadow-lg"
        title="Registrar novo objeto"
      >
        <span className="hero-plus w-6 h-6" />
      </button>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-64 bg-base-100 shadow-xl p-6 flex flex-col gap-4">
            <p className="font-bold text-lg">Menu</p>
            <a href="/" className="btn btn-ghost justify-start">
              <span className="hero-home w-5 h-5" />
              Início
            </a>
            <button className="btn btn-ghost justify-start text-error">
              <span className="hero-arrow-right-on-rectangle w-5 h-5" />
              Sair
            </button>
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setDrawerOpen(false)} />
        </div>
      )}
    </div>
  );
}
