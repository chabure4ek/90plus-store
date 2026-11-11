function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <img
        src={product.image}
        alt={product.name}
      />

      <h3>{product.name}</h3>

      <p>{product.price} ₸</p>

      <button onClick={() => onAdd(product)}>
  В корзину
</button>
    </article>
  );
}

export default ProductCard;