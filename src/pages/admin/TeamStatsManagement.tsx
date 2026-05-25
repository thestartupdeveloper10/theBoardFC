import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, Trash, RefreshCw, CheckCircle2 } from 'lucide-react';
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
  created_by: string;
}

interface CalculatedStats {
  season: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  clean_sheets: number;
}

// Season runs Jan–Dec of each calendar year, labelled "YYYY-(YYYY+1)"
function getSeasonFromDate(dateStr: string): string {
  const year = new Date(dateStr).getFullYear();
  return `${year}-${year + 1}`;
}

// ─── FORM ──────────────────────────────────────────────────────────────────

interface TeamStatsFormProps {
  stats?: TeamStats;
  onSuccess: () => void;
}

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
        created_by: user?.id,
      };
      if (isEditing) {
        const { error: err } = await supabase.from('team_stats').update(statsData).eq('id', stats.id);
        if (err) throw err;
        toast({ title: 'Stats updated', description: `Stats for ${season} updated.` });
      } else {
        const { error: err } = await supabase.from('team_stats').insert(statsData);
        if (err) throw err;
        toast({ title: 'Stats added', description: `Stats for ${season} added.` });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-2">
        <Label htmlFor="season">Season (e.g., 2026-2027)</Label>
        <Input id="season" value={season} onChange={e => setSeason(e.target.value)} required disabled={isEditing} />
        {!isEditing && <p className="text-xs text-muted-foreground">Season cannot be changed after creation.</p>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Played</Label><Input type="number" min="0" value={matchesPlayed} onChange={e => setMatchesPlayed(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Wins</Label><Input type="number" min="0" value={wins} onChange={e => setWins(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Draws</Label><Input type="number" min="0" value={draws} onChange={e => setDraws(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Losses</Label><Input type="number" min="0" value={losses} onChange={e => setLosses(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Goals For</Label><Input type="number" min="0" value={goalsFor} onChange={e => setGoalsFor(e.target.value)} required /></div>
        <div className="space-y-2"><Label>Goals Against</Label><Input type="number" min="0" value={goalsAgainst} onChange={e => setGoalsAgainst(e.target.value)} required /></div>
        <div className="space-y-2 col-span-2 md:col-span-1"><Label>Clean Sheets</Label><Input type="number" min="0" value={cleanSheets} onChange={e => setCleanSheets(e.target.value)} required /></div>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : isEditing ? 'Update Stats' : 'Add Stats'}
      </Button>
    </form>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

export function TeamStatsManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStats, setCurrentStats] = useState<TeamStats | null>(null);

  // Calculated stats derived live from fixtures (preview)
  const [calculatedStats, setCalculatedStats] = useState<CalculatedStats[]>([]);
  const [loadingCalc, setLoadingCalc] = useState(false);

  useEffect(() => {
    loadStats();
    loadCalculatedStats();
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
      toast({ title: 'Load Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  // Fetch all completed fixtures and derive stats per season — no DB write, just preview
  async function loadCalculatedStats() {
    setLoadingCalc(true);
    try {
      const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select('match_date, is_home_game, home_score, away_score, status');
      if (error) throw error;

      const map: Record<string, CalculatedStats> = {};

      for (const f of fixtures || []) {
        if ((f.status || '').toLowerCase() !== 'completed') continue;
        if (f.home_score === null || f.away_score === null) continue;

        const season = getSeasonFromDate(f.match_date);
        if (!map[season]) {
          map[season] = { season, matches_played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, clean_sheets: 0 };
        }

        const ourGoals: number = f.is_home_game ? f.home_score : f.away_score;
        const theirGoals: number = f.is_home_game ? f.away_score : f.home_score;

        map[season].matches_played += 1;
        map[season].goals_for += ourGoals;
        map[season].goals_against += theirGoals;
        if (theirGoals === 0) map[season].clean_sheets += 1;
        if (ourGoals > theirGoals) map[season].wins += 1;
        else if (ourGoals === theirGoals) map[season].draws += 1;
        else map[season].losses += 1;
      }

      setCalculatedStats(
        Object.values(map).sort((a, b) => b.season.localeCompare(a.season)),
      );
    } catch (err: any) {
      console.error('Error calculating stats from fixtures:', err);
    } finally {
      setLoadingCalc(false);
    }
  }

  // Write the calculated stats to the team_stats table (upsert per season)
  async function syncFromFixtures() {
    if (calculatedStats.length === 0) {
      toast({ title: 'Nothing to sync', description: 'No completed fixtures found.' });
      return;
    }
    setSyncing(true);
    try {
      for (const calc of calculatedStats) {
        // Check if a record already exists for this season
        const { data: existing } = await supabase
          .from('team_stats')
          .select('id')
          .eq('season', calc.season)
          .maybeSingle();

        const payload = {
          season: calc.season,
          matches_played: calc.matches_played,
          wins: calc.wins,
          draws: calc.draws,
          losses: calc.losses,
          goals_for: calc.goals_for,
          goals_against: calc.goals_against,
          clean_sheets: calc.clean_sheets,
          updated_at: new Date().toISOString(),
          created_by: user?.id,
        };

        if (existing) {
          const { error } = await supabase.from('team_stats').update(payload).eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('team_stats').insert(payload);
          if (error) throw error;
        }
      }

      toast({
        title: 'Stats synced',
        description: `${calculatedStats.length} season(s) updated from ${calculatedStats.reduce((s, c) => s + c.matches_played, 0)} completed matches.`,
      });
      loadStats();
    } catch (err: any) {
      toast({ title: 'Sync failed', description: err.message, variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  }

  function handleEdit(stat: TeamStats) {
    setCurrentStats(stat);
    setIsEditDialogOpen(true);
  }

  async function handleDelete(id: string, season: string) {
    if (!confirm(`Delete stats for the ${season} season?`)) return;
    try {
      const { error } = await supabase.from('team_stats').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Stats deleted', description: `Stats for ${season} removed.` });
      loadStats();
    } catch (error: any) {
      toast({ title: 'Delete Error', description: error.message, variant: 'destructive' });
    }
  }

  // Determine if a calculated season differs from what's stored
  const syncDiffMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const calc of calculatedStats) {
      const stored = stats.find(s => s.season === calc.season);
      if (!stored) {
        map[calc.season] = true; // new
      } else {
        const changed =
          stored.matches_played !== calc.matches_played ||
          stored.wins !== calc.wins ||
          stored.draws !== calc.draws ||
          stored.losses !== calc.losses ||
          stored.goals_for !== calc.goals_for ||
          stored.goals_against !== calc.goals_against ||
          stored.clean_sheets !== calc.clean_sheets;
        map[calc.season] = changed;
      }
    }
    return map;
  }, [calculatedStats, stats]);

  const hasPendingChanges = Object.values(syncDiffMap).some(Boolean);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Team Statistics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Auto-calculated from completed fixtures · Current season: 2026-2027
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => { loadCalculatedStats(); loadStats(); }}
            disabled={loadingCalc || syncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingCalc ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
          <Button
            onClick={syncFromFixtures}
            disabled={syncing || loadingCalc || !hasPendingChanges}
            className="relative"
          >
            {syncing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            {syncing ? 'Syncing...' : 'Apply to Database'}
            {hasPendingChanges && !syncing && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#E63946] text-[8px] font-bold text-white">
                !
              </span>
            )}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Add manually">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader><DialogTitle>Add Season Stats Manually</DialogTitle></DialogHeader>
              <TeamStatsForm onSuccess={() => { setIsAddDialogOpen(false); loadStats(); }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Live calculation preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Calculated from Fixtures
            </CardTitle>
            {hasPendingChanges && (
              <Badge variant="destructive" className="text-xs">
                {Object.values(syncDiffMap).filter(Boolean).length} season(s) out of sync
              </Badge>
            )}
            {!hasPendingChanges && !loadingCalc && calculatedStats.length > 0 && (
              <Badge variant="secondary" className="text-xs text-green-600 bg-green-50 dark:bg-green-950">
                ✓ Database is up to date
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Live view — auto-derived from all completed match scores. Click "Apply to Database" to save.
          </p>
        </CardHeader>
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
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCalc ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-16 text-center text-muted-foreground">
                    Calculating from fixtures...
                  </TableCell>
                </TableRow>
              ) : calculatedStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-16 text-center text-muted-foreground">
                    No completed fixtures found.
                  </TableCell>
                </TableRow>
              ) : (
                calculatedStats.map(c => (
                  <TableRow key={c.season} className={syncDiffMap[c.season] ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}>
                    <TableCell className="font-semibold">{c.season}</TableCell>
                    <TableCell className="text-center">{c.matches_played}</TableCell>
                    <TableCell className="text-center font-medium text-green-600">{c.wins}</TableCell>
                    <TableCell className="text-center font-medium text-yellow-600">{c.draws}</TableCell>
                    <TableCell className="text-center font-medium text-red-500">{c.losses}</TableCell>
                    <TableCell className="text-center">{c.goals_for}</TableCell>
                    <TableCell className="text-center">{c.goals_against}</TableCell>
                    <TableCell className="text-center font-medium">
                      {c.goals_for - c.goals_against > 0 && '+'}
                      {c.goals_for - c.goals_against}
                    </TableCell>
                    <TableCell className="text-center">{c.clean_sheets}</TableCell>
                    <TableCell className="text-center">
                      {syncDiffMap[c.season] ? (
                        <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600">
                          {stats.find(s => s.season === c.season) ? 'Changed' : 'New'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-green-400 text-green-600">
                          Synced
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stored stats (current DB state) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Database Records</CardTitle>
          <p className="text-xs text-muted-foreground">
            What is currently saved in the database. Manual edits override the sync.
          </p>
        </CardHeader>
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
                <TableRow>
                  <TableCell colSpan={10} className="h-16 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : stats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-16 text-center text-muted-foreground">
                    No records yet — use "Apply to Database" to populate from fixtures.
                  </TableCell>
                </TableRow>
              ) : (
                stats.map(stat => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{stat.season}</TableCell>
                    <TableCell className="text-center">{stat.matches_played}</TableCell>
                    <TableCell className="text-center">{stat.wins}</TableCell>
                    <TableCell className="text-center">{stat.draws}</TableCell>
                    <TableCell className="text-center">{stat.losses}</TableCell>
                    <TableCell className="text-center">{stat.goals_for}</TableCell>
                    <TableCell className="text-center">{stat.goals_against}</TableCell>
                    <TableCell className="text-center">{stat.goals_for - stat.goals_against}</TableCell>
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

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Edit Stats — {currentStats?.season}</DialogTitle></DialogHeader>
          {currentStats && (
            <TeamStatsForm
              stats={currentStats}
              onSuccess={() => { setIsEditDialogOpen(false); loadStats(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
