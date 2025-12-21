import { useEffect, useState } from "react";
import orderService from "../services/orderService";
import "../App.css";

export default function PaymentPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* FORMAT NUMBERS WITH COMMAS */
  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* LOAD COMPLETED ORDERS */
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getByStatus("Completed");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load completed orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* CONFIRM PAYMENT */
  const confirmPayment = async () => {
    if (!selectedOrder) return;

    try {
      await orderService.updateStatus(selectedOrder.id, {
        orderStatus: "Paid",
      });

      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to confirm payment.");
    }
  };

  return (
    <div className="main-content">
      <div className="main-header">
        <h1>Payments</h1>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No completed orders.</p>
      ) : (
        <div className="order-layout">
          {/* LEFT — COMPLETED ORDERS */}
          <div className="order-products">
            <div className="order-grid">
              {orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    className="order-card"
                    style={{
                      border: isSelected
                        ? "2px solid #10b981"
                        : "2px solid transparent",
                      transition: "border 0.2s",
                    }}
                  >
                    <div style={{ marginBottom: "6px" }}>
                      <strong>Order #{order.id}</strong>
                    </div>

                    {order.tableId && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#d1d5db",
                          marginBottom: "6px",
                        }}
                      >
                        Table {order.tableId}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#9ca3af",
                        marginBottom: "10px",
                      }}
                    >
                      Total: ₱{formatNumber(order.total)}
                    </div>

                    <button
                      className="add-button"
                      style={{ width: "100%" }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      Checkout
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — PAYMENT DETAILS */}
          <div className="order-cart">
            {!selectedOrder ? (
              <p style={{ color: "#9ca3af" }}>
                Select an order to process payment
              </p>
            ) : (
              <>
                <h3 style={{ marginBottom: "6px" }}>
                  Order #{selectedOrder.id}
                </h3>

                {selectedOrder.tableId && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#9ca3af",
                      marginBottom: "12px",
                    }}
                  >
                    Table {selectedOrder.tableId}
                  </p>
                )}

                {selectedOrder.orderItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <strong>
                        {item.productName || `Product #${item.productId}`}
                      </strong>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        ₱{formatNumber(item.unitPrice)} × {item.quantity}
                      </div>
                    </div>

                    <div>₱{formatNumber(item.lineTotal)}</div>
                  </div>
                ))}

                <div className="cart-total">
                  <strong>Total: ₱{formatNumber(selectedOrder.total)}</strong>
                </div>

                <button
                  className="add-button"
                  style={{
                    background: "#10b981",
                    width: "100%",
                  }}
                  onClick={confirmPayment}
                >
                  Confirm Payment
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
