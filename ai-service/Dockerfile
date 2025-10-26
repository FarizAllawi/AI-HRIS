# ---- Base image ----
FROM ghcr.io/astral-sh/uv:python3.12-bookworm

# Set working directory
WORKDIR /app

# Copy dependency files first (for layer caching)
COPY pyproject.toml ./

# Install dependencies (include dev deps for linting, testing, etc.)
RUN uv lock --upgrade
RUN uv sync --frozen

# Copy all project files
COPY . .

# Use uv-managed virtual environment
ENV PATH="/app/.venv/bin:$PATH"

## Expose FastAPI default port
#EXPOSE 8000
#
## Enable fastapi auto-reload
#CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]