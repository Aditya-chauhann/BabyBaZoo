export interface CJProduct {
  pid: string;
  productName: string;
  productImage: string;
  sellPrice: number;
  categoryId: string;
  categoryName: string;
  description?: string;
  variants?: CJVariant[];
}

export interface CJVariant {
  vid: string;
  variantName: string;
  variantSellPrice: number;
  variantSku?: string;
  stock: number;
}
