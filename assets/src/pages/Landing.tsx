import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <nav className="navbar bg-primary text-primary-content px-4 shadow-md">
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

      {/* Hero */}
      <main className="flex-1 flex flex-col md:flex-row items-center max-w-6xl mx-auto w-full px-5 py-8 md:py-12 gap-8 md:gap-12">

        {/* Imagem — aparece primeiro no mobile, lado direito no desktop */}
        <div className="w-full md:hidden flex justify-center">
          <img
            src="/campus-map.png"
            alt="Mapa do campus Facens"
            className="w-64 drop-shadow-xl rounded-xl"
          />
        </div>

        {/* Texto */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Achados e Perdidos · Facens
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Perdeu algo no campus?{" "}
            <span className="text-primary">A gente encontra.</span>
          </h1>
          <p className="text-base-content/60 text-base md:text-lg max-w-md mb-8">
            A FindIt usa inteligência artificial para identificar e catalogar
            objetos perdidos. Encontre o seu e retire na secretaria.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link to="/buscar" className="btn btn-primary btn-lg w-full sm:w-auto">
              Buscar item perdido
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg w-full sm:w-auto">
              Entrar com conta
            </Link>
          </div>
        </div>

        {/* Imagem — só no desktop */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <img
            src="/campus-map.png"
            alt="Mapa do campus Facens"
            className="w-full max-w-lg drop-shadow-2xl"
          />
        </div>
      </main>

      {/* Como funciona */}
      <section className="bg-base-200 px-5 py-10">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase text-center mb-2">
          Como Funciona
        </p>
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6">
          Simples, rápido e seguro
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center gap-2 p-5">
              <span className="hero-camera w-8 h-8 text-primary" />
              <h3 className="font-bold text-sm">Captura automática</h3>
              <p className="text-xs text-base-content/70">
                A câmera ESP32-CAM fotografa o objeto e a IA descreve e categoriza automaticamente.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center gap-2 p-5">
              <span className="hero-magnifying-glass w-8 h-8 text-primary" />
              <h3 className="font-bold text-sm">Busca inteligente</h3>
              <p className="text-xs text-base-content/70">
                Descreva o que perdeu e receba os itens mais compatíveis.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center gap-2 p-5">
              <span className="hero-check-circle w-8 h-8 text-primary" />
              <h3 className="font-bold text-sm">Retirada presencial</h3>
              <p className="text-xs text-base-content/70">
                Retire seu objeto na secretaria com RA e CPF. Tudo rastreado e seguro.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center py-5 text-xs text-base-content/50">
        © 2026 FindIt UniFacens · Projeto UPx07
      </footer>
    </div>
  );
}
