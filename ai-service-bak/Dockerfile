# ==========================================
# Stage 1: Base image for common dependencies
# ==========================================
FROM python:3.12-slim-bookworm AS base

RUN apt-get update && apt-get install --no-install-recommends -y \
    build-essential \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv
ADD https://astral.sh/uv/install.sh /install.sh
RUN chmod -R 755 /install.sh && /install.sh && rm /install.sh
ENV PATH="/root/.local/bin:${PATH}"

# AVOID USING CUDA PACKAGE
ENV CUDA_VISIBLE_DEVICES=""
ENV TRANSFORMERS_NO_CUDA=1

WORKDIR /app

# Copy project files
COPY pyproject.toml ./
# Copy uv.lock if it exists
COPY uv.lock* ./

# Copy application code
COPY app ./app

# Install base dependencies
RUN uv sync --no-dev || uv pip install -e .

ENV PATH="/app/.venv/bin:${PATH}"
ENV PYTHONPATH=/app

# ==========================================
# Stage 2: FastAPI image (lightweight)
# ==========================================
FROM base AS fastapi

EXPOSE 8100

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100", "--reload"]

# ==========================================
# Stage 3: Celery Worker image (with ML libs)
# ==========================================
FROM base AS celery-worker

# Install PyTorch CPU version and ML dependencies
RUN pip install --no-cache-dir \
    torch==2.6.0 \
    torchvision \
    torchaudio \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Install additional ML dependencies
RUN pip install --no-cache-dir \
    "python-multipart>=0.0.20" \
    "transformers>=4.57.1" \
    "sentence-transformers>=5.1.1"

CMD ["celery", "-A", "app.celery_app.celery_app", "worker", "--loglevel=info"]