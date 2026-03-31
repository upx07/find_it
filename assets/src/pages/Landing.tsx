import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <nav className="navbar bg-primary text-primary-content px-6 shadow-md">
        <div className="flex-1 flex items-center gap-2">
          <span className="hero-magnifying-glass w-5 h-5" />
          <span className="font-bold text-lg tracking-tight">FindIt UniFacens</span>
        </div>
        <div className="flex gap-2">
          <a href="/auth/sign-in" className="btn btn-ghost btn-sm text-primary-content">
            Entrar
          </a>
          <a href="/auth/register" className="btn btn-sm bg-white text-primary hover:bg-base-200">
            Criar Conta
          </a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">
          Plataforma de Achados e Perdidos
        </p>
        <h1 className="text-4xl font-bold leading-tight max-w-sm mb-4">
          Perdeu algo no campus?{" "}
          <span className="text-primary">A gente encontra pra você.</span>
        </h1>
        <p className="text-base-content/70 max-w-sm mb-8">
          A FindIt conecta objetos perdidos aos seus donos usando inteligência
          artificial. Identifique e retire presencialmente na secretaria.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a href="/auth/register" className="btn btn-primary">
            Criar minha conta &rarr;
          </a>
          <a href="/auth/sign-in" className="btn btn-outline">
            Já tenho conta
          </a>
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
