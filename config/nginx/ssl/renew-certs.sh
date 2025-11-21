#!/bin/bash

echo "🔄 Renewing SSL Certificates"
echo "============================"

# Renew certificates
certbot renew --quiet

# Reload nginx if certificates were renewed
if [ $? -eq 0 ]; then
    nginx -t && systemctl reload nginx
    echo "✓ Certificates renewed and nginx reloaded"
else
    echo "✓ No renewal needed"
fi
