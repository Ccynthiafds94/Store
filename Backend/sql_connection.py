__cnx = None

import mysql.connector
def get_sql_connection():
    global __cnx
    if __cnx is None:
        config = {
                "user": "root",
                "password": "root",
                "host": "127.0.0.1",
                "database": "gs",
        }
        __cnx = mysql.connector.connect(**config)
    return __cnx