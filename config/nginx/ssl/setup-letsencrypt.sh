#!/bin/bash

set -e

echo "🔐 Let's Encrypt SSL Certificate Setup"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAINS=(
    "screening-api.yourdomain.com"
    "grafana.yourdomain.com"
    "flower.yourdomain.com"
)

EMAIL="admin@yourdomain.com"
SSL_DIR="/etc/letsencrypt"
NGINX_SSL_DIR="/etc/nginx/ssl"

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; }

check_dependencies() {
    log "Checking dependencies..."

    if ! command -v certbot &> /dev/null; then
        error "Certbot is not installed. Please install it first:"
        echo "  Ubuntu/Debian: sudo apt-get install certbot"
        echo "  CentOS/RHEL: sudo yum install certbot"
        exit 1
    fi

    if ! command -v nginx &> /dev/null; then
        error "Nginx is not installed or not in PATH"
        exit 1
    fi

    info "All dependencies are available"
}

setup_nginx_for_challenge() {
    log "Setting up Nginx for ACME challenge..."

    # Create challenge directory
    mkdir -p /var/www/certbot

    # Create temporary nginx configuration for certificate challenge
    cat > /etc/nginx/conf.d/certbot-challenge.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    location / {
        return 444;
    }
}
EOF

    # Test and reload nginx
    if nginx -t; then
        systemctl reload nginx
        info "Nginx configured for ACME challenge"
    else
        error "Nginx configuration test failed"
        exit 1
    fi
}

generate_dhparam() {
    log "Generating Diffie-Hellman parameters (this may take a while)..."

    if [ ! -f "$NGINX_SSL_DIR/dhparam.pem" ]; then
        mkdir -p "$NGINX_SSL_DIR"
        openssl dhparam -out "$NGINX_SSL_DIR/dhparam.pem" 2048
        info "Diffie-Hellman parameters generated"
    else
        warn "Diffie-Hellman parameters already exist"
    fi
}

obtain_certificates() {
    log "Obtaining SSL certificates from Let's Encrypt..."

    for domain in "${DOMAINS[@]}"; do
        log "Processing domain: $domain"

        if [ -d "$SSL_DIR/live/$domain" ]; then
            warn "Certificate already exists for $domain, skipping..."
            continue
        fi

        if certbot certonly --webroot -w /var/www/certbot -d "$domain" --email "$EMAIL" --agree-tos --non-interactive; then
            info "✓ Certificate obtained for $domain"
        else
            error "Failed to obtain certificate for $domain"
        fi
    done
}

setup_ssl_configuration() {
    log "Setting up SSL configuration..."

    # Create common SSL parameters file
    cat > "$NGINX_SSL_DIR/ssl-params.conf" << 'EOF'
# SSL Configuration Parameters
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_ecdh_curve secp384r1;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 1.1.1.1 valid=300s;
resolver_timeout 5s;

# Security headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
EOF

    info "SSL configuration created"
}

setup_certificate_renewal() {
    log "Setting up certificate renewal..."

    # Create renewal script
    cat > /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << 'EOF'
#!/bin/bash
echo "Reloading Nginx after certificate renewal..."
nginx -t && systemctl reload nginx
EOF

    chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh

    # Test renewal
    if certbot renew --dry-run; then
        info "✓ Certificate renewal test successful"
    else
        error "Certificate renewal test failed"
    fi

    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    info "✓ Certificate renewal added to crontab"
}

cleanup_challenge_config() {
    log "Cleaning up challenge configuration..."

    rm -f /etc/nginx/conf.d/certbot-challenge.conf

    if nginx -t; then
        systemctl reload nginx
        info "Challenge configuration cleaned up"
    else
        error "Failed to clean up challenge configuration"
    fi
}

display_summary() {
    echo ""
    echo "✅ SSL Certificate Setup Complete!"
    echo "=================================="
    echo ""
    echo "📋 Certificate Summary:"
    for domain in "${DOMAINS[@]}"; do
        if [ -d "$SSL_DIR/live/$domain" ]; then
            echo "  ✓ $domain"
        else
            echo "  ✗ $domain (failed)"
        fi
    done
    echo ""
    echo "📍 Certificate Locations:"
    echo "  - Live certificates: $SSL_DIR/live/"
    echo "  - SSL configuration: $NGINX_SSL_DIR/"
    echo ""
    echo "🔄 Renewal Information:"
    echo "  - Automatic renewal configured via cron"
    echo "  - Manual renewal: certbot renew"
    echo "  - Dry run: certbot renew --dry-run"
    echo ""
    echo "🔧 Next Steps:"
    echo "  1. Update your Nginx server blocks to use the new certificates"
    echo "  2. Test SSL configuration: nginx -t"
    echo "  3. Reload Nginx: systemctl reload nginx"
    echo "  4. Test SSL using: openssl s_client -connect yourdomain.com:443"
    echo ""
}

main() {
    log "Starting SSL certificate setup..."

    check_dependencies
    setup_nginx_for_challenge
    generate_dhparam
    obtain_certificates
    setup_ssl_configuration
    setup_certificate_renewal
    cleanup_challenge_config
    display_summary

    log "SSL setup completed successfully! 🔒"
}

# Run main function
main "$@"
