import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import productService from "../services/productService";
import "../App.css";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatNumber = (num) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();

      const formattedProducts = res.data.map((p) => ({
        ...p,
        formattedPrice: formatNumber(p.price),
      }));

      setProducts(formattedProducts);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSave = async (product) => {
    try {
      if (product.id) {
        await productService.update(product.id, product);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...product, formattedPrice: formatNumber(product.price) }
              : p
          )
        );
      } else {
        const res = await productService.create(product);
        setProducts((prev) => [
          ...prev,
          { ...res.data, formattedPrice: formatNumber(res.data.price) },
        ]);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setShowForm(false);
    }
  };

  return (
    <>
      <div className="main-content">
        <div className="main-header">
          <h1>Products</h1>
          <button className="add-button" onClick={handleAdd}>
            + Add Product
          </button>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProductForm
              product={editingProduct}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
