#!/bin/bash

set -e

echo "🔍 Monitoring Stack Health Check"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TIMEOUT=10
RETRIES=3
HEALTH_ENDPOINTS=(
    "http://localhost:3000/api/health"
    "http://localhost:9090/-/healthy"
    "http://localhost:9093/-/healthy"
    "http://localhost:3100/ready"
    "http://localhost:3200/ready"
    "http://localhost:9121/health"
    "http://localhost:9187/health"
    "http://localhost:9100/metrics"
    "http://localhost:8080/health"
    "http://localhost:9540/metrics"
    "http://localhost:9115/health"
)

# Status tracking
declare -A SERVICE_STATUS
declare -A SERVICE_ENDPOINTS=(
    ["Grafana"]="http://localhost:3000"
    ["Prometheus"]="http://localhost:9090"
    ["Alertmanager"]="http://localhost:9093"
    ["Loki"]="http://localhost:3100"
    ["Tempo"]="http://localhost:3200"
    ["Redis Exporter"]="http://localhost:9121"
    ["Postgres Exporter"]="http://localhost:9187"
    ["Node Exporter"]="http://localhost:9100"
    ["cAdvisor"]="http://localhost:8080"
    ["Celery Exporter"]="http://localhost:9540"
    ["Blackbox Exporter"]="http://localhost:9115"
)

# Logging
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }

# Health check function
check_health() {
    local service=$1
    local url=$2

    for ((i=1; i<=RETRIES; i++)); do
        if curl -s -f --max-time $TIMEOUT "$url" > /dev/null 2>&1; then
            SERVICE_STATUS["$service"]="HEALTHY"
            return 0
        fi

        if [ $i -lt $RETRIES ]; then
            sleep 2
        fi
    done

    SERVICE_STATUS["$service"]="UNHEALTHY"
    return 1
}

# Check Docker containers
check_containers() {
    log "Checking Docker containers..."

    if ! docker info > /dev/null 2>&1; then
        error "Docker daemon is not running"
        return 1
    fi

    local total_containers=0
    local running_containers=0

    while read -r line; do
        if [ -n "$line" ]; then
            total_containers=$((total_containers + 1))
            if echo "$line" | grep -q "Up"; then
                running_containers=$((running_containers + 1))
            fi
        fi
    done < <(docker-compose -f docker-compose.monitoring.yml ps --services 2>/dev/null | \
             xargs -I {} docker-compose -f docker-compose.monitoring.yml ps {} 2>/dev/null | \
             tail -n +3)

    if [ $total_containers -eq 0 ]; then
        warn "No monitoring containers found. Is the stack running?"
        return 1
    fi

    info "Containers: $running_containers/$total_containers running"

    if [ $running_containers -eq $total_containers ]; then
        return 0
    else
        return 1
    fi
}

# Check service endpoints
check_endpoints() {
    log "Checking service endpoints..."

    local healthy_count=0
    local total_count=0

    for service in "${!SERVICE_ENDPOINTS[@]}"; do
        local url="${SERVICE_ENDPOINTS[$service]}"
        total_count=$((total_count + 1))

        if check_health "$service" "$url"; then
            healthy_count=$((healthy_count + 1))
        fi
    done

    info "Endpoints: $healthy_count/$total_count healthy"
    return $((total_count - healthy_count))
}

# Check resource usage
check_resources() {
    log "Checking system resources..."

    # CPU load
    local load=$(awk '{print $1}' /proc/loadavg)
    local cores=$(nproc)
    local load_percentage=$(echo "scale=2; $load * 100 / $cores" | bc)

    if (( $(echo "$load_percentage > 80" | bc -l) )); then
        warn "High CPU load: $load_percentage%"
    else
        info "CPU load: $load_percentage%"
    fi

    # Memory usage
    local mem_total=$(free -m | awk 'NR==2{print $2}')
    local mem_used=$(free -m | awk 'NR==2{print $3}')
    local mem_percentage=$(echo "scale=2; $mem_used * 100 / $mem_total" | bc)

    if (( $(echo "$mem_percentage > 85" | bc -l) )); then
        warn "High memory usage: $mem_percentage%"
    else
        info "Memory usage: $mem_percentage%"
    fi

    # Disk space
    local disk_usage=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        warn "High disk usage: $disk_usage%"
    else
        info "Disk usage: $disk_usage%"
    fi
}

