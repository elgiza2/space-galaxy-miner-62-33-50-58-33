import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useTickets } from '@/hooks/useTickets';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { 
  Ticket, 
  Gift, 
  ShoppingCart, 
  Award, 
  Clock, 
  Star,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { EnhancedTicket } from '@/services/enhancedTicketService';

interface TicketManagementProps {
  onTicketSelect?: (ticket: EnhancedTicket) => void;
  showPurchaseOptions?: boolean;
  gameContext?: string;
}

const TicketManagement: React.FC<TicketManagementProps> = ({
  onTicketSelect,
  showPurchaseOptions = true,
  gameContext = 'mines'
}) => {
  const { 
    tickets, 
    loading, 
    ticketStats, 
    dailyTicketsCount,
    canGetDailyTickets,
    claimDailyTickets,
    createPremiumTicket,
    purchaseTickets,
    getTicketValue
  } = useTickets();
  
  const { spaceCoins, subtractCoins } = useSpaceCoins();
  const [purchaseCount, setPurchaseCount] = useState(1);

  const getTicketIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="w-4 h-4" />;
      case 'task_reward':
        return <Award className="w-4 h-4" />;
      case 'premium':
        return <Star className="w-4 h-4" />;
      default:
        return <Ticket className="w-4 h-4" />;
    }
  };

  const getTicketColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'task_reward':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'premium':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getTicketTypeLabel = (type: string) => {
    switch (type) {
      case 'daily':
        return 'يومية';
      case 'task_reward':
        return 'مكافأة مهمة';
      case 'premium':
        return 'مميزة';
      default:
        return 'عادية';
    }
  };

  const handlePurchaseTickets = async () => {
    const costPerTicket = 1000;
    const totalCost = purchaseCount * costPerTicket;
    
    if (totalCost > spaceCoins) {
      return;
    }
    
    await subtractCoins(totalCost);
    await purchaseTickets(purchaseCount, totalCost);
    setPurchaseCount(1);
  };

  const dailyProgress = (dailyTicketsCount / 3) * 100;

  if (loading) {
    return (
      <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
        <CardContent className="p-6">
          <div className="text-center text-gray-300">جاري تحميل التذاكر...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات التذاكر */}
      <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            إحصائيات التذاكر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{ticketStats.available}</div>
              <div className="text-sm text-gray-300">متاحة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{ticketStats.used}</div>
              <div className="text-sm text-gray-300">مستخدمة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{ticketStats.expired}</div>
              <div className="text-sm text-gray-300">منتهية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{ticketStats.total}</div>
              <div className="text-sm text-gray-300">المجموع</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700/80 backdrop-blur-sm border border-slate-600/50">
          <TabsTrigger value="available" className="data-[state=active]:bg-slate-600/80">
            التذاكر المتاحة ({ticketStats.available})
          </TabsTrigger>
          <TabsTrigger value="daily" className="data-[state=active]:bg-slate-600/80">
            التذاكر اليومية
          </TabsTrigger>
          {showPurchaseOptions && (
            <TabsTrigger value="purchase" className="data-[state=active]:bg-slate-600/80">
              شراء تذاكر
            </TabsTrigger>
          )}
        </TabsList>

        {/* التذاكر المتاحة */}
        <TabsContent value="available" className="space-y-4">
          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-yellow-400" />
                التذاكر المتاحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">لا توجد تذاكر متاحة</p>
                  <p className="text-sm text-gray-500 mt-2">
                    احصل على تذاكر يومية أو اشتري تذاكر جديدة
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-4 rounded-lg border ${getTicketColor(ticket.type)} backdrop-blur-sm cursor-pointer hover:scale-105 transition-all duration-200`}
                      onClick={() => onTicketSelect?.(ticket)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTicketIcon(ticket.type)}
                          <div>
                            <div className="font-medium">
                              تذكرة {getTicketTypeLabel(ticket.type)}
                            </div>
                            <div className="text-sm opacity-75">
                              القيمة: {getTicketValue(ticket).toLocaleString()} عملة
                            </div>
                            {ticket.description && (
                              <div className="text-xs opacity-60 mt-1">
                                {ticket.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-2">
                            {getTicketTypeLabel(ticket.type)}
                          </Badge>
                          <div className="text-xs opacity-75">
                            {new Date(ticket.created_at).toLocaleDateString('ar-SA')}
                          </div>
                          {ticket.expires_at && (
                            <div className="text-xs text-orange-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              تنتهي: {new Date(ticket.expires_at).toLocaleString('ar-SA')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* التذاكر اليومية */}
        <TabsContent value="daily" className="space-y-4">
          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                التذاكر اليومية المجانية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">التقدم اليومي</span>
                  <span className="text-white font-bold">{dailyTicketsCount}/3</span>
                </div>
                <Progress value={dailyProgress} className="h-2" />
                <p className="text-sm text-gray-400 mt-2">
                  يمكنك الحصول على 3 تذاكر مجانية يومياً
                </p>
              </div>

              {canGetDailyTickets ? (
                <Button 
                  onClick={claimDailyTickets}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  استلم التذاكر اليومية ({3 - dailyTicketsCount} متبقية)
                </Button>
              ) : (
                <div className="text-center py-4">
                  <div className="text-green-400 font-medium mb-2">
                    ✅ تم استلام جميع التذاكر اليومية
                  </div>
                  <p className="text-sm text-gray-400">
                    عد غداً للحصول على المزيد من التذاكر المجانية
                  </p>
                </div>
              )}

              {/* نصائح للحصول على تذاكر */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <h4 className="text-white font-medium mb-2">طرق أخرى للحصول على التذاكر:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• أكمل المهام اليومية</li>
                  <li>• شارك في الأحداث الخاصة</li>
                  <li>• اشتري تذاكر مميزة</li>
                  <li>• ادع أصدقاء جدد</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* شراء التذاكر */}
        {showPurchaseOptions && (
          <TabsContent value="purchase" className="space-y-4">
            <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-400" />
                  شراء تذاكر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">رصيدك الحالي:</span>
                  <span className="text-yellow-400 font-bold">{spaceCoins.toLocaleString()} عملة</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-300">عدد التذاكر</label>
                    <Input
                      type="number"
                      value={purchaseCount}
                      onChange={(e) => setPurchaseCount(Math.max(1, Number(e.target.value)))}
                      className="bg-slate-700/80 backdrop-blur-sm border-slate-600/50 text-white"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <div className="flex justify-between items-center">
                      <span>سعر التذكرة الواحدة:</span>
                      <span className="text-yellow-400">1,000 عملة</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span>المجموع:</span>
                      <span className="text-yellow-400">{(purchaseCount * 1000).toLocaleString()} عملة</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePurchaseTickets}
                    disabled={purchaseCount * 1000 > spaceCoins}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    اشتري {purchaseCount} تذكرة
                  </Button>

                  {purchaseCount * 1000 > spaceCoins && (
                    <p className="text-red-400 text-sm text-center">
                      رصيدك غير كافي لشراء هذا العدد من التذاكر
                    </p>
                  )}
                </div>

                {/* عروض التذاكر المميزة */}
                <div className="border-t border-slate-600/30 pt-4">
                  <h4 className="text-white font-medium mb-3">عروض مميزة:</h4>
                  <div className="grid gap-2">
                    <Button
                      onClick={() => createPremiumTicket(5000)}
                      variant="outline"
                      className="w-full bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      تذكرة ذهبية (5,000 عملة مضمونة)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default TicketManagement;