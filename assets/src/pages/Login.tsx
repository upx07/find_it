import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === "student") {
        navigate("/buscar");
      } else {
        navigate("/staff");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("authentication failed")) {
        setError("Email ou senha incorretos, ou sua conta ainda não foi ativada pelo administrador.");
      } else {
        setError(msg || "Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div className="text-center">
            <span className="hero-magnifying-glass text-primary w-10 h-10 inline-block" />
            <h1 className="text-2xl font-bold mt-2">FindIt</h1>
            <p className="text-base-content/60 text-sm">Acesso da equipe</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="form-control">
              <span className="label-text mb-1">E-mail</span>
              <input
                type="email"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Senha</span>
              <input
                type="password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && (
              <div className="alert alert-error py-2 text-sm">
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Sem conta?{" "}
            <Link to="/register" className="link link-primary">
              Cadastrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
