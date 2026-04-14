import { Link } from "react-router-dom";

export default function ConfirmEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl text-center">
        <div className="card-body gap-4">
          <span className="hero-envelope text-primary w-14 h-14 mx-auto" />
          <h1 className="text-2xl font-bold">Verifique seu e-mail</h1>
          <p className="text-base-content/60">
            Enviamos um link de confirmação para o seu e-mail. Clique nele para
            ativar sua conta e acessar o FindIt.
          </p>
          <p className="text-xs text-base-content/40">
            Não recebeu? Verifique a caixa de spam.
          </p>
          <Link to="/login" className="btn btn-outline btn-sm mt-2">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
