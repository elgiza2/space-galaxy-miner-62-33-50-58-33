
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TicketShopPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto pt-16">
        <Card className="bg-black/40 border border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-center">Ticket Shop</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🎫</div>
            <p className="text-gray-400">Ticket shop coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketShopPage;
