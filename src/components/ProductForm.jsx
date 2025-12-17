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
      setImagePreview(URL.createObjectURL(file)); // preview
    }
  };

  const submit = (e) => {
    e.preventDefault();

    onSave({
      ...product,
      name,
      price: Number(price),
      stock: Number(stock),
      imagePath: imagePreview, // keep preview for now
      imageFile, // you can send this to backend later
    });
  };

  return (
    <form className="product-form" onSubmit={submit}>
      <h2>{product ? "Edit Product" : "Add Product"}</h2>

      <input
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        required
      />

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          style={{ width: "120px", marginTop: "10px", borderRadius: "8px" }}
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
