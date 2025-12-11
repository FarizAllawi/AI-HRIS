#!/bin/bash
set -e

# Configuration
HRMS_APP_URL="${HRMS_APP_URL:-http://hrms-app:80}"
HEALTH_ENDPOINT="${HRMS_APP_URL}/health"
PASSPORT_ENV_FILE="${PASSPORT_ENV_FILE:-/app/shared/ai-service_passport.env}"
ENV_FILE="${ENV_FILE:-/app/.env}"
MAX_RETRIES=1000
RETRY_INTERVAL=60

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Wait for hrms-app health endpoint
wait_for_hrms_app() {
    log "Waiting for hrms-app to be healthy..."

    local retries=0
    # We are using HRMS_APP_URL to construct HEALTH_ENDPOINT above:
    # HEALTH_ENDPOINT="${HRMS_APP_URL}/health"
    # So here, we are correctly using it via $HEALTH_ENDPOINT in the curl command.
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s -f --max-time 5 "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
            log "hrms-app is healthy at $HEALTH_ENDPOINT!"
            return 0
        fi

        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            warn "hrms-app not ready yet at $HEALTH_ENDPOINT, retrying in ${RETRY_INTERVAL}s... (${retries}/${MAX_RETRIES})"
            sleep $RETRY_INTERVAL
        fi
    done

    error "hrms-app failed to become healthy after $MAX_RETRIES attempts"
    return 1
}

# Read OAuth credentials from passport.env and update .env
update_oauth_credentials() {
    log "Reading OAuth credentials from passport.env..."

    if [ ! -f "$PASSPORT_ENV_FILE" ]; then
        error "Passport env file not found: $PASSPORT_ENV_FILE"
        return 1
    fi

    # Source the passport.env file to read CLIENT_ID and CLIENT_SECRET
    # Handle the escaped backslash in CLIENT_SECRET
    CLIENT_ID=$(grep "^CLIENT_ID=" "$PASSPORT_ENV_FILE" | cut -d '=' -f2- | tr -d '\r\n')
    CLIENT_SECRET=$(grep "^CLIENT_SECRET=" "$PASSPORT_ENV_FILE" | cut -d '=' -f2- | sed 's/\\\//\//g' | tr -d '\r\n')

    if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
        error "CLIENT_ID or CLIENT_SECRET not found in $PASSPORT_ENV_FILE"
        return 1
    fi

    log "Found CLIENT_ID: ${CLIENT_ID:0:20}..."
    log "Updating .env file with OAuth credentials..."

    # Create .env file if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        touch "$ENV_FILE"
        log "Created .env file"
    fi

    # Remove existing OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET lines if they exist
    # Use a temporary file to avoid backup file creation
    if grep -q "^OAUTH_CLIENT_ID=" "$ENV_FILE" 2>/dev/null || grep -q "^OAUTH_CLIENT_SECRET=" "$ENV_FILE" 2>/dev/null || grep -q "^# OAuth credentials (auto-generated from passport.env)" "$ENV_FILE" 2>/dev/null; then
        grep -v "^OAUTH_CLIENT_ID=" "$ENV_FILE" 2>/dev/null | \
        grep -v "^OAUTH_CLIENT_SECRET=" | \
        grep -v "^# OAuth credentials (auto-generated from passport.env)" > "${ENV_FILE}.tmp" || true
        mv "${ENV_FILE}.tmp" "$ENV_FILE"
    fi

    # Ensure .env file ends with a newline before appending
    if [ -s "$ENV_FILE" ] && [ "$(tail -c 1 "$ENV_FILE")" != "" ]; then
        echo "" >> "$ENV_FILE"
    fi

    # Append new OAuth credentials
    # Use printf to safely handle special characters like $ in CLIENT_SECRET
    {
        echo "# OAuth credentials (auto-generated from passport.env)"
        printf "OAUTH_CLIENT_ID=%s\n" "$CLIENT_ID"
        printf "OAUTH_CLIENT_SECRET=%s\n" "$CLIENT_SECRET"
    } >> "$ENV_FILE"

    log "OAuth credentials updated successfully"
}

# Main execution
main() {
    log "Starting ai-service entrypoint..."

    # Wait for hrms-app to be healthy
    if ! wait_for_hrms_app; then
        error "Failed to wait for hrms-app. Exiting..."
        exit 1
    fi

    # Update OAuth credentials
    if ! update_oauth_credentials; then
        error "Failed to update OAuth credentials. Continuing anyway..."
    fi

    log "Entrypoint setup complete. Starting application..."

    # Execute the main command
    exec "$@"
}

# Run main function
main "$@"
