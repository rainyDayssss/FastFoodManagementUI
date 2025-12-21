import { useEffect, useState } from "react";
import productService from "../services/productService";
import orderService from "../services/orderService";
import "../App.css";

export default function OrderPageMobile() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [tableNo, setTableNo] = useState("");
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productService.getAll();
        setProducts(res.data.filter((p) => p.isActive));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    setCart((prev) => prev.filter((c) => products.some((p) => p.id === c.id)));
  }, [products]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = (product) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        alert(`Cannot add more than ${product.stock} items of ${product.name}`);
        return;
      }
      setCart(cart.map((c) => (c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      if (product.stock <= 0) {
        alert(`Product ${product.name} is out of stock!`);
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, value) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (value === "") {
      setCart(cart.map((c) => (c.id === id ? { ...c, quantity: "" } : c)));
      return;
    }
    const quantity = Number(value);
    if (quantity > product.stock) {
      alert(`Cannot order more than ${product.stock} items of ${product.name}`);
      return;
    }
    if (quantity <= 0) {
      setCart(cart.filter((c) => c.id !== id));
    } else {
      setCart(cart.map((c) => (c.id === id ? { ...c, quantity } : c)));
    }
  };

  const removeItem = (id) => setCart(cart.filter((c) => c.id !== id));
  const total = cart.reduce((sum, item) => sum + item.price * (Number(item.quantity) || 0), 0);

  const confirmOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    if (!tableNo || isNaN(Number(tableNo)) || Number(tableNo) <= 0) {
      alert("Please enter a valid Table No.");
      return;
    }
    try {
      await orderService.create({
        tableId: Number(tableNo),
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });
      alert("Order placed successfully!");
      localStorage.removeItem("cart");
      setCart([]);
      setTableNo("");
      setShowCart(false);
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="main-content">
      <div className="main-header">
        <h1>Order</h1>
      </div>

      {/* PRODUCTS LIST VERTICAL SCROLL */}
      <div
        className="order-products-mobile"
        style={{
          maxHeight: "calc(100vh - 180px)",
          overflowY: "auto",
          paddingRight: "8px",
        }}
      >
        <h3>Products</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {products.map((p) => (
              <div key={p.id} className="product-card">
                <div className="image-frame">
                  {p.imagePath && <img src={p.imagePath} alt={p.name} className="product-image" />}
                </div>
                <h3>{p.name}</h3>
                <p>₱{formatNumber(p.price)}</p>
                <p>Stock: {p.stock}</p>
                <button className="add-button" onClick={() => addToCart(p)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD TO ORDER BUTTON */}
      {cart.length > 0 && !showCart && (
        <button
          className="add-button confirm"
          style={{
            position: "fixed",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            width: "90%",
          }}
          onClick={() => setShowCart(true)}
        >
          View Order ({cart.length})
        </button>
      )}

      {/* CART PANEL */}
      {showCart && (
        <div
          className="order-cart-mobile"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: "70%",
            overflowY: "auto",
            padding: "16px",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            background: "#1f1f1f",
            zIndex: 1000,
          }}
        >
          {/* Close button on top-right */}
          <button
            onClick={() => setShowCart(false)}
            style={{
              position: "absolute",
              top: "12px",
              right: "16px",
              padding: "6px 10px",
              borderRadius: "50%",
              border: "none",
              background: "#555",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
            title="Close"
          >
            ×
          </button>

          <h3 style={{ marginTop: "0" }}>Order ({cart.length})</h3>

          {cart.length > 0 && (
            <div className="table-input" style={{ marginTop: "32px" }}>
              <label>
                Table No.:
                <input
                  type="number"
                  min="1"
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                />
              </label>
            </div>
          )}

          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-left">
                {item.imagePath && (
                  <div className="cart-image">
                    <img src={item.imagePath} alt={item.name} />
                  </div>
                )}
                <div>
                  <strong>{item.name}</strong>
                  <p>₱{formatNumber(item.price)}</p>
                </div>
              </div>
              <div className="cart-item-actions">
                <input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, e.target.value)}
                  onBlur={() => item.quantity === "" && updateQuantity(item.id, 1)}
                />
                <button className="delete" onClick={() => removeItem(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <strong>Total: ₱{formatNumber(total)}</strong>
          </div>

          <button className="add-button confirm" onClick={confirmOrder}>
            Confirm Order
          </button>
        </div>
      )}
    </div>
  );
}
