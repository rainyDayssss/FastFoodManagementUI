import axiosClient from "./axiosClient";

const productService = {
  getAll: () => axiosClient.get("/products"),
  getById: (id) => axiosClient.get(`/products/${id}`),

  create: (product) => {
    const formData = new FormData();
    formData.append("Name", product.name);
    formData.append("Price", product.price);
    formData.append("Stock", product.stock);
    if (product.imageFile) formData.append("Image", product.imageFile);

    return axiosClient.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id, product) => {
    const formData = new FormData();
    if (product.name) formData.append("Name", product.name);
    if (product.price) formData.append("Price", product.price);
    if (product.stock) formData.append("Stock", product.stock);
    if (product.imageFile) formData.append("Image", product.imageFile);

    return axiosClient.patch(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id) => axiosClient.delete(`/products/${id}`),
};

export default productService;
