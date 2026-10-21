from sql_connection import get_sql_connection


def get_products():
    cnx = get_sql_connection()
    cursor = cnx.cursor()
    try:
        cursor.execute(
            "SELECT products.product_id, products.name, uom.uom_name, products.price "
            "FROM products INNER JOIN uom ON products.uom_id = uom.uom_id "
            "ORDER BY products.name"
        )
        return [
            {
                "product_id": product_id,
                "name": name,
                "uom_name": uom_name,
                "price": price,
            }
            for product_id, name, uom_name, price in cursor
        ]
    finally:
        cursor.close()
        cnx.close()


def add_product(name, uom_name, price):
    cnx = get_sql_connection()
    cursor = cnx.cursor()
    try:
        cursor.execute("SELECT product_id FROM products WHERE name = %s", (name,))
        if cursor.fetchone():
            raise ValueError("A product with this name already exists.")

        cursor.execute("SELECT uom_id FROM uom WHERE uom_name = %s", (uom_name,))
        uom = cursor.fetchone()
        if uom:
            uom_id = uom[0]
        else:
            cursor.execute("SELECT COALESCE(MAX(uom_id), 0) + 1 FROM uom")
            uom_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO uom (uom_id, uom_name) VALUES (%s, %s)",
                (uom_id, uom_name),
            )

        cursor.execute(
            "INSERT INTO products (name, uom_id, price) VALUES (%s, %s, %s)",
            (name, uom_id, price),
        )
        product_id = cursor.lastrowid
        cnx.commit()
        return {
            "product_id": product_id,
            "name": name,
            "uom_name": uom_name,
            "price": price,
        }
    except Exception:
        cnx.rollback()
        raise
    finally:
        cursor.close()
        cnx.close()

if __name__ == "__main__":
    products = get_products()
    for product in products:
        print(product)  
