#!/bin/bash
set -e

# Create additional users if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create read-only user for monitoring
    CREATE USER monitor WITH PASSWORD 'monitor_password';
    GRANT pg_monitor TO monitor;

    -- Create application-specific schema if needed
    -- CREATE SCHEMA IF NOT EXISTS screening AUTHORIZATION admin;

    -- Set up extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

    -- Grant permissions
    GRANT ALL PRIVILEGES ON DATABASE screening_db TO admin;
EOSQL

echo "Database initialization complete!"