# Check Prometheus metrics
check_prometheus_metrics() {
    log "Checking Prometheus metrics..."

    local metrics=(
        "up"
        "prometheus_tsdb_head_series"
        "prometheus_target_scrapes_exceeded_sample_limit_total"
        "prometheus_rule_group_duration_seconds"
    )

    local healthy=true

    for metric in "${metrics[@]}"; do
        if curl -s "http://localhost:9090/api/v1/query?query=$metric" | grep -q "\"result\":\[\]"; then
            warn "Metric $metric not found or has no data"
            healthy=false
        fi
    done

    if $healthy; then
        info "Prometheus metrics: OK"
        return 0
    else
        warn "Prometheus metrics: Some issues detected"
        return 1
    fi
}

# Check alert rules
check_alert_rules() {
    log "Checking alert rules..."

    local rules=$(curl -s "http://localhost:9090/api/v1/rules" | jq -r '.data.groups[].rules[].name' 2>/dev/null || true)

    if [ -z "$rules" ]; then
        warn "No alert rules found"
        return 1
    fi

    local rule_count=$(echo "$rules" | wc -l)
    info "Alert rules: $rule_count configured"

    # Check for firing alerts
    local firing_alerts=$(curl -s "http://localhost:9090/api/v1/alerts" | jq -r '.data.alerts[] | select(.state=="firing") | .labels.alertname' 2>/dev/null || true)

    if [ -n "$firing_alerts" ]; then
        warn "Firing alerts detected:"
        echo "$firing_alerts" | while read alert; do
            warn "  - $alert"
        done
        return 1
    else
        info "No firing alerts"
        return 0
    fi
}

# Check data retention
check_data_retention() {
    log "Checking data retention..."

    local prometheus_data=$(du -sh monitoring/prometheus/data 2>/dev/null | cut -f1)
    local loki_data=$(du -sh monitoring/loki/data 2>/dev/null | cut -f1)
    local tempo_data=$(du -sh monitoring/tempo/data 2>/dev/null | cut -f1)

    info "Prometheus data: ${prometheus_data:-Unknown}"
    info "Loki data: ${loki_data:-Unknown}"
    info "Tempo data: ${tempo_data:-Unknown}"
}

# Generate report
generate_report() {
    echo ""
    echo "📊 Health Check Report"
    echo "======================"
    echo "Timestamp: $(date)"
    echo ""

    echo "Service Status:"
    echo "---------------"
    for service in "${!SERVICE_STATUS[@]}"; do
        local status="${SERVICE_STATUS[$service]}"
        if [ "$status" = "HEALTHY" ]; then
            echo -e "  ✅ $service: $status"
        else
            echo -e "  ❌ $service: $status"
        fi
    done

    echo ""
    echo "Recommendations:"
    echo "----------------"

    local unhealthy_count=0
    for status in "${SERVICE_STATUS[@]}"; do
        if [ "$status" = "UNHEALTHY" ]; then
            unhealthy_count=$((unhealthy_count + 1))
        fi
    done

    if [ $unhealthy_count -eq 0 ]; then
        echo "  ✅ All services are healthy"
    else
        echo "  🔧 $unhealthy_count services need attention"
        echo "  💡 Run 'docker-compose -f docker-compose.monitoring.yml logs' for details"
    fi
}

# Main execution
main() {
    case "${1:-full}" in
        "quick")
            check_containers
            check_endpoints
            ;;
        "full")
            check_containers
            check_endpoints
            check_resources
            check_prometheus_metrics
            check_alert_rules
            check_data_retention
            ;;
        "resources")
            check_resources
            ;;
        "alerts")
            check_alert_rules
            ;;
        *)
            echo "Usage: $0 {quick|full|resources|alerts}"
            exit 1
            ;;
    esac

    generate_report
}

# Run health check
main "$@"

# Exit with appropriate code
for status in "${SERVICE_STATUS[@]}"; do
    if [ "$status" = "UNHEALTHY" ]; then
        exit 1
    fi
done

exit 0
