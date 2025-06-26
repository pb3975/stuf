#!/usr/bin/env python3
"""
Database migration script to add the missing custom_attributes column
to the items table.
"""

import sqlite3
import json
import os

def migrate_database():
    """Add the custom_attributes column to the items table if it doesn't exist."""
    
    db_path = 'inventory.db'
    
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found!")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if custom_attributes column already exists
        cursor.execute("PRAGMA table_info(items)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'custom_attributes' not in columns:
            print("Adding custom_attributes column to items table...")
            
            # Add the custom_attributes column with a default empty JSON object
            cursor.execute("""
                ALTER TABLE items 
                ADD COLUMN custom_attributes TEXT DEFAULT '{}'
            """)
            
            # Update existing rows to have an empty JSON object
            cursor.execute("""
                UPDATE items 
                SET custom_attributes = '{}' 
                WHERE custom_attributes IS NULL
            """)
            
            conn.commit()
            print("✅ Migration completed successfully!")
            print("Added custom_attributes column to items table.")
        else:
            print("✅ custom_attributes column already exists. No migration needed.")
        
        # Verify the migration
        cursor.execute("PRAGMA table_info(items)")
        columns_after = cursor.fetchall()
        print("\nCurrent table schema:")
        for col in columns_after:
            print(f"  - {col[1]} ({col[2]})")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == "__main__":
    print("Starting database migration...")
    success = migrate_database()
    if success:
        print("\n🎉 Migration completed successfully!")
    else:
        print("\n💥 Migration failed!")
        exit(1) 