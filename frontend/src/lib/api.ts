import axios from "axios";

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PageResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type Product = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
};

export type Category = {
  id: number;
  name: string;
  description: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  authorName: string;
  createdAt: string;
};

export type Review = {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  ratingStar: number;
  comment: string;
  createdAt: string;
};

export type CartItem = {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  productPrice: number;
  quantity: number;
};

export type Cart = {
  id: number;
  userId: number;
  totalPrice: number;
  items: CartItem[];
};

export type UserProfile = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  locked: boolean;
  createdAt: string;
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  userId: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
};

export type AuthResponse = {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  role: string;
};

export type InventoryMovement = {
  id: number;
  productId: number;
  productName: string;
  type: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: string;
  referenceId: number;
  note: string;
  createdByName: string;
  createdAt: string;
};

export type AdminDashboard = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
  latestUsers: UserProfile[];
  recentOrders: Order[];
  lowStockItems: Product[];
  recentInventoryMovements: InventoryMovement[];
};

export type VnpayPaymentResponse = {
  orderId: number;
  transactionRef: string;
  paymentUrl: string;
};

export type UploadedFileResponse = {
  path: string;
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (value && typeof value === "object") {
    if ("value" in value) {
      return toNumber((value as { value?: unknown }).value);
    }
    if ("number" in value) {
      return toNumber((value as { number?: unknown }).number);
    }
  }

  return 0;
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  id: toNumber(product.id),
  categoryId: toNumber(product.categoryId),
  price: toNumber(product.price),
  stock: toNumber(product.stock),
});

const normalizeProductPage = (page: PageResponse<Product>): PageResponse<Product> => ({
  ...page,
  content: (
    Array.isArray(page.content?.[1]) && typeof page.content?.[0] === "string"
      ? page.content[1]
      : page.content ?? []
  ).map((item) => normalizeProduct(item as Product)),
  number: toNumber(page.number),
  size: toNumber(page.size),
  totalElements: toNumber(page.totalElements),
  totalPages: toNumber(page.totalPages),
});

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

const unwrap = async <T>(promise: Promise<{ data: ApiEnvelope<T> }>) => {
  const response = await promise;
  return response.data.data;
};

export const apiClient = {
  getCategories: () => unwrap<Category[]>(api.get("/api/categories")),
  getProducts: (params?: { page?: number; size?: number; keyword?: string }) =>
    unwrap<PageResponse<Product>>(api.get("/api/products", { params })).then(normalizeProductPage),
  getProduct: (id: string) => unwrap<Product>(api.get(`/api/products/${id}`)).then(normalizeProduct),
  getPosts: () => unwrap<PageResponse<Post>>(api.get("/api/posts")),
  getReviews: (productId: string) => unwrap<PageResponse<Review>>(api.get(`/api/reviews/product/${productId}`)),
  login: (payload: { email: string; password: string }) => unwrap<AuthResponse>(api.post("/api/auth/login", payload)),
  register: (payload: { email: string; password: string; fullName: string; phone: string }) =>
    unwrap(api.post("/api/auth/register", payload)),
  googleLogin: (payload: { code?: string; idToken?: string; redirectUri?: string }) =>
    unwrap<AuthResponse>(api.post("/api/auth/google", payload)),
  getProfile: () => unwrap<UserProfile>(api.get("/api/users/me")),
  updateProfile: (payload: { fullName: string; phone: string }) =>
    unwrap<UserProfile>(api.put("/api/users/me", payload)),
  getOrders: () => unwrap<PageResponse<Order>>(api.get("/api/orders")),
  getOrderById: (orderId: number | string) => unwrap<Order>(api.get(`/api/orders/${orderId}`)),
  getAllOrdersAdmin: (params?: { page?: number; size?: number }) =>
    unwrap<PageResponse<Order>>(api.get("/api/orders/all", { params })),
  updateOrderStatus: (orderId: number, status: string) =>
    unwrap<Order>(api.put(`/api/orders/${orderId}/status`, null, { params: { status } })),
  getCart: () => unwrap<Cart>(api.get("/api/cart")),
  addCartItem: (payload: { productId: number; quantity: number }) => unwrap<Cart>(api.post("/api/cart/items", payload)),
  updateCartItem: (itemId: number, quantity: number) =>
    unwrap<Cart>(api.put(`/api/cart/items/${itemId}`, null, { params: { quantity } })),
  removeCartItem: (itemId: number) => unwrap<Cart>(api.delete(`/api/cart/items/${itemId}`)),
  clearCart: () => unwrap(api.delete("/api/cart")),
  createOrder: (payload: { shippingAddress: string; paymentMethod: string }) =>
    unwrap<Order>(api.post("/api/orders", payload)),
  createProduct: (payload: {
    categoryId: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
  }) => unwrap<Product>(api.post("/api/products", payload)),
  createProductWithImage: (payload: {
    categoryId: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    file: File;
  }) => {
    const formData = new FormData();
    formData.append("categoryId", String(payload.categoryId));
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("price", String(payload.price));
    formData.append("stock", String(payload.stock));
    formData.append("file", payload.file);
    return unwrap<Product>(api.post("/api/products/with-image", formData));
  },
  deleteProduct: (id: number) => unwrap(api.delete(`/api/products/${id}`)),
  createPost: (payload: { title: string; content: string; thumbnail?: string }) =>
    unwrap<Post>(api.post("/api/posts", payload)),
  createPostWithImage: (payload: { title: string; content: string; file: File }) => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("content", payload.content);
    formData.append("file", payload.file);
    return unwrap<Post>(api.post("/api/posts/with-image", formData));
  },
  deletePost: (id: number) => unwrap(api.delete(`/api/posts/${id}`)),
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return unwrap<UploadedFileResponse>(api.post("/api/uploads", formData));
  },
  createReview: (payload: { productId: number; ratingStar: number; comment: string }) =>
    unwrap<Review>(api.post("/api/reviews", payload)),
  createVnpayPayment: (payload: { orderId: number; bankCode?: string; language?: string }) =>
    unwrap<VnpayPaymentResponse>(api.post("/api/payments/vnpay/create", payload)),
  getAllUsers: (params?: { page?: number; size?: number }) =>
    unwrap<PageResponse<UserProfile>>(api.get("/api/users", { params })),
  toggleUserLock: (userId: number) => unwrap(api.put(`/api/users/${userId}/toggle-lock`)),
  updateUserRole: (userId: number, role: string) =>
    unwrap(api.put(`/api/users/${userId}/role`, null, { params: { role } })),
  getAdminDashboard: () => unwrap<AdminDashboard>(api.get("/api/admin/dashboard")),
  getInventoryMovements: (params?: { page?: number; size?: number }) =>
    unwrap<PageResponse<InventoryMovement>>(api.get("/api/admin/inventory-movements", { params })),
  adjustInventory: (payload: { productId: number; quantity: number; type: string; note?: string }) =>
    unwrap<InventoryMovement>(api.post("/api/admin/inventory-movements", payload)),
};
