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

  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* Load products */
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

  /* Load cart */
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
    setHydrated(true);
  }, []);

  /* Sync cart with products */
  useEffect(() => {
    if (products.length === 0) return;
    setCart((prev) => prev.filter((c) => products.some((p) => p.id === c.id)));
  }, [products]);

  /* Save cart */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  /* CART ACTIONS */
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

  /* Confirm order */
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

      {/* PRODUCTS SWIPEABLE */}
      <div className="order-products-mobile">
        <h3>Products</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="product-scroll">
            {products.map((p) => (
              <div key={p.id} className="product-card">
                {p.imagePath && <img src={p.imagePath} alt={p.name} className="product-image" />}
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

      {/* COLLAPSIBLE CART */}
      <div className="order-cart-mobile">
        <h3>Cart ({cart.length})</h3>

        {cart.length > 0 && (
          <div className="table-input">
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

        {cart.length === 0 ? (
          <p>No items yet</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-left">
                  {item.imagePath && <img src={item.imagePath} alt={item.name} className="cart-image" />}
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
                  <button onClick={() => removeItem(item.id)}>Delete</button>
                </div>
              </div>
            ))}

            <div className="cart-total">
              <strong>Total: ₱{formatNumber(total)}</strong>
            </div>

            <button className="add-button confirm" onClick={confirmOrder}>
              Confirm Order
            </button>
          </>
        )}
      </div>
    </div>
  );
}
