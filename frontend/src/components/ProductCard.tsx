import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../lib/api";
import { resolveProductImage } from "../lib/image";

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export function ProductCard({
  product,
  onAdd,
  authAware,
}: {
  product: Product;
  onAdd: (quantity: number) => void;
  authAware: boolean;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <article className="panel overflow-hidden transition hover:-translate-y-1">
      <img
        src={resolveProductImage(product.imageUrl)}
        alt={product.name}
        className="h-56 w-full object-cover"
      />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-sage/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-moss">
            huu co chon loc
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
            <p className="text-xs text-slate-400">Tồn kho: {product.stock}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="px-4 py-2 text-lg text-slate-600"
            >
              -
            </button>
            <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.min(Math.max(product.stock, 1), current + 1))}
              className="px-4 py-2 text-lg text-slate-600"
            >
              +
            </button>
          </div>
          <button onClick={() => onAdd(quantity)} className="button-primary px-4 py-2 text-xs" type="button">
            {authAware ? "Thêm vào giỏ hàng" : "Lưu sản phẩm"}
          </button>
        </div>
      </div>
    </article>
  );
}
