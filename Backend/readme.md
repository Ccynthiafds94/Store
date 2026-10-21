# Grocery Store backend

## Run the API

Install the backend dependencies, make sure the MySQL `gs` database and its
`products` and `uom` tables are available, then start Flask:

```powershell
python -m pip install -r requirements.txt
python server.py
```

The API listens at `http://127.0.0.1:5000`. `GET /api/products` returns the
inventory, and `POST /api/products` adds an item using JSON fields `name`,
`uom_name`, and `price`.

## Database configuration

The connection defaults are MySQL on `127.0.0.1`, database `gs`, user `root`,
and password `root`. Override them with `MYSQL_HOST`, `MYSQL_DATABASE`,
`MYSQL_USER`, and `MYSQL_PASSWORD` environment variables.

## Run the frontend

In a second terminal, follow the instructions in `../UI/README.md`. The Next.js
development server proxies `/api` requests to this Flask server.