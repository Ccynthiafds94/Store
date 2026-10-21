import os

import mysql.connector


def get_sql_connection():
    config = {
        "user": os.environ.get("MYSQL_USER", "root"),
        "password": os.environ.get("MYSQL_PASSWORD", "root"),
        "host": os.environ.get("MYSQL_HOST", "127.0.0.1"),
        "database": os.environ.get("MYSQL_DATABASE", "gs"),
    }
    return mysql.connector.connect(**config)