'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pointStoreApi } from '@/utils/api/pointStore';
import { PointItemPurchase } from '@/types/pointStore';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<PointItemPurchase[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const data = await pointStoreApi.getMyPurchases();
      setPurchases(data);
    } catch (error) {
      toast.error('구매 내역을 불러오는데 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">내 구매 내역</h1>
        <button
          onClick={() => router.push('/point-store')}
          className="text-blue-500 hover:text-blue-600"
        >
          상점으로 돌아가기
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchases.map((purchase) => (
          <div
            key={`${purchase.itemId}-${purchase.purchasedAt}`}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative h-48">
              <Image
                src={purchase.imageUrl}
                alt={purchase.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{purchase.name}</h3>
              <p className="text-gray-600 mb-4">{purchase.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{purchase.price}P</span>
                <span className="text-sm text-gray-500">
                  구매일: {format(new Date(purchase.purchasedAt), 'yyyy.MM.dd')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {purchases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">구매한 아이템이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
