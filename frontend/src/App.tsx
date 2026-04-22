import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Flower2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AuthResponse,
  CartItem,
  Category,
  Order,
  Post,
  Product,
  Review,
  apiClient,
  setAuthToken,
} from "./lib/api";
import { ApiStateCard } from "./components/ApiStateCard";
import { AppHeader } from "./components/AppHeader";
import { CartRow } from "./components/CartRow";
import { EmptyState } from "./components/EmptyState";
import { ProductCard } from "./components/ProductCard";

declare global {
  interface Window {
    google?: {
      accounts?: {
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
const GUEST_CART_KEY = "organic-shop-guest-cart";
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  "637635931751-avampr56o1h1dq1oq3bp7iolonuu7qtg.apps.googleusercontent.com";

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

function App() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [userName, setUserName] = useState(() => localStorage.getItem(USER_KEY) ?? "");
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
      setNotice("Da them san pham vao gio hang.");
    },
    onError: () => {
      setNotice("Khong the them vao gio hang backend.");
    },
  });

  const searchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
  };

  const logout = () => {
    setToken("");
    setUserName("");
    localStorage.removeItem(USER_KEY);
    queryClient.removeQueries({ queryKey: ["cart"] });
    queryClient.removeQueries({ queryKey: ["profile"] });
    queryClient.removeQueries({ queryKey: ["orders"] });
    navigate("/");
  };

  const addToCart = (product: Product) => {
    if (token) {
      addCartMutation.mutate({ productId: product.id, quantity: 1 });
      return;
    }
    setGuestCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { productId: product.id, quantity: 1, product }];
    });
    setNotice("Da them san pham vao guest cart.");
  };

  const cartCount = token
    ? cartQuery.data?.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) ?? 0
    : guestCart.reduce((sum: number, item: GuestCartItem) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-hero pb-10">
      <AppHeader
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSearch={searchSubmit}
        token={token}
        onLogout={logout}
        cartCount={cartCount}
      />

      <main className="shell mt-8">
        {notice ? (
          <div className="mb-6 rounded-3xl border border-sage bg-white/80 px-5 py-4 text-sm font-medium text-moss">
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
          <Route path="/profile" element={<ProfilePage token={token} userName={userName} />} />
          <Route
            path="/authenticate"
            element={
              <AuthenticatePage
                onAuth={(nextToken, nextName) => {
                  setToken(nextToken);
                  setUserName(nextName);
                  localStorage.setItem(USER_KEY, nextName);
                  navigate("/profile");
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
  onAddToCart: (product: Product) => void;
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
    return <ApiStateCard title="Dang tai san pham" description="Frontend dang goi GET /api/products de lay du lieu." />;
  }

  if (productsQuery.isError) {
    return <ApiStateCard title="Khong tai duoc san pham" description="Kiem tra backend, CORS va VITE_API_URL." />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="panel overflow-hidden px-8 py-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sage/40 px-4 py-2 text-sm font-medium text-moss">
            <Sparkles className="h-4 w-4" />
            Handpicked fresh every morning
          </div>
          <h1 className="max-w-2xl font-heading text-4xl font-extrabold leading-tight text-slate-900 md:text-6xl">
            Organic groceries with a calm, premium checkout flow.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Built for trust: fresh produce, origin stories, clean visuals, fast payment, and review-driven shopping.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products" className="button-primary gap-2">
              Explore products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/checkout" className="button-secondary">
              Quick checkout
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {([
              ["100% organic", BadgeCheck],
              ["Tracked origin", MapPin],
              ["Cold-chain care", Truck],
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
            <p className="text-sm uppercase tracking-[0.3em] text-sage">Natural rhythm</p>
            <h2 className="mt-3 font-heading text-3xl font-bold">Weekly wellness basket</h2>
            <p className="mt-4 text-sm leading-6 text-white/80">
              Use the current backend APIs to power category discovery, cart, profile, Google sign-in and VNPay checkout.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            {categoriesLoading ? <p className="text-sm text-white/70">Dang tai danh muc...</p> : null}
            {categoriesError ? <p className="text-sm text-rose-200">Khong tai duoc danh muc.</p> : null}
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

      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-leaf">Best sellers</p>
            <h2 className="font-heading text-3xl font-bold">Products that move fast</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-moss">
            View all
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {productsQuery.data?.content.length ? productsQuery.data.content.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={() => onAddToCart(product)}
              authAware={isAuthenticated}
            />
          )) : <EmptyState title="Chua co san pham" description="API tra ve danh sach rong." />}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {postsQuery.isError ? <ApiStateCard title="Khong tai duoc bai viet" description="Frontend da goi GET /api/posts nhung backend tra loi loi." /> : null}
        {postsQuery.data?.content.slice(0, 3).map((post: Post) => (
          <article key={post.id} className="panel overflow-hidden">
            <img
              src={post.thumbnail || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"}
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

function ProductsPage({ onAddToCart, isAuthenticated }: { onAddToCart: (product: Product) => void; isAuthenticated: boolean }) {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") ?? "";
  const productsQuery = useQuery({
    queryKey: ["products", keyword],
    queryFn: () => apiClient.getProducts({ keyword, size: 12 }),
  });

  if (productsQuery.isLoading) {
    return <ApiStateCard title="Dang tai danh sach san pham" description="Frontend dang goi GET /api/products." />;
  }

  if (productsQuery.isError) {
    return <ApiStateCard title="Khong the tai san pham" description="Kiem tra backend API /api/products va CORS." />;
  }

  return (
    <div className="space-y-6">
      <div className="panel px-6 py-6">
        <p className="text-sm uppercase tracking-[0.25em] text-leaf">Catalog</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">Organic pantry and produce</h1>
        <p className="mt-2 text-slate-600">{keyword ? `Search result for "${keyword}"` : "Browse the latest products from backend."}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {productsQuery.data?.content.length ? productsQuery.data.content.map((product: Product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={() => onAddToCart(product)}
            authAware={isAuthenticated}
          />
        )) : <EmptyState title="Khong co ket qua" description="Khong tim thay san pham phu hop." />}
      </div>
    </div>
  );
}

function ProductDetailPage({ onAddToCart, isAuthenticated }: { onAddToCart: (product: Product) => void; isAuthenticated: boolean }) {
  const { id = "" } = useParams();
  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiClient.getProduct(id),
  });
  const reviewsQuery = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => apiClient.getReviews(id),
  });

  if (productQuery.isLoading) {
    return <ApiStateCard title="Dang tai chi tiet san pham" description="Frontend dang goi GET /api/products/{id}." />;
  }

  if (productQuery.isError || !productQuery.data) {
    return <ApiStateCard title="Khong tai duoc chi tiet san pham" description="Kiem tra id san pham hoac backend API." />;
  }

  const product = productQuery.data;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel overflow-hidden">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"}
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
            <p className="text-sm text-slate-500">Stock: {product.stock}</p>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="button-primary" onClick={() => onAddToCart(product)}>
              {isAuthenticated ? "Add to backend cart" : "Add to guest cart"}
            </button>
            <Link className="button-secondary" to="/checkout">
              Buy now
            </Link>
          </div>
        </div>

        <div className="panel px-7 py-7">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-leaf" />
            <p className="font-semibold">Trust signals</p>
          </div>
          <div className="mt-4 grid gap-3">
            {["100% Organic badge ready", "Origin and review sections available", "VNPay and COD checkout supported"].map((item) => (
              <div key={item} className="rounded-2xl bg-mist px-4 py-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="panel px-7 py-7">
          <h2 className="font-heading text-2xl font-bold">Customer reviews</h2>
          <div className="mt-5 space-y-4">
            {reviewsQuery.isLoading ? <p className="text-sm text-slate-500">Dang tai review...</p> : null}
            {reviewsQuery.isError ? <p className="text-sm text-rose-500">Khong tai duoc review tu /api/reviews/product/{id}.</p> : null}
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
              <p className="text-sm text-slate-500">No reviews yet.</p>
            )}
          </div>
        </div>
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
        <h1 className="font-heading text-3xl font-bold">Cart</h1>
        <p className="mt-2 text-slate-600">
          {token ? "Using backend cart API." : "Using guest cart. Sign in before checkout to create order."}
        </p>
        <div className="mt-6 space-y-4">
          {token ? (
            cartItems.length ? cartItems.map((item) => (
              <CartRow
                key={item.id}
                name={item.productName}
                price={item.productPrice}
                quantity={item.quantity}
                image={item.productImageUrl}
                onRemove={() => removeMutation.mutate(item.id)}
              />
            )) : <EmptyState title="Gio hang trong" description="GET /api/cart da chay nhung chua co item nao." />
          ) : (
            guestCart.length ? guestCart.map((item) => (
              <CartRow
                key={item.productId}
                name={item.product.name}
                price={item.product.price}
                quantity={item.quantity}
                image={item.product.imageUrl}
                onRemove={() => setGuestCart((current) => current.filter((cartItem) => cartItem.productId !== item.productId))}
              />
            )) : <EmptyState title="Guest cart trong" description="Hay them san pham tu danh sach products." />
          )}
        </div>
      </div>

      <div className="panel h-fit px-6 py-6">
        <h2 className="font-heading text-2xl font-bold">Summary</h2>
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <span>Total</span>
          <span className="text-2xl font-bold text-moss">
            {currency(token ? cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0) : guestTotal)}
          </span>
        </div>
        <Link to="/checkout" className="button-primary mt-6 w-full">
          Continue to checkout
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
        <h1 className="font-heading text-3xl font-bold">Checkout</h1>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Shipping address</span>
            <textarea
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              className="min-h-32 w-full rounded-3xl border border-slate-200 bg-mist px-4 py-3 outline-none"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Payment method</p>
            <div className="grid gap-3 md:grid-cols-2">
              {["COD", "VNPAY"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-3xl border px-4 py-4 text-left ${paymentMethod === method ? "border-leaf bg-sage/30" : "border-slate-200 bg-white"}`}
                >
                  <p className="font-semibold">{method}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {method === "COD" ? "Order first, collect on delivery." : "Redirect to VNPay sandbox."}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel h-fit px-6 py-6">
        <h2 className="font-heading text-2xl font-bold">Order summary</h2>
        <p className="mt-3 text-sm text-slate-500">
          {token ? "This screen uses backend cart + order APIs." : "Guest cart cannot create backend order until login."}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <span>Total</span>
          <span className="text-2xl font-bold text-moss">{currency(total)}</span>
        </div>
        <button onClick={submit} className="button-primary mt-6 w-full">
          Place order
        </button>
      </div>
    </div>
  );
}

function ProfilePage({ token, userName }: { token: string; userName: string }) {
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

  if (!token) {
    return <div className="panel px-6 py-10">Please sign in to view profile and orders.</div>;
  }

  if (profileQuery.isLoading || ordersQuery.isLoading) {
    return <ApiStateCard title="Dang tai profile" description="Frontend dang goi /api/users/me va /api/orders." />;
  }

  if (profileQuery.isError || ordersQuery.isError) {
    return <ApiStateCard title="Khong tai duoc profile" description="Kiem tra token JWT hoac backend API user/order." />;
  }

  return (
    <div className="space-y-6">
      <div className="panel px-6 py-6">
        <p className="text-sm uppercase tracking-[0.25em] text-leaf">Account</p>
        <h1 className="mt-2 font-heading text-3xl font-bold">{profileQuery.data?.fullName ?? userName}</h1>
        <p className="mt-2 text-slate-600">{profileQuery.data?.email}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {ordersQuery.data?.content.length ? ordersQuery.data.content.map((order: Order) => (
          <div key={order.id} className="panel px-6 py-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Order #{order.id}</p>
              <span className="rounded-full bg-sage/40 px-3 py-1 text-xs font-semibold text-moss">
                {order.paymentStatus}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{order.shippingAddress}</p>
            <p className="mt-4 text-lg font-bold text-moss">{currency(order.totalPrice)}</p>
          </div>
        )) : <EmptyState title="Chua co don hang" description="API /api/orders da goi thanh cong nhung danh sach rong." />}
      </div>
    </div>
  );
}

function AuthenticatePage({ onAuth }: { onAuth: (token: string, name: string) => void }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("123456");
  const [fullName, setFullName] = useState("Organic Shopper");
  const [phone, setPhone] = useState("0900000000");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [searchParams] = useSearchParams();

  const loginMutation = useMutation({
    mutationFn: apiClient.login,
    onSuccess: (response: AuthResponse) => onAuth(response.token, response.fullName),
  });
  const registerMutation = useMutation({
    mutationFn: apiClient.register,
    onSuccess: () => setMode("login"),
  });
  const googleMutation = useMutation({
    mutationFn: apiClient.googleLogin,
    onSuccess: (response: AuthResponse) => onAuth(response.token, response.fullName),
  });

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      googleMutation.mutate({
        code,
        redirectUri: `${window.location.origin}/authenticate`,
      });
    }
  }, [googleMutation, searchParams]);

  const requestGoogleCode = () => {
    const redirectUri = `${window.location.origin}/authenticate`;
    const client = window.google?.accounts?.oauth2?.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      ux_mode: "redirect",
      redirect_uri: redirectUri,
    });
    client?.requestCode();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel bg-moss px-7 py-8 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-sage">Secure access</p>
          <h1 className="mt-3 font-heading text-4xl font-bold">JWT + Google code flow</h1>
          <p className="mt-4 text-sm leading-7 text-white/80">
            Frontend sends `code` and `redirectUri` to backend `/api/auth/google`. Redirect is aligned to
            `http://localhost:3000/authenticate`.
          </p>
          <button onClick={requestGoogleCode} className="button-primary mt-8 w-full bg-white text-moss hover:bg-cream">
            Continue with Google
          </button>
        </div>

        <div className="panel px-7 py-8">
          <div className="mb-6 flex gap-3">
            {(["login", "register"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === value ? "bg-leaf text-white" : "bg-mist text-slate-600"}`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="grid gap-4">
            {mode === "register" && (
              <>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-3xl bg-mist px-4 py-3 outline-none" placeholder="Full name" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-3xl bg-mist px-4 py-3 outline-none" placeholder="Phone" />
              </>
            )}
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-3xl bg-mist px-4 py-3 outline-none" placeholder="Email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="rounded-3xl bg-mist px-4 py-3 outline-none" placeholder="Password" />
            <button
              onClick={() =>
                mode === "login"
                  ? loginMutation.mutate({ email, password })
                  : registerMutation.mutate({ email, password, fullName, phone })
              }
              className="button-primary"
            >
              {mode === "login" ? "Login" : "Create account"}
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
        <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${status === "success" || status === "cod" ? "bg-sage/40 text-moss" : "bg-red-100 text-red-500"}`}>
          <BadgeCheck className="h-9 w-9" />
        </div>
        <h1 className="font-heading text-3xl font-bold">
          {status === "success" ? "VNPay payment successful" : status === "cod" ? "Order placed successfully" : "Payment failed"}
        </h1>
        <p className="mt-3 text-slate-600">Order reference: #{orderId}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/profile" className="button-primary">Go to profile</Link>
          <Link to="/products" className="button-secondary">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default App;
