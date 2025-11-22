#!/bin/bash

set -e

echo "🚀 AI Screening Service Environment Setup"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }

# Configuration
APP_NAME="AI Screening Service"
VENV_DIR=".venv"
DATA_DIR="data"
UPLOADS_DIR="uploads"
KEYS_DIR="keys"
LOGS_DIR="logs"
MODELS_DIR="data/models"

check_prerequisites() {
    log "Checking prerequisites..."

    # Check Python
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is not installed. Please install Python 3.8 or higher."
        exit 1
    fi

    PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    info "Python version: $PYTHON_VERSION"

    # Check uv
    if ! command -v uv &> /dev/null; then
        error "uv is not installed. Please install uv first:"
        echo "  curl -LsSf https://astral.sh/uv/install.sh | sh"
        echo "  or: pip install uv"
        exit 1
    fi

    UV_VERSION=$(uv --version)
    info "uv version: $UV_VERSION"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        warn "Docker is not installed. Some features may not work."
    else
        info "Docker is available"
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        warn "Docker Compose is not installed. Some features may not work."
    else
        info "Docker Compose is available"
    fi
}

create_directories() {
    log "Creating application directories..."

    local directories=(
        "$DATA_DIR"
        "$UPLOADS_DIR"
        "$KEYS_DIR"
        "$LOGS_DIR"
        "$MODELS_DIR"
        "$MODELS_DIR/indobert"
        "$MODELS_DIR/embeddings"
        "logs/application"
        "logs/celery"
        "logs/access"
        "logs/errors"
    )

    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            info "Created directory: $dir"
        else
            info "Directory exists: $dir"
        fi
    done

    # Set proper permissions
    chmod 755 "$UPLOADS_DIR" "$LOGS_DIR" "$KEYS_DIR"
}

setup_virtual_environment() {
    log "Setting up Python environment with uv..."

    if [ ! -d "$VENV_DIR" ]; then
        # Use uv to create and manage the virtual environment
        uv venv "$VENV_DIR"
        info "Virtual environment created: $VENV_DIR"
    else
        warn "Virtual environment already exists: $VENV_DIR"
    fi

    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    info "Virtual environment activated"
}

install_dependencies() {
    log "Installing Python dependencies with uv..."

    # Install dependencies using uv
    if [ -f "pyproject.toml" ]; then
        # First, install without editable mode to avoid setuptools issues
        info "Installing dependencies in regular mode..."
        uv sync

        # Check if we need to install in development mode
        if [ -d "app" ] && [ -f "app/__init__.py" ]; then
            info "Installing application in development mode using pip..."
            # Use pip for editable install to avoid setuptools discovery issues
            uv pip install -e . --no-build-isolation
        fi

        info "Application dependencies installed successfully"
    else
        error "pyproject.toml not found. Please ensure you're in the project root directory."
        exit 1
    fi

    # Install development dependencies if using uv
    info "Installing development dependencies..."
    uv sync --dev
    info "Development dependencies installed"
}

setup_environment_file() {
    log "Setting up environment configuration..."

    if [ ! -f ".env" ]; then
        cat > .env << 'EOF'
# AI Screening Service Environment Configuration
# ==============================================

# API Settings
API_NAME=AI-SERVICE
API_HOST=0.0.0.0
API_PORT=8100
DEBUG=True

GATEWAY_BASE_URL=http://192.168.247.37:8000

# OAUTH KEY
OAUTH_CLIENT_ID=019a8469-f263-7353-aa3a-bd7684162890
OAUTH_CLIENT_SECRET=RT7BTFF9tgZEq3vhThRQ0pt5ZvwIcA8dw2RjCgXh
OAUTH_TOKEN_SCOPE=ai-service:*
OAUTH_TOKEN_FETCH_TIMEOUT=10
OAUTH_TOKEN_MAX_RETRIES=3
OAUTH_TOKEN_BACKOFF_BASE=0.5

# CORS (comma-separated)
CORS_ORIGINS=["*"]

# Database
# DATABASE_URL=postgresql://admin:secret@localhost:5432/screening_db # Uncomment for PostgreSQL
DB_USER=admin
DB_PASSWORD=YourSuperSecurePassword123!
DB_NAME=screening_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Flower
FLOWER_USER=admin
FLOWER_PASSWORD=YourFlowerPassword123!

# Model Settings
MODEL_NAME=indobenchmark/indobert-base-p1
MODEL_PATH=./data/models
MAX_SEQ_LENGTH=512
EMBEDDING_DIM=768

# Scoring Settings
SIMILARITY_THRESHOLD=0.5
DEFAULT_SHORTLIST_PERCENTILE=75.0
DEFAULT_FLAG_PERCENTILE=25.0

# Training Settings
REPLAY_BUFFER_SIZE=10000
BATCH_SIZE=16
LEARNING_RATE=2e-5
REFINEMENT_EPOCHS=3

# Cache Settings
EMBEDDING_CACHE_TTL=2592000

# Additional Settings
LOG_LEVEL=INFO
ENVIRONMENT=development
EOF
        warn "Created .env file - PLEASE UPDATE WITH YOUR ACTUAL CONFIGURATION!"
    else
        info "Environment file already exists: .env"
    fi
}

