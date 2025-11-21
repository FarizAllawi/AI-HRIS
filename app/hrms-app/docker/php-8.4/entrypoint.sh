#!/bin/bash
set -e

# -------------------------------------------------------
# 1. UID/GID MAPPING (Fixes Docker permissions issues)
# -------------------------------------------------------
if [ "$(id -u)" -eq 0 ]; then
    # Only attempt to modify if user "sail" exists (Dev stage)
    if id "sail" &>/dev/null; then
        if [ -n "$WWWUSER" ]; then
            usermod -u "$WWWUSER" sail || true
        fi

        if [ -n "$WWWGROUP" ]; then
            groupmod -g "$WWWGROUP" sail || true
        fi
    fi
fi

# Determine the user to run commands as
if id "sail" &>/dev/null; then
    RUN_AS="sail"
else
    RUN_AS="nobody"
fi

echo "Running setup as user: $RUN_AS"

# -------------------------------------------------------
# 2. LARAVEL INSTALLATION (Only if missing)
# -------------------------------------------------------
if [ ! -f /var/www/html/composer.json ]; then
  echo "Laravel Not exists, Creating Installation..."
  # Run installation as the target user, not root
  su-exec $RUN_AS composer create-project laravel/laravel="12.*" /var/www/html
else
  echo "Laravel already exists, skip installation."
fi

# -------------------------------------------------------
# 3. ENVIRONMENT CONFIGURATION (FIX: Added defensive defaults for DB variables)
# -------------------------------------------------------
echo "Adjusting .env with environment variables..."
if [ -f .env ]; then
    # Use environment variables, falling back to defaults if they are empty.
    # The default DB_PORT is now 5432 for Postgres.
    sed -i "s|^DB_CONNECTION=.*|DB_CONNECTION=${DB_CONNECTION:-pgsql}|" .env
    sed -i "s|^#* *DB_HOST=.*|DB_HOST=${DB_HOST:-pgsql}|" .env
    sed -i "s|^#* *DB_PORT=.*|DB_PORT=${DB_PORT:-5432}|" .env
    sed -i "s|^#* *DB_DATABASE=.*|DB_DATABASE=${DB_DATABASE:-ai_hris_db}|" .env
    sed -i "s|^#* *DB_USERNAME=.*|DB_USERNAME=${DB_USERNAME:-ai_hris_user}|" .env
    sed -i "s|^#* *DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD:-secret}|" .env

    # Check
    cat .env | grep DB_
else
    echo ".env file not found, skipping DB configuration replacement."
fi

# -------------------------------------------------------
# 4. PERMISSIONS (Fix storage/cache)
# -------------------------------------------------------
echo "Setting ownership and permissions..."
mkdir -p /var/www/html/storage/logs
touch /var/www/html/storage/logs/laravel.log

# Ensure directories exist
mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache

# Set ownership to the correct user (sail or nobody)
chown -R $RUN_AS:$RUN_AS /var/www/html

# Set directory permissions
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# -------------------------------------------------------
# 5. DEPENDENCY CHECKS (Composer & Node)
# -------------------------------------------------------
cd /var/www/html

# Detect Environment
APP_ENV=$(grep ^APP_ENV= .env | cut -d '=' -f2 | tr -d '\r')
if [[ -z "$APP_ENV" ]]; then
    APP_ENV=local
fi

echo "Laravel Environment: $APP_ENV"

# --- A. Composer Check (FIX: Corrected Bash syntax for dependency check) ---
# Check if vendor exists. If not, run composer install.
if [ ! -d "vendor" ]; then
    echo "Vendor directory missing. Installing PHP dependencies..."
    # Ensure composer runs as the intended user
    su-exec $RUN_AS composer install --no-interaction --prefer-dist
else
    echo "Vendor directory exists. Skipping composer install."
fi

# --- B. Node/Frontend Check (Vue/React/Inertia) ---
# Check if package.json exists
if [ -f "package.json" ]; then
    # Check if node_modules is missing
    if [ ! -d "node_modules" ]; then
        echo "package.json found but node_modules missing. Installing JS dependencies..."

        # Check for specific lock files to determine package manager
        if [ -f "pnpm-lock.yaml" ]; then
            echo "Detected pnpm-lock.yaml. Using pnpm..."
            su-exec $RUN_AS pnpm install
        elif [ -f "yarn.lock" ]; then
            echo "Detected yarn.lock. Using yarn..."
            # Note: yarn must be installed in Dockerfile for this to work, checking fallback
            if command -v yarn &> /dev/null; then
                su-exec $RUN_AS yarn install
            else
                echo "Yarn not installed, falling back to npm..."
                su-exec $RUN_AS npm install
            fi
        else
            echo "Defaulting to npm install..."
            su-exec $RUN_AS npm install
        fi
    else
        echo "node_modules exists. Skipping JS dependency install."
    fi
fi

# -------------------------------------------------------
# 6. LARAVEL OPTIMIZATION & MIGRATION
# -------------------------------------------------------

# Run Migrations (Optional: Wrap in try block or ensure DB is ready)
echo "Running Migrations..."
su-exec $RUN_AS php artisan migrate --force || echo "Migration failed or DB not ready, skipping..."

if [ "$APP_ENV" = "production" ]; then
    echo "Production Mode: Caching Configuration..."
    su-exec $RUN_AS php artisan config:cache
    su-exec $RUN_AS php artisan route:cache
    su-exec $RUN_AS php artisan view:cache
else
    echo "Development Mode: Clearing Configuration..."
    su-exec $RUN_AS php artisan config:clear
    su-exec $RUN_AS php artisan cache:clear
    su-exec $RUN_AS php artisan view:clear
    su-exec $RUN_AS php artisan route:clear
fi

# -------------------------------------------------------
# 7. EXECUTE CMD (Supervisord)
# -------------------------------------------------------
echo "Starting Supervisor..."
exec "$@"
