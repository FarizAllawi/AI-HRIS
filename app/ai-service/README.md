# Requirements
- PostgreSQL
- Redis
- UV package manager (https://docs.astral.sh/uv/)
- Docker (Optional for development)

# Development Step
### First make the env file from .env.example
```bash
    cp .env.example .env
```

### Add the `API_CLIENT_ID` and `API_CLIENT_SECRET`
If you don’t have these values yet, first follow the Development Mode steps in
hrms-app/README.md. After you run `Generate Passport Client For AI-SERVICE`, then run this command:
```bash
    # Update API credentials in .env (Linux)
sed -i 's/^API_CLIENT_ID=.*/API_CLIENT_ID=<your_client_id>/' .env && \
sed -i 's/^API_CLIENT_SECRET=.*/API_CLIENT_SECRET=<your_client_secret>/' .env
````
```bash
  # Update API credentials in .env (MacOS)
sed -i '' 's/^API_CLIENT_ID=.*/API_CLIENT_ID=<your_client_id>/' .env && \
sed -i '' 's/^API_CLIENT_SECRET=.*/API_CLIENT_SECRET=<your_client_secret>/' .env
````
Replace:
- <your_client_id>
- <your_client_secret>

with the values shown in the passport output.

# Development with docker
  ```bash
    docker compose up --watch
  ```

You can check:
- Web Development: http://localhost:8100/
- Flower task monitoring: http://localhost:5555/

# Development without docker
  ### Sync Package
  ```bash
    uv sync
  ```

  ### Run FastAPI
  ```bash
    uvicorn app.main:app --reload --port 8100
  ```

  ### In another terminal: Run Celery worker
  ```bash
    celery -A app.celery_app worker --loglevel=info
  ```

  ### Optional: Run Celery beat (periodic tasks)
  ```bash
    celery -A app.celery_app beat --loglevel=info
  ```

  ### Optional: Run Celery flower for monitoring purpose
  ```bash
    celery -A app.celery_app flower --port=5555
  ```

# Production Step
Fill the required Environtment variables in file `docker-compose.prod.yml`

### Create necessary directories
```bash
  mkdir -p logs data uploads keys
```

### Deploy with production env file
```bash
  docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Scale workers if needed
```bash
  docker-compose -f docker-compose.prod.yml up -d --scale celery-worker=2
```

### View logs
```bash
  docker-compose -f docker-compose.prod.yml logs -f
```

### Backup database
```bash
docker exec fastapi-postgres pg_dump -U admin screening_db > backup.sql
```
