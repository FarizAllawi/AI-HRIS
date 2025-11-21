#!/bin/bash

set -e

echo "💾 Database Backup Script"
echo "========================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="screening_db_backup_$TIMESTAMP"
RETENTION_DAYS=30
COMPRESSION_LEVEL=6

# Logging
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }

load_environment() {
    if [ -f .env ]; then
        set -a
        source .env
        set +a
        info "Environment loaded from .env"
    else
        warn "No .env file found, using defaults"
    fi
}

detect_database_type() {
    if [[ "$DATABASE_URL" == postgresql://* ]]; then
        echo "postgresql"
    elif [[ "$DATABASE_URL" == sqlite://* ]]; then
        echo "sqlite"
    elif [[ "$DATABASE_URL" == mysql://* ]]; then
        echo "mysql"
    else
        echo "unknown"
    fi
}

backup_postgresql() {
    local backup_file="$BACKUP_DIR/$BACKUP_NAME.sql"
    local compressed_file="$backup_file.gz"

    log "Starting PostgreSQL backup..."

    # Extract connection details from DATABASE_URL
    local db_url=${DATABASE_URL#postgresql://}
    local user_pass_host=$(echo "$db_url" | cut -d'@' -f1)
    local host_port_db=$(echo "$db_url" | cut -d'@' -f2)

    local username=$(echo "$user_pass_host" | cut -d':' -f1)
    local password=$(echo "$user_pass_host" | cut -d':' -f2)
    local host=$(echo "$host_port_db" | cut -d':' -f1)
    local port=$(echo "$host_port_db" | cut -d':' -f2 | cut -d'/' -f1)
    local database=$(echo "$host_port_db" | cut -d'/' -f2)

    # Set password for pg_dump
    export PGPASSWORD="$password"

    info "Backing up database: $database@$host:$port"

    # Perform backup
    if pg_dump \
        --host="$host" \
        --port="${port:-5432}" \
        --username="$username" \
        --dbname="$database" \
        --verbose \
        --no-password \
        --format=plain \
        --no-owner \
        --no-privileges \
        > "$backup_file"; then

        # Compress backup
        gzip -$COMPRESSION_LEVEL "$backup_file"
        local final_size=$(du -h "$compressed_file" | cut -f1)

        log "PostgreSQL backup completed: $compressed_file ($final_size)"
        echo "$compressed_file"
    else
        error "PostgreSQL backup failed"
        return 1
    fi
}

backup_sqlite() {
    local db_file=${DATABASE_URL#sqlite:///}
    local backup_file="$BACKUP_DIR/$BACKUP_NAME.db"
    local compressed_file="$backup_file.gz"

    log "Starting SQLite backup..."

    if [ ! -f "$db_file" ]; then
        error "SQLite database file not found: $db_file"
        return 1
    fi

    info "Backing up SQLite database: $db_file"

    # Copy database file
    if cp "$db_file" "$backup_file"; then
        # Compress backup
        gzip -$COMPRESSION_LEVEL "$backup_file"
        local final_size=$(du -h "$compressed_file" | cut -f1)

        log "SQLite backup completed: $compressed_file ($final_size)"
        echo "$compressed_file"
    else
        error "SQLite backup failed"
        return 1
    fi
}

create_backup_manifest() {
    local backup_file=$1
    local db_type=$2

    local manifest_file="${backup_file%.*}.manifest"

    cat > "$manifest_file" << EOF
Database Backup Manifest
=======================
Backup ID: $BACKUP_NAME
Timestamp: $(date)
Database Type: $db_type
Backup File: $(basename "$backup_file")
File Size: $(du -h "$backup_file" | cut -f1)

Application Information:
- AI Screening Service
- Environment: ${ENVIRONMENT:-unknown}
- Database URL: ${DATABASE_URL:-unknown}

System Information:
- Hostname: $(hostname)
- OS: $(uname -s)
- Backup Tool: $0

Checksums:
- MD5: $(md5sum "$backup_file" | cut -d' ' -f1)
- SHA256: $(sha256sum "$backup_file" | cut -d' ' -f1)

Restoration Instructions:
- PostgreSQL: psql -f backup_file.sql
- SQLite: cp backup_file.db database.db
EOF

    info "Backup manifest created: $manifest_file"
}

verify_backup() {
    local backup_file=$1
    local db_type=$2

    log "Verifying backup integrity..."

    # Check if backup file exists and has content
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        return 1
    fi

    local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [ "$file_size" -lt 1024 ]; then
        warn "Backup file seems very small: $file_size bytes"
    fi

    # Test decompression for gzip files
    if [[ "$backup_file" == *.gz ]]; then
        if gzip -t "$backup_file" 2>/dev/null; then
            info "✓ Backup file compression verified"
        else
            error "Backup file compression corrupted"
            return 1
        fi
    fi

    info "✓ Backup verification passed"
}

cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."

    local deleted_count=0
    while IFS= read -r -d '' file; do
        if [ -f "$file" ]; then
            rm "$file"
            # Also remove corresponding manifest
            local manifest_file="${file%.*}.manifest"
            if [ -f "$manifest_file" ]; then
                rm "$manifest_file"
            fi
            deleted_count=$((deleted_count + 1))
        fi
    done < <(find "$BACKUP_DIR" -name "screening_db_backup_*" -type f -mtime "+$RETENTION_DAYS" -print0)

    if [ "$deleted_count" -gt 0 ]; then
        info "Removed $deleted_count old backup(s)"
    else
        info "No old backups to remove"
    fi
}

upload_to_cloud() {
    local backup_file=$1

    # This is a template for cloud upload functionality
    # Implement based on your cloud storage provider

    if [ "$ENABLE_CLOUD_BACKUP" = "true" ]; then
        warn "Cloud backup not implemented. Please configure your cloud storage."
        # Example for AWS S3:
        # aws s3 cp "$backup_file" "s3://your-backup-bucket/$(basename "$backup_file")"
    fi
}

send_notification() {
    local status=$1
    local backup_file=$2
    local db_type=$3

    local subject="Database Backup $status - $APP_NAME"
    local message="Backup $status for $db_type database\nFile: $(basename "$backup_file")\nTime: $(date)"

    # Email notification (requires mail setup)
    if [ -n "$BACKUP_NOTIFICATION_EMAIL" ]; then
        echo -e "$message" | mail -s "$subject" "$BACKUP_NOTIFICATION_EMAIL" 2>/dev/null || \
        warn "Failed to send email notification"
    fi

    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local slack_message="{\"text\":\"$subject\n$message\"}"
        curl -X POST -H 'Content-type: application/json' \
             --data "$slack_message" "$SLACK_WEBHOOK_URL" 2>/dev/null || \
        warn "Failed to send Slack notification"
    fi

    info "Backup $status notification sent"
}

main() {
    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    # Load environment
    load_environment

    # Detect database type
    local db_type=$(detect_database_type)
    info "Detected database type: $db_type"

    case $db_type in
        "postgresql")
            backup_file=$(backup_postgresql)
            ;;
        "sqlite")
            backup_file=$(backup_sqlite)
            ;;
        *)
            error "Unsupported database type: $db_type"
            exit 1
            ;;
    esac

    if [ -n "$backup_file" ]; then
        # Create manifest
        create_backup_manifest "$backup_file" "$db_type"

        # Verify backup
        verify_backup "$backup_file" "$db_type"

        # Upload to cloud (if enabled)
        upload_to_cloud "$backup_file"

        # Send success notification
        send_notification "SUCCEEDED" "$backup_file" "$db_type"

        # Cleanup old backups
        cleanup_old_backups

        # Display summary
        echo ""
        log "✅ Backup completed successfully!"
        info "Backup file: $backup_file"
        info "Size: $(du -h "$backup_file" | cut -f1)"
        info "Location: $(pwd)/$backup_file"
        echo ""
    else
        error "Backup failed"
        send_notification "FAILED" "N/A" "$db_type"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "list")
        echo "Available backups:"
        find "$BACKUP_DIR" -name "screening_db_backup_*" -type f | sort -r
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "verify")
        if [ -n "$2" ]; then
            verify_backup "$2" "unknown"
        else
            error "Please specify backup file to verify"
            exit 1
        fi
        ;;
    *)
        main
        ;;
esac
