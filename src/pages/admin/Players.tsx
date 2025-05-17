import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

const Players: React.FC = () => {
  const [players, setPlayers] = useState([]);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);

  const deletePlayer = async (playerId: string) => {
    setDeletingPlayerId(playerId);
    
    try {
      // First, delete all stats associated with the player
      const { error: statsDeleteError } = await supabase
        .from('player_stats')
        .delete()
        .eq('player_id', playerId);
        
      if (statsDeleteError) throw statsDeleteError;
      
      // Now that stats are deleted, delete the player
      const { error: playerDeleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);
        
      if (playerDeleteError) throw playerDeleteError;
      
      // Update the UI by removing the deleted player
      setPlayers(players.filter(player => player.id !== playerId));
      
      toast({
        title: "Player deleted",
        description: "The player and all associated stats have been deleted.",
      });
    } catch (err: any) {
      console.error('Error deleting player:', err);
      toast({
        title: "Error deleting player",
        description: err.message || "Failed to delete player",
        variant: "destructive",
      });
    } finally {
      setDeletingPlayerId(null);
    }
  };

  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Trash className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
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
              onClick={() => deletePlayer(player.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingPlayerId === player.id ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Players; 