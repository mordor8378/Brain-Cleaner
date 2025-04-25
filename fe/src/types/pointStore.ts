export interface PointItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface PointItemPurchaseResult {
  itemName: string;
  itemPrice: number;
  remainingPoint: number;
}

export interface PointItemPurchaseRequest {
  itemId: number;
}

export interface PointItemPurchase {
  itemId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  purchasedAt: string;
}
