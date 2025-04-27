export interface PointItem {
  id: number;
  name: string;
  description: string;
  price: number;
  code: string; // 이모지 코드 (예: ":zeus:")
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
  code: string;
  imageUrl: string;
  purchasedAt: string;
}
