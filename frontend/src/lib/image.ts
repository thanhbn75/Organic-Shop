const localImages = import.meta.glob("../images/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export function resolveProductImage(imageUrl?: string) {
  if (!imageUrl) {
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/images/")) {
    const fileName = imageUrl.split("/").pop();
    const match = Object.entries(localImages).find(([path]) => path.endsWith(`/${fileName}`));
    if (match) {
      return match[1];
    }
  }

  if (imageUrl.startsWith("/uploads/")) {
    const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    return `${apiBase}${imageUrl}`;
  }

  return imageUrl;
}
