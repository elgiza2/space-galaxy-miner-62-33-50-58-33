
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, ShoppingCart, Activity } from 'lucide-react';
import { TopPurchaser } from '@/services/analyticsService';

interface AnalyticsCardsProps {
  currentActiveUsers: number;
  lastHourActiveUsers: number;
  topPurchasers: TopPurchaser[];
  isLoading: boolean;
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({
  currentActiveUsers,
  lastHourActiveUsers,
  topPurchasers,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-gradient-to-br from-gray-500/15 to-gray-600/15 backdrop-blur-xl border-2 border-gray-500/40 rounded-3xl">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-400 rounded mb-2"></div>
                <div className="h-8 bg-gray-400 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Current Active Users */}
      <Card className="bg-gradient-to-br from-green-500/15 to-emerald-500/15 backdrop-blur-xl border-2 border-green-500/40 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Current Users</p>
              <p className="text-white text-2xl font-bold">{currentActiveUsers}</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </CardContent>
      </Card>

      {/* Last Hour Active Users */}
      <Card className="bg-gradient-to-br from-blue-500/15 to-cyan-500/15 backdrop-blur-xl border-2 border-blue-500/40 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">نشط آخر ساعة</p>
              <p className="text-white text-2xl font-bold">{lastHourActiveUsers}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      {/* Top Purchaser */}
      <Card className="bg-gradient-to-br from-purple-500/15 to-pink-500/15 backdrop-blur-xl border-2 border-purple-500/40 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">أكثر المشتريات</p>
              <p className="text-white text-lg font-bold">
                {topPurchasers[0]?.username || 'لا يوجد'}
              </p>
              {topPurchasers[0] && (
                <p className="text-purple-300 text-xs">
                  ${topPurchasers[0].total_spent}
                </p>
              )}
            </div>
            <ShoppingCart className="w-8 h-8 text-purple-400" />
          </div>
        </CardContent>
      </Card>

      {/* Top Purchasers List */}
      <Card className="bg-gradient-to-br from-orange-500/15 to-red-500/15 backdrop-blur-xl border-2 border-orange-500/40 rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-orange-200 text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            أفضل المشترين
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2">
            {topPurchasers.slice(0, 3).map((purchaser, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-white truncate max-w-20">{purchaser.username}</span>
                <span className="text-orange-300">${purchaser.total_spent}</span>
              </div>
            ))}
            {topPurchasers.length === 0 && (
              <p className="text-orange-300 text-xs">لا توجد مشتريات</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCards;
