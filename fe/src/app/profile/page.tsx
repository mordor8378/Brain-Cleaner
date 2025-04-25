import Link from 'next/link';
import { FaStore } from 'react-icons/fa';

<div className="flex items-center gap-4 mb-6">
  <Link
    href="/point-store"
    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
  >
    <FaStore className="text-xl" />
    <span>포인트 상점</span>
  </Link>
  <span className="text-gray-500">보유 포인트: {user.remainingPoint}P</span>
</div>;
