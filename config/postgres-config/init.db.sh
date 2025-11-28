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
    \connect $POSTGRES_DB
    
EOSQL

echo "Database creation complete for: ${DB_NAMES[@]}."
echo "Initialization script finished successfully!"