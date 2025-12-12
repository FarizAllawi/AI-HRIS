# Serving Application
## Development Mode
### 1. Create .env file
```bash
  cp .env.example .env
```
### 2. Database Migration
```bash
  php artisan migrate #1. Migrate database
```
### 3. Database Seeder (Optional)
```bash
  php artisan db:seed #1. Migrate database
```
### 4. Start the container
```bash
  # docker compose -f 'docker-compose.dev.yml' up # starting with logs
  docker compose -f 'docker-compose.dev.yml' up -d # starting in daemon or background process
```
