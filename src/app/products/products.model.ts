export interface Product {
  id?: number;
  name: string;
  categoryId: number;
  description?: string;
  screenSize?: string;
  ram?: number;
  battery?: number;
  storage?: number;
  imageUrl?: string;
  stock?: number;
  originalPrice?: number;
  price?: number;
  discount?: number;
}
