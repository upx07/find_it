import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { gqlFetch } from "../services/graphql";
import SideMenu from "../components/SideMenu";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  ra: string | null;
  setor: string | null;
  role: string;
  createdAt: string;
}

const LIST_REQUESTS = `
  query {
    listAccessRequests {
      id
      name
      email
      ra
      setor
      role
      createdAt
    }
  }
`;

const APPROVE_USER = `
  mutation ApproveUser($id: ID!) {
    approveUser(id: $id, input: {}) {
      id
      name
      active
    }
  }
`;

const REJECT_USER = `
  mutation RejectUser($id: ID!) {
    rejectUser(id: $id) {
      result { id }
    }
  }
`;

export default function AccessRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/staff");
      return;
    }
    fetchRequests();
  }, [user]);

  async function fetchRequests() {
    try {
      const data = await gqlFetch<{ listAccessRequests: AccessRequest[] }>(LIST_REQUESTS);
      setRequests(data.listAccessRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setApproving(id);
    try {
      await gqlFetch(APPROVE_USER, { id });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao aprovar usuário");
    } finally {
      setApproving(null);
    }
  }

  async function handleReject(id: string) {
    setRejecting(id);
    try {
      await gqlFetch(REJECT_USER, { id });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao rejeitar pedido");
    } finally {
      setRejecting(null);
    }
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <nav className="navbar bg-primary text-primary-content px-4 shadow-md">
        <button className="btn btn-ghost btn-sm" onClick={() => setDrawerOpen(true)}>
          <span className="hero-bars-3 w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center gap-2 ml-2">
          <span className="hero-magnifying-glass w-5 h-5" />
          <span className="font-bold text-lg tracking-tight">FindIt Staff</span>
        </div>
      </nav>
      <SideMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">
          Administração
        </p>
        <h1 className="text-2xl font-bold mb-6">Pedidos de Acesso</h1>

        {error && (
          <div className="alert alert-error mb-4 text-sm">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-base-content/40">
            <span className="hero-check-circle w-12 h-12" />
            <p className="text-sm">Nenhum pedido pendente</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <div key={req.id} className="card bg-base-200 shadow-sm">
                <div className="card-body p-4 gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{req.name}</p>
                      <p className="text-sm text-base-content/60">{req.email}</p>
                    </div>
                    <span className="badge badge-warning badge-sm shrink-0">
                      {req.role === "staff" ? "Funcionário" : req.role}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-base-content/50">
                    {req.ra && (
                      <span className="flex items-center gap-1">
                        <span className="hero-identification w-3 h-3" />
                        RA: {req.ra}
                      </span>
                    )}
                    {req.setor && (
                      <span className="flex items-center gap-1">
                        <span className="hero-building-office w-3 h-3" />
                        {req.setor}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="hero-calendar w-3 h-3" />
                      {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-ghost btn-sm text-error"
                      disabled={rejecting === req.id || approving === req.id}
                      onClick={() => handleReject(req.id)}
                    >
                      {rejecting === req.id
                        ? <span className="loading loading-spinner loading-xs" />
                        : "Rejeitar"}
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={approving === req.id || rejecting === req.id}
                      onClick={() => handleApprove(req.id)}
                    >
                      {approving === req.id
                        ? <span className="loading loading-spinner loading-xs" />
                        : "Aprovar acesso"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
