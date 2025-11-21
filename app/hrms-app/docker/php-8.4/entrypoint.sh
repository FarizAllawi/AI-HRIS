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
# 3. ENVIRONMENT CONFIGURATION (FIX: Ensure .env exists before configuration)
# -------------------------------------------------------
echo "Adjusting .env with environment variables..."

# Check if .env file exists. If not, create it from .env.example
if [ ! -f .env ] && [ -f .env.example ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
elif [ ! -f .env ] && [ ! -f .env.example ]; then
    # Fallback for empty project
    echo ".env and .env.example not found. Creating minimal .env"
    echo "APP_NAME=Laravel HRIS" > .env
    echo "APP_ENV=local" >> .env
fi

if [ -f .env ]; then
    # FIX: Ensure no Windows line endings interfere with configuration
    echo "Removing Windows carriage returns from .env..."
    sed -i 's/\r$//' .env

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
# Ensure directories exist
mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache

# IMPORTANT: Do NOT run chown -R on the entire /var/www/html as this can fail
# on mounted node_modules/vendor if they were created on the host by a different UID.
# 1. Set ownership for writable directories recursively (Must succeed)
chown -R $RUN_AS:$RUN_AS /var/www/html/storage
chown -R $RUN_AS:$RUN_AS /var/www/html/bootstrap/cache

# 2. Set ownership for the top-level application directory (non-recursive)
# This ensures application files are owned by $RUN_AS without touching sub-dependencies.
# Using '|| true' allows the script to continue if chown fails on some host-mounted files.
chown $RUN_AS:$RUN_AS /var/www/html || true
chown $RUN_AS:$RUN_AS /var/www/html/* || true
chown $RUN_AS:$RUN_AS /var/www/html/.* || true

# Set directory permissions for writable folders
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Fix log file permissions if it was created as root before
touch /var/www/html/storage/logs/laravel.log
chown $RUN_AS:$RUN_AS /var/www/html/storage/logs/laravel.log

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
su-exec $RUN_AS php artisan key:generate
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
# 7. VITE ASSET MANAGEMENT
# -------------------------------------------------------
cd /var/www/html

if [ -f "package.json" ]; then

    # Determine package manager preference
    PACKAGE_MANAGER="npm"
    if [ -f "pnpm-lock.yaml" ]; then
        PACKAGE_MANAGER="pnpm"
    elif [ -f "yarn.lock" ] && command -v yarn &> /dev/null; then
        PACKAGE_MANAGER="yarn"
    fi
    echo "Detected package manager: $PACKAGE_MANAGER"

    if [ "$APP_ENV" = "local" ]; then
        # 7.A: Development Mode: Start the Vite HMR server in the background
        echo "Starting Vite development server (via '$PACKAGE_MANAGER run dev') in the background..."

        # We run the command using the determined package manager
        # Run in background (&) so the script can continue to Supervisord.
        su-exec $RUN_AS $PACKAGE_MANAGER run dev &

    elif [ "$APP_ENV" = "production" ]; then
        # 7.B: Production Mode: Ensure assets are built
        if [ ! -f "public/build/manifest.json" ]; then
            echo "Manifest not found. Building production assets (via '$PACKAGE_MANAGER run build')..."
            # Run the command in the foreground to ensure completion before starting supervisor
            su-exec $RUN_AS $PACKAGE_MANAGER run build
        else
            echo "Production assets already built (manifest.json found). Skipping build."
        fi
    fi
fi

# -------------------------------------------------------
# 8. EXECUTE CMD (Supervisord)
# -------------------------------------------------------
echo "Starting Supervisor..."
exec "$@"
