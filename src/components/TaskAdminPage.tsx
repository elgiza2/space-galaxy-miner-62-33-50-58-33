import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, FileText, Webhook, Shield, Gift, Activity, CalendarDays, Zap, Smartphone } from 'lucide-react';
import SimplifiedTaskAdminDashboard from './SimplifiedTaskAdminDashboard';
import AdminClanManagement from './AdminClanManagement';
import ReferralActivationDashboard from './ReferralActivationDashboard';
import AdminGiveawayManagement from './AdminGiveawayManagement';
import NewZoneManagement from './NewZoneManagement';
import AdminPasswordProtection from './AdminPasswordProtection';
import AdvancedTaskManagement from './AdvancedTaskManagement';
import AdminSpaceAppsManagement from './AdminSpaceAppsManagement';


const TaskAdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AdminPasswordProtection>
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-white/10 to-gray-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-gray-400/10 to-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-gray-300/10 to-white/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl mb-4">
            <Settings className="w-8 h-8 text-white/80" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            مركز التحكم الإداري
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Comprehensive system management with simplified interface and advanced tools
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 data-[state=active]:bg-black/40 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 rounded-xl transition-all duration-300 hover:bg-black/30 text-gray-300"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">الرئيسية</span>
              </TabsTrigger>
              <TabsTrigger 
                value="webhook" 
                className="flex items-center gap-2 data-[state=active]:bg-black/40 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 rounded-xl transition-all duration-300 hover:bg-black/30 text-gray-300"
              >
                <Webhook className="w-4 h-4" />
                <span className="hidden sm:inline">الإحالات</span>
              </TabsTrigger>
              <TabsTrigger 
                value="clans" 
                className="flex items-center gap-2 data-[state=active]:bg-black/40 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 rounded-xl transition-all duration-300 hover:bg-black/30 text-gray-300"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">العشائر</span>
              </TabsTrigger>
              <TabsTrigger 
                value="giveaways" 
                className="flex items-center gap-2 data-[state=active]:bg-black/40 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 rounded-xl transition-all duration-300 hover:bg-black/30 text-gray-300"
              >
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">الجوائز</span>
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="flex items-center gap-2 data-[state=active]:bg-black/40 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 rounded-xl transition-all duration-300 hover:bg-black/30 text-gray-300"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">الأحداث</span>
              </TabsTrigger>
              <TabsTrigger 
                value="newzone" 
                className="flex items-center gap-2 data-[state=active]:bg-black/40 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 rounded-xl transition-all duration-300 hover:bg-black/30 text-gray-300"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">New Zone</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex items-center gap-2 data-[state=active]:bg-black/40 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 rounded-xl transition-all duration-300 hover:bg-black/30 text-gray-300"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Tasks</span>
              </TabsTrigger>
              <TabsTrigger 
                value="spaceapps" 
                className="flex items-center gap-2 data-[state=active]:bg-black/40 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-white/20 rounded-xl transition-all duration-300 hover:bg-black/30 text-gray-300"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Apps</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <SimplifiedTaskAdminDashboard />
          </TabsContent>

          {/* Referral Management Tab */}
          <TabsContent value="webhook" className="space-y-6">
            <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">
              <CardHeader className="bg-black/20 rounded-t-2xl border-b border-white/10">
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-2 bg-black/20 rounded-xl">
                    <Webhook className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-xl">Referral System Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ReferralActivationDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clans Management Tab */}
          <TabsContent value="clans" className="space-y-6">
            <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">
              <CardHeader className="bg-black/20 rounded-t-2xl border-b border-white/10">
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-2 bg-black/20 rounded-xl">
                    <Shield className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-xl">Clan Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <AdminClanManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Giveaways Management Tab */}
          <TabsContent value="giveaways" className="space-y-6">
            <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">
              <CardHeader className="bg-black/20 rounded-t-2xl border-b border-white/10">
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-2 bg-black/20 rounded-xl">
                    <Gift className="w-5 h-5 text-pink-400" />
                  </div>
                  <span className="text-xl">Giveaway Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <AdminGiveawayManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Zone Management Tab */}
          <TabsContent value="newzone" className="space-y-6">
            <NewZoneManagement />
          </TabsContent>

          {/* Advanced Tasks Management Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <AdvancedTaskManagement />
          </TabsContent>

          {/* Space Apps Management Tab */}
          <TabsContent value="spaceapps" className="space-y-6">
            <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">
              <CardHeader className="bg-black/20 rounded-t-2xl border-b border-white/10">
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-2 bg-black/20 rounded-xl">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xl">Space Apps Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <AdminSpaceAppsManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AdminPasswordProtection>
  );
};

export default TaskAdminPage;
