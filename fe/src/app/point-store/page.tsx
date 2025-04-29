"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pointStoreApi } from "@/utils/api/pointStore";
import { PointItem } from "@/types/pointStore";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getEmojiUrl } from "@/constants/emoji-map";

interface PurchaseModalProps {
  item: PointItem;
  onClose: () => void;
  onConfirm: () => void;
  userPoints: number;
}

const PurchaseModal = ({
  item,
  onClose,
  onConfirm,
  userPoints,
}: PurchaseModalProps) => {
  const remainingPoints = userPoints - item.price;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">구매 확인</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
          </div>
          <h4 className="text-center text-2xl font-bold mb-2">{item.name}</h4>
          <p className="text-sm text-gray-600 text-center mb-4">
            구매 후에는 환불이 불가능합니다.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>보유 포인트</span>
              <span className="font-medium flex items-center gap-1">
                <span role="img" aria-label="brain">
                  🧠
                </span>
                {userPoints} P
              </span>
            </div>
            <div className="flex justify-between">
              <span>상품 가격</span>
              <span className="font-medium text-pink-500 flex items-center gap-1">
                <span role="img" aria-label="brain">
                  🧠
                </span>
                {item.price} P
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>구매 후 잔여</span>
              <span className="font-medium flex items-center gap-1">
                <span role="img" aria-label="brain">
                  🧠
                </span>
                {remainingPoints} P
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-white rounded hover:opacity-90 transition-colors"
            style={{ backgroundColor: CUSTOM_PINK }}
          >
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
};

const CUSTOM_PINK = "#F742CD";

const ItemImage = ({
  src,
  code,
  alt,
}: {
  src: string;
  code: string;
  alt: string;
}) => {
  return (
    <div className="relative h-36 bg-gray-100">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-1"
        unoptimized={true}
      />
    </div>
  );
};

const ItemCard = ({
  item,
  onPurchase,
  isPurchased = false,
}: {
  item: PointItem;
  onPurchase?: (item: PointItem) => void;
  isPurchased?: boolean;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <ItemImage src={item.imageUrl} code={item.code} alt={item.name} />
      <div className="p-3">
        <h3 className="text-base font-semibold mb-1">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold flex items-center gap-1">
            <span role="img" aria-label="brain">
              🧠
            </span>
            {item.price}P
          </span>
          {isPurchased ? (
            <span className="text-green-500 text-sm">구매완료</span>
          ) : (
            <button
              onClick={() => onPurchase?.(item)}
              className="text-white px-3 py-1 text-sm rounded hover:opacity-90 transition-colors"
              style={{ backgroundColor: CUSTOM_PINK }}
            >
              구매하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function PointStorePage() {
  const [items, setItems] = useState<PointItem[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<PointItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PointItem | null>(null);
  const router = useRouter();
  const { user, loading, mutate } = useUser();

  useEffect(() => {
    loadItems();
    if (user) {
      loadPurchasedItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      const data = await pointStoreApi.getItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load items:", err);
      toast.error("아이템 목록을 불러오는데 실패했습니다.");
    }
  };

  const loadPurchasedItems = async () => {
    try {
      const data = await pointStoreApi.getMyPurchases();
      // Transform purchase items to match PointItem type
      const items = data.map((purchase) => ({
        id: purchase.itemId,
        name: purchase.name,
        description: purchase.description,
        price: purchase.price,
        imageUrl: purchase.imageUrl,
        code: purchase.code,
      }));
      setPurchasedItems(items);
    } catch (err) {
      console.error("Failed to load purchased items:", err);
      toast.error("구매 내역을 불러오는데 실패했습니다.");
    }
  };

  const handlePurchase = async (item: PointItem) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    setSelectedItem(item);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItem || !user) return;

    if (
      user.remainingPoint !== undefined &&
      user.remainingPoint < selectedItem.price
    ) {
      toast.error("포인트가 부족합니다.");
      setSelectedItem(null);
      return;
    }

    try {
      const result = await pointStoreApi.purchaseItem({
        itemId: selectedItem.id,
      });
      toast.success(
        `${result.itemName} 구매 완료! 남은 포인트: ${result.remainingPoint}P`
      );
      mutate();
      setSelectedItem(null);
      loadItems();
      loadPurchasedItems();
    } catch (err) {
      console.error("Failed to purchase item:", err);
      toast.error(err instanceof Error ? err.message : "구매에 실패했습니다.");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-4 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold mb-1">포인트 상점</h1>
            <p className="opacity-90 text-sm">@{user.nickname}</p>
            <p className="text-xl font-bold flex items-center gap-1">
              <span role="img" aria-label="brain">
                🧠
              </span>
              {user.remainingPoint || 0} P
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="store">이모티콘 상점</TabsTrigger>
          <TabsTrigger value="purchased">구매한 이모티콘</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onPurchase={handlePurchase} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="purchased">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {purchasedItems.map((item) => (
              <ItemCard key={item.id} item={item} isPurchased />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedItem && user.remainingPoint !== undefined && (
        <PurchaseModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleConfirmPurchase}
          userPoints={user.remainingPoint}
        />
      )}
    </div>
  );
}
