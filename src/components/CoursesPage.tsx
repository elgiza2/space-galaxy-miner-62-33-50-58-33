
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useToast } from '@/hooks/use-toast';
import { formatTON } from '../utils/ton';

const CoursesPage = () => {
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [discountActive, setDiscountActive] = useState(true);

  // Prevent scrolling when component loads
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  // Initialize countdown timer
  useEffect(() => {
    const initializeCountdown = () => {
      const savedEndTime = localStorage.getItem('discountEndTime');
      let endTime;

      if (savedEndTime) {
        endTime = parseInt(savedEndTime);
      } else {
        // Set countdown to 72 hours from now
        endTime = Date.now() + (72 * 60 * 60 * 1000);
        localStorage.setItem('discountEndTime', endTime.toString());
      }

      const updateTimer = () => {
        const now = Date.now();
        const timeDiff = endTime - now;

        if (timeDiff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          setDiscountActive(false);
          localStorage.removeItem('discountEndTime');
          return;
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
        setDiscountActive(true);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return interval;
    };

    const interval = initializeCountdown();
    return () => clearInterval(interval);
  }, []);

  const handlePurchase = async () => {
    if (!tonConnectUI.wallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your TON wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const priceInTON = 1; // Fixed price of 1 TON
      
      // Simple transaction without any payload or comment to prevent format errors
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{
          address: 'UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R',
          amount: (priceInTON * 1000000000).toString(),
        }]
      };

      console.log(`Sending simple TON transaction for ${priceInTON} TON:`, transaction);
      await tonConnectUI.sendTransaction(transaction);
      
      localStorage.setItem('millionaireCourse', 'purchased');
      localStorage.setItem('coursePurchaseDate', Date.now().toString());

      toast({
        title: "Purchase Successful!",
        description: "Welcome to the Millionaire Program. You'll get full access soon."
      });
    } catch (error) {
      console.error('Course purchase failed:', error);
      toast({
        title: "Payment Failed",
        description: "Transaction was rejected or cancelled",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const courseFeatures = [
    "Make Money Online",
    "Develop the Right Mindset", 
    "Social Skills & Confidence",
    "Fitness & Masculinity",
    "Business & Time Management"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-2 pb-20">
      <div className="max-w-xs mx-auto space-y-3">
        {/* Header */}
        <div className="text-center pt-3 pb-2">
          <h1 className="text-lg font-bold text-white mb-1">
            Become a Member
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto"></div>
        </div>

        {/* Main Course Card */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
          <CardHeader className="text-center pb-2 p-3">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Millionaire
              </h2>
              
              {/* Price Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    1 TON
                  </span>
                  <span className="text-gray-600 text-sm">/month</span>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <Button 
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 text-sm rounded-full mb-2"
            >
              {isProcessing ? 'Processing...' : 'Join Now'}
            </Button>

            {/* Question */}
            <p className="text-gray-700 text-sm font-medium">
              Are you ready to become a millionaire?
            </p>
          </CardHeader>

          <CardContent className="space-y-2 p-3 pt-0">
            {/* Course Features */}
            <div className="space-y-1.5">
              {courseFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-black rounded-full flex-shrink-0"></div>
                  <span className="text-gray-800 font-medium text-xs">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoursesPage;
