#!/usr/bin/env python3
"""
PostgreSQL migration script to add columns to the items table if they don't exist.
"""
import psycopg2
import sys

DB_NAME = "inventory"
DB_USER = "inventory_user"
DB_PASSWORD = "inventory_password"
DB_HOST = "localhost"  # or 'inventory_db' if running inside Docker
DB_PORT = 5432

def column_exists(cursor, table, column):
    cursor.execute("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name=%s AND column_name=%s
        );
    """, (table, column))
    return cursor.fetchone()[0]

def migrate():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()

        if not column_exists(cursor, 'items', 'custom_attributes'):
            print("Adding custom_attributes column to items table...")
            cursor.execute("""
                ALTER TABLE items ADD COLUMN custom_attributes JSONB DEFAULT '{}'::jsonb;
            """)
            conn.commit()
            print("Migration completed: custom_attributes column added.")
        else:
            print("custom_attributes column already exists. No migration needed.")

        if not column_exists(cursor, 'items', 'image_url'):
            print("Adding image_url column to items table...")
            cursor.execute("""
                ALTER TABLE items ADD COLUMN image_url VARCHAR(255);
            """)
            conn.commit()
            print("Migration completed: image_url column added.")
        else:
            print("image_url column already exists. No migration needed.")

        if not column_exists(cursor, 'items', 'qr_code_url'):
            print("Adding qr_code_url column to items table...")
            cursor.execute("""
                ALTER TABLE items ADD COLUMN qr_code_url VARCHAR(255);
            """)
            conn.commit()
            print("Migration completed: qr_code_url column added.")
        else:
            print("qr_code_url column already exists. No migration needed.")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("Starting PostgreSQL migration...")
    migrate()
    print("Done.")