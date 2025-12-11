# ==========================================
# 🏗️ BASE BUILDER (Shared by Dev & Prod)
# ==========================================
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder-base
WORKDIR /app

# 1. Install system build dependencies (GCC, Postgre headers, curl for health checks)
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Set UV environment variables
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# 3. Install dependencies (Cached)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project

# ==========================================
# 💻 DEVELOPMENT STAGE
# ==========================================
FROM builder-base AS development

# Copy source and install the project in editable mode
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked

# Install supervisor for multi-process management
RUN apt-get update && apt-get install -y supervisor && rm -rf /var/lib/apt/lists/*

# Setup User and Directories
RUN groupadd --system --gid 999 nonroot \
 && useradd --system --gid 999 --uid 999 --create-home nonroot

RUN mkdir -p /app/uploads /app/keys /app/data /app/logs /app/shared && \
    chown -R nonroot:nonroot /app /app/data /app/uploads /app/keys /app/logs /app/shared && \
    chmod 755 /app/uploads /app/data /app/keys /app/logs /app/shared

# Copy and setup entrypoint
COPY docker/python-3.12/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && \
    chown nonroot:nonroot /app/entrypoint.sh

# Environment Setup
ENV PATH="/app/.venv/bin:$PATH"
ENTRYPOINT ["/app/entrypoint.sh"]
USER root


# ==========================================
# 🔨 PRODUCTION BUILDER (Intermediate)
# ==========================================
FROM builder-base AS builder-prod

# Copy source and install the project in NON-EDITABLE mode
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-editable

# ==========================================
# 🚀 PRODUCTION RUNTIME (Final Image)
# ==========================================
FROM python:3.12-slim-bookworm AS production

# 1. Install Runtime Libraries (No compilers, but curl for health checks)
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# 2. Create Non-root user
RUN groupadd --system --gid 999 nonroot \
 && useradd --system --gid 999 --uid 999 --create-home nonroot

# 3. COPY only the .venv from builder-prod (no source code needed with --no-editable)
COPY --from=builder-prod --chown=nonroot:nonroot /app/.venv /app/.venv

WORKDIR /app
COPY docker /app/docker

# 4. Setup Directories
RUN mkdir -p /var/log /app/logs /app/data/huggingface && \
    touch /var/log/supervisord.log && \
    touch /app/logs/supervisord.log && \
    touch /app/logs/fastapi.log /app/logs/worker.log /app/logs/beat.log /app/logs/flower.log && \
    chown -R nonroot:nonroot /var/log/supervisord.log /app/logs/ /app/data/huggingface && \
    chmod -R 755 /var/log/supervisord.log /app/logs/ /app/data/huggingface

# 5. Copy and setup entrypoint
COPY --from=builder-prod --chown=nonroot:nonroot /app/docker/python-3.12/entrypoint.sh /app/entrypoint.sh
COPY --from=builder-prod --chown=nonroot:nonroot /app /app
COPY --from=builder-prod --chown=nonroot:nonroot /app/.venv /app/.venv

RUN chmod +x /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh && \
    chown nonroot:nonroot /app/entrypoint.sh

# 6. Final Config
ENV PATH="/app/.venv/bin:$PATH"
ENTRYPOINT ["/app/entrypoint.sh"]
USER root

CMD ["supervisord", "-c", "/app/docker/python-3.12/supervisord.conf"]
