#!/bin/bash
set -e

# Minimal ASCII-only entrypoint. Cleaned to avoid syntax errors caused by
# non-ASCII whitespace or invisible characters.

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

# Determine APP_ENV early (env var > .env)
APP_ENV="${APP_ENV:-}"
if [ -z "$APP_ENV" ] && [ -f /var/www/html/.env ]; then
    APP_ENV=$(grep '^APP_ENV=' /var/www/html/.env 2>/dev/null | cut -d '=' -f2 | tr -d '\r' || echo "")
fi
APP_ENV="${APP_ENV:-local}"
PRODUCTION_MODE=0
if [ "$APP_ENV" = "production" ] || [ "$APP_ENV" = "prod" ]; then
    PRODUCTION_MODE=1
fi

echo "Detected APP_ENV=$APP_ENV (PRODUCTION_MODE=$PRODUCTION_MODE)"

# -------------------------------------------------------
# 2. LARAVEL INSTALLATION (Only if missing)
# -------------------------------------------------------
if [ ! -f /var/www/html/composer.json ]; then
    if [ "$PRODUCTION_MODE" -eq 1 ]; then
        echo "production: composer.json not found — will NOT auto-create Laravel in production. Aborting setup that requires app sources."
    else
        echo "Laravel Not exists, Creating Installation..."

        echo "Installing into temporary directory..."
        su-exec $RUN_AS composer create-project laravel/laravel="12.*" /tmp/laravel-temp --prefer-dist

        echo "Moving installation to project root..."
        su-exec $RUN_AS rsync -av \
            --exclude='.pnpm-store' \
            --exclude='.git' \
            --exclude='.gitignore' \
            --exclude='README.md' \
            /tmp/laravel-temp/ /var/www/html/

        rm -rf /tmp/laravel-temp
    fi
else
    echo "Laravel already exists, skip installation."
fi

# -------------------------------------------------------
# 3. ENVIRONMENT CONFIGURATION
# -------------------------------------------------------
echo "Adjusting .env with environment variables..."
cd /var/www/html || exit 1

