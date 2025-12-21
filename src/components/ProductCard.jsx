export default function ProductCard({ product, onEdit, onDelete }) {
  // Format price inside the card (in case it's not pre-formatted)
  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="product-card">
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
      <p>₱{formatNumber(product.price)}</p> {/* formatted price */}
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
