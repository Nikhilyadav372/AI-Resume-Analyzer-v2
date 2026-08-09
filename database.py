import os
import mysql.connector
from mysql.connector import Error
from config import Config

def get_connection():
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            ssl_ca=os.path.join(
                os.path.dirname(__file__),
                "certificates",
                "ca.pem"
            )
        )

        if connection.is_connected():
            print("✅ Database Connected Successfully")
            return connection

    except Error as e:
        print("❌ Database Connection Error:", e)
        return None