import { useState } from "react";
import "../App.css";

export default function ProductForm({ product, onSave, onCancel }) {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price || "");
  const [stock, setStock] = useState(product?.stock || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.imagePath || "");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submit = (e) => {
    e.preventDefault();

    onSave({
      ...product,
      name,
      price: Number(price),
      stock: Number(stock),
      imagePath: imagePreview,
      imageFile,
    });
  };

  return (
    <form className="product-form" onSubmit={submit}>
      <h2>{product ? "Edit Product" : "Add Product"}</h2>

      {/* NAME */}
      <div className="form-row">
        <span className="form-label">Name</span>
        <input
          placeholder="Burger"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* PRICE */}
      <div className="form-row">
        <span className="form-label">Price</span>
        <div className="price-input">
          <span className="peso">₱</span>
          <input
            type="number"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>

      {/* STOCK */}
      <div className="form-row">
        <span className="form-label">Stock</span>
        <input
          type="number"
          placeholder="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
      </div>

      {/* IMAGE */}
      <div className="form-row">
        <span className="form-label">Image</span>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          style={{
            width: "120px",
            marginTop: "10px",
            borderRadius: "8px",
          }}
        />
      )}

      <div className="actions">
        <button type="submit">Save</button>
        <button type="button" className="cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
