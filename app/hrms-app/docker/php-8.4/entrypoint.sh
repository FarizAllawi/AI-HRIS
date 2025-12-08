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

  # FIX: "create-project" fails on non-empty dirs and lacks a --force flag.
  # Workaround: Install to a temp dir, then move files to the root.
  echo "Installing into temporary directory..."
  su-exec $RUN_AS composer create-project laravel/laravel="12.*" /tmp/laravel-temp --prefer-dist

  echo "Moving installation to project root..."
  # Copy all files (including hidden ones) from temp to root
  su-exec $RUN_AS rsync -av \
    --exclude='.pnpm-store' \
    --exclude='.git' \
    --exclude='.gitignore' \
    --exclude='README.md' \
    /tmp/laravel-temp/ /var/www/html/

  # Cleanup temp dir
  rm -rf /tmp/laravel-temp
else
  echo "Laravel already exists, skip installation."
fi

# -------------------------------------------------------
# 3. ENVIRONMENT CONFIGURATION (FIX: Ensure .env exists before configuration)
# -------------------------------------------------------
echo "Adjusting .env with environment variables..."

# Change to the project directory
cd /var/www/html || exit 1

# Check if .env file exists. If not, create it from .env.example
if [ ! -f .env ] && [ -f .env.example ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
elif [ ! -f .env ] && [ ! -f .env.example ]; then
    # Fallback for empty project
    echo ".env and .env.example not found. Creating minimal .env"
    echo "APP_NAME=Laravel Example" > .env
    echo "APP_ENV=local" >> .env
fi

if [ -f .env ]; then
    # FIX: Ensure no Windows line endings interfere with configuration
    echo "Removing Windows carriage returns from .env..."
    sed -i 's/\r$//' .env

    # Use environment variables, falling back to defaults if they are empty.
    # The default DB_PORT is now 5432 for Postgres.
    sed -i "s|^DB_CONNECTION=.*|DB_CONNECTION=${DB_CONNECTION:-pgsql}|" .env
    sed -i "s|^#* *DB_HOST=.*|DB_HOST=${DB_HOST:-postgres}|" .env
    sed -i "s|^#* *DB_PORT=.*|DB_PORT=${DB_PORT:-5432}|" .env
    sed -i "s|^#* *DB_DATABASE=.*|DB_DATABASE=${DB_DATABASE:-laravel_db}|" .env
    sed -i "s|^#* *DB_USERNAME=.*|DB_USERNAME=${DB_USERNAME:-postgres}|" .env
    sed -i "s|^#* *DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD:-secret}|" .env

    # The default Redis
    sed -i "s|^REDIS_CLIENT=.*|REDIS_CLIENT=${REDIS_CLIENT:-phpredis}|" .env
    sed -i "s|^REDIS_HOST=.*|REDIS_HOST=${REDIS_HOST:-redis}|" .env
    sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=${REDIS_PASSWORD:-null}|" .env
    sed -i "s|^REDIS_PORT=.*|REDIS_PORT=${REDIS_PORT:-6379}|" .env

    # Mailhog / Mailpit settings
    sed -i "s|^MAIL_MAILER=.*|MAIL_MAILER=${MAIL_MAILER:-smtp}|" .env
    sed -i "s|^MAIL_HOST=.*|MAIL_HOST=${MAIL_HOST:-mailpit}|" .env
    sed -i "s|^MAIL_PORT=.*|MAIL_PORT=${MAIL_PORT:-1025}|" .env
    sed -i "s|^MAIL_USERNAME=.*|MAIL_USERNAME=${MAIL_USERNAME:-null}|" .env
    sed -i "s|^MAIL_PASSWORD=.*|MAIL_PASSWORD=${MAIL_PASSWORD:-null}|" .env
    sed -i "s|^MAIL_ENCRYPTION=.*|MAIL_ENCRYPTION=${MAIL_ENCRYPTION:-null}|" .env
    sed -i "s|^MAIL_FROM_ADDRESS=.*|MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS:-hello@example.com}|" .env

    # Check
    cat .env | grep DB_
    cat .env | grep REDIS_
    cat .env | grep MAIL_
else
    echo ".env file not found, skipping DB configuration replacement."
fi

# -------------------------------------------------------
# 4. PERMISSIONS (Fix storage/cache)
# -------------------------------------------------------
echo "Setting ownership and permissions..."
# Create required directories if they don't exist
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/bootstrap/cache

# Set ownership (Recursive on storage, non-recursive on root to avoid node_modules issues)
chown -R $RUN_AS:$RUN_AS /var/www/html/storage
chown -R $RUN_AS:$RUN_AS /var/www/html/bootstrap/cache
chown $RUN_AS:$RUN_AS /var/www/html/public 2>/dev/null || true

if [ -f /var/www/html/.env ]; then
    echo "Fixing .env file permissions..."
    chown $RUN_AS:$RUN_AS /var/www/html/.env
fi

# --- CRITICAL CHANGE: Use 777 for Dev Storage ---
# In Dev, 777 is safer for storage/cache to ensure Host OS (Windows/Mac)
# can delete logs generated by the Container without "Permission Denied".
chmod -R 777 /var/www/html/storage
chmod -R 777 /var/www/html/bootstrap/cache

# Ensure the log file exists and is writable
touch /var/www/html/storage/logs/laravel.log
chmod 666 /var/www/html/storage/logs/laravel.log
chown $RUN_AS:$RUN_AS /var/www/html/storage/logs/laravel.log

# -------------------------------------------------------
# 5. DEPENDENCY CHECKS (Composer & Node)
# -------------------------------------------------------
cd /var/www/html || exit 1

# Detect Environment
APP_ENV=$(grep ^APP_ENV= .env 2>/dev/null | cut -d '=' -f2 | tr -d '\r' || echo "local")
if [[ -z "$APP_ENV" ]]; then
    APP_ENV="local"
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

# Run Migrations
echo "Running Migrations..."
if [ -f .env ]; then
    su-exec $RUN_AS php artisan key:generate --force
    su-exec $RUN_AS php artisan migrate --force || echo "Migration failed or DB not ready, skipping..."
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

   # Ensure shared dir exists and has permissions
   mkdir -p "$SHARED_DIR"
   chmod 777 "$SHARED_DIR"

    # --- HELPER FUNCTION: Deletes old client, creates new client, and saves to file ---
    generate_client_and_save() {
         local client_name=$1
         local config_file=$2
         local client_json_output
         local php_script

         php_script="
             use Illuminate\Support\Facades\DB;
             use Illuminate\Support\Str;
             use Laravel\Passport\Client;

             // Wrap everything inside DB transaction
             DB::transaction(function () use (\$client_name) {
                 // Delete existing clients by name
                 DB::table('oauth_clients')->where('name', '${client_name}')->delete();

                 // Create fresh client_credentials client
                 \$client = new Client;
                 \$client->name = '${client_name}';
                 \$client->redirect_uris = [];  // empty array (required format)
                 \$client->grant_types = ['client_credentials'];
                 \$client->revoked = false;
                 \$client->secret = Str::random(40);
                 \$client->save();

                 // Output JSON
                 echo json_encode([
                     'id' => \$client->id,
                     'secret' => \$client->secret
                 ]);
             });
         "

         echo "   Running Passport client generator..."

         client_json_output=$(su-exec $RUN_AS php artisan tinker --execute="$php_script")

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
                 return 0
             fi
         fi

         echo "   Error: Failed to generate client credentials."
         echo "      Raw output: $client_json_output"
         return 1
     }
     # --- END FUNCTION ---

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
         DB_DATA=$(su-exec $RUN_AS php artisan tinker --execute="
             \$c = \\Laravel\\Passport\\Client::where('name', '$name')->first();
             if (!\$c) { echo \"NONE\"; return; }
             echo \$c->id . ' ' . \$c->secret;
         ")

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
            su-exec $RUN_AS php artisan tinker --execute="
                echo \\Laravel\\Passport\\Client::where('name', '$name')->count();
            " 2>/dev/null | tr -dc '0-9' || echo "0"
        )

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
             su-exec $RUN_AS php artisan tinker --execute="\Laravel\Passport\Client::where('name', '$CLIENT_NAME')->delete();"
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
             echo
             continue
         fi

         # 5. Compare env and DB (checksum validation)
         if [ "$ENV_ID" != "$DB_ID" ] || [ "$ENV_SECRET" != "$DB_SECRET" ]; then
             echo "   [Checksum Mismatch]"
             echo "       Env ID: $ENV_ID"
             echo "       DB  ID: $DB_ID"
             echo "       Env SECRET: $ENV_SECRET"
             echo "       DB  SECRET: $DB_SECRET"
             echo "   Action: Regenerate"
             generate_client_and_save "$CLIENT_NAME" "$CONFIG_FILE"
             echo
             continue
         fi

         # 6. Everything matches
         echo "   [OK] Config and DB match for $CLIENT_NAME"
         echo "   Action: None needed"
         echo
     done

     echo "-------------------------------------------------------"
fi

# -------------------------------------------------------
# 6.6. CACHE CONFIGURATION BASED ON ENVIRONMENT
# -------------------------------------------------------
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

    if [ "$APP_ENV" = "local" ]; then
        # 7.A: Development Mode: Start the Vite HMR server in the background
        # echo "Starting Vite development server (via '$PACKAGE_MANAGER run dev') in the background..."

        # We run the command using the determined package manager
        # Run in background (&) so the script can continue to Supervisord.
        # su-exec $RUN_AS $PACKAGE_MANAGER run dev &

        # !!! CHANGE HERE !!!
        # We want to start it manually in the terminal. So the error logs are visible.
        echo "👉 Open a terminal and run '$PACKAGE_MANAGER run dev' to start the frontend."

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
