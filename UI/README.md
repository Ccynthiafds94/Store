# Marketday UI

This Next.js app displays and adds products through the Flask backend.

## Start locally

1. Start MySQL with the `gs` database and start the Flask API from `Backend`:

   ```powershell
   cd ..\Backend
   python -m pip install -r requirements.txt
   python server.py
   ```

2. In a second terminal, start the UI:

   ```powershell
   cd UI
   npm install
   npm run dev
   ```

3. Open `http://localhost:3000`. The UI proxies its `/api` requests to
   `http://127.0.0.1:5000`. Set `BACKEND_URL` before starting Next.js to use a
   different backend address.

The API provides `GET /api/products` and `POST /api/products`. The latter
accepts `{ "name": "Apples", "uom_name": "Kg", "price": 2.5 }`.
