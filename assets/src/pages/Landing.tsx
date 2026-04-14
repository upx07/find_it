import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col bg-linear-to-br from-base-100 to-base-200">
      <nav className="navbar bg-primary text-primary-content px-6 shadow-md">
        <div className="flex-1 flex items-center gap-2">
          <span className="hero-magnifying-glass w-5 h-5" />
          <span className="font-bold text-lg tracking-tight">FindIt UniFacens</span>
        </div>
        <div className="flex gap-2">
          <Link to="/login" className="btn btn-ghost btn-sm text-primary-content">
            Entrar
          </Link>
          <Link to="/register" className="btn btn-sm bg-white text-primary hover:bg-base-200">
            Criar Conta
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center max-w-6xl mx-auto w-full px-6 py-12 gap-12">
        <div className="flex-1 flex flex-col items-start text-left">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
            Plataforma de Achados e Perdidos · Facens
          </p>
          <h1 className="text-5xl font-bold leading-tight mb-5">
            Perdeu algo<br />
            no campus?{" "}
            <span className="text-primary">A gente encontra.</span>
          </h1>
          <p className="text-base-content/60 text-lg max-w-md mb-10">
            A FindIt usa inteligência artificial para identificar e catalogar
            objetos perdidos. Encontre o seu e retire na secretaria.
          </p>
          <div className="flex gap-3">
            <Link to="/buscar" className="btn btn-primary btn-lg">
              Buscar item perdido
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Entrar com conta
            </Link>
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center">
          <img
            src="/campus-map.png"
            alt="Mapa do campus Facens"
            className="w-full max-w-lg drop-shadow-2xl"
          />
        </div>
      </main>

      <section className="bg-base-200 px-6 py-12">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase text-center mb-2">
          Como Funciona
        </p>
        <h2 className="text-2xl font-bold text-center mb-8">
          Simples, rápido e seguro
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center gap-2">
              <span className="hero-camera w-8 h-8 text-primary" />
              <h3 className="card-title text-base">Captura automática</h3>
              <p className="text-sm text-base-content/70">
                A câmera ESP32-CAM fotografa o objeto e a IA descreve e categoriza automaticamente.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center gap-2">
              <span className="hero-magnifying-glass w-8 h-8 text-primary" />
              <h3 className="card-title text-base">Busca inteligente</h3>
              <p className="text-sm text-base-content/70">
                Descreva o que perdeu em linguagem natural e receba os itens mais compatíveis.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center gap-2">
              <span className="hero-check-circle w-8 h-8 text-primary" />
              <h3 className="card-title text-base">Retirada presencial</h3>
              <p className="text-sm text-base-content/70">
                Retire seu objeto na secretaria com RA e CPF. Tudo rastreado e seguro.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-6 text-sm text-base-content/50">
        © 2026 FindIt UniFacens · Projeto UPx07
      </footer>
    </div>
  );
}
