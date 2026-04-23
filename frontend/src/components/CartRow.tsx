import { resolveProductImage } from "../lib/image";

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export function CartRow({
  name,
  price,
  quantity,
  image,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  name: string;
  price: number;
  quantity: number;
  image: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-100 p-4">
      <img
        src={resolveProductImage(image)}
        alt={name}
        className="h-24 w-24 rounded-2xl object-cover"
      />
      <div className="flex-1">
        <p className="font-semibold">{name}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-slate-200 bg-white">
            <button onClick={onDecrease} className="px-4 py-2 text-lg text-slate-600" type="button">
              -
            </button>
            <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
            <button onClick={onIncrease} className="px-4 py-2 text-lg text-slate-600" type="button">
              +
            </button>
          </div>
          <p className="text-sm text-slate-500">Số lượng</p>
        </div>
        <p className="mt-2 font-bold text-moss">{currency(price * quantity)}</p>
      </div>
      <button onClick={onRemove} className="button-secondary px-4 py-2" type="button">
        Xóa
      </button>
    </div>
  );
}
