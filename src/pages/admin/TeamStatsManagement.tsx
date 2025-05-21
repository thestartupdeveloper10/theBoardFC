import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TeamStats {
  id: string;
  season: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  clean_sheets: number;
  updated_at: string;
  created_by: string; // Assuming you want to show who last edited
}

interface TeamStatsFormProps {
  stats?: TeamStats;
  onSuccess: () => void;
}

// Reusable Form Component for Add/Edit
function TeamStatsForm({ stats, onSuccess }: TeamStatsFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [season, setSeason] = useState(stats?.season || '');
  const [matchesPlayed, setMatchesPlayed] = useState(stats?.matches_played?.toString() || '0');
  const [wins, setWins] = useState(stats?.wins?.toString() || '0');
  const [draws, setDraws] = useState(stats?.draws?.toString() || '0');
  const [losses, setLosses] = useState(stats?.losses?.toString() || '0');
  const [goalsFor, setGoalsFor] = useState(stats?.goals_for?.toString() || '0');
  const [goalsAgainst, setGoalsAgainst] = useState(stats?.goals_against?.toString() || '0');
  const [cleanSheets, setCleanSheets] = useState(stats?.clean_sheets?.toString() || '0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!stats;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const statsData = {
        season,
        matches_played: parseInt(matchesPlayed, 10),
        wins: parseInt(wins, 10),
        draws: parseInt(draws, 10),
        losses: parseInt(losses, 10),
        goals_for: parseInt(goalsFor, 10),
        goals_against: parseInt(goalsAgainst, 10),
        clean_sheets: parseInt(cleanSheets, 10),
        updated_at: new Date().toISOString(),
        created_by: user?.id, // Always update who last modified
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('team_stats')
          .update(statsData)
          .eq('id', stats.id);
        if (updateError) throw updateError;
        toast({ title: "Stats updated", description: `Stats for ${season} updated.` });
      } else {
        const { error: insertError } = await supabase
          .from('team_stats')
          .insert(statsData);
        if (insertError) throw insertError;
        toast({ title: "Stats added", description: `Stats for ${season} added.` });
      }
      onSuccess();
    } catch (err: any) {
      console.error("Error saving team stats:", err);
      setError(err.message || "An error occurred.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-2">
        <Label htmlFor="season">Season (e.g., 2024-2025)</Label>
        <Input id="season" value={season} onChange={e => setSeason(e.target.value)} required disabled={isEditing} />
         {!isEditing && <p className="text-sm text-muted-foreground">Season cannot be changed after creation.</p>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2"> <Label htmlFor="matchesPlayed">Played</Label> <Input id="matchesPlayed" type="number" min="0" value={matchesPlayed} onChange={e => setMatchesPlayed(e.target.value)} required /> </div>
        <div className="space-y-2"> <Label htmlFor="wins">Wins</Label> <Input id="wins" type="number" min="0" value={wins} onChange={e => setWins(e.target.value)} required /> </div>
        <div className="space-y-2"> <Label htmlFor="draws">Draws</Label> <Input id="draws" type="number" min="0" value={draws} onChange={e => setDraws(e.target.value)} required /> </div>
        <div className="space-y-2"> <Label htmlFor="losses">Losses</Label> <Input id="losses" type="number" min="0" value={losses} onChange={e => setLosses(e.target.value)} required /> </div>
        <div className="space-y-2"> <Label htmlFor="goalsFor">Goals For</Label> <Input id="goalsFor" type="number" min="0" value={goalsFor} onChange={e => setGoalsFor(e.target.value)} required /> </div>
        <div className="space-y-2"> <Label htmlFor="goalsAgainst">Goals Against</Label> <Input id="goalsAgainst" type="number" min="0" value={goalsAgainst} onChange={e => setGoalsAgainst(e.target.value)} required /> </div>
        <div className="space-y-2 col-span-2 md:col-span-1"> <Label htmlFor="cleanSheets">Clean Sheets</Label> <Input id="cleanSheets" type="number" min="0" value={cleanSheets} onChange={e => setCleanSheets(e.target.value)} required /> </div>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : (isEditing ? 'Update Stats' : 'Add Stats')}
      </Button>
    </form>
  );
}


// Main Management Component
export function TeamStatsManagement() {
  const [stats, setStats] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStats, setCurrentStats] = useState<TeamStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_stats')
        .select('*')
        .order('season', { ascending: false });
      if (error) throw error;
      setStats(data || []);
    } catch (error: any) {
      console.error("Error loading team stats:", error);
      toast({ title: "Load Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(stat: TeamStats) {
    setCurrentStats(stat);
    setIsEditDialogOpen(true);
  }
  
  async function handleDelete(id: string, season: string) {
     if (!confirm(`Are you sure you want to delete stats for the ${season} season?`)) {
      return;
    }
     try {
      const { error } = await supabase.from('team_stats').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Stats deleted", description: `Stats for ${season} removed.` });
      loadStats(); // Refresh list
    } catch (error: any) {
      console.error("Error deleting team stats:", error);
      toast({ title: "Delete Error", description: error.message, variant: "destructive" });
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Statistics by Season</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Season Stats</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>Add New Season Stats</DialogTitle></DialogHeader>
            <TeamStatsForm onSuccess={() => { setIsAddDialogOpen(false); loadStats(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Season</TableHead>
                <TableHead className="text-center">P</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GA</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center">CS</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : stats.length === 0 ? (
                 <TableRow><TableCell colSpan={10} className="h-24 text-center">No team stats found. Add stats for a season.</TableCell></TableRow>
              ) : (
                stats.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{stat.season}</TableCell>
                    <TableCell className="text-center">{stat.matches_played}</TableCell>
                    <TableCell className="text-center">{stat.wins}</TableCell>
                    <TableCell className="text-center">{stat.draws}</TableCell>
                    <TableCell className="text-center">{stat.losses}</TableCell>
                    <TableCell className="text-center">{stat.goals_for}</TableCell>
                    <TableCell className="text-center">{stat.goals_against}</TableCell>
                    <TableCell className="text-center">{stat.goals_for - stat.goals_against}</TableCell> {/* Goal Difference */}
                    <TableCell className="text-center">{stat.clean_sheets}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(stat)}>
                         <Pencil className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(stat.id, stat.season)}>
                         <Trash className="h-4 w-4 text-destructive" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
         <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>Edit Stats for {currentStats?.season}</DialogTitle></DialogHeader>
            {currentStats && <TeamStatsForm stats={currentStats} onSuccess={() => { setIsEditDialogOpen(false); loadStats(); }} />}
         </DialogContent>
      </Dialog>
    </div>
  );
} 