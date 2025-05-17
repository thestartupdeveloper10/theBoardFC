import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Search, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { PlayerStatForm } from './PlayerStatForm';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  player_number: number;
  position: string;
}

interface PlayerStat {
  id: string;
  player_id: string;
  season: string;
  matches_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
  updated_at: string;
}

export function PlayerStatsManagement() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(playerId || '');
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStat, setCurrentStat] = useState<PlayerStat | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('season');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load players and stats on component mount
  useEffect(() => {
    loadPlayers();
    loadSeasons();
    
    // If we have a player ID, either from params or state, load their stats
    if (selectedPlayerId) {
      loadPlayerDetails(selectedPlayerId);
      loadPlayerStats(selectedPlayerId);
    }
  }, [selectedPlayerId]);

  async function loadPlayers() {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, first_name, last_name, player_number, position')
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      setAllPlayers(data || []);
      
      // Set initial player selection if none exists
      if (!selectedPlayerId && data && data.length > 0) {
        setSelectedPlayerId(data[0].id);
      }
    } catch (error: any) {
      console.error('Error loading players:', error);
      toast({
        title: "Failed to load players",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function loadSeasons() {
    try {
      // Get unique seasons from player_stats
      const { data, error } = await supabase
        .from('player_stats')
        .select('season')
        .order('season', { ascending: false });
      
      if (error) throw error;
      
      // Extract unique seasons
      const uniqueSeasons = [...new Set(data?.map(item => item.season))];
      setSeasons(uniqueSeasons);
      
      // Set default selected season to the most recent one
      if (uniqueSeasons.length > 0 && !selectedSeason) {
        setSelectedSeason(uniqueSeasons[0]);
      }
    } catch (error: any) {
      console.error('Error loading seasons:', error);
    }
  }

  async function loadPlayerDetails(id: string) {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, first_name, last_name, player_number, position')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setPlayer(data);
    } catch (error: any) {
      console.error('Error loading player details:', error);
    }
  }

  async function loadPlayerStats(id: string) {
    setLoading(true);
    try {
      let query = supabase
        .from('player_stats')
        .select('*')
        .eq('player_id', id);
      
      // Apply season filter if selected and not "all"
      if (selectedSeason && selectedSeason !== 'all') {
        query = query.eq('season', selectedSeason);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Sort the data
      const sortedData = sortData(data || [], sortColumn, sortDirection);
      setPlayerStats(sortedData);
    } catch (error: any) {
      console.error('Error loading player stats:', error);
      toast({
        title: "Failed to load stats",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function sortData(data: PlayerStat[], column: string, direction: 'asc' | 'desc') {
    return [...data].sort((a, b) => {
      const valueA = a[column as keyof PlayerStat];
      const valueB = b[column as keyof PlayerStat];
      
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
    
    // Re-sort the data
    setPlayerStats(prev => sortData(prev, column, sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'));
  }

  function handleChangePlayer(id: string) {
    setSelectedPlayerId(id);
    // Update URL to reflect the selected player
    navigate(`/admin/players/${id}/stats`);
  }

  function handleChangeSeason(season: string) {
    setSelectedSeason(season);
    if (selectedPlayerId) {
      loadPlayerStats(selectedPlayerId);
    }
  }

  function handleEditStat(stat: PlayerStat) {
    setCurrentStat(stat);
    setIsEditDialogOpen(true);
  }

  function handleAddStat() {
    setIsAddDialogOpen(true);
  }

  // Check if the player has stats for the current season
  const hasStatsForCurrentSeason = playerStats.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Player Statistics</h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPlayerId} onValueChange={handleChangePlayer}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {allPlayers.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} {p.player_number ? `(#${p.player_number})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedSeason} onValueChange={handleChangeSeason}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {seasons.map(season => (
                <SelectItem key={season} value={season}>{season}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddStat}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Stats
          </Button>
        </div>
      </div>
      
      {player && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-xl font-semibold">
                {player.first_name} {player.last_name} 
                {player.player_number && <span className="ml-2 text-muted-foreground">#{player.player_number}</span>}
              </div>
              
              {player.position && (
                <Badge variant="outline" className="text-sm">
                  {player.position}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('season')}>
                  Season 
                  <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                </TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('matches_played')}>
                  Matches
                  <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                </TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('goals')}>
                  Goals
                  <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                </TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('assists')}>
                  Assists
                  <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                </TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('yellow_cards')}>
                  Yellow Cards
                  <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                </TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('red_cards')}>
                  Red Cards
                  <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                </TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('minutes_played')}>
                  Minutes
                  <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : playerStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No stats found for this player. Click "Add Stats" to add their first stats entry.
                  </TableCell>
                </TableRow>
              ) : (
                playerStats.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{stat.season}</TableCell>
                    <TableCell className="text-center">{stat.matches_played}</TableCell>
                    <TableCell className="text-center">{stat.goals}</TableCell>
                    <TableCell className="text-center">{stat.assists}</TableCell>
                    <TableCell className="text-center">{stat.yellow_cards}</TableCell>
                    <TableCell className="text-center">{stat.red_cards}</TableCell>
                    <TableCell className="text-center">{stat.minutes_played}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditStat(stat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Stats Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Stats for {player?.first_name} {player?.last_name}</DialogTitle>
          </DialogHeader>
          <PlayerStatForm 
            playerId={selectedPlayerId}
            onSuccess={() => {
              setIsAddDialogOpen(false);
              loadPlayerStats(selectedPlayerId);
              loadSeasons();
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Stats Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Stats for {player?.first_name} {player?.last_name}</DialogTitle>
          </DialogHeader>
          {currentStat && (
            <PlayerStatForm 
              playerId={selectedPlayerId}
              stat={currentStat}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                loadPlayerStats(selectedPlayerId);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 