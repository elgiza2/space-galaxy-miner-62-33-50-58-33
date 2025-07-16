
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceItem } from '@/data/morePageServices';

interface ServiceCardProps {
  service: ServiceItem;
  index: number;
  onServiceClick: (serviceId: string) => void;
}

const ServiceCard = ({ service, index, onServiceClick }: ServiceCardProps) => {
  const IconComponent = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card 
        className={`relative bg-gray-800/50 backdrop-blur-lg border border-gray-600/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-gray-500/50 ${service.shadow} hover:shadow-lg group`}
        onClick={() => onServiceClick(service.id)}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
        
        {/* Glowing Border Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300`} />
        
        <CardContent className="relative p-6 h-36 flex flex-col justify-center items-center text-center space-y-3">
          {/* Icon with gradient background */}
          <div className={`p-3 rounded-full bg-gradient-to-r ${service.gradient} shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          {/* Title */}
          <h3 className="text-white font-bold text-sm leading-tight">
            {service.title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-400 text-xs leading-tight opacity-80">
            {service.description}
          </p>
          
          {/* Hover Effect Arrow */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 border-r-2 border-b-2 border-white/60 transform rotate-[-45deg]"></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
