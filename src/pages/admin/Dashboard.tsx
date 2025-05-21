import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlayersManagement } from './PlayersManagement';
import { MatchesManagement } from './MatchesManagement';
import { NewsManagement } from './NewsManagement';
import { TeamStatsManagement } from './TeamStatsManagement';
import { PlayerStatsManagement } from './PlayerStatsManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Users, Calendar, FileText, BarChart2, Settings, MessageSquare } from 'lucide-react';
import { ContactList } from './ContactList';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get tab from URL query parameter or default to 'players'
  const activeTab = searchParams.get('tab') || 'players';
  
  // Sync URL parameter with valid tab values
  useEffect(() => {
    if (!['players', 'player_stats', 'matches', 'news', 'team_stats', 'settings', 'contacts'].includes(activeTab)) {
      setSearchParams({ tab: 'players' });
    }
  }, [activeTab]);
  
  // Set tab in URL when tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  
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
      case 'contacts':
        return <ContactList />;
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
  
  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 h-full md:h-auto md:grid-cols-6 mb-4 md:mb-8">
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Players</span>
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Fixtures</span>
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>News</span>
          </TabsTrigger>
          <TabsTrigger value="team_stats" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Stats</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="players">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="matches">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="news">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="team_stats">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="contacts">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="settings">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
} 