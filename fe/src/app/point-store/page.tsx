'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pointStoreApi } from '@/utils/api/pointStore';
import { PointItem } from '@/types/pointStore';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function PointStorePage() {
  const [items, setItems] = useState<PointItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PointItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await pointStoreApi.getItems();
      setItems(data);
    } catch (error) {
      toast.error('아이템 목록을 불러오는데 실패했습니다.');
    }
  };

  const handlePurchase = async (item: PointItem) => {
    try {
      const result = await pointStoreApi.purchaseItem({ itemId: item.id });
      toast.success(
        `${result.itemName} 구매 완료! 남은 포인트: ${result.remainingPoint}P`
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '구매에 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">포인트 상점</h1>
        <button
          onClick={() => router.push('/point-store/my-purchases')}
          className="text-blue-500 hover:text-blue-600"
        >
          구매 내역
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{item.price}P</span>
                <button
                  onClick={() => handlePurchase(item)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  구매하기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
