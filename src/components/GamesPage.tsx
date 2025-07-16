
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigation, Page } from '@/hooks/useNavigation';
import { Gamepad2, Trophy, Zap, Target, Dices, Coins, Candy, Play, Star, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GamesPage = () => {
  const { setCurrentPage } = useNavigation();

  const games = [
    {
      id: 'candy-slots',
      name: 'Candy Fortune Reels',
      description: 'لعبة سلوتس الحلوى مع نظام الكلاستر والمضاعفات الرائعة',
      icon: Candy,
      color: 'from-pink-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-pink-500/10 to-purple-600/10',
      borderColor: 'border-pink-500/20',
      buttonColor: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700',
      features: ['6x6 Grid', 'Cluster Pays', 'مضاعفات', 'دورات مجانية'],
      maxWin: '10,000x'
    },
    {
      id: 'slots',
      name: 'Be Rich Slots',
      description: 'لعبة القمار الكلاسيكية مع مكافآت ضخمة وفرص ربح مذهلة',
      icon: Coins,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-500/10 to-orange-600/10',
      borderColor: 'border-yellow-500/20',
      buttonColor: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
      features: ['5 Reels', 'Wild Symbols', 'جاكبوت', 'بونص جولات'],
      maxWin: '5,000x'
    },
    {
      id: 'mines',
      name: 'Space Mines',
      description: 'اكتشف الكنوز الفضائية وتجنب الألغام في مغامرة مثيرة',
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-gradient-to-br from-blue-500/10 to-cyan-600/10',
      borderColor: 'border-blue-500/20',
      buttonColor: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
      features: ['25 خانات', 'مضاعفات تلقائية', 'كاش آوت', 'استراتيجية'],
      maxWin: '2,500x'
    }
  ];

  const handleGameClick = (gameId: string) => {
    console.log('🎮 لعبة مختارة:', gameId);
    
    // التأكد من أن gameId صحيح
    const validGameIds = ['candy-slots', 'slots', 'mines'];
    if (validGameIds.includes(gameId)) {
      setCurrentPage(gameId as Page);
      console.log('✅ تم الانتقال إلى:', gameId);
    } else {
      console.error('❌ معرف اللعبة غير صحيح:', gameId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              صالة الألعاب
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            استمتع بأفضل الألعاب واربح مكافآت رائعة
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="space-y-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Card className={`${game.bgColor} ${game.borderColor} border-2 hover:border-opacity-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <game.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">{game.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm font-medium">Max: {game.maxWin}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Star className="w-5 h-5 text-yellow-400 mb-1" />
                      <div className="text-xs text-gray-400">HOT</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="text-gray-300 mb-4 text-sm leading-relaxed">
                    {game.description}
                  </CardDescription>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {game.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                        <Zap className="w-3 h-3 text-blue-400" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Play Button */}
                  <Button
                    onClick={() => handleGameClick(game.id)}
                    className={`w-full ${game.buttonColor} text-white font-medium py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group`}
                  >
                    <Play className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    العب الآن
                    <Gift className="w-4 h-4 ml-2 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 border-2">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dices className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                المزيد من الألعاب قريباً
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                ننتظر المزيد من الألعاب المثيرة والمكافآت الضخمة
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-400">
                <Star className="w-4 h-4" />
                <span className="text-sm">تحديثات أسبوعية</span>
                <Star className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 grid grid-cols-2 gap-4"
        >
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 border">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-blue-300 text-sm font-medium">أفضل لاعب</p>
              <p className="text-white text-lg font-bold">قريباً</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 border">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-purple-300 text-sm font-medium">ألعاب متاحة</p>
              <p className="text-white text-lg font-bold">{games.length}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default GamesPage;
