FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS base

# Setup a non-root user
RUN groupadd --system --gid 999 nonroot \
 && useradd --system --gid 999 --uid 999 --create-home nonroot

WORKDIR /app

# Install PostgreSQL headers and compiler for psycopg2 and others
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Bytecode optimization
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_TOOL_BIN_DIR=/usr/local/bin

# Copy project metadata and sync dependencies
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-dev

# Copy the rest of the source
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

# Creating required directories with proper permissions
RUN mkdir -p /app/uploads /app/keys /app/data /app/logs && \
    chown -R nonroot:nonroot /app/data /app/uploads /app/keys /app/logs && \
    chmod 755 /app/uploads /app/data /app/keys /app/logs


# Add virtualenv to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Reset the entrypoint, don't invoke `uv`
ENTRYPOINT []

# Use non-root user
USER nonroot

# ================================
# 🚀 Stage 1 - FastAPI (Uvicorn)
# ================================
FROM base AS web

# Expose FastAPI port
EXPOSE 8100

# Command for running FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100", "--log-level", "info", "--reload"]


# ================================
# ⚙️ Stage 2 - Celery Worker
# ================================
FROM base AS celery

# Command for running Celery worker
CMD ["celery", "-A", "app.celery_app", "worker", "--loglevel=info"]


# ================================
# 🌼 Stage 3 - Celery Flower Monitor
# ================================
FROM base AS flower

EXPOSE 5555
# Command for running Flower dashboard
CMD ["celery", "-A", "app.celery_app", "flower", "--port=5555"]
