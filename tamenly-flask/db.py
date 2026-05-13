import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()

dbconfig = {
    "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
    "port": int(os.getenv("MYSQL_PORT", 3306)),
    "user": os.getenv("MYSQL_USER"),
    "password": os.getenv("MYSQL_PASS"),
    "database": os.getenv("MYSQL_DB"),
}

try:
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="tamenly_pool",
        pool_size=10,
        **dbconfig
    )
    print("✅ MySQL Connection Pool created successfully")
except mysql.connector.Error as err:
    print(f"❌ Error creating MySQL connection pool: {err}")

def get_db_connection():
    return connection_pool.get_connection()

def query_db(query, args=(), one=False):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, args)
        rv = cursor.fetchall()
        conn.commit()
        return (rv[0] if rv else None) if one else rv
    finally:
        cursor.close()
        conn.close()

def execute_db(query, args=()):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, args)
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()
