import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  usePlayer, 
  usePlayerStats,
  useTeamStats
} from '@/services/queries';
import { 
  ArrowLeft, 
  Calendar, 
  Trophy, 
  Clock, 
  Shield, 
  User, 
  Flag, 
  Target, 
  Ruler, 
  Weight,
  Award
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useSeasons } from '@/services/queries';

// Colors by position for consistent styling with Team page
const positionColors = {
  Goalkeeper: {
    primary: 'from-yellow-500 to-orange-500',
    secondary: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-500',
    gradient: 'yellow-500'
  },
  Defender: {
    primary: 'from-blue-500 to-cyan-500',
    secondary: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-500',
    gradient: 'blue-500'
  },
  Midfielder: {
    primary: 'from-green-500 to-emerald-500',
    secondary: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-500',
    gradient: 'green-500'
  },
  Forward: {
    primary: 'from-red-500 to-rose-500',
    secondary: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-500',
    gradient: 'red-500'
  }
};

// Stat card with animated progression
const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  max = 100 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 5), 100);
  
  return (
    <Card className={`p-4 relative overflow-hidden ${color.border}`}>
      <div className="flex items-center gap-3 z-10 relative">
        <div className={`${color.secondary} p-3 rounded-lg`}>
          <Icon className={`h-5 w-5 ${color.text}`} />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
      
      {/* Progress background */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`absolute left-0 bottom-0 h-1 bg-gradient-to-r ${color.primary}`}
      />
    </Card>
  );
};

