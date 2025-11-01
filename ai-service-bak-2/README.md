## Requirements
 - Redis


## Activate Python Virtual Env
```bash
    source venv/bin/activate
```

## Install Dependencies
Install Pytorch cpu version only
```bash
  pip install --no-cache-dir torch==2.6.0 torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```
Install Requirements
```bash
  pip install --no-cache-dir -r app/requirements.txt
```

## Run Celery App
```bash
  celery -A app.celery_app.celery_app worker --loglevel=info
```

## Run Local
```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8100
```

