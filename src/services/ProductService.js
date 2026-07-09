// productService.js
// Centralized API layer for Products & Services and Product Groups.
// Swap BASE_URL / fetch logic for your real backend as needed.

const BASE_URL = "http://localhost:8080/api/";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch (_) {
      // response had no JSON body
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ---------- Products ----------

export function getProducts() {
  return request("/products");
}

export function getProduct(id) {
  return request(`/products/${id}`);
}

export function createProduct({ name, unit, productCode, productGroupId, price, tax, priceInclTax, rotRut }) {
  return request("/products", {
    method: "POST",
    body: JSON.stringify({
      name,
      unit,
      productCode,
      productGroupId,
      price,
      tax,
      priceInclTax,
      rotRut,
    }),
  });
}

export function updateProduct(id, updates) {
  return request(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteProduct(id) {
  return request(`/products/${id}`, { method: "DELETE" });
}

// ---------- Product groups ----------

export function getProductGroups() {
  return request("/product-groups");
}

export function createProductGroup({ groupName, addToGroupId }) {
  return request("/product-groups", {
    method: "POST",
    body: JSON.stringify({ groupName, addToGroupId }),
  });
}

export function deleteProductGroup(id) {
  return request(`/product-groups/${id}`, { method: "DELETE" });
}

// ---------- Helpers ----------

export function computePriceInclTax(price, taxPercent) {
  const p = Number(price) || 0;
  const t = Number(taxPercent) || 0;
  return +(p * (1 + t / 100)).toFixed(2);
}