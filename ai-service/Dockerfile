FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential git && \
    rm -rf /var/lib/apt/lists/*


COPY ./src /app

# Install CPU-only PyTorch (latest stable version)
RUN pip install --no-cache-dir torch==2.6.0 torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install requirements dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8100

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8100"]
