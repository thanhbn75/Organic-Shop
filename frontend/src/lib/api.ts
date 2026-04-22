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

export type VnpayPaymentResponse = {
  orderId: number;
  transactionRef: string;
  paymentUrl: string;
};

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
    unwrap<PageResponse<Product>>(api.get("/api/products", { params })),
  getProduct: (id: string) => unwrap<Product>(api.get(`/api/products/${id}`)),
  getPosts: () => unwrap<PageResponse<Post>>(api.get("/api/posts")),
  getReviews: (productId: string) => unwrap<PageResponse<Review>>(api.get(`/api/reviews/product/${productId}`)),
  login: (payload: { email: string; password: string }) => unwrap<AuthResponse>(api.post("/api/auth/login", payload)),
  register: (payload: { email: string; password: string; fullName: string; phone: string }) =>
    unwrap(api.post("/api/auth/register", payload)),
  googleLogin: (payload: { code?: string; idToken?: string; redirectUri?: string }) =>
    unwrap<AuthResponse>(api.post("/api/auth/google", payload)),
  getProfile: () => unwrap<UserProfile>(api.get("/api/users/me")),
  getOrders: () => unwrap<PageResponse<Order>>(api.get("/api/orders")),
  getCart: () => unwrap<Cart>(api.get("/api/cart")),
  addCartItem: (payload: { productId: number; quantity: number }) => unwrap<Cart>(api.post("/api/cart/items", payload)),
  updateCartItem: (itemId: number, quantity: number) =>
    unwrap<Cart>(api.put(`/api/cart/items/${itemId}`, null, { params: { quantity } })),
  removeCartItem: (itemId: number) => unwrap<Cart>(api.delete(`/api/cart/items/${itemId}`)),
  clearCart: () => unwrap(api.delete("/api/cart")),
  createOrder: (payload: { shippingAddress: string; paymentMethod: string }) =>
    unwrap<Order>(api.post("/api/orders", payload)),
  createVnpayPayment: (payload: { orderId: number; bankCode?: string; language?: string }) =>
    unwrap<VnpayPaymentResponse>(api.post("/api/payments/vnpay/create", payload)),
};
