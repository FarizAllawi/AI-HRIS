.PHONY: help setup install dev-install build up down logs restart clean test migrate shell

# Detect docker compose command (prefer modern plugin)
DOCKER_COMPOSE := $(shell which docker compose 2>/dev/null)

# Detect docker compose command (prefer modern plugin)
ifneq (, $(shell docker compose version 2>/dev/null))
	DOCKER_COMPOSE := docker compose
else ifneq (, $(shell which docker-compose 2>/dev/null))
	DOCKER_COMPOSE := docker-compose
	$(warning ⚠️  You are using the legacy docker-compose (Python version).)
	$(warning ⚙️  It may cause errors like "Not supported URL scheme http+docker".)
	$(warning 💡 Please run: sudo apt remove docker-compose -y && sudo apt install docker-compose-plugin -y)
else
	$(error ❌ Docker Compose not found. Install it via: sudo apt install docker-compose-plugin -y)
endif

# If neither is installed, stop immediately
ifeq ($(DOCKER_COMPOSE),)
$(error ❌ Docker Compose not found. Install it via: sudo apt install docker-compose-plugin -y)
endif

help:
	@echo "AI Screening Service - Available Commands:"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make setup         - Create virtual environment"
	@echo "  make install       - Install base dependencies"
	@echo "  make dev-install   - Install all dependencies (including ML libs)"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make build         - Build all Docker images"
	@echo "  make up            - Start all services"
	@echo "  make down          - Stop all services"
	@echo "  make logs          - View logs (all services)"
	@echo "  make logs-web      - View FastAPI logs"
	@echo "  make logs-celery   - View Celery worker logs"
	@echo "  make restart       - Restart all services"
	@echo ""
	@echo "Development:"
	@echo "  make run-api       - Run FastAPI locally"
	@echo "  make run-celery    - Run Celery worker locally"
	@echo "  make run-beat      - Run Celery beat locally"
	@echo "  make shell         - Open shell in web container"
	@echo ""
	@echo "Database:"
	@echo "  make migrate       - Run database migrations"
	@echo "  make db-shell      - Open PostgreSQL shell"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test          - Run tests"
	@echo "  make lint          - Run linters"
	@echo "  make format        - Format code"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean         - Clean cache and temp files"
	@echo "  make clean-all     - Clean everything including volumes"

# Setup
setup:
	python3 -m venv venv
	@echo "✅ Virtual environment created"
	@echo "Activate with: source venv/bin/activate"

install:
	pip install --upgrade pip
	pip install -r requirements.txt
	@echo "✅ Base dependencies installed"

dev-install: install
	pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
	pip install transformers sentence-transformers
	@echo "✅ All dependencies installed (including ML libs)"

# Docker commands
build:
	$(DOCKER_COMPOSE) build
	@echo "✅ Docker images built"

up:
	$(DOCKER_COMPOSE) up -d
	@echo "✅ Services started"
	@echo "📍 FastAPI: http://localhost:8100"
	@echo "📍 API Docs: http://localhost:8100/docs"
	@echo "📍 Flower: http://localhost:5555"

down:
	$(DOCKER_COMPOSE) down
	@echo "✅ Services stopped"

logs:
	$(DOCKER_COMPOSE) logs -f

logs-web:
	$(DOCKER_COMPOSE) logs -f web

logs-celery:
	$(DOCKER_COMPOSE) logs -f celery-worker

logs-flower:
	$(DOCKER_COMPOSE) logs -f flower

restart:
	$(DOCKER_COMPOSE) restart
	@echo "✅ Services restarted"

restart-web:
	$(DOCKER_COMPOSE) restart web

restart-celery:
	$(DOCKER_COMPOSE) restart celery-worker

# Local development
run-api:
	@echo "Starting FastAPI server..."
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8100

run-celery:
	@echo "Starting Celery worker..."
	celery -A app.celery_app worker --loglevel=info

run-beat:
	@echo "Starting Celery beat..."
	celery -A app.celery_app beat --loglevel=info

run-flower:
	@echo "Starting Flower..."
	celery -A app.celery_app flower --port=5555

# Database
migrate:
	@echo "Running database migrations..."
	alembic upgrade head

migrate-create:
	@echo "Creating new migration..."
	@read -p "Enter migration message: " msg; \
	alembic revision --autogenerate -m "$$msg"

db-shell:
	$(DOCKER_COMPOSE) exec postgres psql -U admin -d screening_db

# Shell access
shell:
	$(DOCKER_COMPOSE) exec web bash

shell-celery:
	$(DOCKER_COMPOSE) exec celery-worker bash

# Testing
test:
	pytest tests/ -v

test-cov:
	pytest --cov=app --cov-report=html --cov-report=term tests/

lint:
	flake8 app/ --count --select=E9,F63,F7,F82 --show-source --statistics
	flake8 app/ --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

format:
	black app/
	isort app/

# Clean up
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf .coverage htmlcov/ dist/ build/
	@echo "✅ Cache cleaned"

clean-all: down clean
	$(DOCKER_COMPOSE) down -v
	docker system prune -f
	@echo "✅ Everything cleaned (including volumes)"

# Quick start for new developers
quickstart: setup install
	@echo ""
	@echo "🎉 Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Copy environment file: cp .env.example .env"
	@echo "2. Edit .env with your settings"
	@echo "3. Start services: make up"
	@echo "4. Check logs: make logs"
	@echo "5. Visit: http://localhost:8100/docs"

# Production deployment
deploy-prod: build
	@echo "Deploying to production..."
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "✅ Production deployment complete"

# Status check
status:
	@echo "Checking service status..."
	$(DOCKER_COMPOSE) ps

# Create required directories
init-dirs:
	mkdir -p data/models data/embeddings data/replay_buffer uploads
	touch data/models/.gitkeep data/embeddings/.gitkeep data/replay_buffer/.gitkeep uploads/.gitkeep
	@echo "✅ Data directories created"