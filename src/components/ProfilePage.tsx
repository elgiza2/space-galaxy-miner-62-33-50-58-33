
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSpaceCoins } from '@/hooks/useSpaceCoins';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { 
  User, 
  Wallet,
  Star,
  Shield,
  Calendar,
  FileText
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const { spaceCoins } = useSpaceCoins();
  const { telegramUser, userProfile } = useTelegramUser();
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    if (userProfile?.first_name) {
      setDisplayName(userProfile.first_name);
    } else if (telegramUser?.first_name) {
      setDisplayName(telegramUser.first_name);
    }
  }, [userProfile, telegramUser]);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='5' cy='5' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative z-10 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8 pt-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                My Profile
              </h1>
            </div>
            <p className="text-white/60 text-sm">
              Manage your account information
            </p>
          </div>

          {/* Main Profile Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="relative mb-4">
                <Avatar className="w-20 h-20 mx-auto border-2 border-white/20 shadow-2xl ring-2 ring-white/10">
                  <AvatarImage 
                    src={telegramUser?.photo_url} 
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-white/10 backdrop-blur-md text-white text-xl font-bold border border-white/20">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{displayName}</h2>
                <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
                  <span>@{telegramUser?.username || 'user'}</span>
                  {telegramUser?.is_premium && (
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  )}
                </div>
              </div>
            </div>

            {/* Balance Section */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <img 
                  src="/lovable-uploads/a56963aa-9f88-44b8-9aff-3b5e9e4c7a60.png" 
                  alt="Space Coin" 
                  className="w-5 h-5 rounded-full" 
                />
                <span className="text-white/80 font-semibold">$SPACE Balance</span>
              </div>
              <div className="text-3xl font-bold text-white text-center mb-2">
                {new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(spaceCoins)}
              </div>
              <p className="text-white/60 text-xs text-center">Your Current Balance</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Account Info</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-white/70 font-medium text-sm">User ID:</span>
                <span className="text-white font-mono text-sm bg-white/10 px-2 py-1 rounded-md">
                  {telegramUser?.id || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-white/70 font-medium text-sm">Username:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">
                    @{telegramUser?.username || 'Not set'}
                  </span>
                  {telegramUser?.is_premium && (
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                <span className="text-white/70 font-medium text-sm">Language:</span>
                <span className="text-white font-medium bg-white/10 px-2 py-1 rounded-md text-sm">
                  {telegramUser?.language_code?.toUpperCase() || 'EN'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/70" />
                  <span className="text-white/70 font-medium text-sm">Member Since:</span>
                </div>
                <span className="text-white font-medium text-sm">
                  {userProfile?.created_at 
                    ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Recently'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* TON Wallet */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">TON Wallet</h3>
            </div>
            
            {tonConnectUI.wallet ? (
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold mb-2 text-sm">Wallet Connected</p>
                    <p className="text-white/70 text-xs font-mono bg-white/10 px-3 py-2 rounded-lg">
                      {tonConnectUI.wallet.account.address.slice(0, 6)}...
                      {tonConnectUI.wallet.account.address.slice(-4)}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                    Active
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white/70 font-medium text-sm">No wallet connected</p>
                    <p className="text-white/50 text-xs">Connect to access features</p>
                  </div>
                  <Button
                    onClick={() => tonConnectUI.openModal()}
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-lg"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Terms of Use */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-3 shadow-lg backdrop-blur-md border border-white/20 py-3">
                  <FileText className="w-5 h-5" />
                  Terms of Use
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    📄 Terms of Use – SPACE Mining Mini App
                  </DialogTitle>
                </DialogHeader>
                <div className="text-white/80 text-sm space-y-4">
                  <p>Welcome to the official mining bot for the SPACE token.</p>
                  <p>Please read the following terms carefully before using this bot.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-white font-bold mb-2">1. Service Description</h3>
                      <p>This bot provides an interactive experience within Telegram, allowing users to mine the SPACE token through cloud mining, daily activities, and referrals.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold mb-2">2. Token Listing Soon</h3>
                      <p>The SPACE token is currently in preparation for listing on official exchange platforms. However, it is not yet available for trading, withdrawal, or financial conversion at this time.</p>
                      <div className="bg-yellow-900/30 backdrop-blur-md border border-yellow-600/50 rounded-lg p-3 mt-2">
                        <p className="text-yellow-300 text-xs">⚠️ Disclaimer: Until the official listing announcement, all in-app token activities are for engagement and community participation only, and do not reflect actual financial value.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold mb-2">3. No Financial Promises</h3>
                      <p>We do not guarantee any financial return or future value for the SPACE token. The token's future utility and price will be determined by market conditions once listed.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold mb-2">4. Fair Use Policy</h3>
                      <p>Users are strictly prohibited from:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Using bots, scripts, emulators, or any automated tools.</li>
                        <li>Exploiting bugs or abusing the system.</li>
                      </ul>
                      <p className="mt-2">Any violation will result in permanent suspension of the account.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold mb-2">5. User Data</h3>
                      <p>We only collect basic public Telegram data including:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Username</li>
                        <li>Telegram ID</li>
                        <li>Preferred language</li>
                      </ul>
                      <p className="mt-2">We do not sell or share user data with third parties.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold mb-2">6. Changes & Updates</h3>
                      <p>We reserve the right to modify the mining mechanics, reward structure, or these Terms of Use at any time. Users will be notified of any major changes via in-app announcements or our official Telegram channel.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold mb-2">7. Disclaimer of Liability</h3>
                      <p>This application is developed and maintained by an independent team. It is not affiliated with Telegram or any cryptocurrency exchange. All current mining features are for entertainment and community engagement only, until further updates.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold mb-2">8. Support & Contact</h3>
                      <p>For inquiries or support, please reach out through our official Telegram channel:</p>
                      <p className="text-blue-400 font-mono mt-1">📢 @spaceaico</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Bottom spacing */}
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
