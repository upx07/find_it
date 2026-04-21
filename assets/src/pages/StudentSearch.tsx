import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SideMenu from "../components/SideMenu";

type Category = "todos" | "eletronicos" | "documentos" | "vestuario" | "acessorios" | "chaves";

interface Item {
  id: string;
  code: string;
  category: string;
  description: string;
  location: string;
  date: string;
  imageUrl?: string;
}

const MOCK_ITEMS: Item[] = [
  {
    id: "1",
    code: "OBJ-002",
    category: "Eletrônicos",
    description:
      "iPhone 14 com capa transparente e protetor de tela. Tela bloqueada com papel de parede de paisagem.",
    location: "Cantina",
    date: "09/04/2025",
  },
  {
    id: "2",
    code: "OBJ-001",
    category: "Eletrônicos",
    description: "Fone de ouvido Bluetooth preto, modelo JBL Tune 510BT. Sem case.",
    location: "Bloco A",
    date: "10/04/2025",
  },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "eletronicos", label: "Eletrônicos" },
  { value: "documentos", label: "Documentos" },
  { value: "vestuario", label: "Vestuário" },
  { value: "acessorios", label: "Acessórios" },
  { value: "chaves", label: "Chaves" },
];

const LOCATIONS = ["Todos os locais", "Bloco A", "Bloco B", "Cantina", "Biblioteca", "Laboratório"];

interface PickupModalProps {
  item: Item;
  onClose: () => void;
}

function PickupModal({ item, onClose }: PickupModalProps) {
  const [form, setForm] = useState({ nome: "", ra: "", cpf: "", data: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
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
            <button className="btn btn-primary" onClick={onClose}>
              Fechar
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg mb-1">Solicitar Retirada</h3>
            <p className="text-sm text-base-content/70 mb-4">
              {item.code} · {item.category}
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
              <div className="modal-action mt-2">
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar retirada
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
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("todos");
  const { token, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [location, setLocation] = useState("Todos os locais");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const activeFilters = [
    category !== "todos",
    location !== "Todos os locais",
  ].filter(Boolean).length;

  const filtered = MOCK_ITEMS.filter((item) => {
    const matchesCategory =
      category === "todos" ||
      item.category.toLowerCase().includes(category.replace("eletronicos", "eletrôn"));
    const matchesLocation =
      location === "Todos os locais" || item.location === location;
    const matchesQuery =
      query.trim() === "" ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesLocation && matchesQuery;
  });

  const hasSearch = query.trim() !== "" || activeFilters > 0;

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

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`btn btn-sm whitespace-nowrap ${
                category === cat.value ? "btn-primary" : "btn-ghost border border-base-300"
              }`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center mb-4">
          <span className="hero-map-pin w-4 h-4 text-base-content/50" />
          <select
            className="select select-bordered select-sm flex-1"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {LOCATIONS.map((loc) => (
              <option key={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {activeFilters > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <button
              className="btn btn-xs btn-outline btn-error"
              onClick={() => {
                setCategory("todos");
                setLocation("Todos os locais");
              }}
            >
              Limpar filtros ({activeFilters})
            </button>
          </div>
        )}

        {hasSearch ? (
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
                      <span className="badge badge-ghost badge-sm">{item.category}</span>
                      <span className="text-base-content/40">·</span>
                      <span>{item.code}</span>
                    </div>
                    <p className="text-sm leading-snug">{item.description}</p>
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
              Use a barra de busca, selecione a categoria, o local ou a data aproximada para encontrar seu objeto.
            </p>
          </div>
        )}
      </div>

      {selectedItem && (
        <PickupModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
