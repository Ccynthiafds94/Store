import math

from flask import Flask, jsonify, request

from products_dao import add_product, get_products


app = Flask(__name__)


@app.get("/hello")
def hello():
    return "Hello, how are you"


@app.get("/api/products")
def list_products():
    return jsonify(get_products())


@app.post("/api/products")
def create_product():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "A JSON object is required."}), 400

    name = data.get("name")
    uom_name = data.get("uom_name", "Unit")
    price = data.get("price")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Product name is required."}), 400
    if not isinstance(uom_name, str) or not uom_name.strip():
        return jsonify({"error": "Unit of measure is required."}), 400
    if (
        isinstance(price, bool)
        or not isinstance(price, (int, float))
        or not math.isfinite(price)
        or price < 0
    ):
        return jsonify({"error": "Price must be a non-negative number."}), 400

    try:
        product = add_product(name.strip(), uom_name.strip(), price)
    except ValueError as error:
        return jsonify({"error": str(error)}), 409

    return jsonify(product), 201


if __name__ == "__main__":
    print("Starting Python Flask Server For Store Management System")
    app.run(host="127.0.0.1", port=5000)