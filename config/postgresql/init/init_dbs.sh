#!/bin/bash
set -e

HRMS_DB_USER=${HRMS_DB_USER:-$POSTGRES_USER}
SCREENING_DB_USER=${SCREENING_DB_USER:-$POSTGRES_USER}

DB_NAMES=("hrms_db" "screening_db")
DB_OWNERS=("$HRMS_DB_USER" "$SCREENING_DB_USER")
NUM_DBS=${#DB_NAMES[@]}

echo "Starting PostgreSQL database creation and setup..."

# Build SQL string without heredoc to avoid variable expansion issues
SQL=""

# Create databases
for ((i=0; i<NUM_DBS; i++)); do
	SQL+="CREATE DATABASE ${DB_NAMES[i]} OWNER ${DB_OWNERS[i]};"$'\n'
done

# Create monitoring user (without IF NOT EXISTS which is not valid syntax)
SQL+="DO \$\$ BEGIN CREATE USER monitor WITH PASSWORD 'monitor_password'; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;"$'\n'
SQL+="GRANT pg_monitor TO monitor;"$'\n'

# Create extensions in each database
for ((i=0; i<NUM_DBS; i++)); do
	SQL+="\\connect ${DB_NAMES[i]}"$'\n'
	SQL+='CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'$'\n'
	SQL+='CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";'$'\n'
done

# Configure PostgreSQL for performance
SQL+="\\connect postgres"$'\n'
SQL+="ALTER SYSTEM SET max_connections = 100;"$'\n'
SQL+="ALTER SYSTEM SET shared_buffers = '1GB';"$'\n'
SQL+="ALTER SYSTEM SET effective_cache_size = '3GB';"$'\n'
SQL+="ALTER SYSTEM SET maintenance_work_mem = '256MB';"$'\n'
SQL+="ALTER SYSTEM SET checkpoint_completion_target = 0.9;"$'\n'
SQL+="ALTER SYSTEM SET wal_buffers = '16MB';"$'\n'
SQL+="ALTER SYSTEM SET default_statistics_target = 100;"$'\n'
SQL+="ALTER SYSTEM SET random_page_cost = 1.1;"$'\n'
SQL+="ALTER SYSTEM SET effective_io_concurrency = 200;"$'\n'
SQL+="ALTER SYSTEM SET work_mem = '4854kB';"$'\n'
SQL+="ALTER SYSTEM SET huge_pages = off;"$'\n'
SQL+="ALTER SYSTEM SET min_wal_size = '1GB';"$'\n'
SQL+="ALTER SYSTEM SET max_wal_size = '4GB';"$'\n'

# Execute the SQL
echo "$SQL" | psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"

echo "Database creation complete for: ${DB_NAMES[@]}."
echo "Initialization script finished successfully!"
