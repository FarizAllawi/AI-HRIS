# ================================
# 🔨 Builder Stage
# ================================
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Install PostgreSQL headers and compiler for psycopg2 and others
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_PYTHON_DOWNLOADS=0

WORKDIR /app

# Install dependencies first (better caching)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-dev

# Then copy the project and install it
COPY . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev


# ================================
# 🐍 Base Runtime Stage
# ================================
FROM python:3.12-slim-bookworm AS runtime

# Install runtime dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Setup a non-root user
RUN groupadd --system --gid 999 nonroot \
 && useradd --system --gid 999 --uid 999 --create-home nonroot

# Copy the application from the builder
COPY --from=builder --chown=nonroot:nonroot /app /app

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

# Use `/app` as the working directory
WORKDIR /app

# Creating required directories with proper permissions
RUN mkdir -p /app/uploads /app/keys /app/logs && \
    chown -R nonroot:nonroot /app/uploads /app/keys /app/logs && \
    chmod 755 /app/uploads /app/keys /app/logs

# Use the non-root user to run our application
USER nonroot

# ================================
# 🚀 FastAPI (Uvicorn)
# ================================
FROM runtime AS web

EXPOSE 8100

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100", "--log-level", "info"]


# ================================
# ⚙️ Celery Worker
# ================================
FROM runtime AS worker

CMD ["celery", "-A", "app.celery_app", "worker", "--loglevel=info", "--concurrency=2"]


# ================================
# ⏰ Celery Beat
# ================================
FROM runtime AS beat

CMD ["celery", "-A", "app.celery_app", "beat", "--loglevel=info"]


# ================================
# 🌼 Celery Flower Monitor
# ================================
FROM runtime AS flower

EXPOSE 5555

CMD ["celery", "-A", "app.celery_app", "flower", "--port=5555"]
