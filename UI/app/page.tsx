"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { FormEvent } from "react";

type Product = {
  product_id: number;
  name: string;
  uom_name: string;
  price: number | string;
};

type ProductForm = {
  name: string;
  uom_name: string;
  price: string;
};

const emptyForm: ProductForm = { name: "", uom_name: "Piece", price: "" };

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;
  return body?.error ?? `Request failed (${response.status})`;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) throw new Error(await readError(response));
      setProducts((await response.json()) as Product[]);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not connect to the inventory API.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.uom_name.toLowerCase().includes(normalizedQuery),
    );
  }, [products, query]);

  const inventoryValue = products.reduce(
    (total, product) => total + Number(product.price),
    0,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          uom_name: form.uom_name.trim(),
          price: Number(form.price),
        }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const product = (await response.json()) as Product;
      setProducts((current) =>
        [...current, product].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setForm(emptyForm);
      setNotice(`${product.name} was added to your inventory.`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save this product.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Marketday home">
          <span className="brand-mark">M</span>
          <span>MarketDay</span>
        </Link>

        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <a className="nav-item active" href="#inventory">
            <span className="nav-icon">▦</span>
            Inventory
            <span className="nav-count">{products.length}</span>
          </a>
          <a className="nav-item muted" href="#add-product">
            <span className="nav-icon">＋</span>
            Add product
          </a>
        </nav>

        <div className="sidebar-note">
          <span className="note-icon">✦</span>
          <p>Good inventory makes for a great day at the market.</p>
          <span>Keep things fresh.</span>
        </div>
        <div className="profile">
          <span className="avatar">S</span>
          <span>
            <strong>Store manager</strong>
            <small>Workspace</small>
          </span>
          <span className="profile-dots">···</span>
        </div>
      </aside>

      <section className="main-area" id="inventory">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>Inventory</strong>
          </div>
          <div className="topbar-right">
            <span className="live-indicator"><i /> Store is open</span>
            <span className="today-label">
              {new Intl.DateTimeFormat("en", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }).format(new Date())}
            </span>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR STORE AT A GLANCE</div>
              <h1>Inventory</h1>
              <p className="subheading">
                Keep track of the products that make your store special.
              </p>
            </div>
            <a className="primary-button heading-button" href="#add-product">
              <span>＋</span> Add a product
            </a>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon mint">▦</span>
                <span className="stat-caption">TOTAL PRODUCTS</span>
              </div>
              <strong className="stat-value">{products.length}</strong>
              <span className="stat-foot">Products in your catalog</span>
            </article>
            <article className="stat-card">
              <div className="stat-top">
                <span className="stat-icon peach">$</span>
                <span className="stat-caption">TOTAL LISTED PRICES</span>
              </div>
              <strong className="stat-value">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(inventoryValue)}
              </strong>
              <span className="stat-foot">Combined listed prices</span>
            </article>
            <article className="stat-card stat-tip">
              <span className="tip-spark">✳</span>
              <div>
                <span className="stat-caption">A LITTLE REMINDER</span>
                <p>Fresh stock, happy shoppers.</p>
                <span className="stat-foot">Your shelves are in your hands.</span>
              </div>
            </article>
          </div>

          <div className="workspace-grid">
            <section className="panel product-panel">
              <div className="panel-heading">
                <div>
                  <h2>All products <span className="heading-count">{products.length}</span></h2>
                  <p>Your complete store catalog</p>
                </div>
                <label className="search-box">
                  <span aria-hidden="true">⌕</span>
                  <input
                    aria-label="Search products"
                    placeholder="Search products..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
              </div>

              {error && (
                <div className="alert error-alert" role="alert">
                  <span>{error}</span>
                  <button className="text-button" onClick={() => void loadProducts()}>
                    Try again
                  </button>
                </div>
              )}
              {notice && (
                <div className="alert success-alert" role="status">
                  {notice}
                  <button
                    className="dismiss-button"
                    aria-label="Dismiss success message"
                    onClick={() => setNotice("")}
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>UNIT</th>
                      <th>PRICE</th>
                      <th className="table-action-heading">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td className="empty-state" colSpan={4}>Loading your products...</td>
                      </tr>
                    ) : filteredProducts.length ? (
                      filteredProducts.map((product, index) => (
                        <tr key={product.product_id}>
                          <td>
                            <div className="product-cell">
                              <span className={`product-avatar color-${index % 5}`}>
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                              <span className="product-name">{product.name}</span>
                            </div>
                          </td>
                          <td><span className="unit-pill">{product.uom_name}</span></td>
                          <td className="price-cell">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(Number(product.price))}
                          </td>
                          <td className="table-action-heading">
                            <span className="stock-status"><i /> Listed</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="empty-state" colSpan={4}>
                          {query
                            ? "No products match your search."
                            : error
                              ? "Products couldn't be loaded. Check the backend connection and retry."
                              : "Your inventory is empty. Add a product to get started."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                Showing <strong>{filteredProducts.length}</strong> of{" "}
                <strong>{products.length}</strong> products
                <span className="footer-dot">·</span> Updated just now
              </div>
            </section>

            <aside className="panel form-panel" id="add-product">
              <div className="form-heading">
                <span className="form-icon">＋</span>
                <div>
                  <h2>Add a product</h2>
                  <p>Grow your catalog, one good thing at a time.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="product-name">PRODUCT NAME</label>
                <input
                  id="product-name"
                  className="text-input"
                  placeholder="e.g. Organic avocados"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />

                <label className="field-label" htmlFor="product-unit">UNIT OF MEASURE</label>
                <select
                  id="product-unit"
                  className="text-input select-input"
                  value={form.uom_name}
                  onChange={(event) => setForm({ ...form, uom_name: event.target.value })}
                  required
                >
                  <option>Piece</option>
                  <option>Kg</option>
                  <option>Gram</option>
                  <option>L</option>
                  <option>Pack</option>
                  <option>Box</option>
                  <option>Unit</option>
                </select>

                <label className="field-label" htmlFor="product-price">PRICE</label>
                <div className="price-input-wrap">
                  <span>$</span>
                  <input
                    id="product-price"
                    className="text-input price-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    required
                  />
                  <span className="currency-label">USD</span>
                </div>

                <button className="primary-button submit-button" type="submit" disabled={saving}>
                  {saving ? "Adding product..." : "Add to inventory"}
                  {!saving && <span>→</span>}
                </button>
              </form>
              <div className="form-footnote">
                <span>✳</span>
                Your product will be added to the store catalog right away.
              </div>
            </aside>
          </div>
          <footer className="page-footer">
            <span>Made for the good things in life <b>♥</b></span>
            <span>Marketday Inventory <i>·</i> v1.0</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
