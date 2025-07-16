import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTickets } from '@/hooks/useTickets';
import { 
  Ticket, 
  ArrowLeft, 
  TrendingUp,
  Calendar,
  Award,
  Star,
  Clock,
  BarChart3
} from 'lucide-react';
import TicketManagement from './TicketManagement';

interface TicketsPageProps {
  onBack?: () => void;
}

const TicketsPage: React.FC<TicketsPageProps> = ({ onBack }) => {
  const { ticketStats, availableTickets, loading } = useTickets();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 pt-4 pb-24">
        <div className="max-w-md mx-auto">
          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
            <CardContent className="p-6">
              <div className="text-center text-gray-300">جاري تحميل التذاكر...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 pt-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Ticket className="w-8 h-8 text-yellow-400" />
              إدارة التذاكر
            </h1>
            <p className="text-gray-300 mt-2">
              احصل على تذاكر مجانية واستخدمها في الألعاب
            </p>
          </div>
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/60"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              رجوع
            </Button>
          )}
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Ticket className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{availableTickets}</div>
              <div className="text-sm text-gray-300">تذاكر متاحة</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-400">{ticketStats.used}</div>
              <div className="text-sm text-gray-300">مستخدمة</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-400">{ticketStats.expired}</div>
              <div className="text-sm text-gray-300">منتهية</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">{ticketStats.total}</div>
              <div className="text-sm text-gray-300">المجموع</div>
            </CardContent>
          </Card>
        </div>

        {/* معلومات حول التذاكر */}
        <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              أنواع التذاكر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 font-medium">تذاكر يومية</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  احصل على 3 تذاكر مجانية يومياً
                </p>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                  قيمة: 500 عملة
                </Badge>
              </div>

              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">تذاكر المكافآت</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  احصل عليها من إنجاز المهام
                </p>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                  قيمة: 1,000 عملة
                </Badge>
              </div>

              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-300 font-medium">تذاكر مميزة</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  اشتريها أو احصل عليها من العروض
                </p>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  قيمة: متغيرة
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* طرق استخدام التذاكر */}
        <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white">كيفية استخدام التذاكر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <h4 className="text-white font-medium">اختر لعبة</h4>
                  <p className="text-gray-300 text-sm">اذهب إلى لعبة الألغام أو أي لعبة أخرى</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div>
                  <h4 className="text-white font-medium">اختر نوع الرهان</h4>
                  <p className="text-gray-300 text-sm">حدد "تذكرة" كنوع الرهان</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div>
                  <h4 className="text-white font-medium">اختر التذكرة</h4>
                  <p className="text-gray-300 text-sm">حدد التذكرة التي تريد استخدامها</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                <div>
                  <h4 className="text-white font-medium">ابدأ اللعب</h4>
                  <p className="text-gray-300 text-sm">اربح عملات بناء على قيمة التذكرة والمضاعفات</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إدارة التذاكر */}
        <TicketManagement 
          showPurchaseOptions={true}
          gameContext="general"
        />
      </div>
    </div>
  );
};

export default TicketsPage;
