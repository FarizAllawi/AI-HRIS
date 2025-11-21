# SSL Certificate Setup

This directory contains SSL configuration and setup scripts for the AI Screening Service.

## File Structure
```
ssl/
├── generate-self-signed.sh # Generate self-signed certificates for development
├── setup-letsencrypt.sh # Automated Let's Encrypt certificate setup
├── renew-certs.sh # Certificate renewal script
├── dhparam.pem # Diffie-Hellman parameters (generate with setup script)
└── ssl-params.conf # Common SSL parameters
```

## Production Setup (Let's Encrypt)

1. Update domain names in nginx configuration files
2. Run the Let's Encrypt setup script:
```bash
   chmod +x deployment/nginx/ssl/setup-letsencrypt.sh
   ./deployment/nginx/ssl/setup-letsencrypt.sh
```

## Development Setup (Self-Signed)
For development environments, use self-signed certificates:

```bash
chmod +x deployment/nginx/ssl/generate-self-signed.sh
./deployment/nginx/ssl/generate-self-signed.sh
```

### Certificate Renewal
Let's Encrypt certificates expire every 90 days. Set up a cron job:
```bash
# Add to crontab (crontab -e)
0 12 * * * /path/to/deployment/nginx/ssl/renew-certs.sh
```

### Security Notes
- Keep private keys secure (permissions 600)
- Use strong Diffie-Hellman parameters (2048-bit minimum)
- Enable HSTS for production
- Regularly update SSL configurations

