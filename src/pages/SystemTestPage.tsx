
import React from 'react';
import ReferralSystemTester from '@/components/ReferralSystemTester';
import ReferralActivationDashboard from '@/components/ReferralActivationDashboard';

const SystemTestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-2">
            نظام الإحالة - التفعيل والاختبار
          </h1>
          <p className="text-gray-300">
            لوحة تحكم شاملة لتفعيل واختبار نظام الإحالة مع Telegram Bot
          </p>
        </div>

        {/* Activation Dashboard */}
        <div className="mb-8">
          <ReferralActivationDashboard />
        </div>

        {/* System Tester */}
        <div>
          <ReferralSystemTester />
        </div>

      </div>
    </div>
  );
};

export default SystemTestPage;
