import { useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CircleDollarSign,
  Flower2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ApiStateCard } from "./components/ApiStateCard";
import { AppHeader } from "./components/AppHeader";
import { CartRow } from "./components/CartRow";
import { EmptyState } from "./components/EmptyState";
import { ProductCard } from "./components/ProductCard";
import {
  type AdminDashboard,
  type AuthResponse,
  type CartItem,
  type Category,
  type InventoryMovement,
  type Order,
  type Post,
  type Product,
  type Review,
  type UserProfile,
  apiClient,
  setAuthToken,
} from "./lib/api";
import { resolveProductImage } from "./lib/image";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "pill" | "rectangular" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: number;
            },
          ) => void;
        };
        oauth2?: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode: "redirect";
            redirect_uri: string;
            callback?: (response: { code: string }) => void;
          }) => { requestCode: () => void };
        };
      };
    };
  }
}

type GuestCartItem = {
  productId: number;
  quantity: number;
  product: Product;
};

const TOKEN_KEY = "organic-shop-token";
const USER_KEY = "organic-shop-user";
const USER_ROLE_KEY = "organic-shop-role";
const GUEST_CART_KEY = "organic-shop-guest-cart";
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  "637635931751-avampr56o1h1dq1oq3bp7iolonuu7qtg.apps.googleusercontent.com";

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Yeu cau that bai. Vui long thu lai.";
};

