import axios from "axios";

const PRODUCTS_URL = "http://localhost:8080/api/v1/products";
const PRODUCT_GROUPS_URL = "http://localhost:8080/api/v1/product-groups";

const ProductService = {
  // Products
  getAllProducts: () => axios.get(PRODUCTS_URL),
  getProductById: (id) => axios.get(`${PRODUCTS_URL}/${id}`),
  createProduct: (payload) => axios.post(PRODUCTS_URL, payload),
  updateProduct: (id, payload) => axios.put(`${PRODUCTS_URL}/${id}`, payload),
  deleteProduct: (id) => axios.delete(`${PRODUCTS_URL}/${id}`),

  // Product groups
  getAllProductGroups: () => axios.get(PRODUCT_GROUPS_URL),
  createProductGroup: (payload) => axios.post(PRODUCT_GROUPS_URL, payload),
  updateProductGroup: (id, payload) => axios.put(`${PRODUCT_GROUPS_URL}/${id}`, payload),
  deleteProductGroup: (id) => axios.delete(`${PRODUCT_GROUPS_URL}/${id}`),
};

export default ProductService;