# ==========================================
# 🏗️ BASE BUILDER (Shared by Dev & Prod)
# ==========================================
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder-base
WORKDIR /app

# 1. Install system build dependencies (GCC, Postgre headers)
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    g++ \
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

# Setup User and Directories
RUN groupadd --system --gid 999 nonroot \
 && useradd --system --gid 999 --uid 999 --create-home nonroot

RUN mkdir -p /app/uploads /app/keys /app/data /app/logs && \
    chown -R nonroot:nonroot /app /app/data /app/uploads /app/keys /app/logs && \
    chmod 755 /app/uploads /app/data /app/keys /app/logs

# Environment Setup
ENV PATH="/app/.venv/bin:$PATH"
# Reset ENTRYPOINT so we dont have add uv to call command
ENTRYPOINT []
USER nonroot


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
WORKDIR /app

# 1. Install Runtime Libraries (No compilers)
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# 2. Create Non-root user
RUN groupadd --system --gid 999 nonroot \
 && useradd --system --gid 999 --uid 999 --create-home nonroot

# 3. COPY only the .venv from builder-prod (no source code needed with --no-editable)
COPY --from=builder-prod --chown=nonroot:nonroot /app/.venv /app/.venv

# 4. Setup Directories
RUN mkdir -p /app/uploads /app/keys /app/logs && \
    chown -R nonroot:nonroot /app/uploads /app/keys /app/logs && \
    chmod 755 /app/uploads /app/keys /app/logs

# 5. Final Config
ENV PATH="/app/.venv/bin:$PATH"
USER nonroot

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100"]
