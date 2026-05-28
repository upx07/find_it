# ---- Build stage ----
FROM elixir:1.18-otp-26 AS builder

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mix local.hex --force && mix local.rebar --force

ENV MIX_ENV=prod

# Elixir deps (camada cacheada separadamente)
COPY mix.exs mix.lock ./
RUN mix deps.get --only prod
RUN mix deps.compile

# Node deps (camada cacheada separadamente)
COPY assets/package.json assets/package-lock.json ./assets/
RUN npm ci --prefix assets

# Código fonte
COPY config ./config
COPY priv ./priv
COPY lib ./lib
COPY assets ./assets

# Compila o código
RUN mix compile

# Build dos assets com Vite e gera o cache_manifest.json (obrigatório em prod)
RUN npm run build --prefix assets && mix phx.digest

# Gera release
RUN mix release

# ---- Runtime stage ----
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y \
    libssl3 \
    libncurses6 \
    locales \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

WORKDIR /app

RUN useradd --create-home app
USER app

COPY --from=builder --chown=app:app /app/_build/prod/rel/find_it ./

ENV HOME=/app PHX_SERVER=true

CMD bin/find_it eval "FindIt.Release.migrate()" && bin/find_it start
