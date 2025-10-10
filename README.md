# AI-HRMS

# Development
docker compose -f docker-compose.yml -f docker-compose.development.yml up --build

# Production
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
