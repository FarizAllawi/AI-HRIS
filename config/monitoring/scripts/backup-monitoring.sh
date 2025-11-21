#!/bin/bash

set -e

echo "💾 Starting Monitoring Stack Backup..."
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="/backups/monitoring"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
RETENTION_DAYS=7

# Logging
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    warn "Not running as root. Some operations might require elevated privileges."
fi

# Create backup directory
mkdir -p "$BACKUP_PATH"
log "Backup directory created: $BACKUP_PATH"

# Function to backup Docker volumes
backup_volume() {
    local volume_name=$1
    local backup_file=$2

    if docker volume inspect "$volume_name" > /dev/null 2>&1; then
        log "Backing up volume: $volume_name"
        docker run --rm -v "$volume_name":/source -v "$BACKUP_PATH":/backup alpine \
            tar czf "/backup/$backup_file" -C /source ./
    else
        warn "Volume $volume_name not found, skipping"
    fi
}

# Function to backup configuration
backup_config() {
    local config_dir=$1
    local backup_name=$2

    if [ -d "$config_dir" ]; then
        log "Backing up configuration: $config_dir"
        tar czf "$BACKUP_PATH/$backup_name" -C "$(dirname "$config_dir")" "$(basename "$config_dir")"
    else
        warn "Config directory $config_dir not found, skipping"
    fi
}

# Function to backup database
backup_database() {
    log "Backing up PostgreSQL database..."

    if docker ps | grep -q "postgres"; then
        docker exec postgres pg_dump -U admin screening_db > "$BACKUP_PATH/postgres_backup.sql"
        log "PostgreSQL database backup completed"
    else
        warn "PostgreSQL container not running, skipping database backup"
    fi
}

# Function to backup Redis data
backup_redis() {
    log "Backing up Redis data..."

    if docker ps | grep -q "redis"; then
        docker exec redis redis-cli SAVE > /dev/null 2>&1
        backup_volume "redis_data" "redis_backup.tar.gz"
        log "Redis backup completed"
    else
        warn "Redis container not running, skipping Redis backup"
    fi
}

# Main backup process
main() {
    case "${1:-all}" in
        "all")
            backup_all
            ;;
        "config")
            backup_configs
            ;;
        "data")
            backup_data
            ;;
        "db")
            backup_database
            ;;
        *)
            echo "Usage: $0 {all|config|data|db}"
            exit 1
            ;;
    esac
}

# Backup everything
backup_all() {
    log "Starting complete monitoring stack backup..."

    # Backup configurations
    backup_configs

    # Backup data volumes
    backup_data

    # Backup databases
    backup_database
    backup_redis

    # Create backup manifest
    create_manifest
}

# Backup configurations
backup_configs() {
    log "Backing up configurations..."

    backup_config "monitoring/prometheus" "prometheus_config.tar.gz"
    backup_config "monitoring/grafana/provisioning" "grafana_provisioning.tar.gz"
    backup_config "monitoring/alertmanager" "alertmanager_config.tar.gz"
    backup_config "monitoring/loki" "loki_config.tar.gz"
    backup_config "monitoring/tempo" "tempo_config.tar.gz"

    # Backup docker-compose files
    if [ -f "docker-compose.monitoring.yml" ]; then
        cp "docker-compose.monitoring.yml" "$BACKUP_PATH/"
    fi
    if [ -f "docker-compose.yml" ]; then
        cp "docker-compose.yml" "$BACKUP_PATH/"
    fi

    # Backup environment files
    if [ -f ".env" ]; then
        cp ".env" "$BACKUP_PATH/"
    fi
    if [ -f "monitoring/.env" ]; then
        cp "monitoring/.env" "$BACKUP_PATH/"
    fi
}

# Backup data volumes
backup_data() {
    log "Backing up data volumes..."

    backup_volume "prometheus_data" "prometheus_data.tar.gz"
    backup_volume "grafana_data" "grafana_data.tar.gz"
    backup_volume "alertmanager_data" "alertmanager_data.tar.gz"
    backup_volume "loki_data" "loki_data.tar.gz"
    backup_volume "tempo_data" "tempo_data.tar.gz"
}

# Create backup manifest
create_manifest() {
    log "Creating backup manifest..."

    cat > "$BACKUP_PATH/backup_manifest.txt" << EOF
Backup Manifest
===============
Timestamp: $(date)
Backup ID: $TIMESTAMP
Components: Monitoring Stack

Contents:
$(ls -la "$BACKUP_PATH")

System Information:
$(docker --version)
$(docker-compose --version)

Volume Information:
$(docker volume ls | grep -E "(prometheus|grafana|alertmanager|loki|tempo|redis|postgres)")

Container Status:
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
EOF
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."

    find "$BACKUP_DIR" -maxdepth 1 -type d -name "2*" -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true

    local remaining_backups=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "2*" | wc -l)
    log "Remaining backups: $remaining_backups"
}

# Verify backup
verify_backup() {
    log "Verifying backup integrity..."

    # Check if backup directory has content
    if [ -z "$(ls -A "$BACKUP_PATH")" ]; then
        error "Backup directory is empty!"
        exit 1
    fi

    # Verify tar files
    for file in "$BACKUP_PATH"/*.tar.gz; do
        if [ -f "$file" ]; then
            if ! tar tzf "$file" > /dev/null 2>&1; then
                warn "Backup file $file might be corrupted"
            fi
        fi
    done

    log "Backup verification completed"
}

# Main execution
main "$@"

# Cleanup old backups
cleanup_old_backups

# Verify the backup
verify_backup

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
log "Backup completed successfully! Size: $BACKUP_SIZE"

# Display backup location
echo ""
echo "✅ Backup completed!"
echo "📍 Location: $BACKUP_PATH"
echo "📦 Size: $BACKUP_SIZE"
echo ""
echo "To restore, use: ./monitoring/scripts/restore-monitoring.sh $TIMESTAMP"
echo ""
