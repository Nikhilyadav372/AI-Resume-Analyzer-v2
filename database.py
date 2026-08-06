import mysql.connector
from mysql.connector import Error
from config import Config


def get_connection():
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )

        if connection.is_connected():
            print("✅ Database Connected Successfully")
            return connection

    except Error as e:
        print("❌ Error:", e)
        return None
    if connection.is_connected():
     print("✅ Database Connected Successfully")
    print("Connected Database:", connection.database)
    return connection