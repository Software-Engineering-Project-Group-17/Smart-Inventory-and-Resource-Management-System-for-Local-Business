#!/bin/bash
# =====================================================
# Database Setup Script for Smart Inventory System
# =====================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Smart Inventory and Resource Management System${NC}"
echo -e "${BLUE}Database Setup Script${NC}"
echo "=================================================="

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed or not in PATH"
    exit 1
fi

print_success "PostgreSQL found"

# Prompt for database connection details
echo ""
print_info "Please provide your database connection details:"

read -p "Database host (e.g., localhost): " DB_HOST
read -p "Database port (default: 5432): " DB_PORT
read -p "Database name: " DB_NAME
read -p "Database username: " DB_USER
read -s -p "Database password: " DB_PASSWORD
echo ""

# Set default port if not provided
if [ -z "$DB_PORT" ]; then
    DB_PORT=5432
fi

# Construct connection string
DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"

print_info "Testing database connection..."

# Test connection
if psql "$DB_URL" -c "SELECT 1;" &> /dev/null; then
    print_success "Database connection successful"
else
    print_error "Failed to connect to database"
    exit 1
fi

# Run the schema
print_info "Creating database schema..."

if psql "$DB_URL" -f "smart_inventory_schema.sql" &> /dev/null; then
    print_success "Database schema created successfully"
else
    print_error "Failed to create database schema"
    exit 1
fi

echo ""
print_success "Database setup completed successfully!"
print_info "Your Smart Inventory system database is ready to use."

echo ""
echo "Connection details:"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "Username: $DB_USER"

echo ""
print_info "You can now update your application.properties with these connection details:"
echo "spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "spring.datasource.username=${DB_USER}"
echo "spring.datasource.password=<your_password>"
