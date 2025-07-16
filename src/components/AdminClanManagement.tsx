
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, Plus, Trash2, Users, Crown, ExternalLink, Calendar } from 'lucide-react';
import { clanService, type Clan } from '@/services/clanService';
import CreateClanModal from './CreateClanModal';

const AdminClanManagement = () => {
  const [clans, setClans] = useState<Clan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadClans();
  }, []);

  const loadClans = async () => {
    setIsLoading(true);
    try {
      const clansData = await clanService.getAllClans();
      setClans(clansData);
    } catch (error) {
      console.error('Error loading clans:', error);
      toast({
        title: "Error Loading Clans",
        description: "An error occurred while loading the clans list",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClan = async (clanId: string, clanName: string) => {
    try {
      const success = await clanService.deleteClan(clanId);
      if (success) {
        toast({
          title: "Clan Deleted",
          description: `Clan "${clanName}" has been deleted successfully`,
        });
        loadClans();
      } else {
        throw new Error('Failed to delete clan');
      }
    } catch (error) {
      console.error('Error deleting clan:', error);
      toast({
        title: "Failed to Delete Clan",
        description: "An error occurred while deleting the clan",
        variant: "destructive"
      });
    }
  };

  const formatCoins = (coins: number) => {
    if (coins >= 1000000) {
      return `${(coins / 1000000).toFixed(1)}M`;
    } else if (coins >= 1000) {
      return `${(coins / 1000).toFixed(1)}K`;
    }
    return coins.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading clans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Clan Management</h2>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Clan
        </Button>
      </div>

      <div className="grid gap-4">
        {clans.length === 0 ? (
          <Card className="bg-white/5 border-gray-600">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">No clans yet</p>
            </CardContent>
          </Card>
        ) : (
          clans.map((clan) => (
            <Card key={clan.id} className="bg-white/5 border-gray-600 hover:bg-white/10 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Clan Image/Icon */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12 border-2 border-purple-500/50">
                      <AvatarImage src={clan.image || undefined} alt={clan.name} />
                      <AvatarFallback className="bg-purple-500/20 text-white">
                        {clan.icon || clan.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold">
                      #{clan.rank}
                    </Badge>
                  </div>

                  {/* Clan Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {clan.name}
                      </h3>
                      {clan.telegram_link && (
                        <a
                          href={clan.telegram_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      <span className="text-sm text-gray-400">Leader: {clan.leader}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{clan.member_count} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💰 {formatCoins(clan.total_coins)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(clan.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {clan.description && (
                      <p className="text-sm text-gray-400 mt-2 truncate">
                        {clan.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-red-500/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Confirm Clan Deletion
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete clan "{clan.name}"? 
                            This action cannot be undone and will also remove all clan members.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-gray-600 text-gray-300">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteClan(clan.id, clan.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Clan
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateClanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onClanCreated={loadClans}
      />
    </div>
  );
};

export default AdminClanManagement;
