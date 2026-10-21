from sql_connection import get_sql_connection
def get_products():
    cnx = get_sql_connection()
    cursor = cnx.cursor()

    # Simple: select exactly the four columns expected and print rows
    query = "SELECT products.product_id, products.name, uom.uom_name, products.price FROM gs.products INNER JOIN uom ON products.uom_id = uom.uom_id;"

    cnx = get_sql_connection()
    cursor = cnx.cursor()
    cursor.execute(query)

    response = []

    for product_id, name, uom_name, price in cursor:
        response.append(
            {
                "product_id": product_id,
                "name": name, 
                "uom_name": uom_name, 
                "price": price
            }
        )

    cursor.close()
    cnx.close()
    
    return response

if __name__ == "__main__":
    products = get_products()
    for product in products:
        print(product)  
