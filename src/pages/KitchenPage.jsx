import { useEffect, useState } from "react";
import orderService from "../services/orderService";
import "../App.css";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD CONFIRMED ORDERS
  ========================== */
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getByStatus("Confirmed");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* =========================
     MARK ORDER AS DONE
  ========================== */
  const markAsDone = async (orderId) => {
    try {
      await orderService.updateStatus(orderId, { orderStatus: "Completed" });
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to update order status.");
    }
  };

  return (
    <div className="main-content">
      <div className="main-header">
        <h1>Kitchen Orders</h1>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No confirmed orders.</p>
      ) : (
        <div className="order-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div>
                <strong>Order #{order.id}</strong>
                {order.tableId && <span> — Table {order.tableId}</span>}
              </div>
              <ul>
                {order.orderItems?.map((item) => (
                  <li key={item.productId}>
                    {item.product?.name || `Product ID ${item.productId}`} x {item.quantity}
                  </li>
                ))}
              </ul>
              <button
                className="add-button"
                style={{ background: "#3b82f6" }}
                onClick={() => markAsDone(order.id)}
              >
                Done Cooking
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