// Chart component for season comparison
const StatChart = ({ data, statKey, label, color }) => {
  // Sort data by season
  const sortedData = [...data].sort((a, b) => a.season.localeCompare(b.season));
  const maxValue = Math.max(...sortedData.map(s => s[statKey] || 0)) || 1;
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{label} by Season</h3>
      <div className="h-[160px] flex items-end gap-2">
        {sortedData.map((stat, index) => {
          const value = stat[statKey] || 0;
          const heightPercentage = (value / maxValue) * 100;
          
          return (
            <div key={stat.id} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-center">{value}</div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`w-full bg-gradient-to-t from-${color.gradient} to-${color.gradient}/60 rounded-t-md`}
              />
              <div className="text-xs text-muted-foreground truncate w-full text-center">
                {stat.season.split('-')[0]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function PlayerStats() {
  const { playerId } = useParams();
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  
  // Fetch player data and stats using TanStack Query
  const { data: player, isLoading: playerLoading } = usePlayer(playerId || '');
  const { data: playerStats = [], isLoading: statsLoading } = usePlayerStats(playerId || '', selectedSeason);
  const { data: seasons = [], isLoading: seasonsLoading } = useSeasons();
  
  // Add teamStats query for goalkeepers to fetch clean sheets
  const { data: teamStats = [], isLoading: teamStatsLoading } = useTeamStats();
  
  // Get most recent stats for current season display
  const currentStats = playerStats?.length > 0 ? playerStats[0] : null;
  
  // Get team clean sheets for goalkeepers
  const cleanSheets = player?.position === 'Goalkeeper' && teamStats.length > 0 
    ? teamStats[0].clean_sheets || 0 
    : null;
  
  // Calculate age if birth date available
  const age = player?.birth_date 
    ? Math.floor((new Date().getTime() - new Date(player.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
    : null;
  
  // Get position-specific styling
  const positionStyle = player?.position 
    ? positionColors[player.position as keyof typeof positionColors] || positionColors.Midfielder
    : positionColors.Midfielder;
  
  const isLoading = playerLoading || statsLoading || (player?.position === 'Goalkeeper' && teamStatsLoading);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!player) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Player Not Found</h1>
        <p className="mb-8">Sorry, we couldn't find the player you're looking for.</p>
        <Link to="/team" className="text-blue-600 hover:underline">
          Return to Team Page
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section with Player Info */}
      <div className="relative mb-12">
        {/* Background gradient */}
        <div className={`absolute inset-x-0 top-0 h-64 bg-gradient-to-r ${positionStyle.primary} opacity-80 rounded-xl`} />
        
        {/* Back button */}
        <div className="relative z-10 mb-8 pt-6">
          <Button 
            variant="ghost" 
            className="bg-background/80 backdrop-blur-sm" 
            asChild
          >
            <Link to="/team">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team
            </Link>
          </Button>
        </div>
        
        {/* Player info grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Image and basic info */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative mb-6"
            >
              <div className={`absolute inset-0 rounded-full ${positionStyle.secondary} -m-3 animate-pulse`} />
              <Avatar className="w-48 h-48 border-4 border-background">
                {player.profile_image_url ? (
                  <AvatarImage 
                    src={player.profile_image_url} 
                    alt={`${player.first_name} ${player.last_name}`} 
                    className="object-cover object-top h-full w-full"
                  />
                ) : (
                  <AvatarFallback className="bg-muted-foreground/10 text-4xl">
                    {player.first_name[0]}{player.last_name[0]}
                  </AvatarFallback>
                )}
              </Avatar>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="bg-background/90 backdrop-blur-sm text-4xl font-bold rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                {player.player_number || "?"}
              </div>
              
              <h1 className="text-3xl font-bold">
                {player.first_name} {player.last_name}
              </h1>
              
              <div className={`${positionStyle.text} font-medium text-xl mb-2`}>
                {player.position}
              </div>
              
              <Badge 
                variant={player.status === 'active' ? 'default' : 'destructive'}
                className="uppercase text-xs font-bold"
              >
                {player.status}
              </Badge>
            </motion.div>
          </div>
          
          {/* Middle column - Physical details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4 flex flex-col justify-center"
          >
            <div className={`p-4 rounded-lg bg-gradient-to-r ${positionStyle.secondary} backdrop-blur-sm`}>
            <h2 className="text-xl font-bold text-center">Player Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Birth Date</div>
                  <div className="font-medium">
                    {player.birth_date 
                      ? format(new Date(player.birth_date), 'MMMM d, yyyy') 
                      : 'Not available'}
                  </div>
                  {age && <div className="text-sm text-muted-foreground">Age: {age} years</div>}
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Joined Club</div>
                  <div className="font-medium">
                    {player.joined_date 
                      ? format(new Date(player.joined_date), 'MMMM d, yyyy') 
                      : 'Not available'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Ruler className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Height</div>
                  <div className="font-medium">{player.height || 'Not available'} cm</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Weight className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Weight</div>
                  <div className="font-medium">{player.weight || 'Not available'} kg</div>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
          
          {/* Right column - Biography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold">Biography</h2>
            <div className="prose dark:prose-invert max-w-none">
              {player.bio ? (
                <p>{player.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">No biography available for this player.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold"
          >
            Player Statistics
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Select 
              value={selectedSeason} 
              onValueChange={setSelectedSeason}
              disabled={seasonsLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {seasons.map(season => (
                  <SelectItem key={season} value={season}>{season}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="history">Season History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {/* Basic Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatCard 
                  label="Matches Played" 
                  value={currentStats?.matches_played || 0} 
                  icon={User} 
                  color={positionStyle}
                  max={38} 
                />
              </motion.div>
              
              {/* For goalkeepers, show clean sheets instead of goals */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {player?.position === 'Goalkeeper' ? (
                  <StatCard 
                    label="Clean Sheets" 
                    value={cleanSheets || 0} 
                    icon={Shield} 
                    color={positionStyle}
                    max={20} 
                  />
                ) : (
                  <StatCard 
                    label="Goals" 
                    value={currentStats?.goals || 0} 
                    icon={Trophy} 
                    color={positionStyle}
                    max={player?.position === 'Forward' ? 30 : player?.position === 'Midfielder' ? 15 : 5} 
                  />
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StatCard 
                  label="Assists" 
                  value={currentStats?.assists || 0} 
                  icon={Target} 
                  color={positionStyle}
                  max={player.position === 'Forward' ? 20 : player.position === 'Midfielder' ? 20 : 10} 
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <StatCard 
                  label="Minutes Played" 
                  value={currentStats?.minutes_played || 0} 
                  icon={Clock} 
                  color={positionStyle}
                  max={3420} 
                />
              </motion.div>
            </div>
            
            {/* Charts - Adjust for goalkeepers */}
            {playerStats.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {player?.position === 'Goalkeeper' ? (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Team Performance with {player.first_name}</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Shield className={positionStyle.text} />
                        <span>Team Clean Sheets</span>
                      </div>
                      <span className="font-bold text-xl">{cleanSheets || 0}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mt-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((cleanSheets || 0) / 20) * 100, 100)}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full bg-gradient-to-r ${positionStyle.primary}`}
                      />
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <StatChart 
                      data={playerStats} 
                      statKey="goals" 
                      label="Goals" 
                      color={positionStyle} 
                    />
                  </Card>
                )}
                
                <Card className="p-6">
                  <StatChart 
                    data={playerStats} 
                    statKey="assists" 
                    label="Assists" 
                    color={positionStyle} 
                  />
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Discipline */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Discipline</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-6 bg-yellow-400"></div>
                      <span>Yellow Cards</span>
                    </div>
                    <span className="font-bold">{currentStats?.yellow_cards || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-6 bg-red-500"></div>
                      <span>Red Cards</span>
                    </div>
                    <span className="font-bold">{currentStats?.red_cards || 0}</span>
                  </div>
                  
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentStats?.yellow_cards || 0) * 10, 100)}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                </div>
              </Card>
              
              {/* Playing Time */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Playing Time</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Minutes Played</span>
                      <span className="font-bold">{currentStats?.minutes_played || 0}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((currentStats?.minutes_played || 0) / 3420) * 100, 100)}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full bg-gradient-to-r ${positionStyle.primary}`}
                      />
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {Math.round(((currentStats?.minutes_played || 0) / 3420) * 100)}% of maximum
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Matches Played</span>
                      <span className="font-bold">{currentStats?.matches_played || 0}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((currentStats?.matches_played || 0) / 38) * 100, 100)}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full bg-gradient-to-r ${positionStyle.primary}`}
                      />
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {Math.round(((currentStats?.matches_played || 0) / 38) * 100)}% of matches
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Season</th>
                    <th className="p-3 text-center">Matches</th>
                    <th className="p-3 text-center">Goals</th>
                    <th className="p-3 text-center">Assists</th>
                    <th className="p-3 text-center">Yellow Cards</th>
                    <th className="p-3 text-center">Red Cards</th>
                    <th className="p-3 text-center">Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStats.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground">
                        No statistics available for this player
                      </td>
                    </tr>
                  ) : (
                    playerStats.map((stat, index) => (
                      <motion.tr
                        key={stat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="border-b border-border hover:bg-muted/30"
                      >
                        <td className="p-3 font-medium">{stat.season}</td>
                        <td className="p-3 text-center">{stat.matches_played}</td>
                        <td className="p-3 text-center">{stat.goals}</td>
                        <td className="p-3 text-center">{stat.assists}</td>
                        <td className="p-3 text-center">{stat.yellow_cards}</td>
                        <td className="p-3 text-center">{stat.red_cards}</td>
                        <td className="p-3 text-center">{stat.minutes_played}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
                {playerStats.length > 0 && (
                  <tfoot className="bg-muted/30 font-medium">
                    <tr>
                      <td className="p-3">Career Total</td>
                      <td className="p-3 text-center">
                        {playerStats.reduce((sum, stat) => sum + (stat.matches_played || 0), 0)}
                      </td>
                      <td className="p-3 text-center">
                        {playerStats.reduce((sum, stat) => sum + (stat.goals || 0), 0)}
                      </td>
                      <td className="p-3 text-center">
                        {playerStats.reduce((sum, stat) => sum + (stat.assists || 0), 0)}
                      </td>
                      <td className="p-3 text-center">
                        {playerStats.reduce((sum, stat) => sum + (stat.yellow_cards || 0), 0)}
                      </td>
                      <td className="p-3 text-center">
                        {playerStats.reduce((sum, stat) => sum + (stat.red_cards || 0), 0)}
                      </td>
                      <td className="p-3 text-center">
                        {playerStats.reduce((sum, stat) => sum + (stat.minutes_played || 0), 0)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 