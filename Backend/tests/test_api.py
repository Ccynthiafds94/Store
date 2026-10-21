import unittest
from unittest.mock import patch

from server import app


class ProductApiTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    @patch("server.get_products")
    def test_list_products(self, get_products):
        get_products.return_value = [
            {"product_id": 1, "name": "Apples", "uom_name": "Kg", "price": 2.5}
        ]

        response = self.client.get("/api/products")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), get_products.return_value)

    @patch("server.add_product")
    def test_create_product(self, add_product):
        add_product.return_value = {
            "product_id": 1,
            "name": "Apples",
            "uom_name": "Kg",
            "price": 2.5,
        }

        response = self.client.post(
            "/api/products",
            json={"name": " Apples ", "uom_name": " Kg ", "price": 2.5},
        )

        self.assertEqual(response.status_code, 201)
        add_product.assert_called_once_with("Apples", "Kg", 2.5)
        self.assertEqual(response.get_json(), add_product.return_value)

    def test_create_product_rejects_invalid_price(self):
        response = self.client.post(
            "/api/products",
            json={"name": "Apples", "uom_name": "Kg", "price": -1},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Price", response.get_json()["error"])

    @patch("server.add_product", side_effect=ValueError("Duplicate product."))
    def test_create_product_reports_duplicate(self, add_product):
        response = self.client.post(
            "/api/products",
            json={"name": "Apples", "uom_name": "Kg", "price": 2.5},
        )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json()["error"], "Duplicate product.")


if __name__ == "__main__":
    unittest.main()