if [ ! -f .env ] && [ -f .env.example ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
elif [ ! -f .env ] && [ ! -f .env.example ]; then
    echo ".env and .env.example not found. Creating minimal .env"
    printf '%s\n' "APP_NAME=Laravel Example" "APP_ENV=local" > .env
fi

if [ -f .env ]; then
    echo "Removing Windows carriage returns from .env..."
    sed -i 's/\r$//' .env

    sed -i "s|^DB_CONNECTION=.*|DB_CONNECTION=${DB_CONNECTION:-pgsql}|" .env
    sed -i "s|^#* *DB_HOST=.*|DB_HOST=${DB_HOST:-postgres}|" .env
    sed -i "s|^#* *DB_PORT=.*|DB_PORT=${DB_PORT:-5432}|" .env
    sed -i "s|^#* *DB_DATABASE=.*|DB_DATABASE=${DB_DATABASE:-laravel_db}|" .env
    sed -i "s|^#* *DB_USERNAME=.*|DB_USERNAME=${DB_USERNAME:-postgres}|" .env
    sed -i "s|^#* *DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD:-secret}|" .env

    sed -i "s|^REDIS_CLIENT=.*|REDIS_CLIENT=${REDIS_CLIENT:-phpredis}|" .env
    sed -i "s|^REDIS_HOST=.*|REDIS_HOST=${REDIS_HOST:-redis}|" .env
    sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=${REDIS_PASSWORD:-null}|" .env
    sed -i "s|^REDIS_PORT=.*|REDIS_PORT=${REDIS_PORT:-6379}|" .env

    sed -i "s|^MAIL_MAILER=.*|MAIL_MAILER=${MAIL_MAILER:-smtp}|" .env
    sed -i "s|^MAIL_HOST=.*|MAIL_HOST=${MAIL_HOST:-mailpit}|" .env
    sed -i "s|^MAIL_PORT=.*|MAIL_PORT=${MAIL_PORT:-1025}|" .env
    sed -i "s|^MAIL_USERNAME=.*|MAIL_USERNAME=${MAIL_USERNAME:-null}|" .env
    sed -i "s|^MAIL_PASSWORD=.*|MAIL_PASSWORD=${MAIL_PASSWORD:-null}|" .env
    sed -i "s|^MAIL_ENCRYPTION=.*|MAIL_ENCRYPTION=${MAIL_ENCRYPTION:-null}|" .env
    sed -i "s|^MAIL_FROM_ADDRESS=.*|MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS:-hello@example.com}|" .env

    grep DB_ .env || true
    grep REDIS_ .env || true
    grep MAIL_ .env || true
else
    echo ".env file not found, skipping DB configuration replacement."
fi

# -------------------------------------------------------
# 4. PERMISSIONS (Fix storage/cache)
# -------------------------------------------------------
echo "Setting ownership and permissions..."
mkdir -p /var/www/html/storage/logs \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache \
         /var/www/html/bootstrap/cache

if [ "$PRODUCTION_MODE" -eq 1 ]; then
    echo "Applying production-safe permissions..."
    chown -R $RUN_AS:$RUN_AS /var/www/html || true
    find /var/www/html -type d -exec chmod 755 {} \; || true
    find /var/www/html -type f -exec chmod 644 {} \; || true
    chmod -R 775 /var/www/html/storage || true
    chmod -R 775 /var/www/html/bootstrap/cache || true
    touch /var/www/html/storage/logs/laravel.log || true
    chmod 664 /var/www/html/storage/logs/laravel.log || true
    chown $RUN_AS:$RUN_AS /var/www/html/storage/logs/laravel.log 2>/dev/null || true
else
    chown -R $RUN_AS:$RUN_AS /var/www/html/storage 2>/dev/null || true
    chown -R $RUN_AS:$RUN_AS /var/www/html/bootstrap/cache 2>/dev/null || true
    chown $RUN_AS:$RUN_AS /var/www/html/public 2>/dev/null || true
    chmod -R 777 /var/www/html/storage 2>/dev/null || true
    chmod -R 777 /var/www/html/bootstrap/cache 2>/dev/null || true
    touch /var/www/html/storage/logs/laravel.log || true
    chmod 666 /var/www/html/storage/logs/laravel.log || true
    chown $RUN_AS:$RUN_AS /var/www/html/storage/logs/laravel.log 2>/dev/null || true
fi

# Ensure the log file exists and is writable
touch /var/www/html/storage/logs/laravel.log || true
chmod 666 /var/www/html/storage/logs/laravel.log || true
chown $RUN_AS:$RUN_AS /var/www/html/storage/logs/laravel.log 2>/dev/null || true

# -------------------------------------------------------
# 5. DEPENDENCY CHECKS (Composer & Node)
# -------------------------------------------------------
cd /var/www/html || exit 1

APP_ENV=$(grep '^APP_ENV=' .env 2>/dev/null | cut -d '=' -f2 | tr -d '\r' || echo "local")
if [ -z "$APP_ENV" ]; then
    APP_ENV="local"
fi

echo "Laravel Environment: $APP_ENV"

if [ ! -d "vendor" ]; then
    echo "Vendor directory missing. Installing PHP dependencies..."
    if [ "$PRODUCTION_MODE" -eq 1 ]; then
        echo "Production: attempting composer install (will run as $RUN_AS via su-exec if available)..."
        if command -v su-exec >/dev/null 2>&1; then
            su-exec $RUN_AS composer install --no-interaction --prefer-dist --optimize-autoloader || echo "Composer install failed in production; please ensure vendor dependencies are present."
        else
            composer install --no-interaction --prefer-dist --optimize-autoloader || echo "Composer install failed and su-exec not available."
        fi
    else
        su-exec $RUN_AS composer install --no-interaction --prefer-dist
    fi
else
    echo "Vendor directory exists. Skipping composer install."
fi

if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo "package.json found but node_modules missing. Installing JS dependencies..."
        if [ -f "pnpm-lock.yaml" ]; then
            echo "Detected pnpm-lock.yaml. Using pnpm..."
            su-exec $RUN_AS pnpm install
        elif [ -f "yarn.lock" ]; then
            echo "Detected yarn.lock. Using yarn..."
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
# 6. LARAVEL OPTIMIZATION & MIGRATION (Safer for production)
# -------------------------------------------------------
echo "Running Migrations..."
if [ -f .env ]; then
    APP_KEY=$(grep -E '^APP_KEY=' .env 2>/dev/null | cut -d '=' -f2- | tr -d '\r' || echo "")

    if [ "$PRODUCTION_MODE" -eq 1 ]; then
        if [ -z "$APP_KEY" ]; then
            echo "APP_KEY missing. Generating application key..."
            su-exec $RUN_AS php artisan key:generate --force
            APP_KEY=$(grep -E '^APP_KEY=' .env 2>/dev/null | cut -d '=' -f2- | tr -d '\r' || echo "")
        else
            echo "APP_KEY exists in .env, skipping key generation."
        fi
    fi

    echo "Running Database  migrations."
    su-exec $RUN_AS php artisan migrate --force || echo "Migration failed or DB not ready, skipping..."
    echo "Ensuring Passport keys..."
    su-exec $RUN_AS php artisan passport:keys --force || echo "Passport key generation failed, continuing..."
    echo "Seeding Default user..."
    su-exec $RUN_AS php artisan db:seed --force || echo "Seeding default user failed, continuing..."
else
    echo ".env file not found, skipping migrations and key generation."
fi

# ==============================================================================
# 6.5. PASSPORT CLIENT SETUP (TRUSTED SERVICES)
# ==============================================================================
if [ -n "$TRUSTED_SERVICE" ]; then
   echo "-------------------------------------------------------"
   echo "🔐 Setting up Passport Clients for TRUSTED_SERVICE: $TRUSTED_SERVICE"

   # Define the shared directory based on your compose.yml volume mapping
   SHARED_DIR="/var/www/html/storage/shared"
   LARAVEL_ENV="/var/www/html/.env"

   # Ensure shared dir exists and has permissions
   mkdir -p "$SHARED_DIR"
   chmod 777 "$SHARED_DIR"

    # --- HELPER FUNCTION: Deletes old client, creates new client, and saves to file ---
    generate_client_and_save() {
        local client_name=$1
        local config_file=$2
        local tmp_php="/tmp/create_passport_client.php"

        echo "   Generating PHP script for $client_name..."

        # Write a standalone PHP script to a temp file.
        # We use a heredoc with strict ownership of variables.
        cat > "$tmp_php" <<EOF
<?php
// 1. Bootstrap Laravel (bypass Artisan/Tinker wrappers for stability)
require '/var/www/html/vendor/autoload.php';
\$app = require_once '/var/www/html/bootstrap/app.php';
\$kernel = \$app->make(Illuminate\Contracts\Console\Kernel::class);
\$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Passport\Client;

try {
    \$name = '${client_name}';

    // 2. Database Transaction
    DB::transaction(function () use (\$name) {
        // Delete existing clients by name
        DB::table('oauth_clients')->where('name', \$name)->delete();

        \$secret_code = Str::random(40);
        // Create fresh client
        // NOTE: Standard Passport table does NOT have 'grant_types' column.
        // We configure it for Client Credentials grant (machine-to-machine)
        // by setting personal/password flags to false.
        \$client = new Client;
        \$client->name = '${client_name}';
        \$client->redirect_uris = [];  // empty array (required format)
        \$client->grant_types = ['client_credentials'];
        \$client->revoked = false;
        \$client->secret = \$secret_code;
        \$client->save();

        // Output JSON result
        echo json_encode([
            'id' => \$client->id,
            'secret' => \$secret_code
        ]);
    });
} catch (\Throwable \$e) {
    // Catch any error (DB, Syntax, etc) and print it clearly
    fwrite(STDERR, "PHP ERROR: " . \$e->getMessage());
    exit(1);
}
EOF

        # Fix ownership so the runtime user can execute it
        chmod 644 "$tmp_php"

        echo "   Executing Passport generator..."

        # Execute the script using PHP directly
        local client_json_output
        client_json_output=$(su-exec $RUN_AS php "$tmp_php")
        local exit_code=$?

        # Clean up temp file
        rm "$tmp_php"

        # Check for failure
        if [ $exit_code -ne 0 ]; then
            echo "   ❌ Fatal Error: Failed to create client."
            echo "   Output: $client_json_output"
            return 1
        fi

        # Extract JSON cleanly
        local client_data
        client_data=$(echo "$client_json_output" | grep -o '{"id":"[^"]*","secret":"[^"]*"}' | head -n 1)

        if [ -n "$client_data" ]; then
            local client_id
            local client_secret

            client_id=$(echo "$client_data" | grep -o '"id":"[^"]*"' | sed 's/"id":"//' | sed 's/"//')
            client_secret=$(echo "$client_data" | grep -o '"secret":"[^"]*"' | sed 's/"secret":"//' | sed 's/"//')

            if [ -n "$client_id" ] && [ -n "$client_secret" ]; then
                echo "CLIENT_ID=$client_id" > "$config_file"
                echo "CLIENT_SECRET=$client_secret" >> "$config_file"
                echo "   Saved credentials to $config_file"

                if [ -f "$LARAVEL_ENV" ]; then
                    # Convert client name to uppercase for env variable
                    local env_var_name=$(echo "$client_name" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

                    # Remove existing entries if they exist
                    sed -i.bak -e "/^${env_var_name}_CLIENT_ID=/d" -e "/^${env_var_name}_CLIENT_SECRET=/d" "$LARAVEL_ENV"

                    # Append new entries
                    echo "${env_var_name}_CLIENT_ID=$client_id" >> "$LARAVEL_ENV"
                    echo "${env_var_name}_CLIENT_SECRET=$client_secret" >> "$LARAVEL_ENV"

                    echo "export ${env_var_name}_CLIENT_ID=\"$client_id\"" >> /etc/profile.d/00-custom-env.sh
                    echo "export ${env_var_name}_CLIENT_SECRET=\"$client_secret\"" >> /etc/profile.d/00-custom-env.sh
                    chmod +x /etc/profile.d/00-custom-env.sh
                    echo "   Updated credentials in Laravel .env as ${env_var_name}_CLIENT_ID and ${env_var_name}_CLIENT_SECRET"
                fi
                return 0
            fi
        fi


        echo "   Error: Could not parse JSON output."
        echo "   Raw output: $client_json_output"
        return 1
    }

    # Reads CLIENT_ID and CLIENT_SECRET from an env file
    read_env_credentials() {
        local file="$1"

        # Reset variables
        ENV_ID=""
        ENV_SECRET=""

        if [ -f "$file" ]; then
            ENV_ID=$(grep -E '^CLIENT_ID=' "$file" 2>/dev/null | cut -d '=' -f2)
            ENV_SECRET=$(grep -E '^CLIENT_SECRET=' "$file" 2>/dev/null | cut -d '=' -f2)
        fi
    }

    get_db_credentials() {
        local name="$1"

        # Returns: ID SECRET or blank if not found
        DB_DATA=$(
            su-exec $RUN_AS sh -c "HOME=/tmp php artisan tinker --execute=\"
                \\$c = \\\\Laravel\\\\Passport\\\\Client::where('name', '$name')->first();
                if (!\\$c) { echo \\\"NONE\\\"; return; }
                echo \\$c->id . ' ' . \\$c->secret;
            \""
        ) || DB_DATA=""

        # Parse result
        if [ "$DB_DATA" = "NONE" ]; then
            DB_ID=""
            DB_SECRET=""
        else
            DB_ID=$(echo "$DB_DATA" | awk '{print $1}')
            DB_SECRET=$(echo "$DB_DATA" | awk '{print $2}')
        fi
    }

    get_db_count() {
        local name="$1"

        DB_COUNT=$(
            su-exec $RUN_AS sh -c "HOME=/tmp php artisan tinker --execute=\"
                echo \\\\Laravel\\\\Passport\\\\Client::where('name', '$name')->count();
            \"" 2>/dev/null | tr -dc '0-9' || echo "0"
        ) || true

        # Ensure DB_COUNT is numeric
        if ! [[ "$DB_COUNT" =~ ^[0-9]+$ ]]; then
            DB_COUNT=0
        fi
    }

    IFS=',' read -ra SERVICES <<< "$TRUSTED_SERVICE"

    for SERVICE_RAW in "${SERVICES[@]}"; do
        SERVICE_KEY=$(echo "$SERVICE_RAW" | xargs)
        CLIENT_NAME=$(echo "$SERVICE_KEY" | tr '[:lower:]' '[:upper:]')
        CONFIG_FILE="$SHARED_DIR/${SERVICE_KEY}_passport.env"

        echo "Processing Service: $CLIENT_NAME"

        # Get DB count and env values
        get_db_count "$CLIENT_NAME"

        # 1. Missing config file
        if [ ! -f "$CONFIG_FILE" ]; then
            echo "   [Missing] No config file"
            echo "   Action: Generate new client"
            generate_client_and_save "$CLIENT_NAME" "$CONFIG_FILE"
            echo
            continue
        fi

        # Read env CLIENT_ID + CLIENT_SECRET
        read_env_credentials "$CONFIG_FILE"

        # 2. Config exists but DB client missing
        if [ "$DB_COUNT" -eq 0 ]; then
            echo "   [Mismatch] Config exists, DB missing client"
            echo "   Action: Regenerate"
            generate_client_and_save "$CLIENT_NAME" "$CONFIG_FILE"
            echo
            continue
        fi

        # 3. Duplicates in DB
        if [ "$DB_COUNT" -gt 1 ]; then
            echo "   [Conflict] Multiple DB entries for $CLIENT_NAME"
            echo "   Action: Cleanup + Regenerate"

            # FIX: Use sh -c wrapper to correctly set HOME=/tmp environment variable
            su-exec $RUN_AS sh -c "HOME=/tmp php artisan tinker --execute=\"\Laravel\Passport\Client::where('name', '$CLIENT_NAME')->delete();\"" || true

            generate_client_and_save "$CLIENT_NAME" "$CONFIG_FILE"
            continue
        fi

        # 4. Single DB entry: fetch its credentials
        get_db_credentials "$CLIENT_NAME"

        # If DB did not return ID/secret, regenerate
        if [ -z "$DB_ID" ] || [ -z "$DB_SECRET" ]; then
            echo "   [Error] Client record invalid in DB"
            echo "   Action: Regenerate"
            generate_client_and_save "$CLIENT_NAME" "$CONFIG_FILE"
            continue
        fi
    done
fi
# -------------------------------------------------------
# 7. VITE ASSET MANAGEMENT
# -------------------------------------------------------
cd /var/www/html || exit 1

if [ -f "package.json" ]; then
    # Determine package manager preference
    PACKAGE_MANAGER="npm"
    if [ -f "pnpm-lock.yaml" ]; then
      PACKAGE_MANAGER="pnpm"
    elif [ -f "yarn.lock" ] && command -v yarn &> /dev/null; then
      PACKAGE_MANAGER="yarn"
    fi
    echo "Detected package manager: $PACKAGE_MANAGER"

   if [ "$PRODUCTION_MODE" -eq 1 ]; then
      echo "Production Mode: Ensuring assets are built..."
      # 7.B: Production Mode: Ensure assets are built
      if [ ! -f "public/build/manifest.json" ]; then
        echo "Manifest not found. Building production assets (via '$PACKAGE_MANAGER run build')..."
        # Run the command in the foreground to ensure completion before starting supervisor
        su-exec $RUN_AS $PACKAGE_MANAGER run build
      else
        echo "Production assets already built (manifest.json found). Skipping build."
      fi
   else
       echo "👉 Open a terminal and run '$PACKAGE_MANAGER run dev' to start the frontend."
   fi
fi

# ------------------------------------------------
# 8. EXECUTE CMD (Supervisord)
# -------------------------------------------------------
echo "Starting Supervisor..."

# Source the environment variables for the current shell
if [ -f /etc/profile.d/00-custom-env.sh ]; then
   . /etc/profile.d/00-custom-env.sh
fi

# =========================================================
# === TEMPORARY LOGGING MODIFICATION ===
# =========================================================
# Log the critical variables BEFORE execution to confirm they are loaded.
echo "--- ENVIRONMENT VARIABLE CHECK (BEFORE EXEC) ---"
if [ -n "$AI_SERVICE_CLIENT_ID" ]; then
    echo "✅ AI_SERVICE_CLIENT_ID is set: $AI_SERVICE_CLIENT_ID"
else
    echo "❌ AI_SERVICE_CLIENT_ID is NOT set or empty."
fi
if [ -n "$AI_SERVICE_CLIENT_SECRET" ]; then
    echo "✅ AI_SERVICE_CLIENT_SECRET is set (first 5 chars): ${AI_SERVICE_CLIENT_SECRET:0:5}..."
else
    echo "❌ AI_SERVICE_CLIENT_SECRET is NOT set or empty."
fi
echo "------------------------------------------------"
# =========================================================

# Check if the command involves supervisord
if echo "$@" | grep -q "/usr/bin/supervisord"; then
  # SUPERVISORD CASE:
  # We must run supervisord as root so it can:
  # 1. Bind to port 80 (Nginx)
  # 2. Switch users for subprocesses (PHP-FPM, etc.)
  echo "🚀 Executing Supervisord as root (it will manage subprocess permissions)..."
  exec "$@"
else
  # GENERIC COMMAND CASE (e.g. "php artisan ..."):
  # Drop privileges to the app user for security.
  if [ "$PRODUCTION_MODE" -eq 1 ]; then
    if command -v su-exec >/dev/null 2>&1; then
      exec su-exec $RUN_AS "$@"
    elif command -v gosu >/dev/null 2>&1; then
      exec gosu $RUN_AS "$@"
    else
      echo "Warning: su-exec/gosu not found; running process as current user."
      exec "$@"
    fi
  else
    exec "$@"
  fi
fi
