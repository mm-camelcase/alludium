-- Initialize TODO Database
-- This script runs when the PostgreSQL container is first created

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create a schema for our application (optional, but good practice)
CREATE SCHEMA IF NOT EXISTS todo_app;

-- Set default search path
ALTER ROLE todo_user SET search_path = todo_app, public;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA todo_app TO todo_user;
GRANT CREATE ON SCHEMA todo_app TO todo_user;

-- Note: Actual tables will be created by migrations in Task 2
-- This script just sets up the basic database structure and permissions