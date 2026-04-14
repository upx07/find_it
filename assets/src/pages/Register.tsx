import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Role = "student" | "staff";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ra, setRa] = useState("");
  const [setor, setSetor] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await register({ name, email, ra: ra || undefined, setor: setor || undefined, role, password, passwordConfirmation });
      if (result.role === "student") {
        navigate("/confirmar-email");
      } else {
        navigate("/aguardando-aprovacao");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-10">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body gap-5">
          <div className="text-center">
            <span className="hero-magnifying-glass text-primary w-10 h-10 inline-block" />
            <h1 className="text-2xl font-bold mt-2">Criar conta</h1>
            <p className="text-base-content/60 text-sm">FindIt UniFacens</p>
          </div>

          <div className="tabs tabs-boxed">
            <button
              type="button"
              className={`tab flex-1 ${role === "student" ? "tab-active" : ""}`}
              onClick={() => setRole("student")}
            >
              Sou aluno
            </button>
            <button
              type="button"
              className={`tab flex-1 ${role === "staff" ? "tab-active" : ""}`}
              onClick={() => setRole("staff")}
            >
              Sou funcionário
            </button>
          </div>

          <p className="text-xs text-base-content/50 -mt-2 text-center">
            {role === "student"
              ? "Você receberá um e-mail para confirmar sua conta."
              : "Seu acesso será liberado após aprovação de um administrador."}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label pb-1" htmlFor="name">
                <span className="label-text">Nome completo</span>
              </label>
              <input
                id="name"
                type="text"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label pb-1" htmlFor="email">
                <span className="label-text">E-mail</span>
              </label>
              <input
                id="email"
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label pb-1" htmlFor="ra">
                <span className="label-text">RA</span>
                <span className="label-text-alt text-base-content/40">opcional</span>
              </label>
              <input
                id="ra"
                type="text"
                className="input input-bordered w-full"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
                placeholder="Ex: 123456"
              />
            </div>

            {role === "staff" && (
              <div>
                <label className="label pb-1" htmlFor="setor">
                  <span className="label-text">Setor</span>
                  <span className="label-text-alt text-base-content/40">opcional</span>
                </label>
                <select
                  id="setor"
                  className="select select-bordered w-full"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                >
                  <option value="">Selecione seu setor</option>
                  <option value="Secretaria">Secretaria</option>
                  <option value="Biblioteca">Biblioteca</option>
                  <option value="Portaria">Portaria</option>
                  <option value="TI">TI</option>
                  <option value="Coordenação">Coordenação</option>
                  <option value="Laboratório">Laboratório</option>
                  <option value="Cantina">Cantina</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            )}

            <div>
              <label className="label pb-1" htmlFor="password">
                <span className="label-text">Senha</span>
                <span className="label-text-alt text-base-content/40">mín. 8 caracteres</span>
              </label>
              <input
                id="password"
                type="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="label pb-1" htmlFor="password-confirmation">
                <span className="label-text">Confirmar senha</span>
              </label>
              <input
                id="password-confirmation"
                type="password"
                className="input input-bordered w-full"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert alert-error py-2 text-sm">
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Já tem conta?{" "}
            <Link to="/login" className="link link-primary">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
