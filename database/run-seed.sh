#!/bin/bash

# =============================================================================
# Fresh County Database Seed Script
# =============================================================================
# This script restores the complete database from active-fc-database.sql
# which contains both schema and all data (521 records across 31 tables)
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="ecommerce_db"
DB_USER="root"
DB_PASSWORD="@Erhun91"
DB_HOST="localhost"
BACKUP_FILE="active-fc-database.sql"

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}Fresh County Database Restoration${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file '$BACKUP_FILE' not found!${NC}"
    echo -e "${YELLOW}Please ensure active-fc-database.sql is in the database directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Database Configuration:${NC}"
echo -e "   Host: $DB_HOST"
echo -e "   Database: $DB_NAME"
echo -e "   User: $DB_USER"
echo -e "   Backup File: $BACKUP_FILE"
echo ""

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo -e "${RED}❌ MySQL server is not running!${NC}"
    echo -e "${YELLOW}Please start MySQL server first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ MySQL server is running${NC}"

# Test database connection
if ! mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to MySQL database!${NC}"
    echo -e "${YELLOW}Please check your database credentials.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"

# Create database if it doesn't exist
echo -e "${YELLOW}🔨 Creating database if not exists...${NC}"
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database '$DB_NAME' ready${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi

# Ask for confirmation before restoring
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will completely replace the current database with backup data!${NC}"
echo -e "${YELLOW}   This includes:${NC}"
echo -e "${YELLOW}   • 31 tables with complete schema${NC}"
echo -e "${YELLOW}   • 521 records including:${NC}"
echo -e "${YELLOW}     - 83 orders with order history${NC}"
echo -e "${YELLOW}     - 29 products with variations${NC}"
echo -e "${YELLOW}     - 11 user accounts${NC}"
echo -e "${YELLOW}     - All categories, coupons, and content${NC}"
echo ""
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🚫 Database restoration cancelled.${NC}"
    exit 0
fi

# Backup current database (if it has data)
CURRENT_BACKUP="backup_$(date +%Y%m%d_%H%M%S).sql"
echo -e "${YELLOW}💾 Creating backup of current database...${NC}"
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" --single-transaction --routines --triggers "$DB_NAME" > "$CURRENT_BACKUP" 2>/dev/null

if [ $? -eq 0 ] && [ -s "$CURRENT_BACKUP" ]; then
    echo -e "${GREEN}✅ Current database backed up to: $CURRENT_BACKUP${NC}"
else
    echo -e "${YELLOW}ℹ️  No existing data to backup or backup failed${NC}"
    rm -f "$CURRENT_BACKUP" 2>/dev/null
fi

# Restore from backup file
echo -e "${YELLOW}📦 Restoring database from $BACKUP_FILE...${NC}"
echo -e "${BLUE}This may take a few moments...${NC}"

mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database restoration completed successfully!${NC}"
else
    echo -e "${RED}❌ Database restoration failed!${NC}"
    
    # Attempt to restore from current backup if it exists
    if [ -f "$CURRENT_BACKUP" ] && [ -s "$CURRENT_BACKUP" ]; then
        echo -e "${YELLOW}🔄 Attempting to restore from current backup...${NC}"
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$CURRENT_BACKUP"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Original database restored from backup${NC}"
        fi
    fi
    exit 1
fi

# Verify restoration
echo -e "${YELLOW}🔍 Verifying restoration...${NC}"

# Count tables
TABLE_COUNT=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | wc -l)
TABLE_COUNT=$((TABLE_COUNT - 1)) # Remove header row

# Count total records
RECORD_COUNT=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "
SELECT SUM(table_rows) as total_rows 
FROM information_schema.tables 
WHERE table_schema = '$DB_NAME' AND table_type = 'BASE TABLE';" 2>/dev/null | tail -1)

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}🎉 DATABASE RESTORATION COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "${GREEN}📊 Restoration Summary:${NC}"
echo -e "   📋 Tables: $TABLE_COUNT"
echo -e "   📈 Records: ~$RECORD_COUNT"
echo -e "   💾 Backup File: $BACKUP_FILE"
echo ""
echo -e "${GREEN}🗄️  Restored Data Includes:${NC}"
echo -e "   • Complete product catalog with variations"
echo -e "   • All customer orders and order history"
echo -e "   • User accounts and authentication data"
echo -e "   • Categories, coupons, and promotional data"
echo -e "   • Blog content and website pages"
echo -e "   • Newsletter subscriptions and settings"
echo -e "   • All system settings and configurations"
echo ""
echo -e "${BLUE}🚀 Your Fresh County database is ready!${NC}"
echo ""

# Clean up backup file if restoration was successful and user doesn't want to keep it
if [ -f "$CURRENT_BACKUP" ] && [ -s "$CURRENT_BACKUP" ]; then
    echo -e "${YELLOW}🗂️  Current database backup saved as: $CURRENT_BACKUP${NC}"
    read -p "Keep the backup file? (Y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        rm -f "$CURRENT_BACKUP"
        echo -e "${YELLOW}🗑️  Backup file removed${NC}"
    fi
fi

echo -e "${GREEN}✅ Done!${NC}"