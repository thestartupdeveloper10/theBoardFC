import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface Player {
  id: string;
  first_name?: string;
  last_name?: string;
}

const Players: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch players when component mounts
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, first_name, last_name');
        
      if (error) throw error;
      setPlayers(data || []);
    } catch (err: any) {
      console.error('Error fetching players:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load players"
      });
    }
  };

  const handleDeleteClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setIsDialogOpen(true);
  };

  const deletePlayer = async () => {
    if (!selectedPlayerId) return;
    
    setDeletingPlayerId(selectedPlayerId);
    
    try {
      // First, delete all stats associated with the player
      const { error: statsDeleteError } = await supabase
        .from('player_stats')
        .delete()
        .eq('player_id', selectedPlayerId);
        
      if (statsDeleteError) throw statsDeleteError;
      
      // Now that stats are deleted, delete the player
      const { error: playerDeleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', selectedPlayerId);
        
      if (playerDeleteError) throw playerDeleteError;
      
      // Update the UI by removing the deleted player
      setPlayers(players.filter(player => player.id !== selectedPlayerId));
      
      toast({
        title: "Success",
        description: "The player and all associated stats have been deleted."
      });
      
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error('Error deleting player:', err);
      toast({
        variant: "destructive", 
        title: "Error",
        description: err.message || "Failed to delete player"
      });
    } finally {
      setDeletingPlayerId(null);
      setSelectedPlayerId(null);
    }
  };

  return (
    <div>
      {/* List of players */}
      {players.map((player) => (
        <div key={player.id} className="flex items-center justify-between p-3 border-b">
          <div>{player.first_name} {player.last_name}</div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleDeleteClick(player.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the player and all associated stats.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deletePlayer}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingPlayerId ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Players; 