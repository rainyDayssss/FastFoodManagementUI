import { useEffect, useState } from "react";
import orderService from "../services/orderService";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../App.css";

export default function ReportsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    mostBoughtProduct: "-",
    mostUsedTable: "-",
  });
  const [productData, setProductData] = useState([]);
  const [tableData, setTableData] = useState([]);

  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57", "#ffc0cb", "#d88884",
  ];

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getByStatus("Paid");
      const paidOrders = res.data;
      setOrders(paidOrders);

      const totalOrders = paidOrders.length;
      const totalRevenue = paidOrders.reduce((acc, order) => acc + order.total, 0);
      const totalProfit = paidOrders.reduce((acc, order) => {
        const orderProfit = order.orderItems.reduce((sum, item) => sum + item.lineTotal * 0.3, 0);
        return acc + orderProfit;
      }, 0);

      const productCount = {};
      paidOrders.forEach(order => {
        order.orderItems.forEach(item => {
          const name = item.productName || `Product #${item.productId}`;
          productCount[name] = (productCount[name] || 0) + item.quantity;
        });
      });
      const mostBoughtProduct = Object.keys(productCount).reduce(
        (a, b) => (productCount[a] > productCount[b] ? a : b),
        "-"
      );

      const tableCount = {};
      paidOrders.forEach(order => {
        if (order.tableId) {
          tableCount[order.tableId] = (tableCount[order.tableId] || 0) + 1;
        }
      });
      const mostUsedTable =
        Object.keys(tableCount).length > 0
          ? Object.keys(tableCount).reduce((a, b) => (tableCount[a] > tableCount[b] ? a : b))
          : "-";

      setStats({
        totalOrders,
        totalRevenue,
        totalProfit,
        mostBoughtProduct,
        mostUsedTable,
      });

      setProductData(
        Object.keys(productCount).map((name) => ({ name, value: productCount[name] }))
      );
      setTableData(
        Object.keys(tableCount).map((tableId) => ({ name: `Table ${tableId}`, value: tableCount[tableId] }))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to load paid orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* Custom legend formatter */
  const legendFormatter = (value) => (
    <span style={{ fontSize: "0.75rem", color: "#e0e0e0" }}>{value}</span>
  );

  return (
    <div className="main-content">
      <div className="main-header">
        <h1>Sales Reports</h1>
      </div>

      {loading ? (
        <p>Loading paid orders...</p>
      ) : orders.length === 0 ? (
        <p>No paid orders yet.</p>
      ) : (
        <>
          {/* STATISTICS */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Total Paid Orders", value: stats.totalOrders },
              { label: "Total Revenue", value: `₱${formatNumber(stats.totalRevenue)}` },
              { label: "Estimated Profit", value: `₱${formatNumber(stats.totalProfit)}` },
              { label: "Most Bought Product", value: stats.mostBoughtProduct },
              { label: "Most Used Table", value: stats.mostUsedTable },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  flex: "1",
                  minWidth: "180px",
                  background: "#1f1f1f",
                  borderRadius: "12px",
                  padding: "16px",
                  textAlign: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                  transition: "transform 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>{stat.label}</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "8px" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* PIE CHARTS SIDE BY SIDE */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            {/* PRODUCT PIE CHART */}
            <div
              style={{
                flex: "1",
                minWidth: "280px",
                height: "300px",
                background: "#1f1f1f",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <h3 style={{ marginBottom: "12px" }}>Products Bought Distribution</h3>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={productData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}`} />
                  <Legend
                    formatter={legendFormatter}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* TABLE PIE CHART */}
            <div
              style={{
                flex: "1",
                minWidth: "280px",
                height: "300px",
                background: "#1f1f1f",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <h3 style={{ marginBottom: "12px" }}>Tables Usage Distribution</h3>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={tableData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {tableData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}`} />
                  <Legend
                    formatter={legendFormatter}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ORDER LIST */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#1f1f1f",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "#242424" }}>
                  <th style={thStyle}>Order #</th>
                  <th style={thStyle}>Table</th>
                  <th style={thStyle}>Items</th>
                  <th style={thStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    style={{ transition: "background 0.2s", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={tdStyle}>{order.id}</td>
                    <td style={tdStyle}>{order.tableId || "-"}</td>
                    <td style={tdStyle}>
                      {order.orderItems.map((item) => (
                        <div key={item.id}>
                          {item.productName || `Product #${item.productId}`} × {item.quantity} - ₱{formatNumber(item.lineTotal)}
                        </div>
                      ))}
                    </td>
                    <td style={tdStyle}>₱{formatNumber(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px",
  fontSize: "0.9rem",
  color: "#9ca3af",
  borderBottom: "1px solid #333",
};

const tdStyle = {
  padding: "12px",
  fontSize: "0.9rem",
  color: "#e0e0e0",
  verticalAlign: "top",
  borderBottom: "1px solid #333",
};
