#!/bin/bash

set -e

echo "🔄 Database Migration Script"
echo "==========================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ALEMBIC_DIR="migrations"
ALEMBIC_INI="alembic.ini"
BACKUP_BEFORE_MIGRATE=true

# Logging
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }

check_alembic_setup() {
    if [ ! -f "$ALEMBIC_INI" ]; then
        error "Alembic configuration not found: $ALEMBIC_INI"
        info "To initialize Alembic, run: alembic init migrations"
        exit 1
    fi

    if [ ! -d "$ALEMBIC_DIR" ]; then
        error "Migrations directory not found: $ALEMBIC_DIR"
        exit 1
    fi

    info "Alembic configuration verified"
}

load_environment() {
    if [ -f .env ]; then
        set -a
        source .env
        set +a
        info "Environment loaded from .env"
    else
        warn "No .env file found"
    fi
}

create_backup() {
    if [ "$BACKUP_BEFORE_MIGRATE" = "true" ]; then
        log "Creating database backup before migration..."
        ./scripts/backup_database.sh
    else
        warn "Skipping backup (BACKUP_BEFORE_MIGRATE=false)"
    fi
}

check_current_revision() {
    log "Checking current database revision..."

    if alembic current > /dev/null 2>&1; then
        local current_rev=$(alembic current | awk '{print $1}')
        if [ -n "$current_rev" ]; then
            info "Current revision: $current_rev"
        else
            info "Database is at initial state"
        fi
    else
        warn "Could not determine current revision"
    fi
}

generate_migration() {
    local message=$1

    if [ -z "$message" ]; then
        error "Migration message is required"
        echo "Usage: $0 generate \"Your migration message\""
        exit 1
    fi

    log "Generating new migration: $message"

    if alembic revision --autogenerate -m "$message"; then
        local new_migration=$(find "$ALEMBIC_DIR/versions" -name "*_$message.py" | sort -r | head -1)
        if [ -n "$new_migration" ]; then
            info "✓ Migration generated: $(basename "$new_migration")"
            echo ""
            warn "Please review the generated migration before applying:"
            echo "  $ new_migration"
        fi
    else
        error "Failed to generate migration"
        exit 1
    fi
}

apply_migrations() {
    local target=$1

    log "Applying database migrations..."

    if [ -n "$target" ]; then
        info "Migrating to specific revision: $target"
        if ! alembic upgrade "$target"; then
            error "Failed to migrate to $target"
            exit 1
        fi
    else
        info "Migrating to latest revision"
        if ! alembic upgrade head; then
            error "Failed to migrate to latest revision"
            exit 1
        fi
    fi

    info "✓ Migrations applied successfully"
}

downgrade_migration() {
    local target=$1

    if [ -z "$target" ]; then
        error "Target revision required for downgrade"
        echo "Usage: $0 downgrade <revision>"
        exit 1
    fi

    warn "Downgrading database to revision: $target"
    read -p "Are you sure you want to downgrade? This may result in data loss. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Downgrade cancelled"
        exit 0
    fi

    create_backup

    if alembic downgrade "$target"; then
        info "✓ Database downgraded to: $target"
    else
        error "Failed to downgrade database"
        exit 1
    fi
}

show_migration_history() {
    log "Migration history:"
    echo ""
    alembic history --verbose
}

show_pending_migrations() {
    log "Pending migrations:"
    echo ""
    alembic current
    echo ""
    alembic heads
}

validate_migrations() {
    log "Validating migration consistency..."

    # Check for multiple heads
    local head_count=$(alembic heads | grep -c "Rev:")
    if [ "$head_count" -gt 1 ]; then
        error "Multiple migration heads detected. Please resolve before proceeding."
        alembic heads
        exit 1
    fi

    # Check for broken migration chain
    if ! alembic check; then
        error "Migration chain is broken"
        exit 1
    fi

    info "✓ Migration consistency validated"
}

test_migrations() {
    log "Testing migrations on temporary database..."

    # Create temporary database URL
    local temp_db="temp_migration_test_$(date +%s).db"
    local temp_db_url="sqlite:///$temp_db"

    info "Using temporary database: $temp_db"

    # Set temporary database URL
    export DATABASE_URL="$temp_db_url"

    # Create all tables from scratch
    python -c "
from app.core.database import engine, Base
import app.models
Base.metadata.create_all(bind=engine)
print('✓ Base schema created')
"

    # Run all migrations
    if alembic upgrade head; then
        info "✓ All migrations applied successfully to test database"

        # Downgrade all migrations
        if alembic downgrade base; then
            info "✓ All migrations downgraded successfully"
        else
            error "Failed to downgrade test migrations"
        fi
    else
        error "Failed to apply test migrations"
    fi

    # Cleanup
    rm -f "$temp_db"
    unset DATABASE_URL

    info "✓ Migration test completed successfully"
}

create_data_migration() {
    local migration_name=$1

    if [ -z "$migration_name" ]; then
        error "Data migration name is required"
        echo "Usage: $0 data-migration \"add_default_competencies\""
        exit 1
    fi

    log "Creating data migration: $migration_name"

    # Create data migration template
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local migration_file="$ALEMBIC_DIR/versions/${timestamp}_${migration_name}.py"

    cat > "$migration_file" << EOF
\"\"\"${migration_name}
Data migration description

Revision ID: ${timestamp}
Revises: $(alembic current | awk '{print $1}')
Create Date: $(date -Iseconds)
\"\"\"

from alembic import op
import sqlalchemy as sa
from sqlalchemy import orm
from app.core.database import Base

# revision identifiers, used by Alembic.
revision = '${timestamp}'
down_revision = '$(alembic current | awk '{print $1}')'
branch_labels = None
depends_on = None


def upgrade():
    # Data migration logic here
    # Example:
    # bind = op.get_bind()
    # session = orm.Session(bind=bind)
    #
    # # Add your data migration logic
    # try:
    #     # Perform data operations
    #     session.commit()
    # except Exception as e:
    #     session.rollback()
    #     raise e
    # finally:
    #     session.close()
    pass


def downgrade():
    # Data rollback logic here
    # bind = op.get_bind()
    # session = orm.Session(bind=bind)
    #
    # try:
    #     # Rollback data operations
    #     session.commit()
    # except Exception as e:
    #     session.rollback()
    #     raise e
    # finally:
    #     session.close()
    pass
EOF

    info "✓ Data migration created: $(basename "$migration_file")"
    warn "Please implement the upgrade() and downgrade() functions before applying"
}

main() {
    load_environment
    check_alembic_setup

    case "${1:-help}" in
        "generate")
            generate_migration "$2"
            ;;
        "migrate")
            create_backup
            validate_migrations
            apply_migrations "$2"
            ;;
        "downgrade")
            downgrade_migration "$2"
            ;;
        "history")
            show_migration_history
            ;;
        "status")
            show_pending_migrations
            ;;
        "validate")
            validate_migrations
            ;;
        "test")
            test_migrations
            ;;
        "data-migration")
            create_data_migration "$2"
            ;;
        "help")
            echo "Database Migration Script"
            echo ""
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  generate <message>    Generate a new migration"
            echo "  migrate [revision]    Apply migrations (default: head)"
            echo "  downgrade <revision>  Downgrade to specific revision"
            echo "  history               Show migration history"
            echo "  status                Show pending migrations"
            echo "  validate              Validate migration consistency"
            echo "  test                  Test migrations on temporary database"
            echo "  data-migration <name> Create a data migration template"
            echo "  help                  Show this help message"
            ;;
        *)
            error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
