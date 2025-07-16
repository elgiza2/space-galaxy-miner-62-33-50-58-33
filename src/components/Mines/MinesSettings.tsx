import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MinesSettingsProps {
  spaceCoins: number;
  availableTickets: number;
  onBack: () => void;
}

const MinesSettings: React.FC<MinesSettingsProps> = ({
  spaceCoins,
  availableTickets,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            العودة للعبة
          </Button>
          <h1 className="text-2xl font-bold text-white">إعدادات اللعبة</h1>
          <div></div>
        </div>

        {/* Settings Content */}
        <div className="space-y-6 animate-fade-in">
          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50">
            <CardContent className="p-6">
              <h2 className="text-white text-xl font-bold mb-4">كيفية اللعب</h2>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
                  <p>اختر مبلغ الرهان وعدد الألغام</p>
                </div>
                <div className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
                  <p>اضغط على "لعب" لبدء اللعبة</p>
                </div>
                <div className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
                  <p>اضغط على المربعات لاكتشاف الجواهر</p>
                </div>
                <div className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">4</div>
                  <p>تجنب الألغام واسحب أرباحك في الوقت المناسب</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardContent className="p-6">
              <h2 className="text-white text-xl font-bold mb-4">إحصائياتك</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">الرصيد الحالي</p>
                  <p className="text-white text-xl font-bold">{spaceCoins.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">التذاكر المتاحة</p>
                  <p className="text-white text-xl font-bold">{availableTickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MinesSettings;