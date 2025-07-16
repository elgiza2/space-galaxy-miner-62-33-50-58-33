
import React from 'react';
import { motion } from 'framer-motion';
import { morePageServices } from '@/data/morePageServices';
import ServiceCard from './ServiceCard';

interface MorePageProps {
  onNavigate: (page: string) => void;
}

const MorePage = ({ onNavigate }: MorePageProps) => {
  const handleServiceClick = (serviceId: string) => {
    onNavigate(serviceId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-8 pb-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Giveaways
            </h1>
            <p className="text-gray-400 text-sm">
              Complete tasks and earn rewards
            </p>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="flex-1 px-4 pb-8">
          <div className="max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {morePageServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="glass-card hover:bg-white/15 transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={() => handleServiceClick(service.id)}
                >
                  <ServiceCard 
                    service={service}
                    index={index}
                    onServiceClick={handleServiceClick}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorePage;
