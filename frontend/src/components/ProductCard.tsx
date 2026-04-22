import { Link } from "react-router-dom";
import type { Product } from "../lib/api";

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export function ProductCard({
  product,
  onAdd,
  authAware,
}: {
  product: Product;
  onAdd: () => void;
  authAware: boolean;
}) {
  return (
    <article className="panel overflow-hidden transition hover:-translate-y-1">
      <img
        src={product.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"}
        alt={product.name}
        className="h-56 w-full object-cover"
      />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-sage/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-moss">
            100% organic
          </span>
          <span className="text-xs text-slate-400">{product.categoryName}</span>
        </div>
        <Link to={`/products/${product.id}`} className="font-heading text-xl font-bold text-slate-900">
          {product.name}
        </Link>
        <p className="mt-2 text-sm text-slate-600">{product.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-moss">{currency(product.price)}</p>
            <p className="text-xs text-slate-400">{product.stock} in stock</p>
          </div>
          <button onClick={onAdd} className="button-primary px-4 py-2 text-xs">
            {authAware ? "Add to cart" : "Save item"}
          </button>
        </div>
      </div>
    </article>
  );
}
