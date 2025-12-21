import { useEffect, useState } from "react";
import productService from "../services/productService";
import orderService from "../services/orderService";
import "../App.css";

export default function OrderPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [tableNo, setTableNo] = useState("");
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  /* =========================
     FORMAT NUMBERS WITH COMMAS
  ========================== */
  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* =========================
     LOAD PRODUCTS
  ========================== */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productService.getAll();
        const activeProducts = res.data.filter((p) => p.isActive === true);
        setProducts(activeProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /* =========================
     LOAD CART
  ========================== */
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
    setHydrated(true);
  }, []);

  /* =========================
     SYNC CART WITH PRODUCTS
  ========================== */
  useEffect(() => {
    if (products.length === 0) return;
    setCart((prevCart) =>
      prevCart.filter((c) => products.some((p) => p.id === c.id))
    );
  }, [products]);

  /* =========================
     SAVE CART
  ========================== */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  /* =========================
     CART ACTIONS
  ========================== */
  const addToCart = (product) => {
    const existing = cart.find((c) => c.id === product.id);

    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        alert(`Cannot add more than ${product.stock} items of ${product.name}`);
        return;
      }
      setCart(
        cart.map((c) =>
          c.id === product.id ? { ...c, quantity: Number(c.quantity) + 1 } : c
        )
      );
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
      setCart(
        cart.map((c) =>
          c.id === id ? { ...c, quantity: "" } : c
        )
      );
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
      setCart(
        cart.map((c) =>
          c.id === id ? { ...c, quantity } : c
        )
      );
    }
  };

  const removeItem = (id) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * (Number(item.quantity) || 0),
    0
  );

  /* =========================
     CONFIRM ORDER
  ========================== */
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
      const createOrderDTO = {
        tableId: Number(tableNo),
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      await orderService.create(createOrderDTO);

      alert("Order placed successfully!");
      localStorage.removeItem("cart");
      setCart([]);
      setTableNo("");
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

      <div className="order-layout">
        {/* PRODUCTS */}
        <div className="order-products">
          <h3>Products</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <div key={p.id} className="product-card">
                  <div className="image-frame">
                    {p.imagePath && <img src={p.imagePath} alt={p.name} className="product-image" />}
                  </div>
                  <h3>{p.name}</h3>
                  <p>₱{formatNumber(p.price)}</p>
                  <p>Stock: {p.stock}</p>
                  <button className="add-button" onClick={() => addToCart(p)}>
                    Add to Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CART */}
        <div className="order-cart">
          <h3>Order</h3>
          {cart.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Table No.:{" "}
                <input
                  type="number"
                  min="1"
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  style={{
                    width: "60px",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #555",
                    background: "#1a1a1a",
                    color: "#fff",
                    textAlign: "center",
                  }}
                />
              </label>
            </div>
          )}

          {cart.length === 0 ? (
            <p>No items yet</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-left">
                    <div className="cart-image">
                      {item.imagePath && <img src={item.imagePath} alt={item.name} />}
                    </div>
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
                      onBlur={() => {
                        if (item.quantity === "") updateQuantity(item.id, 1);
                      }}
                      style={{ width: "60px", marginRight: "8px" }}
                    />

                    <button
                      className="delete"
                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <div className="cart-total">
                <strong>Total: ₱{formatNumber(total)}</strong>
              </div>

              <button className="add-button" onClick={confirmOrder}>
                Confirm Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
