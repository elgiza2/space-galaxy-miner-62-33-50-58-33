
import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import BottomNavigation from '@/components/Navigation/BottomNavigation';
import MiningPage from '@/components/MiningPage';
import TasksPage from '@/components/TasksPage';
import SpaceAppsPage from '@/components/SpaceAppsPage';
import ReferralPage from '@/components/ReferralPage';
import TaskAdminPage from '@/components/TaskAdminPage';
import GamesPage from '@/components/GamesPage';
import SlotMachine from '@/components/SlotMachine';
import CandyFortuneReels from '@/components/CandyFortuneReels';
import ImprovedMinesPage from '@/components/ImprovedMinesPage';
import RewardPopup from '@/components/RewardPopup';

import MorePage from '@/components/MorePage';
import { useNavigation, Page } from '@/hooks/useNavigation';

const Index = () => {
  const {
    currentPage,
    setCurrentPage,
    showAdminAccess,
    handleTaskButtonClick
  } = useNavigation();

  const [showRewardPopup, setShowRewardPopup] = useState(false);

  useEffect(() => {
    // Show reward popup immediately when page loads
    setShowRewardPopup(true);
  }, []);

  const handleCloseRewardPopup = () => {
    setShowRewardPopup(false);
  };

  const handleSpaceNavigation = (page: string) => {
    setCurrentPage(page as Page);
  };

  const renderCurrentPage = () => {
    console.log('Current page:', currentPage);
    switch (currentPage) {
      case 'mining':
        return <MiningPage />;
      case 'tasks':
        return <TasksPage />;
      case 'games':
        return <GamesPage />;
      case 'space':
        return <MorePage onNavigate={handleSpaceNavigation} />;
      case 'space-apps':
        return <SpaceAppsPage />;
      case 'slots':
        return <SlotMachine />;
      case 'candy-slots':
        return <CandyFortuneReels />;
      case 'referral':
        return <ReferralPage />;
      case 'admin':
        return <TaskAdminPage />;
      case 'mines':
        return <ImprovedMinesPage />;
      default:
        return <MiningPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      <TopBar />
      
      <main>
        {renderCurrentPage()}
      </main>

      <BottomNavigation
        currentPage={currentPage}
        showAdminAccess={showAdminAccess}
        onPageChange={setCurrentPage}
        onTaskButtonClick={handleTaskButtonClick}
      />
      
      <RewardPopup
        isOpen={showRewardPopup}
        onClose={handleCloseRewardPopup}
        onNavigateToReferral={() => {
          setCurrentPage('referral');
          setShowRewardPopup(false);
        }}
      />
    </div>
  );
};

export default Index;
