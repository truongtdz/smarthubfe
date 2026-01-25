export interface Product {
  id?: number;
  name: string;
  categoryId: number;
  description?: string;
  screenSize?: string;
  screenType?: string;
  ram?: number;
  battery?: number;
  chipset?: string;
  storage?: number;
  imageUrl?: string;
  stock?: number;
}
