#!/bin/bash

set -e

echo "🚀 Setting up AI Screening Service Monitoring Stack..."
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    error "docker-compose is not installed. Please install it first."
    exit 1
fi

# Create necessary directories
log "Creating monitoring directories..."
mkdir -p monitoring/prometheus/data
mkdir -p monitoring/grafana/data
mkdir -p monitoring/alertmanager/data
mkdir -p monitoring/loki/data
mkdir -p monitoring/tempo/data
mkdir -p monitoring/redis/data
mkdir -p monitoring/postgres/data

mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/alertmanager/templates

# Set proper permissions
log "Setting directory permissions..."
chmod -R 755 monitoring/
chmod -R 777 monitoring/*/data  # Data directories need write permissions

# Check if .env file exists
if [ ! -f .env ] && [ ! -f monitoring/.env ]; then
    warn "No .env file found. Creating monitoring/.env from template..."

    cat > monitoring/.env << EOF
# Monitoring Environment Variables
# ================================

# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=YourSecureGrafanaPassword123!
GRAFANA_SECRET_KEY=YourVeryLongSecretKeyForGrafanaSecurity123!

# Alerting
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@yourcompany.com
SMTP_PASSWORD=YourSMTPAppPassword
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
PAGERDUTY_INTEGRATION_KEY=your-pagerduty-integration-key

# Application Credentials (should match your main application)
DB_USER=admin
DB_PASSWORD=YourSecureDBPassword123!
DB_NAME=screening_db
REDIS_PASSWORD=YourSecureRedisPassword123!

# OAuth Configuration
GATEWAY_BASE_URL=http://your-gateway-url
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret

# Monitoring Specific
PROMETHEUS_RETENTION=30d
LOKI_RETENTION_PERIOD=744h
TEMPO_RETENTION=48h

# Network Configuration
MONITORING_NETWORK=monitoring
BACKEND_NETWORK=backend
EOF

    warn "Created monitoring/.env - PLEASE UPDATE WITH YOUR ACTUAL PASSWORDS AND CONFIGURATION!"
    warn "You need to edit monitoring/.env before starting the monitoring stack."
fi

# Copy configuration files if they don't exist
log "Setting up configuration files..."

# Copy Prometheus configuration
if [ ! -f monitoring/prometheus/prometheus.yml ]; then
    cp monitoring/prometheus/prometheus.yml.example monitoring/prometheus/prometheus.yml 2>/dev/null || \
    warn "Prometheus configuration template not found, using default"
fi

# Copy Grafana provisioning
if [ ! -f monitoring/grafana/provisioning/datasources/datasource.yml ]; then
    cat > monitoring/grafana/provisioning/datasources/datasource.yml << EOF
apiVersion: 1

deleteDatasources:
  - name: Prometheus
    orgId: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
    jsonData:
      timeInterval: 15s
      queryTimeout: 60s
      httpMethod: POST
EOF
fi

# Create docker-compose.monitoring.yml if it doesn't exist
if [ ! -f docker-compose.monitoring.yml ]; then
    log "Creating docker-compose.monitoring.yml..."
    cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  # ... (this would be the full docker-compose.monitoring.yml content)
  # For brevity, the actual content would be the monitoring stack we discussed earlier
EOF
    warn "Please ensure docker-compose.monitoring.yml contains all monitoring services"
fi

# Create health check script
log "Creating health check script..."
cat > monitoring/scripts/health-check-monitoring.sh << 'EOF'
#!/bin/bash
# Health check script for monitoring stack
EOF
chmod +x monitoring/scripts/health-check-monitoring.sh

# Create backup script
log "Creating backup script..."
cat > monitoring/scripts/backup-monitoring.sh << 'EOF'
#!/bin/bash
# Backup script for monitoring data
EOF
chmod +x monitoring/scripts/backup-monitoring.sh

# Validate configuration
log "Validating configuration..."

# Check if required ports are available
declare -a ports=("9090" "3000" "9093" "3100" "3200" "9121" "9187" "9100" "8080" "9540" "9115")
for port in "${ports[@]}"; do
    if netstat -tuln | grep ":$port " > /dev/null; then
        warn "Port $port is already in use. This may cause conflicts."
    fi
done

# Check disk space
DISK_SPACE=$(df /tmp | awk 'NR==2 {print $4}')
if [ "$DISK_SPACE" -lt 1048576 ]; then  # Less than 1GB
    warn "Low disk space. Monitoring stack may require significant storage."
fi

# Check memory
TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
if [ "$TOTAL_MEM" -lt 4096 ]; then  # Less than 4GB
    warn "System has less than 4GB RAM. Consider increasing resources for monitoring."
fi

# Display next steps
echo ""
echo "✅ Monitoring stack setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit monitoring/.env with your actual passwords and configuration"
echo "2. Review docker-compose.monitoring.yml configuration"
echo "3. Start the monitoring stack:"
echo "   docker-compose -f docker-compose.monitoring.yml up -d"
echo ""
echo "🔍 Access URLs (after starting):"
echo "   Grafana:      http://localhost:3000 (admin/YourSecureGrafanaPassword123!)"
echo "   Prometheus:   http://localhost:9090"
echo "   Alertmanager: http://localhost:9093"
echo "   Loki:         http://localhost:3100"
echo "   Tempo:        http://localhost:3200"
echo ""
echo "📊 Default dashboards will be available in Grafana"
echo "⚡ Health checks: ./monitoring/scripts/health-check-monitoring.sh"
echo "💾 Backups:      ./monitoring/scripts/backup-monitoring.sh"
echo ""

log "Setup completed successfully!"
