import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ProductPage from "./pages/ProductPage";
import PaymentPage from "./pages/PaymentPage";
import KitchenPage from "./pages/KitchenPage";
import ReportsPage from "./pages/ReportsPage";
import OrderPage from "./pages/OrderPage";
import OrderPageMobile from "./pages/OrderPageMobile";

function AppContent() {
  const location = useLocation();

  // Hide sidebar for mobile order page
  const hideSidebar = location.pathname === "/order-mobile";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {!hideSidebar && <Sidebar />}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Routes>
          <Route path="/" element={<ProductPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order-mobile" element={<OrderPageMobile />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
