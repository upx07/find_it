import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center text-center px-6">
      <span className="hero-magnifying-glass w-16 h-16 text-base-content/20 mb-6" />
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <p className="text-xl font-semibold mb-2">Página não encontrada</p>
      <p className="text-base-content/60 mb-8 max-w-xs">
        A página que você procura não existe ou foi movida.
      </p>
      <Link to="/" className="btn btn-primary">
        Voltar ao início
      </Link>
    </div>
  );
}
