// Client-side domain types (mirrors the server's card projection).
export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: string;
  discountPrice: string | null;
  stock: number;
  status: string;
  featured: boolean;
  rating: string;
  ratingCount: number;
  soldCount: number;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  image: string | null;
  createdAt: string | Date;
};

export type CategoryData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  productCount: number;
};