setup_database() {
    log "Setting up database..."

    # Activate virtual environment
    source "$VENV_DIR/bin/activate"

    # Check if we should use Docker or local database
    if [ "$1" = "docker" ]; then
        info "Using Docker for database setup..."
        if command -v docker-compose &> /dev/null; then
            docker-compose up -d postgres redis
            sleep 10  # Wait for services to start
        else
            error "Docker Compose not available for database setup"
            return 1
        fi
    else
        # Local SQLite setup
        info "Using SQLite database"
        if [ ! -f "data/dev.db" ]; then
            python -c "
from app.core.database import engine, Base
import app.models
Base.metadata.create_all(bind=engine)
print('Database tables created successfully')
"
            info "Database tables created"
        else
            info "Database already exists"
        fi
    fi
}

download_ml_models() {
    log "Downloading ML models..."

    # Activate virtual environment
    source "$VENV_DIR/bin/activate"

    # Create model download script
    cat > download_models.py << 'EOF'
import os
import logging
from transformers import AutoTokenizer, AutoModel
from sentence_transformers import SentenceTransformer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_models():
    models_dir = os.getenv('MODEL_CACHE_DIR', 'data/models')
    os.makedirs(models_dir, exist_ok=True)

    # IndoBERT model
    logger.info("Downloading IndoBERT model...")
    indobert_model_name = "indobenchmark/indobert-base-p1"
    try:
        tokenizer = AutoTokenizer.from_pretrained(indobert_model_name, cache_dir=os.path.join(models_dir, "indobert"))
        model = AutoModel.from_pretrained(indobert_model_name, cache_dir=os.path.join(models_dir, "indobert"))
        logger.info("✓ IndoBERT model downloaded successfully")
    except Exception as e:
        logger.error(f"Failed to download IndoBERT model: {e}")

    # Sentence Transformer model
    logger.info("Downloading sentence transformer model...")
    embedding_model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    try:
        model = SentenceTransformer(embedding_model_name, cache_folder=os.path.join(models_dir, "embeddings"))
        logger.info("✓ Sentence transformer model downloaded successfully")
    except Exception as e:
        logger.error(f"Failed to download sentence transformer model: {e}")

if __name__ == "__main__":
    download_models()
EOF

    python download_models.py
    rm download_models.py

    info "ML models setup completed"
}

run_health_check() {
    log "Running health check..."

    source "$VENV_DIR/bin/activate"

    if python scripts/health_check.py; then
        info "Health check passed"
    else
        warn "Health check reported issues"
    fi
}

display_summary() {
    echo ""
    echo "✅ Environment Setup Complete!"
    echo "=============================="
    echo ""
    echo "📋 Summary:"
    echo "  • Python virtual environment: $VENV_DIR"
    echo "  • Application directories created"
    echo "  • Dependencies installed with uv"
    echo "  • Environment configuration: .env"
    echo "  • Database initialized"
    echo "  • ML models downloaded"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Update .env file with your actual configuration"
    echo "  2. Start the application:"
    echo "     ./scripts/start_application.sh"
    echo "  3. Or start with Docker:"
    echo "     docker-compose up -d"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  • Activate virtual env: source $VENV_DIR/bin/activate"
    echo "  • Add dependency: uv add <package>"
    echo "  • Add dev dependency: uv add --dev <package>"
    echo "  • Run tests: pytest"
    echo "  • Database migrations: alembic upgrade head"
    echo "  • Load sample data: python scripts/load_sample_data.py"
    echo ""
}

main() {
    log "Starting $APP_NAME environment setup..."

    check_prerequisites
    create_directories
    setup_virtual_environment
    install_dependencies
    setup_environment_file
    setup_database "${1:-local}"
    download_ml_models
    run_health_check
    display_summary

    log "Setup completed successfully! 🎉"
}

# Run main function with arguments
main "$@"
