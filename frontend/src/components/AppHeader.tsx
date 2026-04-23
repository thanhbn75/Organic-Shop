import type { FormEvent } from "react";
import { Leaf, LogOut, Search, ShoppingBag, UserRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

type AppHeaderProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  token: string;
  isAdmin: boolean;
  onLogout: () => void;
  cartCount: number;
};

export function AppHeader({
  keyword,
  onKeywordChange,
  onSearch,
  token,
  isAdmin,
  onLogout,
  cartCount,
}: AppHeaderProps) {
  return (
    <header className="shell pt-6">
      <div className="panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-leaf/10 p-3 text-leaf">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <p className="font-heading text-xl font-bold text-moss">Organic Shop</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tươi. Sạch. Minh bạch.</p>
          </div>
        </Link>

        <form onSubmit={onSearch} className="flex flex-1 items-center gap-3 rounded-full bg-mist px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Tìm rau củ, trái cây, thực phẩm hữu cơ..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>

        <nav className="flex items-center gap-2 text-sm font-medium">
          {[
            ["/products", "Sản phẩm"],
            ["/journal", "Bài viết"],
            ["/cart", "Giỏ hàng"],
            ["/profile", "Cá nhân"],
            ...(isAdmin ? [["/admin", "Quản trị"]] : []),
          ].map(([href, label]) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${isActive ? "bg-leaf text-white" : "text-slate-600 hover:text-moss"}`
              }
            >
              {label}
            </NavLink>
          ))}
          {token ? (
            <button onClick={onLogout} className="button-secondary gap-2">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          ) : (
            <Link to="/authenticate" className="button-primary gap-2">
              <UserRound className="h-4 w-4" />
              Đăng nhập
            </Link>
          )}
          <Link to="/cart" className="relative rounded-full bg-moss px-4 py-3 text-white">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 rounded-full bg-sage px-1.5 text-[10px] font-bold text-moss">
              {cartCount}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