function App() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [userName, setUserName] = useState(() => localStorage.getItem(USER_KEY) ?? "");
  const [userRole, setUserRole] = useState(() => localStorage.getItem(USER_ROLE_KEY) ?? "");
  const [keyword, setKeyword] = useState("");
  const [notice, setNotice] = useState("");
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>(() => {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    setAuthToken(token || null);
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
  }, [guestCart]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: apiClient.getCategories,
  });

  const cartQuery = useQuery({
    queryKey: ["cart", token],
    queryFn: apiClient.getCart,
    enabled: Boolean(token),
  });

  const addCartMutation = useMutation({
    mutationFn: apiClient.addCartItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart", token] });
      setNotice(" Đã thêm sản phẩm vào giỏ hàng.");
    },
    onError: () => setNotice("Không thể cập nhật giỏ hàng lúc này."),
  });

  const searchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
  };

  const logout = () => {
    setToken("");
    setUserName("");
    setUserRole("");
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    queryClient.clear();
    navigate("/");
  };

  const setAuthenticatedUser = (response: AuthResponse) => {
    setToken(response.token);
    setUserName(response.fullName);
    setUserRole(response.role);
    localStorage.setItem(USER_KEY, response.fullName);
    localStorage.setItem(USER_ROLE_KEY, response.role);
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (token) {
      addCartMutation.mutate({ productId: product.id, quantity });
      return;
    }

    setGuestCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...current, { productId: product.id, quantity, product }];
    });
    setNotice("Đã lưu sản phẩm vào giỏ hàng tạm.");
  };

  const isAdmin = userRole === "ROLE_ADMIN";
  const cartCount = token
    ? cartQuery.data?.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) ?? 0
    : guestCart.reduce((sum: number, item: GuestCartItem) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-hero pb-12">
      <AppHeader
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSearch={searchSubmit}
        token={token}
        isAdmin={isAdmin}
        onLogout={logout}
        cartCount={cartCount}
      />

      <main className="shell mt-8">
        {notice ? (
          <div className="mb-6 rounded-3xl border border-sage bg-white/85 px-5 py-4 text-sm font-medium text-moss">
            {notice}
          </div>
        ) : null}

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                categories={categoriesQuery.data ?? []}
                categoriesLoading={categoriesQuery.isLoading}
                categoriesError={categoriesQuery.isError}
                onAddToCart={addToCart}
                isAuthenticated={Boolean(token)}
              />
            }
          />
          <Route
            path="/products"
            element={<ProductsPage onAddToCart={addToCart} isAuthenticated={Boolean(token)} />}
          />
          <Route
            path="/products/:id"
            element={<ProductDetailPage onAddToCart={addToCart} isAuthenticated={Boolean(token)} />}
          />
          <Route path="/journal" element={<JournalPage />} />
          <Route
            path="/cart"
            element={
              <CartPage
                token={token}
                guestCart={guestCart}
                setGuestCart={setGuestCart}
                cartItems={cartQuery.data?.items ?? []}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                token={token}
                guestCart={guestCart}
                cartItems={cartQuery.data?.items ?? []}
                onRequireLogin={() => navigate("/authenticate")}
              />
            }
          />
          <Route
            path="/profile"
            element={<ProfilePage token={token} userName={userName} onNotice={setNotice} />}
          />
          <Route path="/profile/orders/:id" element={<OrderDetailPage token={token} />} />
          <Route
            path="/admin"
            element={<AdminPage token={token} isAdmin={isAdmin} onNotice={setNotice} />}
          />
          <Route
            path="/authenticate"
            element={
              <AuthenticatePage
                onAuth={(response) => {
                  setAuthenticatedUser(response);
                  navigate(response.role === "ROLE_ADMIN" ? "/admin" : "/profile");
                }}
              />
            }
          />
          <Route path="/payment-result" element={<PaymentResultPage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage({
  categories,
  categoriesLoading,
  categoriesError,
  onAddToCart,
  isAuthenticated,
}: {
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: boolean;
  onAddToCart: (product: Product, quantity?: number) => void;
  isAuthenticated: boolean;
}) {
  const productsQuery = useQuery({
    queryKey: ["home-products"],
    queryFn: () => apiClient.getProducts({ size: 8 }),
  });
  const postsQuery = useQuery({
    queryKey: ["posts"],
    queryFn: apiClient.getPosts,
  });

  if (productsQuery.isLoading) {
    return <ApiStateCard title="Đang tải sản phẩm" description="Vui lòng đợi trong giây lát." />;
  }

  if (productsQuery.isError) {
    return <ApiStateCard title="Không tải được sản phẩm" description="Vui lòng kiểm tra kết nối API." />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="panel overflow-hidden px-8 py-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sage/40 px-4 py-2 text-sm font-medium text-moss">
            <Sparkles className="h-4 w-4" />
            Nông sản sạch, nguồn gốc rõ ràng, mua hàng gọn gàng
          </div>
          <h1 className="max-w-2xl font-heading text-4xl font-extrabold leading-tight text-slate-900 md:text-6xl">
            Cửa hàng hữu cơ chuyên nghiệp từ trang chủ đến lúc giao hàng.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Khám phá sản phẩm hữu cơ, bài viết chia sẻ, quy trình đặt hàng gọn gàng, và khu vuc quan tri phuc vu van hanh thuc te.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products" className="button-primary gap-2">
              Mua ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/journal" className="button-secondary">
              Xem bài viết
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {([
              ["Chất lượng đã kiểm định", BadgeCheck],
              ["Nguồn gốc minh bạch", MapPin],
              ["Giao hàng ổn định", Truck],
            ] as const).map(([label, Icon]) => (
              <div key={label} className="rounded-3xl bg-mist p-4">
                <Icon className="mb-3 h-5 w-5 text-leaf" />
                <p className="font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel flex flex-col justify-between bg-moss px-8 py-8 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sage">Danh mục nổi bật</p>
            <h2 className="mt-3 font-heading text-3xl font-bold">Lựa chọn theo mùa</h2>
            <p className="mt-4 text-sm leading-6 text-white/80">
              Trang chủ đã được mở rộng với nội dung bài viết, quản lý kho, người dùng và đơn hàng cho khu vực admin.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            {categoriesLoading ? <p className="text-sm text-white/70">Đang tải danh muc...</p> : null}
            {categoriesError ? <p className="text-sm text-rose-200">Không tải được danh mục.</p> : null}
            {!categoriesLoading && !categoriesError
              ? categories.slice(0, 4).map((category) => (
                  <div key={category.id} className="rounded-3xl border border-white/10 bg-white/10 p-4">
                    <p className="font-semibold">{category.name}</p>
                    <p className="mt-1 text-sm text-white/70">{category.description}</p>
                  </div>
                ))
              : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Danh mục đầy đủ",
            description: "Sản phẩm, danh mục và bài viết giúp giao diện phong phú hơn một trang bán hàng đơn thuần.",
            icon: Flower2,
          },
          {
            title: "Hành trình khách hàng",
            description: "Người dùng có thể đăng nhập, cập nhật hồ sơ, đặt hàng và theo dõi lịch sử mua sắm trong một lượng xử lý rõ ràng.",
            icon: ShieldCheck,
          },
          {
            title: "Vận hành admin",
            description: "Admin có thể theo dõi tồn kho, quản lý user, cập nhật đơn hàng và xử lý nhập xuất kho.",
            icon: Boxes,
          },
        ].map((item) => (
          <div key={item.title} className="panel px-6 py-6">
            <item.icon className="h-8 w-8 text-leaf" />
            <h3 className="mt-4 font-heading text-2xl font-bold">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-leaf">Nổi bật</p>
            <h2 className="font-heading text-3xl font-bold">Sản phẩm bán chạy</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-moss">
            Xem tat ca
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {productsQuery.data?.content.length ? (
            productsQuery.data.content.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={(quantity) => onAddToCart(product, quantity)}
                authAware={isAuthenticated}
              />
            ))
          ) : (
            <EmptyState title="Chưa có sản phẩm" description="Danh mục hiện đang trống." />
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {postsQuery.data?.content.slice(0, 3).map((post: Post) => (
          <article key={post.id} className="panel overflow-hidden">
            <img
              src={resolveProductImage(post.thumbnail)}
              alt={post.title}
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{post.authorName}</p>
              <h3 className="mt-3 font-heading text-xl font-bold">{post.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{post.content}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function ProductsPage({
  onAddToCart,
  isAuthenticated,
}: {
  onAddToCart: (product: Product, quantity?: number) => void;
  isAuthenticated: boolean;
}) {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") ?? "";
  const productsQuery = useQuery({
    queryKey: ["products", keyword],
    queryFn: () => apiClient.getProducts({ keyword, size: 12 }),
  });

  if (productsQuery.isLoading) {
    return <ApiStateCard title="Dang tai danh sach san pham" description="Vui long doi trong giay lat." />;
  }

  if (productsQuery.isError) {
    return <ApiStateCard title="Khong tai duoc danh sach san pham" description="Vui long thu lai sau." />;
  }

  return (
    <div className="space-y-6">
      <div className="panel px-6 py-6">
        <p className="text-sm uppercase tracking-[0.25em] text-leaf">Danh mục</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">Nông sản sạch và thực phẩm thiết yếu</h1>
        <p className="mt-2 text-slate-600">
          {keyword ? `Kết quả cho "${keyword}"` : "Xem các sản phẩm hữu cơ mới nhất và được quan tâm nhiều."}
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {productsQuery.data?.content.length ? (
          productsQuery.data.content.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={(quantity) => onAddToCart(product, quantity)}
              authAware={isAuthenticated}
            />
          ))
        ) : (
          <EmptyState title="Khong co ket qua phu hop" description="Hay thu tu khoa khac." />
        )}
      </div>
    </div>
  );
}

function ProductDetailPage({
  onAddToCart,
  isAuthenticated,
}: {
  onAddToCart: (product: Product, quantity?: number) => void;
  isAuthenticated: boolean;
}) {
  const { id = "" } = useParams();
  const [quantity, setQuantity] = useState(1);
  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiClient.getProduct(id),
  });
  const reviewsQuery = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => apiClient.getReviews(id),
  });

  if (productQuery.isLoading) {
    return <ApiStateCard title="Dang tai chi tiet san pham" description="Vui long doi trong giay lat." />;
  }

  if (productQuery.isError || !productQuery.data) {
    return <ApiStateCard title="Khong tim thay san pham" description="Vui long quay lai danh muc." />;
  }

  const product = productQuery.data;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel overflow-hidden">
        <img
          src={resolveProductImage(product.imageUrl)}
          alt={product.name}
          className="h-[420px] w-full object-cover"
        />
      </div>
      <div className="space-y-6">
        <div className="panel px-7 py-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-sage/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-moss">
            <Flower2 className="h-4 w-4" />
            {product.categoryName}
          </div>
          <h1 className="mt-4 font-heading text-4xl font-bold">{product.name}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>
          <div className="mt-6 flex items-center gap-6">
            <p className="text-3xl font-bold text-moss">{currency(product.price)}</p>
            <p className="text-sm text-slate-500">Tồn kho: {product.stock}</p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="px-4 py-3 text-lg text-slate-600"
              >
                -
              </button>
              <span className="min-w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(Math.max(product.stock, 1), current + 1))}
                className="px-4 py-3 text-lg text-slate-600"
              >
                +
              </button>
            </div>
            <button className="button-primary" onClick={() => onAddToCart(product, quantity)}>
              {isAuthenticated ? "Thêm vào giỏ" : "Lưu vào giỏ tạm"}
            </button>
            <Link className="button-secondary" to="/checkout">
              Mua ngay
            </Link>
          </div>
        </div>

        <div className="panel px-7 py-7">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-leaf" />
            <p className="font-semibold">Cam kết mua sắm</p>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              "Nguồn hàng được chọn lọc kỹ",
              "Hiển thị tồn kho để dễ theo dõi",
              "Hỗ trợ thanh toán COD và VNPay",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-mist px-4 py-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="panel px-7 py-7">
          <h2 className="font-heading text-2xl font-bold">Đánh giá khách hàng</h2>
          <div className="mt-5 space-y-4">
            {reviewsQuery.isLoading ? <p className="text-sm text-slate-500">Đang tải danh giá...</p> : null}
            {reviewsQuery.isError ? <p className="text-sm text-rose-500">Không tải được danh giá lúc này.</p> : null}
            {reviewsQuery.data?.content.length ? (
              reviewsQuery.data.content.map((review: Review) => (
                <div key={review.id} className="rounded-3xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{review.userName}</p>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: review.ratingStar }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Chưa có đánh giá.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JournalPage() {
  const postsQuery = useQuery({
    queryKey: ["journal-posts"],
    queryFn: apiClient.getPosts,
  });

  if (postsQuery.isLoading) {
    return <ApiStateCard title="Đang tải bài viết" description="Vui lòng đợi trong giây lát." />;
  }

  if (postsQuery.isError) {
    return <ApiStateCard title="Không tải được bài viết" description="Vui lòng thử lại sau." />;
  }

  return (
    <div className="space-y-6">
      <div className="panel px-6 py-6">
        <p className="text-sm uppercase tracking-[0.25em] text-leaf">Bài viết</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">Chia sẻ, mẹo sống khỏe và thông tin sản phẩm</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {postsQuery.data?.content.length ? (
          postsQuery.data.content.map((post: Post) => (
            <article key={post.id} className="panel overflow-hidden">
              <img
                src={resolveProductImage(post.thumbnail)}
                alt={post.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{post.authorName}</p>
                <h2 className="mt-3 font-heading text-xl font-bold">{post.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{post.content}</p>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="Chưa có bài viết" description="Admin có thể đăng bài từ khu vực quản trị." />
        )}
      </div>
    </div>
  );
}

function CartPage({
  token,
  guestCart,
  setGuestCart,
  cartItems,
}: {
  token: string;
  guestCart: GuestCartItem[];
  setGuestCart: Dispatch<SetStateAction<GuestCartItem[]>>;
  cartItems: CartItem[];
}) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      apiClient.updateCartItem(itemId, quantity),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart", token] });
    },
  });
  const removeMutation = useMutation({
    mutationFn: (itemId: number) => apiClient.removeCartItem(itemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart", token] });
    },
  });

  const guestTotal = guestCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel px-6 py-6">
        <h1 className="font-heading text-3xl font-bold">Giỏ hàng</h1>
        <p className="mt-2 text-slate-600">
          {token ? "Giỏ hàng đã sẵn sàng để thanh toán." : "Hãy đăng nhập trước khi đặt hàng."}
        </p>
        <div className="mt-6 space-y-4">
          {token ? (
            cartItems.length ? (
              cartItems.map((item) => (
                <CartRow
                  key={item.id}
                  name={item.productName}
                  price={item.productPrice}
                  quantity={item.quantity}
                  image={item.productImageUrl}
                  onDecrease={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                  onIncrease={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                  onRemove={() => removeMutation.mutate(item.id)}
                />
              ))
            ) : (
              <EmptyState title="Giỏ hàng trống" description="Hãy thêm sản phẩm để bắt đầu đặt hàng." />
            )
          ) : guestCart.length ? (
            guestCart.map((item) => (
              <CartRow
                key={item.productId}
                name={item.product.name}
                price={item.product.price}
                quantity={item.quantity}
                image={item.product.imageUrl}
                onDecrease={() =>
                  setGuestCart((current) =>
                    current
                      .map((cartItem) =>
                        cartItem.productId === item.productId
                          ? { ...cartItem, quantity: cartItem.quantity - 1 }
                          : cartItem,
                      )
                      .filter((cartItem) => cartItem.quantity > 0),
                  )
                }
                onIncrease={() =>
                  setGuestCart((current) =>
                    current.map((cartItem) =>
                      cartItem.productId === item.productId
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem,
                    ),
                  )
                }
                onRemove={() =>
                  setGuestCart((current) =>
                    current.filter((cartItem) => cartItem.productId !== item.productId),
                  )
                }
              />
            ))
          ) : (
            <EmptyState title="Giỏ hàng trống" description="Hãy thêm sản phẩm để bắt đầu đặt hàng." />
          )}
        </div>
      </div>

      <div className="panel h-fit px-6 py-6">
        <h2 className="font-heading text-2xl font-bold">Tổng quan</h2>
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <span>Tổng tiền</span>
          <span className="text-2xl font-bold text-moss">
            {currency(
              token
                ? cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0)
                : guestTotal,
            )}
          </span>
        </div>
        <Link to="/checkout" className="button-primary mt-6 w-full">
          Tiếp tục thanh toán
        </Link>
      </div>
    </div>
  );
}

function CheckoutPage({
  token,
  guestCart,
  cartItems,
  onRequireLogin,
}: {
  token: string;
  guestCart: GuestCartItem[];
  cartItems: CartItem[];
  onRequireLogin: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [shippingAddress, setShippingAddress] = useState("12 Green Avenue, Ho Chi Minh City");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const orderMutation = useMutation({
    mutationFn: apiClient.createOrder,
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ["cart", token] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (paymentMethod === "VNPAY") {
        const payment = await apiClient.createVnpayPayment({ orderId: order.id, language: "vn" });
        window.location.href = payment.paymentUrl;
        return;
      }
      navigate(`/payment-result?status=cod&orderId=${order.id}`);
    },
  });

  const total = token
    ? cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0)
    : guestCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const submit = () => {
    if (!token) {
      onRequireLogin();
      return;
    }
    orderMutation.mutate({ shippingAddress, paymentMethod });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="panel px-6 py-6">
        <h1 className="font-heading text-3xl font-bold">Thanh toán</h1>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Địa chỉ giao hàng</span>
            <textarea
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              className="min-h-32 w-full rounded-3xl border border-slate-200 bg-mist px-4 py-3 outline-none"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Phương thức thanh toán</p>
            <div className="grid gap-3 md:grid-cols-2">
              {["COD", "VNPAY"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-3xl border px-4 py-4 text-left ${
                    paymentMethod === method ? "border-leaf bg-sage/30" : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-semibold">{method}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {method === "COD" ? "Thanh toán khi nhận hàng." : "Chuyển đến cổng thanh toán VNPay."}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel h-fit px-6 py-6">
        <h2 className="font-heading text-2xl font-bold">Tóm tắt đơn hàng</h2>
        <p className="mt-3 text-sm text-slate-500">
          Kiểm tra địa chỉ giao hàng và phương thức thanh toán trước khi đặt đơn.
        </p>
        <div className="mt-6 flex items-center justify-between">
          <span>Tổng tiền</span>
          <span className="text-2xl font-bold text-moss">{currency(total)}</span>
        </div>
        <button onClick={submit} className="button-primary mt-6 w-full">
          Đặt hàng
        </button>
      </div>
    </div>
  );
}

function ProfilePage({
  token,
  userName,
  onNotice,
}: {
  token: string;
  userName: string;
  onNotice: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: apiClient.getProfile,
    enabled: Boolean(token),
  });
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: apiClient.getOrders,
    enabled: Boolean(token),
  });
  const [form, setForm] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    if (profileQuery.data) {
      setForm({
        fullName: profileQuery.data.fullName ?? "",
        phone: profileQuery.data.phone ?? "",
      });
    }
  }, [profileQuery.data]);

  const updateProfileMutation = useMutation({
    mutationFn: apiClient.updateProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      onNotice("Da cap nhat thong tin ca nhan.");
    },
  });

  if (!token) {
    return <div className="panel px-6 py-10">Vui lòng đăng nhập để xem tài khoản.</div>;
  }

  if (profileQuery.isLoading || ordersQuery.isLoading) {
    return <ApiStateCard title="Dang tai tai khoan" description="Vui lòng đợi trong giây lát." />;
  }

  if (profileQuery.isError || ordersQuery.isError) {
    return <ApiStateCard title="Không tải được tài khảon" description="Vui lòng đăng nhập lại." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="panel px-6 py-6">
          <p className="text-sm uppercase tracking-[0.25em] text-leaf">Tài khoản</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">{profileQuery.data?.fullName ?? userName}</h1>
          <p className="mt-2 text-slate-600">{profileQuery.data?.email}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-slate-400">Vai trò</p>
          <p className="mt-2 font-semibold text-moss">{profileQuery.data?.role}</p>
        </div>

        <div className="panel px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Thông tin cá nhân</h2>
          <div className="mt-5 grid gap-4">
            <input
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              className="rounded-3xl bg-mist px-4 py-3 outline-none"
              placeholder="Ho va ten"
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}

              className="rounded-3xl bg-mist px-4 py-3 outline-none"
              placeholder="So dien thoai"
            />
            <button
              onClick={() => updateProfileMutation.mutate(form)}
              className="button-primary w-fit"
            >
              Lưu thông tin
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {ordersQuery.data?.content.length ? (
          ordersQuery.data.content.map((order: Order) => (
            <div key={order.id} className="panel px-6 py-6">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Đơn hàng #{order.id}</p>
                <span className="rounded-full bg-sage/40 px-3 py-1 text-xs font-semibold text-moss">
                  {order.orderStatus}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{order.shippingAddress}</p>
              <p className="mt-2 text-sm text-slate-500">Thanh toán: {order.paymentStatus}</p>
              <div className="mt-3 space-y-2">
                {order.items?.slice(0, 2).map((item) => (
                  <div key={item.id} className="rounded-2xl bg-mist px-3 py-2 text-sm text-slate-600">
                    {item.productName} x {item.quantity}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-lg font-bold text-moss">{currency(order.totalPrice)}</p>
              <Link to={`/profile/orders/${order.id}`} className="mt-4 inline-flex text-sm font-semibold text-moss">
                Xem chi tiết đơn hàng
              </Link>
            </div>
          ))
        ) : (
          <EmptyState title="Chưa có đơn hàng" description="Lịch sử mua hàng sẽ hiển thị tại đây." />
        )}
      </div>
    </div>
  );
}

function OrderDetailPage({ token }: { token: string }) {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const [reviewForms, setReviewForms] = useState<Record<number, { ratingStar: number; comment: string }>>({});
  const orderQuery = useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => apiClient.getOrderById(id),
    enabled: Boolean(token && id),
  });
  const reviewMutation = useMutation({
    mutationFn: apiClient.createReview,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["reviews", String(variables.productId)] });
      setReviewForms((current) => ({
        ...current,
        [variables.productId]: { ratingStar: 5, comment: "" },
      }));
    },
  });

  if (!token) {
    return <div className="panel px-6 py-10">Vui lòng đăng nhập để xem chi tiết đơn hàng.</div>;
  }

  if (orderQuery.isLoading) {
    return <ApiStateCard title="Dang tai chi tiet don hang" description="Vui long doi trong giay lat." />;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return <ApiStateCard title="Khong tai duoc don hang" description="Vui long kiem tra lai don hang." />;
  }

  const order = orderQuery.data;

  return (
    <div className="space-y-6">
      <div className="panel px-6 py-6">
        <p className="text-sm uppercase tracking-[0.25em] text-leaf">Chi tiết đơn hàng</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">Đơn hàng #{order.id}</h1>
        <p className="mt-2 text-slate-600">{order.shippingAddress}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Sản phẩm trong đơn</h2>
          <div className="mt-5 space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-100 p-4">
                <div className="flex items-center gap-4">
                <img
                  src={resolveProductImage(item.productImageUrl)}
                  alt={item.productName}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">{item.productName}</p>
                  <p className="mt-1 text-sm text-slate-500">Số lượng: {item.quantity}</p>
                  <p className="mt-2 text-sm text-slate-500">Đơn giá: {currency(item.price)}</p>
                </div>
                  <p className="font-bold text-moss">{currency(item.price * item.quantity)}</p>
                </div>
                {order.orderStatus === "COMPLETED" ? (
                  <div className="mt-4 rounded-3xl bg-mist p-4">
                    <p className="font-semibold">Danh gia san pham da mua</p>
                    <div className="mt-3 flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setReviewForms((current) => ({
                              ...current,
                              [item.productId]: {
                                ratingStar: star,
                                comment: current[item.productId]?.comment ?? "",
                              },
                            }))
                          }
                          className="text-amber-500"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= (reviewForms[item.productId]?.ratingStar ?? 5) ? "fill-current" : ""
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewForms[item.productId]?.comment ?? ""}
                      onChange={(event) =>
                        setReviewForms((current) => ({
                          ...current,
                          [item.productId]: {
                            ratingStar: current[item.productId]?.ratingStar ?? 5,
                            comment: event.target.value,
                          },
                        }))
                      }
                      className="mt-3 min-h-24 w-full rounded-3xl bg-white px-4 py-3 outline-none"
                      placeholder="Nhap danh gia cua ban"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        reviewMutation.mutate({
                          productId: item.productId,
                          ratingStar: reviewForms[item.productId]?.ratingStar ?? 5,
                          comment: reviewForms[item.productId]?.comment ?? "",
                        })
                      }
                      className="button-primary mt-3"
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="panel h-fit px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Thông tin thanh toán</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p>Trạng thái đơn: {order.orderStatus}</p>
            <p>Trạng thái thanh toán: {order.paymentStatus}</p>
            <p>Phương thức: {order.paymentMethod}</p>
            <p> Tổng tiền: <span className="font-bold text-moss">{currency(order.totalPrice)}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPage({
  token,
  isAdmin,
  onNotice,
}: {
  token: string;
  isAdmin: boolean;
  onNotice: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: apiClient.getCategories,
    enabled: Boolean(token && isAdmin),
  });
  const [inventoryForm, setInventoryForm] = useState({
    productId: "",
    quantity: "1",
    type: "IMPORT",
    note: "",
  });
  const [productForm, setProductForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    stock: "1",
  });
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
  });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState("");
  const [postImagePreview, setPostImagePreview] = useState("");

  useEffect(() => {
    if (!productImageFile) {
      setProductImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(productImageFile);
    setProductImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [productImageFile]);

  useEffect(() => {
    if (!postImageFile) {
      setPostImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(postImageFile);
    setPostImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [postImageFile]);

  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: apiClient.getAdminDashboard,
    enabled: Boolean(token && isAdmin),
  });
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiClient.getAllUsers({ size: 8 }),
    enabled: Boolean(token && isAdmin),
  });
  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => apiClient.getAllOrdersAdmin({ size: 20 }),
    enabled: Boolean(token && isAdmin),
  });
  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => apiClient.getProducts({ size: 50 }),
    enabled: Boolean(token && isAdmin),
  });
  const postsQuery = useQuery({
    queryKey: ["admin-posts"],
    queryFn: apiClient.getPosts,
    enabled: Boolean(token && isAdmin),
  });
  const movementsQuery = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => apiClient.getInventoryMovements({ size: 8 }),
    enabled: Boolean(token && isAdmin),
  });

  const refreshAdmin = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] }),
      queryClient.invalidateQueries({ queryKey: ["posts"] }),
      queryClient.invalidateQueries({ queryKey: ["journal-posts"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
      queryClient.invalidateQueries({ queryKey: ["home-products"] }),
    ]);
  };

  const lockMutation = useMutation({
    mutationFn: (userId: number) => apiClient.toggleUserLock(userId),
    onSuccess: async () => {
      await refreshAdmin();
      onNotice("Da cap nhat trang thai tai khoan.");
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => apiClient.updateUserRole(userId, role),
    onSuccess: async () => {
      await refreshAdmin();
      onNotice("Da cap nhat vai tro.");
    },
  });

  const orderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      apiClient.updateOrderStatus(orderId, status),
    onSuccess: async () => {
      await refreshAdmin();
      onNotice("Da cap nhat trang thai don hang.");
    },
  });

  const inventoryMutation = useMutation({
    mutationFn: apiClient.adjustInventory,
    onSuccess: async () => {
      await refreshAdmin();
      setInventoryForm({ productId: "", quantity: "1", type: "IMPORT", note: "" });
      onNotice("Da cap nhat ton kho.");
    },
  });
  const createProductMutation = useMutation({
    mutationFn: apiClient.createProductWithImage,
    onSuccess: async () => {
      await refreshAdmin();
      setProductForm({
        categoryId: "",
        name: "",
        description: "",
        price: "",
        stock: "1",
      });
      setProductImageFile(null);
      setProductImagePreview("");
      onNotice("Da tao san pham moi.");
    },
  });
  const createPostMutation = useMutation({
    mutationFn: apiClient.createPostWithImage,
    onSuccess: async () => {
      await refreshAdmin();
      setPostForm({
        title: "",
        content: "",
      });
      setPostImageFile(null);
      setPostImagePreview("");
      onNotice("Da dang bai viet moi.");
    },
  });
  const deleteProductMutation = useMutation({
    mutationFn: (productId: number) => apiClient.deleteProduct(productId),
    onSuccess: async () => {
      await refreshAdmin();
      onNotice("Da xoa san pham.");
    },
    onError: () => onNotice("Khong the xoa san pham nay."),
  });
  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => apiClient.deletePost(postId),
    onSuccess: async () => {
      await refreshAdmin();
      onNotice("Da xoa bai viet.");
    },
    onError: () => onNotice("Khong the xoa bai viet nay."),
  });

  if (!token) {
    return <div className="panel px-6 py-10">Vui lòng đăng nhập bằng tài khoản admin.</div>;
  }

  if (!isAdmin) {
    return <div className="panel px-6 py-10">Khu vực này chỉ dành cho admin.</div>;
  }

  if (
    dashboardQuery.isLoading ||
    usersQuery.isLoading ||
    ordersQuery.isLoading ||
    productsQuery.isLoading ||
    postsQuery.isLoading ||
    categoriesQuery.isLoading ||
    movementsQuery.isLoading
  ) {
    return <ApiStateCard title="Dang tai khu vuc quan tri" description="Vui long doi trong giay lat." />;
  }

  if (
    dashboardQuery.isError ||
    usersQuery.isError ||
    ordersQuery.isError ||
    productsQuery.isError ||
    postsQuery.isError ||
    categoriesQuery.isError ||
    movementsQuery.isError
  ) {
    return <ApiStateCard title="Khong tai duoc du lieu quan tri" description="Vui long kiem tra quyen admin va ket noi API." />;
  }

  const dashboard = dashboardQuery.data as AdminDashboard;
  const stockChartData = (productsQuery.data?.content ?? []).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="panel px-6 py-6">
        <p className="text-sm uppercase tracking-[0.25em] text-leaf">Trang quản trị</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">Vận hành kho, khách hàng, bài viết và đơn hàng</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {(
          [
            { label: "Người dùng", value: dashboard.totalUsers, icon: Users },
            { label: "Sản phẩm", value: dashboard.totalProducts, icon: Boxes },
            { label: "Đơn hàng", value: dashboard.totalOrders, icon: Truck },
            { label: "Chờ xử lý", value: dashboard.pendingOrders, icon: ShieldCheck },
            { label: "Sắp hết hàng", value: dashboard.lowStockProducts, icon: CircleDollarSign },
          ] as { label: string; value: number; icon: LucideIcon }[]
        ).map(({ label, value, icon: Icon }) => (
          <div key={label} className="panel px-5 py-5">
            <Icon className="h-6 w-6 text-leaf" />
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="panel px-6 py-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Doanh thu tạm tính</p>
        <p className="mt-2 text-3xl font-bold text-moss">{currency(dashboard.totalRevenue ?? 0)}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Quản lý người dùng</h2>
          <div className="mt-5 space-y-4">
            {usersQuery.data?.content.map((user: UserProfile) => (
              <div key={user.id} className="rounded-3xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{user.fullName}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={user.role}
                      onChange={(event) =>
                        roleMutation.mutate({ userId: user.id, role: event.target.value })
                      }
                      disabled={user.role === "ROLE_ADMIN"}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
                    >
                      <option value="ROLE_USER">ROLE_USER</option>
                      <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    </select>
                    {user.role === "ROLE_USER" ? (
                      <button
                        onClick={() => lockMutation.mutate(user.id)}
                        className="button-secondary px-4 py-2"
                      >
                        {user.locked ? "Mở khóa" : "khóa"}
                      </button>
                    ) : (
                      <span className="rounded-full bg-mist px-4 py-2 text-sm text-slate-500">Admin không thể khóa</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Nhập xuất kho</h2>
          <div className="mt-5 grid gap-4">
            <select
              value={inventoryForm.productId}
              onChange={(event) =>
                setInventoryForm((current) => ({ ...current, productId: event.target.value }))
              }
              className="rounded-3xl bg-mist px-4 py-3 outline-none"
            >
              <option value="">Chọn sản phẩm</option>
              {productsQuery.data?.content.map((product: Product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.stock})
                </option>
              ))}
            </select>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={inventoryForm.quantity}
                onChange={(event) =>
                  setInventoryForm((current) => ({ ...current, quantity: event.target.value }))
                }
                className="rounded-3xl bg-mist px-4 py-3 outline-none"
                placeholder="Số lượng"
              />
              <select
                value={inventoryForm.type}
                onChange={(event) =>
                  setInventoryForm((current) => ({ ...current, type: event.target.value }))
                }
                className="rounded-3xl bg-mist px-4 py-3 outline-none"
              >
                <option value="IMPORT"> NHẬP</option>
                <option value="EXPORT">XUẤT</option>
                <option value="ADJUSTMENT">ĐIỀU CHỈNH</option>
              </select>
            </div>
            <input
              value={inventoryForm.note}
              onChange={(event) =>
                setInventoryForm((current) => ({ ...current, note: event.target.value }))
              }
              className="rounded-3xl bg-mist px-4 py-3 outline-none"
              placeholder="Ghi chú"
            />
            <button
              onClick={() =>
                inventoryMutation.mutate({
                  productId: Number(inventoryForm.productId),
                  quantity: Number(inventoryForm.quantity),
                  type: inventoryForm.type,
                  note: inventoryForm.note,
                })
              }
              className="button-primary w-fit"
            >
              Lưu biến động kho
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="panel px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Tạo sản phẩm mới</h2>
          <div className="mt-5 grid gap-4">
            <select
              value={productForm.categoryId}
              onChange={(event) =>
                setProductForm((current) => ({ ...current, categoryId: event.target.value }))
              }
              className="rounded-3xl bg-mist px-4 py-3 outline-none"
            >
              <option value="">Chọn danh mục</option>
              {categoriesQuery.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              value={productForm.name}
              onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
              className="rounded-3xl bg-mist px-4 py-3 outline-none"
              placeholder="Tên sản phẩm"
            />
            <textarea
              value={productForm.description}
              onChange={(event) =>
                setProductForm((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-28 rounded-3xl bg-mist px-4 py-3 outline-none"
              placeholder="Mô tả sản phẩm"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={productForm.price}
                onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                className="rounded-3xl bg-mist px-4 py-3 outline-none"
                placeholder="Giá"
              />
              <input
                value={productForm.stock}
                onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
                className="rounded-3xl bg-mist px-4 py-3 outline-none"
                placeholder="Số lượng tồn kho"
              />
            </div>
            <input
              type="file"
              onChange={(event) => setProductImageFile(event.target.files?.[0] ?? null)}
              className="rounded-3xl bg-mist px-4 py-3 outline-none"
            />
            {productImagePreview ? (
              <img
                src={productImagePreview}
                alt="Xem truoc anh san pham"
                className="h-40 w-full rounded-3xl object-cover"
              />
            ) : null}
            <button
              onClick={() =>
                productImageFile
                  ? createProductMutation.mutate({
                      categoryId: Number(productForm.categoryId),
                      name: productForm.name,
                      description: productForm.description,
                      price: Number(productForm.price),
                      stock: Number(productForm.stock),
                      file: productImageFile,
                    })
                  : onNotice("Vui long chon anh san pham.")
              }
              className="button-primary w-fit"
            >
              Tạo sản phẩm
            </button>
          </div>
        </div>

        <div className="panel px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Đăng bài viết</h2>
          <div className="mt-5 grid gap-4">
            <input
              value={postForm.title}
              onChange={(event) => setPostForm((current) => ({ ...current, title: event.target.value }))}
              className="rounded-3xl bg-mist px-4 py-3 outline-none"
              placeholder="Tiêu đề bài viết"
            />
            <textarea
              value={postForm.content}
              onChange={(event) => setPostForm((current) => ({ ...current, content: event.target.value }))}
              className="min-h-32 rounded-3xl bg-mist px-4 py-3 outline-none"
              placeholder="Nội dung bài viết"
            />
            <input
              type="file"
              onChange={(event) => setPostImageFile(event.target.files?.[0] ?? null)}
              className="rounded-3xl bg-mist px-4 py-3 outline-none"
            />
            {postImagePreview ? (
              <img
                src={postImagePreview}
                alt="Xem truoc anh bai viet"
                className="h-40 w-full rounded-3xl object-cover"
              />
            ) : null}
            <button
              onClick={() =>
                postImageFile
                  ? createPostMutation.mutate({
                      title: postForm.title,
                      content: postForm.content,
                      file: postImageFile,
                    })
                  : onNotice("Vui long chon anh bai viet.")
              }
              className="button-primary w-fit"
            >
              Đăng bài
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="panel px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Danh sách sản phẩm</h2>
          <div className="mt-5 space-y-4">
            {productsQuery.data?.content.length ? (
              productsQuery.data.content.map((product: Product) => (
                <div key={product.id} className="rounded-3xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-slate-500">
                        {product.categoryName} | {currency(product.price)} | Ton {product.stock}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(`Xoa san pham "${product.name}"?`)) {
                          deleteProductMutation.mutate(product.id);
                        }
                      }}
                      className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Chua co san pham" description="Hay tao san pham moi o tren." />
            )}
          </div>
        </div>

        <div className="panel px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Danh sách bài viết</h2>
          <div className="mt-5 space-y-4">
            {postsQuery.data?.content.length ? (
              postsQuery.data.content.map((post: Post) => (
                <div key={post.id} className="rounded-3xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{post.title}</p>
                      <p className="text-sm text-slate-500">{post.authorName}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(`Xoa bai viet "${post.title}"?`)) {
                          deletePostMutation.mutate(post.id);
                        }
                      }}
                      className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600"
                    >
                      Xoa
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Chua co bai viet" description="Hay dang bai moi o tren." />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="panel px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Đơn hàng gần đây</h2>
          <div className="mt-5 space-y-4">
            {ordersQuery.data?.content.map((order: Order) => (
              <div key={order.id} className="rounded-3xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">Đơn #{order.id}</p>
                    <p className="text-sm text-slate-500">{order.shippingAddress}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={order.orderStatus}
                      onChange={(event) =>
                        orderStatusMutation.mutate({
                          orderId: order.id,
                          status: event.target.value,
                        })
                      }
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
                    >
                      {["PENDING", "PROCESSING", "SHIPPING", "COMPLETED", "CANCELLED"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <span className="rounded-full bg-sage/40 px-3 py-2 text-xs font-semibold text-moss">
                      {currency(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel px-6 py-6">
          <h2 className="font-heading text-2xl font-bold">Lịch sử biến động kho</h2>
          <div className="mt-5 space-y-4">
            {(movementsQuery.data?.content ?? dashboard.recentInventoryMovements ?? []).map(
              (movement: InventoryMovement) => (
                <div key={movement.id} className="rounded-3xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{movement.productName}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        movement.quantityChange >= 0 ? "bg-sage/40 text-moss" : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {movement.quantityChange > 0 ? "+" : ""}
                      {movement.quantityChange}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {movement.type} | {movement.quantityBefore} den {movement.quantityAfter}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{movement.note || "Khong co ghi chu"}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="panel px-6 py-6">
        <h2 className="font-heading text-2xl font-bold">Biểu đồ tồn kho</h2>
        <div className="mt-5 space-y-4">
          {stockChartData.length ? (
            stockChartData.map((product: Product) => {
              const width = Math.max(8, Math.min(100, product.stock));
              return (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{product.name}</span>
                    <span className="text-slate-500">{product.stock} sản phẩm</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-mist">
                    <div
                      className={`h-full rounded-full ${
                        product.stock <= 10 ? "bg-rose-400" : product.stock <= 30 ? "bg-amber-400" : "bg-leaf"
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState title="Chưa có dữ liệu tồn kho" description="Hãy thêm sản phẩm để hiển thị biểu đồ." />
          )}
        </div>
      </div>

      <div className="panel px-6 py-6">
        <h2 className="font-heading text-2xl font-bold">Cảnh báo sắp hết hàng</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.lowStockItems.length ? (
            dashboard.lowStockItems.map((product: Product) => (
              <div key={product.id} className="rounded-3xl bg-mist p-4">
                <p className="font-semibold">{product.name}</p>
                <p className="mt-2 text-sm text-slate-500">{product.categoryName}</p>
                <p className="mt-4 text-lg font-bold text-moss">Còn lại {product.stock}</p>
              </div>
            ))
          ) : (
            <EmptyState title="Tồn kho ổn định" description="Hiện tại chưa có sản phẩm nào sắp hết." />
          )}
        </div>
      </div>
    </div>
  );
}

function AuthenticatePage({ onAuth }: { onAuth: (response: AuthResponse) => void }) {
  const [email, setEmail] = useState("admin@organicshop.com");
  const [password, setPassword] = useState("Admin@123");
  const [fullName, setFullName] = useState("Organic Shopper");
  const [phone, setPhone] = useState("0900000000");
  const [mode, setMode] = useState<"login" | "register">("login");
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  const loginMutation = useMutation({
    mutationFn: apiClient.login,
    onSuccess: (response: AuthResponse) => onAuth(response),
  });
  const registerMutation = useMutation({
    mutationFn: apiClient.register,
    onSuccess: () => setMode("login"),
  });
  const googleMutation = useMutation({
    mutationFn: apiClient.googleLogin,
    onSuccess: (response: AuthResponse) => onAuth(response),
  });

  useEffect(() => {
    const buttonElement = googleButtonRef.current;
    const googleIdentity = window.google?.accounts?.id;

    if (!buttonElement || !googleIdentity) {
      setGoogleReady(false);
      return;
    }

    buttonElement.innerHTML = "";
    googleIdentity.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => {
        if (credential) {
          googleMutation.mutate({ idToken: credential });
        }
      },
    });
    googleIdentity.renderButton(buttonElement, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin_with",
      width: 320,
    });
    setGoogleReady(true);
  }, [googleMutation]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel bg-moss px-7 py-8 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-sage">Truy cập an toàn</p>
          <h1 className="mt-3 font-heading text-4xl font-bold">Đăng nhập người dùng và admin</h1>
          <p className="mt-4 text-sm leading-7 text-white/80">
            Sử dụng email hoặc Google để đăng nhập vào giao diện mua hàng và khu vực quản trị.
          </p>
          <div className="mt-8 flex min-h-11 items-center justify-center">{/*
            Tiếp tục với Google
          */}</div>
          <div className="mt-8 flex min-h-11 items-center justify-center">
            <div ref={googleButtonRef} />
            {!googleReady ? (
              <button type="button" disabled className="button-primary w-full bg-white text-moss opacity-70">
                Dang tai Google...
              </button>
            ) : null}
          </div>
        </div>

        <div className="panel px-7 py-8">
          <div className="mb-6 flex gap-3">
            {(["login", "register"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  mode === value ? "bg-leaf text-white" : "bg-mist text-slate-600"
                }`}
              >
                {value === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>
          <div className="grid gap-4">
            {mode === "register" && (
              <>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-3xl bg-mist px-4 py-3 outline-none"
                  placeholder="Họ và tên"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-3xl bg-mist px-4 py-3 outline-none"
                  placeholder="Số điện thoại"
                />
              </>
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-3xl bg-mist px-4 py-3 outline-none"
              placeholder="Email đăng nhập"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="rounded-3xl bg-mist px-4 py-3 outline-none"
              placeholder="Mật khẩu"
            />
            <button
              onClick={() =>
                mode === "login"
                  ? loginMutation.mutate({ email, password })
                  : registerMutation.mutate({ email, password, fullName, phone })
              }
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="button-primary"
            >
              {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentResultPage() {
  const [params] = useSearchParams();
  const status = params.get("status");
  const orderId = params.get("orderId");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="panel px-8 py-10 text-center">
        <div
          className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${
            status === "success" || status === "cod"
              ? "bg-sage/40 text-moss"
              : "bg-red-100 text-red-500"
          }`}
        >
          <BadgeCheck className="h-9 w-9" />
        </div>
        <h1 className="font-heading text-3xl font-bold">
          {status === "success"
            ? "Thanh toán thành công"
            : status === "cod"
              ? "Đặt hàng thành công"
              : "Thanh toán thất bại"}
        </h1>
        <p className="mt-3 text-slate-600">Mã đơn hàng: #{orderId}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/profile" className="button-primary">
            Về trang cá nhân
          </Link>
          <Link to="/products" className="button-secondary">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
