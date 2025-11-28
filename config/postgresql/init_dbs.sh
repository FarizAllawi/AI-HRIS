#!/bin/bash
set -e

# --- Environment Variable Definitions ---
# The script uses two database owner variables.
# If these variables are NOT set in the environment (which is the case if you only
# define POSTGRES_USER), they automatically fall back to using the default
# POSTGRES_USER as the owner for both databases.
HRMS_DB_USER=${HRMS_DB_USER:-$POSTGRES_USER}
SCREENING_DB_USER=${SCREENING_DB_USER:-$POSTGRES_USER}

# Define the database names and their corresponding owners using parallel arrays.
# Since the owner variables fall back to the same $POSTGRES_USER, both databases
# will be owned by that single user, fulfilling your requirement.
DB_NAMES=("hrms_db" "screening_db") # EDIT THIS IF LINE NEEDED
DB_OWNERS=("$HRMS_DB_USER" "$SCREENING_DB_USER")
NUM_DBS=${#DB_NAMES[@]} # Get the total number of databases to process

echo "Starting PostgreSQL database creation and setup..."

# Execute SQL commands using the default superuser connection
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

    -- ===================================
    -- 1. Create Application Databases
    -- ===================================

    $(for ((i=0; i<NUM_DBS; i++)); do
        echo "-- Creating database: ${DB_NAMES[i]} (Owner: ${DB_OWNERS[i]})"
        echo "CREATE DATABASE ${DB_NAMES[i]} OWNER ${DB_OWNERS[i]};"
    done)


    -- ===================================
    -- 2. Create Common Extensions and Users
    -- ===================================

    -- Create read-only user for monitoring (common practice)
    CREATE USER monitor WITH PASSWORD 'monitor_password';
    GRANT pg_monitor TO monitor;

    -- ===================================
    -- 3. Set up Extensions in the new DBs
    -- ===================================

    -- Loop through all application databases and install necessary extensions.
    $(for ((i=0; i<NUM_DBS; i++)); do
        DB_NAME=${DB_NAMES[i]}
        echo "\\connect ${DB_NAME}"
        echo 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
        echo 'CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";'
    done)

    -- Go back to the initial database
    -- DB Version: 18
    -- OS Type: linux
    -- DB Type: mixed
    -- Total Memory (RAM): 4 GB
    -- CPUs num: 2
    -- Data Storage: ssd

    ALTER SYSTEM SET
    max_connections = '100';
    ALTER SYSTEM SET
    shared_buffers = '1GB';
    ALTER SYSTEM SET
    effective_cache_size = '3GB';
    ALTER SYSTEM SET
    maintenance_work_mem = '256MB';
    ALTER SYSTEM SET
    checkpoint_completion_target = '0.9';
    ALTER SYSTEM SET
    wal_buffers = '16MB';
    ALTER SYSTEM SET
    default_statistics_target = '100';
    ALTER SYSTEM SET
    random_page_cost = '1.1';
    ALTER SYSTEM SET
    effective_io_concurrency = '200';
    ALTER SYSTEM SET
    work_mem = '4854kB';
    ALTER SYSTEM SET
    huge_pages = 'off';
    ALTER SYSTEM SET
    min_wal_size = '1GB';
    ALTER SYSTEM SET
    max_wal_size = '4GB';

    \connect $POSTGRES_DB

EOSQL

echo "Database creation complete for: ${DB_NAMES[@]}."
echo "Initialization script finished successfully!"
