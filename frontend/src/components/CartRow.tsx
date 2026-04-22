const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export function CartRow({
  name,
  price,
  quantity,
  image,
  onRemove,
}: {
  name: string;
  price: number;
  quantity: number;
  image: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-100 p-4">
      <img
        src={image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"}
        alt={name}
        className="h-24 w-24 rounded-2xl object-cover"
      />
      <div className="flex-1">
        <p className="font-semibold">{name}</p>
        <p className="mt-1 text-sm text-slate-500">Qty {quantity}</p>
        <p className="mt-2 font-bold text-moss">{currency(price * quantity)}</p>
      </div>
      <button onClick={onRemove} className="button-secondary px-4 py-2">
        Remove
      </button>
    </div>
  );
}
