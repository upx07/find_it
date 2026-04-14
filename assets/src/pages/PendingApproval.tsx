import { Link } from "react-router-dom";

export default function PendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl text-center">
        <div className="card-body gap-4">
          <span className="hero-clock text-warning w-14 h-14 mx-auto" />
          <h1 className="text-2xl font-bold">Solicitação enviada</h1>
          <p className="text-base-content/60">
            Seu cadastro foi recebido e está aguardando aprovação de um
            administrador. Você será notificado quando o acesso for liberado.
          </p>
          <p className="text-xs text-base-content/40">
            Em caso de dúvidas, entre em contato com a secretaria.
          </p>
          <Link to="/" className="btn btn-outline btn-sm mt-2">
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
