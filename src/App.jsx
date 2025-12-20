import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ProductPage from "./pages/ProductPage";
import PaymentPage from "./pages/PaymentPage";
import KitchenPage from "./pages/KitchenPage";
import ReportsPage from "./pages/ReportsPage";
import OrderPage from "./pages/OrderPage";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<ProductPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
