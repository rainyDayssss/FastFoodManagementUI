import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://localhost:7243/api", // Replace with your backend URL
});

export default axiosClient;
