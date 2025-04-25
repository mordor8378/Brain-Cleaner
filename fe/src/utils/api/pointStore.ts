import {
  PointItem,
  PointItemPurchaseRequest,
  PointItemPurchaseResult,
  PointItemPurchase,
} from '@/types/pointStore';
import { axiosInstance } from './axios';

export const pointStoreApi = {
  // 상점 아이템 목록 조회
  getItems: async (): Promise<PointItem[]> => {
    const response = await axiosInstance.get('/api/v1/pointstore/items');
    return response.data;
  },

  // 아이템 구매
  purchaseItem: async (
    request: PointItemPurchaseRequest
  ): Promise<PointItemPurchaseResult> => {
    const response = await axiosInstance.post(
      '/api/v1/pointstore/purchase',
      request
    );
    return response.data;
  },

  // 구매 내역 조회
  getMyPurchases: async (): Promise<PointItemPurchase[]> => {
    const response = await axiosInstance.get('/api/v1/pointstore/my-purchases');
    return response.data;
  },
};
