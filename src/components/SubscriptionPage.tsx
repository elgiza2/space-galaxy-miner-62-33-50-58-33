
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle, Rocket } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useToast } from '@/hooks/use-toast';
import { formatTON } from '../utils/ton';

const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      price: 1.5,
      period: 'per month',
      icon: Crown,
      color: 'yellow',
      popular: true,
      features: [
        'Auto mining (3+ days)',
        'Fast speed (5x)',
        '+25% bonus points',
        'Exclusive backgrounds',
        'VIP badge',
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 3.0,
      period: 'per month',
      icon: Rocket,
      color: 'purple',
      features: [
        'Ultra-fast mining (10x)',
        'Unlimited auto mining',
        'Exclusive VIP tasks',
        'All backgrounds unlocked',
        '24/7 VIP support',
      ]
    }
  ];

  const handleSubscribe = async (planId: string, price: number) => {
    if (!tonConnectUI.wallet) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your TON wallet first',
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{
          address: 'UQCiVNm22dMF9S3YsHPcgrmqXEQHt4MIdk_N7VJu88NrLr4R',
          amount: (price * 1e9).toString()
        }]
      };

      await tonConnectUI.sendTransaction(transaction);
      setCurrentPlan(planId);
      localStorage.setItem('premiumPlan', planId);
      localStorage.setItem('premiumExpiry', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString());

      toast({
        title: 'Subscription Successful',
        description: `${planId.toUpperCase()} plan activated successfully!`
      });
    } catch (error) {
      console.error('Subscription payment failed:', error);
      toast({
        title: 'Payment Failed',
        description: 'Failed to process subscription payment',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-3 pb-24">
      <div className="max-w-md mx-auto space-y-4">
        {/* Compact Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full">
              <Crown className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-1">
            Premium
          </h1>
          <p className="text-zinc-50 text-sm">
            Unlock premium features and boost your mining
          </p>
        </div>

        {/* Compact Subscription Plans */}
        <div className="space-y-3">
          {plans.map(plan => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;
            return (
              <Card key={plan.id} className="bg-pink-900 relative">
                {plan.popular && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-black font-bold text-xs">
                    Popular
                  </Badge>
                )}
                
                {isCurrentPlan && (
                  <Badge className="absolute top-2 left-2 bg-green-500 text-white font-bold text-xs">
                    Current
                  </Badge>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    <div className={`p-2 rounded-full ${
                      plan.color === 'yellow' ? 'bg-yellow-500/20' : 'bg-purple-500/20'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg font-bold">
                    {plan.name}
                  </CardTitle>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-white">
                      {formatTON(plan.price)}
                    </span>
                    <span className="text-xs ml-2 text-zinc-50 font-bold">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-zinc-50 font-bold">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handleSubscribe(plan.id, plan.price)} 
                    disabled={isCurrentPlan || isProcessing} 
                    className={`w-full mt-4 ${
                      isCurrentPlan 
                        ? 'bg-green-600 hover:bg-green-600 cursor-default' 
                        : plan.popular 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                    } rounded-xl font-bold py-2 text-sm`}
                  >
                    {isProcessing 
                      ? 'Processing...' 
                      : isCurrentPlan 
                        ? 'Current Plan' 
                        : 'Subscribe Now'
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
