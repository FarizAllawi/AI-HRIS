.PHONY: help install-requirements install-python install-uv install-composer install-nvm install-node install-pnpm install-docker install-redis install-postgres install-all serve-hrms-local serve-ai-local build-hrms build-ai build-all serve-hrms-docker serve-ai-docker serve-all-docker deploy-hrms-vps deploy-hrms-docker deploy-ai-docker deploy-all-docker status clean clean-all quickstart

# Detect OS and set appropriate shell
UNAME_S := $(shell uname -s 2>/dev/null || echo Windows)
ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
    SHELL := powershell.exe
    .SHELLFLAGS := -NoProfile -Command
    # Disable colors on Windows to avoid PowerShell parsing issues
    RED := 
    GREEN := 
    YELLOW := 
    BLUE := 
    MAGENTA := 
    CYAN := 
    NC := 
else
    DETECTED_OS := $(UNAME_S)
    # Colors for Unix-like systems
    RED := \033[0;31m
    GREEN := \033[0;32m
    YELLOW := \033[0;33m
    BLUE := \033[0;34m
    MAGENTA := \033[0;35m
    CYAN := \033[0;36m
    NC := \033[0m # No Color
endif

# Progress bar function
define show_progress
	@echo "$(CYAN)⏳ $(1)...$(NC)"
	@printf "["
	@for i in 1 2 3 4 5 6 7 8 9 10; do \
		printf "▓"; \
		sleep 0.1; \
	done
	@printf "] $(GREEN)✓$(NC)\n"
endef

# Check if command exists
define check_command
	@command -v $(1) >/dev/null 2>&1 && echo "$(GREEN)✓ $(1) installed$(NC)" || echo "$(RED)✗ $(1) not found$(NC)"
endef

# Windows version of check_command
define check_command_windows
	@where $(1) >nul 2>&1 && echo ✓ $(1) installed || echo ✗ $(1) not found
endef

help:
ifeq ($(DETECTED_OS),Windows)
	@echo "========================================"
	@echo "    AI-HRIS Project Build System"
	@echo "========================================"
	@echo ""
	@echo "Detected OS: Windows"
	@echo ""
	@echo "INSTALLATION:"
	@echo "  make install-requirements - Install all required tools"
	@echo "  make install-python      - Install Python"
	@echo "  make install-php         - Install PHP 8.4"
	@echo "  make install-uv          - Install uv package manager"
	@echo "  make install-composer    - Install PHP Composer"
	@echo "  make install-nvm         - Install NVM"
	@echo "  make install-node        - Install Node.js via NVM"
	@echo "  make install-pnpm        - Install pnpm"
	@echo "  make install-docker      - Install Docker"
	@echo "  make install-redis       - Install Redis"
	@echo "  make install-postgres    - Install PostgreSQL"
	@echo "  make install-all         - Install everything"
	@echo ""
	@echo "DEVELOPMENT:"
	@echo "  make serve-hrms-local    - Start HRMS-APP locally"
	@echo "  make serve-ai-local      - Start AI-SERVICE locally"
	@echo "  make build-hrms          - Build HRMS-APP"
	@echo "  make build-ai            - Build AI-SERVICE"
	@echo "  make build-all           - Build both services"
	@echo ""
	@echo "DOCKER:"
	@echo "  make serve-hrms-docker   - Run HRMS-APP with Docker"
	@echo "  make serve-ai-docker     - Run AI-SERVICE with Docker"
	@echo "  make serve-all-docker    - Run both with Docker"
	@echo ""
	@echo "DEPLOYMENT:"
	@echo "  make deploy-hrms-vps     - Deploy HRMS-APP to VPS"
	@echo "  make deploy-hrms-docker  - Deploy HRMS-APP with Docker"
	@echo "  make deploy-ai-docker    - Deploy AI-SERVICE with Docker"
	@echo "  make deploy-all-docker   - Deploy both with Docker"
	@echo ""
	@echo "UTILITIES:"
	@echo "  make status              - Check service status"
	@echo "  make clean               - Clean build artifacts"
	@echo "  make clean-all           - Clean everything"
	@echo ""
	@echo "QUICKSTART:"
	@echo "  make quickstart          - Setup development environment"
else
	@echo "$(BLUE)========================================"
	@echo "    AI-HRIS Project Build System"
	@echo "========================================$(NC)"
	@echo ""
	@echo "$(YELLOW)Detected OS: $(DETECTED_OS)$(NC)"
	@echo ""
	@echo "$(GREEN)📧 INSTALLATION:$(NC)"
	@echo "  make install-requirements - Install all required tools"
	@echo "  make install-python      - Install Python"
	@echo "  make install-php         - Install PHP 8.4"
	@echo "  make install-uv          - Install uv package manager"
	@echo "  make install-composer    - Install PHP Composer"
	@echo "  make install-nvm         - Install NVM"
	@echo "  make install-node        - Install Node.js via NVM"
	@echo "  make install-pnpm        - Install pnpm"
	@echo "  make install-docker      - Install Docker"
	@echo "  make install-redis       - Install Redis"
	@echo "  make install-postgres    - Install PostgreSQL"
	@echo "  make install-all         - Install everything"
	@echo ""
	@echo "$(GREEN)🛠️  DEVELOPMENT:$(NC)"
	@echo "  make serve-hrms-local    - Start HRMS-APP locally"
	@echo "  make serve-ai-local      - Start AI-SERVICE locally"
	@echo "  make build-hrms          - Build HRMS-APP"
	@echo "  make build-ai            - Build AI-SERVICE"
	@echo "  make build-all           - Build both services"
	@echo ""
	@echo "$(GREEN)🐳 DOCKER:$(NC)"
	@echo "  make serve-hrms-docker   - Run HRMS-APP with Docker"
	@echo "  make serve-ai-docker     - Run AI-SERVICE with Docker"
	@echo "  make serve-all-docker    - Run both with Docker"
	@echo ""
	@echo "$(GREEN)🚀 DEPLOYMENT:$(NC)"
	@echo "  make deploy-hrms-vps     - Deploy HRMS-APP to VPS"
	@echo "  make deploy-hrms-docker  - Deploy HRMS-APP with Docker"
	@echo "  make deploy-ai-docker    - Deploy AI-SERVICE with Docker"
	@echo "  make deploy-all-docker   - Deploy both with Docker"
	@echo ""
	@echo "$(GREEN)🧹 UTILITIES:$(NC)"
	@echo "  make status              - Check service status"
	@echo "  make clean               - Clean build artifacts"
	@echo "  make clean-all           - Clean everything"
	@echo ""
	@echo "$(GREEN)⚡ QUICKSTART:$(NC)"
	@echo "  make quickstart          - Setup development environment"
endif
	@echo ""

# Installation Commands
install-requirements: install-python install-uv install-composer install-nvm install-node install-pnpm
	@echo "$(GREEN)✓ All required tools installed!$(NC)"

install-python:
ifeq ($(DETECTED_OS),Darwin)
	@echo "$(BLUE)📦 Installing Python on macOS...$(NC)"
	@command -v brew >/dev/null 2>&1 || /bin/bash -c "$$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
	@brew install python@3.12
	$(call show_progress,Installing Python)
	@echo "$(GREEN)✓ Python installed successfully!$(NC)"
else ifeq ($(DETECTED_OS),Linux)
	@echo "$(BLUE)📦 Installing Python on Linux...$(NC)"
	@if command -v apt-get >/dev/null 2>&1; then \
		sudo apt-get update && sudo apt-get install -y python3.12 python3.12-venv python3-pip; \
	elif command -v yum >/dev/null 2>&1; then \
		sudo yum install -y python312 python312-pip; \
	elif command -v dnf >/dev/null 2>&1; then \
		sudo dnf install -y python3.12 python3.12-pip; \
	fi
	$(call show_progress,Installing Python)
	@echo "$(GREEN)✓ Python installed successfully!$(NC)"
else ifeq ($(DETECTED_OS),Windows)
	@echo "$(BLUE)📦 Installing Python on Windows...$(NC)"
	@if (Get-Command python -ErrorAction SilentlyContinue) { \
		Write-Host "Python already installed" -ForegroundColor Green; \
	} else { \
		Write-Host "Opening Python download page..." -ForegroundColor Yellow; \
		Start-Process "https://www.python.org/downloads/"; \
		Write-Host "Please install Python 3.12+ and restart terminal" -ForegroundColor Yellow; \
	}
endif

install-uv:
	@echo "$(BLUE)📦 Installing uv package manager...$(NC)"
ifeq ($(DETECTED_OS),Windows)
	@powershell -Command "irm https://astral.sh/uv/install.ps1 | iex"
else
	@curl -LsSf https://astral.sh/uv/install.sh | sh
endif
	$(call show_progress,Installing uv)
	@echo "$(GREEN)✓ uv installed successfully!$(NC)"
	@echo "$(YELLOW)⚠️  Please restart your terminal$(NC)"

install-php:
	@echo "$(BLUE)📦 Installing PHP 8.4...$(NC)"
ifeq ($(DETECTED_OS),Darwin)
	@/bin/bash -c "$$(curl -fsSL https://php.new/install/mac/8.4)"
	$(call show_progress,Installing PHP)
else ifeq ($(DETECTED_OS),Linux)
	@/bin/bash -c "$$(curl -fsSL https://php.new/install/linux/8.4)"
	$(call show_progress,Installing PHP)
else ifeq ($(DETECTED_OS),Windows)
	@cmd /c "build.bat install-php"
	$(call show_progress,Installing PHP)
endif
	@echo "$(GREEN)✓ PHP 8.4 installed successfully!$(NC)"

install-composer:
	@echo "$(BLUE)📦 Installing PHP Composer...$(NC)"
ifeq ($(DETECTED_OS),Darwin)
	@brew install composer
	$(call show_progress,Installing Composer)
else ifeq ($(DETECTED_OS),Linux)
	@curl -sS https://getcomposer.org/installer | php
	@sudo mv composer.phar /usr/local/bin/composer
	@sudo chmod +x /usr/local/bin/composer
	$(call show_progress,Installing Composer)
else ifeq ($(DETECTED_OS),Windows)
	@powershell -Command "Invoke-WebRequest -Uri https://getcomposer.org/installer -OutFile composer-setup.php; php composer-setup.php; Remove-Item composer-setup.php"
endif
	@echo "$(GREEN)✓ Composer installed successfully!$(NC)"

install-nvm:
	@echo "$(BLUE)📦 Installing NVM...$(NC)"
ifeq ($(DETECTED_OS),Darwin)
	@curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
	$(call show_progress,Installing NVM)
else ifeq ($(DETECTED_OS),Linux)
	@curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
	$(call show_progress,Installing NVM)
else ifeq ($(DETECTED_OS),Windows)
	@powershell -Command "Start-Process 'https://github.com/coreybutler/nvm-windows/releases'"
	@echo "$(YELLOW)Please download and install nvm-setup.exe$(NC)"
endif
	@echo "$(GREEN)✓ NVM installed successfully!$(NC)"
	@echo "$(YELLOW)⚠️  Please restart your terminal and run: source ~/.nvm/nvm.sh$(NC)"

install-node:
	@echo "$(BLUE)📦 Installing Node.js...$(NC)"
ifeq ($(DETECTED_OS),Windows)
	@powershell -Command "if (Get-Command nvm -ErrorAction SilentlyContinue) { nvm install latest; nvm use latest } else { Write-Host 'Please install NVM first' -ForegroundColor Red }"
else
	@bash -c "source ~/.nvm/nvm.sh && nvm install node && nvm use node"
endif
	$(call show_progress,Installing Node.js)
	@echo "$(GREEN)✓ Node.js installed successfully!$(NC)"

install-pnpm:
	@echo "$(BLUE)📦 Installing pnpm...$(NC)"
	@npm install -g pnpm
	$(call show_progress,Installing pnpm)
	@echo "$(GREEN)✓ pnpm installed successfully!$(NC)"

install-docker:
	@echo "$(BLUE)📦 Installing Docker...$(NC)"
ifeq ($(DETECTED_OS),Darwin)
	@echo "$(YELLOW)Opening Docker Desktop download page...$(NC)"
	@open "https://www.docker.com/products/docker-desktop/"
else ifeq ($(DETECTED_OS),Linux)
	@curl -fsSL https://get.docker.com -o get-docker.sh
	@sudo sh get-docker.sh
	@sudo usermod -aG docker $$USER
	@rm get-docker.sh
	$(call show_progress,Installing Docker)
else ifeq ($(DETECTED_OS),Windows)
	@powershell -Command "Start-Process 'https://www.docker.com/products/docker-desktop/'"
endif
	@echo "$(GREEN)✓ Docker installation initiated!$(NC)"

install-redis:
	@echo "$(BLUE)📦 Installing Redis...$(NC)"
ifeq ($(DETECTED_OS),Darwin)
	@brew install redis
	@brew services start redis
else ifeq ($(DETECTED_OS),Linux)
	@sudo apt-get update && sudo apt-get install -y redis-server
	@sudo systemctl enable redis-server
	@sudo systemctl start redis-server
else ifeq ($(DETECTED_OS),Windows)
	@echo "$(YELLOW)Please use Docker for Redis on Windows$(NC)"
	@echo "docker run -d -p 6379:6379 redis:latest"
endif
	$(call show_progress,Installing Redis)
	@echo "$(GREEN)✓ Redis installed successfully!$(NC)"

install-postgres:
	@echo "$(BLUE)📦 Installing PostgreSQL...$(NC)"
ifeq ($(DETECTED_OS),Darwin)
	@brew install postgresql@15
	@brew services start postgresql@15
else ifeq ($(DETECTED_OS),Linux)
	@sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib
	@sudo systemctl enable postgresql
	@sudo systemctl start postgresql
else ifeq ($(DETECTED_OS),Windows)
	@echo "$(YELLOW)Opening PostgreSQL download page...$(NC)"
	@powershell -Command "Start-Process 'https://www.postgresql.org/download/windows/'"
endif
	$(call show_progress,Installing PostgreSQL)
	@echo "$(GREEN)✓ PostgreSQL installed successfully!$(NC)"

install-all: install-requirements install-docker install-redis install-postgres
	@echo "$(GREEN)✓ All tools installed successfully!$(NC)"

# Development Commands
serve-hrms-local:
	@echo "$(BLUE)🚀 Starting HRMS-APP locally...$(NC)"
	@cd hrms-app && \
		echo "$(CYAN)Installing PHP dependencies...$(NC)" && \
		composer install && \
		echo "$(CYAN)Installing Node.js dependencies...$(NC)" && \
		npm install && \
		echo "$(CYAN)Building assets...$(NC)" && \
		npm run build && \
		echo "$(GREEN)✓ Starting Laravel server on http://localhost:8000$(NC)" && \
		php artisan serve --port=8000

serve-ai-local:
	@echo "$(BLUE)🚀 Starting AI-SERVICE locally...$(NC)"
	@cd ai-service && \
		echo "$(CYAN)Installing Python dependencies...$(NC)" && \
		uv sync && \
		echo "$(GREEN)✓ Starting FastAPI server on http://localhost:8100$(NC)" && \
		uv run uvicorn app.main:app --host 0.0.0.0 --port=8100 --reload

build-hrms:
	@echo "$(BLUE)🔨 Building HRMS-APP...$(NC)"
	@cd hrms-app && \
		composer install --no-dev --optimize-autoloader && \
		npm install && \
		npm run build
	$(call show_progress,Building HRMS-APP)
	@echo "$(GREEN)✓ HRMS-APP build complete!$(NC)"

build-ai:
	@echo "$(BLUE)🔨 Building AI-SERVICE...$(NC)"
	@cd ai-service && uv sync --frozen
	$(call show_progress,Building AI-SERVICE)
	@echo "$(GREEN)✓ AI-SERVICE build complete!$(NC)"

build-all: build-hrms build-ai
	@echo "$(GREEN)✓ All services built successfully!$(NC)"

# Docker Commands
serve-hrms-docker:
	@echo "$(BLUE)🐳 Starting HRMS-APP with Docker...$(NC)"
	@cd hrms-app && \
		docker build -t hrms-app . && \
		docker run -d -p 8000:8000 --name hrms-app-container hrms-app
	$(call show_progress,Starting HRMS-APP Docker)
	@echo "$(GREEN)✓ HRMS-APP running at http://localhost:8000$(NC)"

serve-ai-docker:
	@echo "$(BLUE)🐳 Starting AI-SERVICE with Docker...$(NC)"
	@cd ai-service && docker-compose up -d
	$(call show_progress,Starting AI-SERVICE Docker)
	@echo "$(GREEN)✓ AI-SERVICE running at http://localhost:8100$(NC)"
	@echo "$(GREEN)✓ API Docs at http://localhost:8100/docs$(NC)"

serve-all-docker:
	@echo "$(BLUE)🐳 Starting all services with Docker...$(NC)"
	@cd ai-service && docker-compose up -d
	@cd hrms-app && docker build -t hrms-app . && docker run -d -p 8000:8000 --name hrms-app-container hrms-app
	$(call show_progress,Starting all services)
	@echo "$(GREEN)✓ All services running!$(NC)"
	@echo "$(CYAN)HRMS-APP: http://localhost:8000$(NC)"
	@echo "$(CYAN)AI-SERVICE: http://localhost:8100$(NC)"

# Deployment Commands
deploy-hrms-vps:
	@echo "$(BLUE)🚀 Deploying HRMS-APP to VPS...$(NC)"
	@echo "$(YELLOW)This is an interactive deployment process$(NC)"
	@echo "Please provide the following information:"
	@read -p "VPS IP Address: " vps_ip; \
	read -p "SSH User: " ssh_user; \
	read -p "SSH Port (default 22): " ssh_port; \
	ssh_port=$${ssh_port:-22}; \
	echo "$(CYAN)Connecting to VPS...$(NC)"; \
	ssh -p $$ssh_port $$ssh_user@$$vps_ip "mkdir -p /var/www/hrms-app"; \
	echo "$(CYAN)Uploading files...$(NC)"; \
	rsync -avz -e "ssh -p $$ssh_port" --exclude 'node_modules' --exclude 'vendor' hrms-app/ $$ssh_user@$$vps_ip:/var/www/hrms-app/; \
	echo "$(CYAN)Installing dependencies on VPS...$(NC)"; \
	ssh -p $$ssh_port $$ssh_user@$$vps_ip "cd /var/www/hrms-app && composer install --no-dev && npm install && npm run build"
	@echo "$(GREEN)✓ HRMS-APP deployed successfully!$(NC)"

deploy-hrms-docker:
	@echo "$(BLUE)🚀 Deploying HRMS-APP with Docker...$(NC)"
	@cd hrms-app && docker build -t hrms-app:production . && docker push hrms-app:production
	$(call show_progress,Deploying HRMS-APP)
	@echo "$(GREEN)✓ HRMS-APP Docker image deployed!$(NC)"

deploy-ai-docker:
	@echo "$(BLUE)🚀 Deploying AI-SERVICE with Docker...$(NC)"
	@cd ai-service && docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d --build
	$(call show_progress,Deploying AI-SERVICE)
	@echo "$(GREEN)✓ AI-SERVICE deployed!$(NC)"

deploy-all-docker: deploy-hrms-docker deploy-ai-docker
	@echo "$(GREEN)✓ All services deployed with Docker!$(NC)"

# Utility Commands
ifeq ($(DETECTED_OS),Windows)
status:
	@echo "Checking service status..."
	@echo ""
	@echo "Docker Containers:"
	@docker ps
	@echo ""
	@echo "Local Services:"
	@echo "Checking ports 8000 and 8100..."
	@echo ""
	@echo "Installed Tools:"
	@cmd /c check_tools.bat
else
status:
	@echo "$(BLUE)📊 Checking service status...$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker Containers:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "$(RED)Docker not running$(NC)"
	@echo ""
	@echo "$(YELLOW)Local Services:$(NC)"
	@lsof -i :8000 >/dev/null 2>&1 && echo "$(GREEN)HRMS-APP: Running on port 8000$(NC)" || echo "$(RED)HRMS-APP: Not running$(NC)"
	@lsof -i :8100 >/dev/null 2>&1 && echo "$(GREEN)AI-SERVICE: Running on port 8100$(NC)" || echo "$(RED)AI-SERVICE: Not running$(NC)"
	@echo ""
	@echo "$(YELLOW)Installed Tools:$(NC)"
	$(call check_command,python3)
	$(call check_command,uv)
	$(call check_command,composer)
	$(call check_command,node)
	$(call check_command,pnpm)
	$(call check_command,docker)
endif

clean:
	@echo "$(BLUE)🧹 Cleaning build artifacts...$(NC)"
	@cd hrms-app && rm -rf node_modules vendor dist build public/build 2>/dev/null || true
	@cd ai-service && rm -rf __pycache__ .pytest_cache .coverage htmlcov 2>/dev/null || true
	$(call show_progress,Cleaning artifacts)
	@echo "$(GREEN)✓ Clean complete!$(NC)"

clean-all: clean
	@echo "$(BLUE)🧹 Cleaning Docker resources...$(NC)"
	@docker system prune -af 2>/dev/null || true
	@docker volume prune -f 2>/dev/null || true
	$(call show_progress,Cleaning Docker)
	@echo "$(GREEN)✓ Deep clean complete!$(NC)"

quickstart:
	@echo "$(BLUE)⚡ AI-HRIS Quickstart$(NC)"
	@echo ""
	@echo "$(YELLOW)This will set up your development environment$(NC)"
	@echo ""
	@$(MAKE) install-requirements
	@echo ""
	@echo "$(GREEN)✓ Installation complete!$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "1. Copy environment files:"
	@echo "   cp hrms-app/.env.example hrms-app/.env"
	@echo "   cp ai-service/.env.example ai-service/.env"
	@echo ""
	@echo "2. Configure your .env files"
	@echo ""
	@echo "3. Start development servers:"
	@echo "   make serve-hrms-local  # Terminal 1"
	@echo "   make serve-ai-local    # Terminal 2"
	@echo ""
	@echo "4. Or use Docker:"
	@echo "   make serve-all-docker"
	@echo ""
	@echo "$(GREEN)Happy coding! 🚀$(NC)"