import axiosClient from "./axiosClient";

const orderService = {
  getAll: () => axiosClient.get("/orders"),
  
  getById: (id) => axiosClient.get(`/orders/${id}`),
  
  create: (order) => axiosClient.post("/orders", order),
  
  updateStatus: (id, patchOrderDTO) => axiosClient.patch(`/orders/${id}`, patchOrderDTO),
  
  getByStatus: (status) => axiosClient.get(`/orders/status/${status}`),
};

export default orderService;
