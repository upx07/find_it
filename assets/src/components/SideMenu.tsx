import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SideMenu({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  function go(path: string) {
    onClose();
    navigate(path);
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="w-64 bg-base-100 shadow-xl p-6 flex flex-col gap-1">
        <div className="mb-4 pb-4 border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10">
                <span className="text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{user?.name}</p>
              <p className="text-xs text-base-content/50 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <button className="btn btn-ghost justify-start" onClick={() => go("/staff")}>
          <span className="hero-squares-2x2 w-5 h-5" />
          Dashboard
        </button>

        <button className="btn btn-ghost justify-start" onClick={() => go("/buscar")}>
          <span className="hero-magnifying-glass w-5 h-5" />
          Buscar itens
        </button>

        {user?.role === "admin" && (
          <>
            <div className="divider my-1 text-xs text-base-content/30">Admin</div>
            <button className="btn btn-ghost justify-start" onClick={() => go("/admin/aprovacoes")}>
              <span className="hero-user-plus w-5 h-5" />
              Pedidos de acesso
            </button>
          </>
        )}

        <div className="flex-1" />
        <div className="divider my-1" />
        <button
          className="btn btn-ghost justify-start text-error"
          onClick={() => { logout(); navigate("/login"); }}
        >
          <span className="hero-arrow-right-on-rectangle w-5 h-5" />
          Sair
        </button>
      </div>

      <div className="flex-1 bg-black/30" onClick={onClose} />
    </div>
  );
}
