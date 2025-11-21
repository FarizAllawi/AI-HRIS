#!/bin/bash

set -e

echo "🔐 Generating Self-Signed SSL Certificates"
echo "=========================================="

SSL_DIR="/etc/nginx/ssl"
DOMAINS=(
    "screening-api.localhost"
    "grafana.localhost"
    "flower.localhost"
)

mkdir -p "$SSL_DIR"

for domain in "${DOMAINS[@]}"; do
    echo "Generating certificate for: $domain"

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/$domain.key" \
        -out "$SSL_DIR/$domain.crt" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$domain" \
        -addext "subjectAltName=DNS:$domain"

    echo "✓ Generated: $SSL_DIR/$domain.{key,crt}"
done

echo ""
echo "✅ Self-signed certificates generated!"
echo "📍 Location: $SSL_DIR/"
echo ""
echo "⚠️  Note: These are self-signed certificates for development only."
echo "   For production, use Let's Encrypt or a trusted CA."
