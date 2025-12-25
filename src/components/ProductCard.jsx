import "../App.css";

export default function ProductCard({ product, onEdit, onDelete }) {
  const formatNumber = (num) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="product-card" style={{ position: "relative" }}>
      {!product.isActive && (
        <div className="badge-out">Out of Stock</div>
      )}

      <div className="image-frame">
        {product.imagePath && (
          <img
            src={product.imagePath}
            alt={product.name}
            className="product-image"
          />
        )}
      </div>

      <h3>{product.name}</h3>
      <p>₱{formatNumber(product.price)}</p>
      <p>Stock: {product.stock}</p>

      <div className="card-actions">
        <button className="edit" onClick={() => onEdit(product)}>Edit</button>
        <button className="delete" onClick={() => onDelete(product.id)}>Delete</button>
      </div>
    </div>
  );
}
