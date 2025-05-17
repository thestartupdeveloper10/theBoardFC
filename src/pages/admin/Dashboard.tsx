import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlayersManagement } from './PlayersManagement';
import { MatchesManagement } from './MatchesManagement';
import { NewsManagement } from './NewsManagement';
import { TeamStatsManagement } from './TeamStatsManagement';
import { PlayerStatsManagement } from './PlayerStatsManagement';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get tab from URL query parameter or default to 'players'
  const activeTab = searchParams.get('tab') || 'players';
  
  // Sync URL parameter with valid tab values
  useEffect(() => {
    if (!['players', 'player_stats', 'matches', 'news', 'team_stats', 'settings'].includes(activeTab)) {
      setSearchParams({ tab: 'players' });
    }
  }, [activeTab]);
  
  // Render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'players':
        return <PlayersManagement />;
      case 'player_stats':
        return <PlayerStatsManagement />;
      case 'matches':
        return <MatchesManagement />;
      case 'news':
        return <NewsManagement />;
      case 'team_stats':
        return <TeamStatsManagement />;
      case 'settings':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Admin Settings</h2>
            <p className="text-muted-foreground">Settings management coming soon...</p>
          </div>
        );
      default:
        return <PlayersManagement />;
    }
  };
  
  // Map tab values to human-readable titles
  const getPageTitle = () => {
    const titles = {
      'players': 'Player Management',
      'player_stats': 'Player Statistics',
      'matches': 'Fixture Management',
      'news': 'News Management',
      'team_stats': 'Team Statistics',
      'settings': 'Admin Settings'
    };
    return titles[activeTab as keyof typeof titles] || 'Dashboard';
  };
  
  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
        <p className="text-muted-foreground">
          {activeTab === 'settings' 
            ? 'Configure system settings and preferences' 
            : 'Manage and update team information'}
        </p>
      </div>
      
      {renderContent()}
    </div>
  );
} 