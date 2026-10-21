from sql_connection import get_sql_connection

cnx = get_sql_connection()
cursor = cnx.cursor()

print("Enter products interactively. Leave product name blank to finish.")
count = 0
while True:
    name = input("Product name: ").strip()
    if not name:
        break
    uom_name = input("UOM (e.g., Kg, L, Piece): ").strip() or "Unit"
    price_str = input("Price: ").strip()
    try:
        price = float(price_str)
    except ValueError:
        print("Invalid price, try again.")
        continue

    # check if product already exists by name
    cursor.execute("SELECT product_id FROM products WHERE name = %s", (name,))
    p = cursor.fetchone()

    # ensure uom exists
    cursor.execute("SELECT uom_id FROM uom WHERE uom_name = %s", (uom_name,))
    row = cursor.fetchone()
    if row:
        uom_id = row[0]
    else:
        # handle case where uom_id is not auto-increment
        cursor.execute("SELECT COALESCE(MAX(uom_id), 0) + 1 FROM uom")
        new_id_row = cursor.fetchone()
        new_uom_id = new_id_row[0] if new_id_row else 1
        cursor.execute("INSERT INTO uom (uom_id, uom_name) VALUES (%s, %s)", (new_uom_id, uom_name))
        uom_id = new_uom_id

    if p:
        product_id = p[0]
        resp = input(f"Product '{name}' exists (id={product_id}). Update price and UOM? (y/n): ").strip().lower()
        if resp == 'y':
            cursor.execute("UPDATE products SET price = %s, uom_id = %s WHERE product_id = %s", (price, uom_id, product_id))
            cnx.commit()
            print(f"Updated product id={product_id}.")
        else:
            print("Skipped updating existing product.")
    else:
        cursor.execute("INSERT INTO products (name, uom_id, price) VALUES (%s, %s, %s)", (name, uom_id, price))
        cnx.commit()
        print("record inserted")
        count += 1

cursor.close()
cnx.close()
print(f"Done. Inserted {count} new products")
