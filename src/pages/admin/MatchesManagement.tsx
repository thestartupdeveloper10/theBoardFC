import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash, Search, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { MatchForm } from './MatchForm';
import { Fixture } from '@/types/fixture';

export function MatchesManagement() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFixture, setCurrentFixture] = useState<Fixture | null>(null);
  const { toast } = useToast();
  
  // Load fixtures on component mount
  useEffect(() => {
    loadFixtures();
  }, []);
  
  async function loadFixtures() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .order('match_date', { ascending: true });
      
      if (error) throw error;
      
      setFixtures(data);
    } catch (error) {
      console.error('Error loading fixtures:', error);
      toast({
        title: "Failed to load fixtures",
        description: "There was an error loading the fixture list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function handleDeleteFixture(id: string) {
    if (!confirm("Are you sure you want to delete this fixture? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('fixtures')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update UI
      setFixtures(fixtures.filter(fixture => fixture.id !== id));
      
      toast({
        title: "Fixture deleted",
        description: "The fixture has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting fixture:', error);
      toast({
        title: "Failed to delete fixture",
        description: "There was an error deleting the fixture.",
        variant: "destructive",
      });
    }
  }
  
  function handleEditFixture(fixture: Fixture) {
    setCurrentFixture(fixture);
    setIsEditDialogOpen(true);
  }
  
  // Filter fixtures based on search query
  const filteredFixtures = fixtures.filter(fixture => 
    fixture.opponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fixture.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (fixture.competition || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Helper function to display formatted date
  function formatMatchDate(dateString: string) {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy - HH:mm');
    } catch (e) {
      return dateString;
    }
  }
  
  // Helper function to render status badge
  function renderStatusBadge(status: string) {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'in_progress':
        return <Badge className="bg-red-500">LIVE</Badge>;
      case 'completed':
        return <Badge variant="secondary" className='text-white'>Completed</Badge>;
      case 'postponed':
        return <Badge variant="destructive">Postponed</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return null;
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Fixture
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Fixture</DialogTitle>
            </DialogHeader>
            <MatchForm 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                loadFixtures();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search fixtures..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredFixtures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No fixtures found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFixtures.map((fixture) => (
                  <TableRow key={fixture.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatMatchDate(fixture.match_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{fixture.competition}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {fixture.is_home_game ? 'Our Team vs ' + fixture.opponent : fixture.opponent + ' vs Our Team'}
                      </div>
                    </TableCell>
                    <TableCell>{fixture.location}</TableCell>
                    <TableCell>
                      {fixture.home_score !== null && fixture.away_score !== null
                        ? `${fixture.home_score} - ${fixture.away_score}`
                        : 'TBD'
                      }
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(fixture.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditFixture(fixture)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteFixture(fixture.id)}
                      >
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
      
      {/* Edit Fixture Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Fixture</DialogTitle>
          </DialogHeader>
          {currentFixture && (
            <MatchForm 
              fixture={currentFixture}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                loadFixtures();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 