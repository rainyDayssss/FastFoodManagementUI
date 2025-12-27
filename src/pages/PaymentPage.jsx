import { useEffect, useState } from "react";
import orderService from "../services/orderService";
import "../App.css";

export default function PaymentPage() {
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  /* FORMAT NUMBERS WITH COMMAS */
  const formatNumber = (num) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* GROUP ORDERS BY TABLE */
  const groupOrdersByTable = (orders) => {
    return orders.reduce((acc, order) => {
      const tableKey = order.tableId ?? "No Table";
      if (!acc[tableKey]) acc[tableKey] = [];
      acc[tableKey].push(order);
      return acc;
    }, {});
  };

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

  const groupedOrders = groupOrdersByTable(orders);
  const tables = Object.keys(groupedOrders);

  /* CONFIRM PAYMENT FOR ENTIRE TABLE */
  const confirmTablePayment = async () => {
    if (!selectedTable) return;

    try {
      const ordersToPay = groupedOrders[selectedTable];

      await Promise.all(
        ordersToPay.map((order) =>
          orderService.updateStatus(order.id, {
            orderStatus: "Paid",
          })
        )
      );

      // Show success message
      setPaymentSuccess(true);
      
      // Clear selection and reload
      setSelectedTable(null);
      loadOrders();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to confirm table payment.");
    }
  };

  return (
    <div className="main-content">
      <div className="main-header">
        <h1>Payments</h1>
      </div>

      {/* SUCCESS MESSAGE */}
      {paymentSuccess && (
        <div className="success-message">
          ✓ Payment confirmed successfully!
        </div>
      )}

      {loading ? (
        <p>Loading tables...</p>
      ) : tables.length === 0 ? (
        <p>No completed orders.</p>
      ) : (
        <div className="order-layout">
          {/* LEFT — TABLE LIST */}
          <div className="order-products">
            <div className="order-grid">
              {tables.map((tableId) => {
                const isSelected = selectedTable === tableId;

                const tableTotal = groupedOrders[tableId].reduce(
                  (sum, order) => sum + order.total,
                  0
                );

                return (
                  <div
                    key={tableId}
                    className="order-card"
                    style={{
                      border: isSelected
                        ? "2px solid #10b981"
                        : "2px solid transparent",
                      transition: "border 0.2s",
                    }}
                  >
                    <strong>
                      {tableId === "No Table"
                        ? "No Table"
                        : `Table ${tableId}`}
                    </strong>

                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      Orders: {groupedOrders[tableId].length}
                    </div>

                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#d1d5db",
                        marginTop: "6px",
                      }}
                    >
                      Total: ₱{formatNumber(tableTotal)}
                    </div>

                    <button
                      className="add-button"
                      style={{ width: "100%", marginTop: "10px" }}
                      onClick={() => setSelectedTable(tableId)}
                    >
                      View Orders
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — TABLE PAYMENT DETAILS */}
          <div className="order-cart">
            {!selectedTable ? (
              <p style={{ color: "#9ca3af" }}>
                Select a table to process payment
              </p>
            ) : (
              <>
                <h3 style={{ marginBottom: "12px" }}>
                  {selectedTable === "No Table"
                    ? "No Table Orders"
                    : `Table ${selectedTable}`}
                </h3>

                {groupedOrders[selectedTable].map((order) => (
                  <div
                    key={order.id}
                    style={{
                      marginBottom: "16px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid #374151",
                    }}
                  >
                    <strong>Order #{order.id}</strong>

                    {order.orderItems.map((item) => (
                      <div key={item.id} className="cart-item">
                        <div>
                          <strong>
                            {item.productName ||
                              `Product #${item.productId}`}
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
                  </div>
                ))}

                <div className="cart-total">
                  <strong>
                    Total: ₱
                    {formatNumber(
                      groupedOrders[selectedTable].reduce(
                        (sum, o) => sum + o.total,
                        0
                      )
                    )}
                  </strong>
                </div>

                <button
                  className="add-button"
                  style={{
                    background: "#10b981",
                    width: "100%",
                  }}
                  onClick={confirmTablePayment}
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