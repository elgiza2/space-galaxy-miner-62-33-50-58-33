import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Download, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { spaceAppsService } from '@/services/spaceAppsService';
import { useToast } from '@/hooks/use-toast';
interface SpaceApp {
  id: string;
  name: string;
  description: string;
  image_url: string;
  app_url: string;
  category: string;
  is_active: boolean;
  created_at: string;
}
const SpaceAppsPage = () => {
  const [apps, setApps] = useState<SpaceApp[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadApps();
  }, []);
  const loadApps = async () => {
    try {
      setLoading(true);
      const appsData = await spaceAppsService.getActiveApps();
      setApps(appsData);
    } catch (error) {
      console.error('Error loading apps:', error);
      toast({
        title: "Error",
        description: "Failed to load apps",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAppClick = (appUrl: string) => {
    window.open(appUrl, '_blank');
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" animate={{
        y: [0, -20, 0],
        x: [0, 15, 0],
        scale: [1, 1.2, 1]
      }} transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
        <motion.div className="absolute bottom-20 right-8 w-24 h-24 bg-purple-600/15 rounded-full blur-2xl" animate={{
        y: [0, 20, 0],
        x: [0, -10, 0]
      }} transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      }} />
      </div>

      <div className="relative z-10 p-4 pt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Featured Apps</h1>
        </div>

        {/* Loading State */}
        {loading && <div className="flex justify-center items-center h-64">
            <motion.div animate={{
          rotate: 360
        }} transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }} className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full" />
          </div>}

        {/* Apps Grid */}
        {!loading && <div className="max-w-6xl mx-auto">
            {apps.length === 0 ? <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="text-center py-16">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Apps Available</h3>
                <p className="text-gray-400">New apps will be added soon</p>
              </motion.div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {apps.map((app, index) => <motion.div key={app.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }} whileHover={{
            scale: 1.05
          }} className="cursor-pointer" onClick={() => handleAppClick(app.app_url)}>
                    <Card className="bg-gradient-to-br from-blue-800/30 to-purple-700/30 backdrop-blur-xl border border-blue-600/30 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300">
                      {/* App Image */}
                      <div className="aspect-square w-full overflow-hidden">
                        <img src={app.image_url} alt={app.name} className="w-full h-full object-cover" />
                      </div>

                      <CardContent className="p-3">
                        {/* App Name */}
                        <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">
                          {app.name}
                        </h3>

                        {/* Description */}
                        {app.description && (
                          <p className="text-xs text-gray-300 line-clamp-2 mt-1">
                            {app.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>)}
              </div>}
          </div>}
      </div>
    </div>;
};
export default SpaceAppsPage;