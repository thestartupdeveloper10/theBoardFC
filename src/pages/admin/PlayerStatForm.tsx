import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

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
}

interface PlayerStatFormProps {
  playerId: string;
  stat?: PlayerStat;
  onSuccess: () => void;
}

export function PlayerStatForm({ playerId, stat, onSuccess }: PlayerStatFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [season, setSeason] = useState(stat?.season || '');
  const [matchesPlayed, setMatchesPlayed] = useState(stat?.matches_played?.toString() || '0');
  const [goals, setGoals] = useState(stat?.goals?.toString() || '0');
  const [assists, setAssists] = useState(stat?.assists?.toString() || '0');
  const [yellowCards, setYellowCards] = useState(stat?.yellow_cards?.toString() || '0');
  const [redCards, setRedCards] = useState(stat?.red_cards?.toString() || '0');
  // Remove minutesPlayed state
  
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);
  const [usedSeasons, setUsedSeasons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!stat;
  
  // Generate current and past seasons for dropdown
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const seasons = [];
    
    // Add 5 past seasons and 1 future season
    for (let i = -5; i <= 1; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      seasons.push(`${startYear}-${endYear}`);
    }
    
    setAvailableSeasons(seasons);
    
    // Set default season if creating new
    if (!isEditing) {
      setSeason(`${currentYear}-${currentYear + 1}`);
    }
    
    // Load seasons already used by this player
    loadUsedSeasons();
  }, []);
  
  async function loadUsedSeasons() {
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('season')
        .eq('player_id', playerId);
      
      if (error) throw error;
      
      // Exclude current season if editing
      const usedSeasonsArray = data
        .map(s => s.season)
        .filter(s => !isEditing || s !== stat?.season);
        
      setUsedSeasons(usedSeasonsArray);
    } catch (err: any) {
      console.error('Error loading used seasons:', err);
    }
  }
  
  // Calculate minutesPlayed dynamically
  const minutesPlayed = (parseInt(matchesPlayed, 10) || 0) * 90;
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const statData = {
        player_id: playerId,
        season,
        matches_played: parseInt(matchesPlayed, 10) || 0,
        goals: parseInt(goals, 10) || 0,
        assists: parseInt(assists, 10) || 0,
        yellow_cards: parseInt(yellowCards, 10) || 0,
        red_cards: parseInt(redCards, 10) || 0,
        minutes_played: minutesPlayed, // use calculated value
        updated_at: new Date().toISOString(),
        ...(isEditing ? {} : { created_by: user?.id })
      };
      
      if (isEditing) {
        // Update existing stat
        const { error: updateError } = await supabase
          .from('player_stats')
          .update(statData)
          .eq('id', stat.id);
          
        if (updateError) throw updateError;
        
        toast({
          title: "Stats updated",
          description: "Player statistics have been updated successfully.",
        });
      } else {
        // Check if this season already exists for the player
        const { data: existingData, error: checkError } = await supabase
          .from('player_stats')
          .select('id')
          .eq('player_id', playerId)
          .eq('season', season)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') {
          // This is an error other than "no rows returned"
          throw checkError;
        }
        
        if (existingData) {
          setError(`Statistics for the ${season} season already exist for this player.`);
          setIsLoading(false);
          return;
        }
        
        // Create new stat
        const { error: insertError } = await supabase
          .from('player_stats')
          .insert(statData);
          
        if (insertError) throw insertError;
        
        toast({
          title: "Stats added",
          description: `Statistics for the ${season} season have been added.`,
        });
      }
      
      onSuccess();
    } catch (err: any) {
      console.error('Error saving player stats:', err);
      setError(err.message || 'An error occurred while saving the stats.');
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="season">Season</Label>
          <Select 
            value={season} 
            onValueChange={setSeason} 
            disabled={isEditing}
          >
            <SelectTrigger id="season">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {availableSeasons.map(s => (
                <SelectItem 
                  key={s} 
                  value={s}
                  disabled={usedSeasons.includes(s)}
                >
                  {s} {usedSeasons.includes(s) && '(already exists)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isEditing && (
            <p className="text-sm text-muted-foreground">Season cannot be changed after creation</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="matchesPlayed">Matches Played</Label>
            <Input
              id="matchesPlayed"
              type="number"
              min="0"
              value={matchesPlayed}
              onChange={(e) => setMatchesPlayed(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Input
              id="goals"
              type="number"
              min="0"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assists">Assists</Label>
            <Input
              id="assists"
              type="number"
              min="0"
              value={assists}
              onChange={(e) => setAssists(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="yellowCards">Yellow Cards</Label>
            <Input
              id="yellowCards"
              type="number"
              min="0"
              value={yellowCards}
              onChange={(e) => setYellowCards(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="redCards">Red Cards</Label>
            <Input
              id="redCards"
              type="number"
              min="0"
              value={redCards}
              onChange={(e) => setRedCards(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Minutes Played</Label>
            <div className="px-3 py-2 border rounded bg-muted text-muted-foreground">
              {minutesPlayed}
            </div>
            <p className="text-xs text-muted-foreground">Automatically calculated as 90 × matches played</p>
          </div>
        </div>
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading 
          ? (isEditing ? 'Updating...' : 'Creating...') 
          : (isEditing ? 'Update Stats' : 'Add Stats')}
      </Button>
    </form>
  );
}