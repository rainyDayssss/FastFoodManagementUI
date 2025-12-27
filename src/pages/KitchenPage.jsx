import { useEffect, useState } from "react";
import orderService from "../services/orderService";
import "../App.css";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cookingOrders, setCookingOrders] = useState(() => {
    const saved = localStorage.getItem("cookingOrders");
    return saved ? JSON.parse(saved) : [];
  });
  const [doneSuccess, setDoneSuccess] = useState(false);

  /* LOAD CONFIRMED ORDERS */
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

  /* SAVE COOKING ORDERS */
  useEffect(() => {
    localStorage.setItem("cookingOrders", JSON.stringify(cookingOrders));
  }, [cookingOrders]);

  /* COOKING CONTROLS */
  const startCooking = (orderId) => {
    if (!cookingOrders.includes(orderId)) {
      setCookingOrders([...cookingOrders, orderId]);
    }
  };

  const cancelCooking = (orderId) => {
    setCookingOrders(cookingOrders.filter((id) => id !== orderId));
  };

  const markAsDone = async (orderId) => {
    try {
      await orderService.updateStatus(orderId, { orderStatus: "Completed" });
      setCookingOrders(cookingOrders.filter((id) => id !== orderId));
      
      // Show success message
      setDoneSuccess(true);
      
      // Reload orders
      loadOrders();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setDoneSuccess(false);
      }, 3000);
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

      {/* SUCCESS MESSAGE */}
      {doneSuccess && (
        <div className="success-message">
          ✓ Order marked as completed!
        </div>
      )}

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No confirmed orders.</p>
      ) : (
        <div className="order-grid">
          {orders.map((order) => {
            const isCooking = cookingOrders.includes(order.id);

            return (
              <div
                key={order.id}
                className="order-card"
                style={{
                  position: "relative",
                  border: isCooking ? "2px solid #f59e0b" : "none",
                }}
              >
                {/* Cooking badge */}
                {isCooking && (
                  <span
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "#f59e0b",
                      color: "#fff",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                    }}
                  >
                    Cooking
                  </span>
                )}

                <div style={{ marginBottom: "4px" }}>
                  <strong>Order #{order.id}</strong>
                </div>

                {order.tableId && (
                  <div
                    style={{
                      marginBottom: "8px",
                      fontSize: "0.85rem",
                      color: "#d1d5db",
                    }}
                  >
                    Table {order.tableId}
                  </div>
                )}

                <ul>
                  {order.orderItems?.map((item) => (
                    <li key={item.id}>
                      {item.productName} x {item.quantity}
                    </li>
                  ))}
                </ul>

                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  {!isCooking ? (
                    <button
                      className="add-button"
                      style={{
                        background: "#f59e0b",
                        padding: "4px 6px",
                        fontSize: "0.7rem",
                      }}
                      onClick={() => startCooking(order.id)}
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      className="add-button"
                      style={{
                        background: "#ef4444",
                        padding: "4px 6px",
                        fontSize: "0.7rem",
                      }}
                      onClick={() => cancelCooking(order.id)}
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    className="add-button"
                    style={{
                      background: "#3b82f6",
                      padding: "4px 6px",
                      fontSize: "0.7rem",
                    }}
                    onClick={() => markAsDone(order.id)}
                  >
                    Done
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}