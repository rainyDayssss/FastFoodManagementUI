import "../App.css";

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="product-card">
      {product.imagePath && (
        <img
          src={product.imagePath}
          alt={product.name}
          className="product-image"
        />
      )}

      <h3>{product.name}</h3>
      <p>₱{product.price}</p>
      <p>Stock: {product.stock}</p>

      <div className="card-actions">
        <button className="edit" onClick={() => onEdit(product)}>
          Edit
        </button>
        <button className="delete" onClick={() => onDelete(product.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
