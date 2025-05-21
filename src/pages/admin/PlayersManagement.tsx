import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlusCircle, Pencil, Trash, Search } from 'lucide-react';
import { PlayerForm } from './PlayerForm';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Import TanStack Query hooks
import { usePlayers } from '@/services/queries';
import { useDeletePlayer } from '@/services/mutations';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Player } from '@/types/player';

export function PlayersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use TanStack Query hooks
  const { data: players = [], isLoading, isError, error } = usePlayers();
  const deletePlayerMutation = useDeletePlayer();
  
  // Filter players based on search query
  const filteredPlayers = searchQuery
    ? players.filter(player => 
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.player_number && player.player_number.toString().includes(searchQuery))
      )
    : players;
  
  function handleAddSuccess() {
    setIsAddDialogOpen(false);
    // Force a refetch to ensure we have the latest data
    queryClient.invalidateQueries({ queryKey: ['players'] });
  }
  
  function handleEditSuccess() {
    setIsEditDialogOpen(false);
    setCurrentPlayer(null);
    // Force a refetch to ensure we have the latest data
    queryClient.invalidateQueries({ queryKey: ['players'] });
  }
  

  function handleEdit(player: Player) {
    setCurrentPlayer(player);
    setIsEditDialogOpen(true);
  }
  
  // Helper to extract the storage path for deletion
  function getStoragePathFromUrl(url: string): string | null {
    if (!url) return null;
    try {
      // This will extract "players/filename.jpg" from ".../media/players/filename.jpg"
      const match = url.match(/\/media\/(.+)$/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (error) {
      console.error('Error extracting storage path:', error);
      return null;
    }
  }
  
  // Update the handleDeletePlayer function
  async function handleDeletePlayer(id: string) {
    if (!confirm("Are you sure you want to delete this player? This action cannot be undone.")) {
      return;
    }
    
    try {
      // First get the player details to access the image URL
      const { data: player, error: fetchError } = await supabase
        .from('players')
        .select('profile_image_url')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // If player has an image, delete it from storage
      if (player?.profile_image_url) {
        const imagePath = getStoragePathFromUrl(player.profile_image_url);
        console.log("image path",imagePath)
        
        if (imagePath) {
          const { error: storageError } = await supabase.storage
            .from('media')
            .remove([imagePath]);
            
          if (storageError) {
            console.error('Error deleting player image:', storageError);
            console.log("storage error",storageError)
            // Continue with player deletion even if image deletion fails
          }
        }
      }
      
      // Now delete the player
      await deletePlayerMutation.mutateAsync(id);
      
      toast({
        title: "Player deleted",
        description: "The player has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting player:', error);
      toast({
        title: "Failed to delete player",
        description: error.message || "There was an error deleting the player.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading players...</div>;
  }
  
  if (isError) {
    return (
      <div className="p-8">
        <div className="text-red-500">Error loading players: {error.message}</div>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search players..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Player</DialogTitle>
                <DialogDescription>Fill out the form below to add a new player to the team.</DialogDescription>
              </DialogHeader>
              <PlayerForm onSuccess={handleAddSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No players found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {player.profile_image_url ? (
                            <AvatarImage className='object-cover' src={player.profile_image_url} alt={`${player.first_name} ${player.last_name}`} />
                          ) : null}
                          <AvatarFallback>
                            {player.first_name.charAt(0)}{player.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{player.first_name} {player.last_name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{player.player_number || '-'}</TableCell>
                    <TableCell>{player.position || '-'}</TableCell>
                    <TableCell>
                      <StatusBadge status={player.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/players/${player.id}/stats`}>
                          <Button variant="outline" size="sm">
                            Stats
                          </Button>
                        </Link>
                        <Dialog open={isEditDialogOpen && currentPlayer?.id === player.id} onOpenChange={(open) => !open && setCurrentPlayer(null)}>
                          <DialogTrigger asChild onClick={() => handleEdit(player)}>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Edit Player</DialogTitle>
                              <DialogDescription>Modify the player details in the form below.</DialogDescription>
                            </DialogHeader>
                            {currentPlayer && (
                              <PlayerForm 
                                player={currentPlayer} 
                                onSuccess={handleEditSuccess} 
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDeletePlayer(player.id)}
                          disabled={deletePlayerMutation.isPending}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'injured' | 'suspended' | 'inactive' | string }) {
  const variants = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    injured: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`${status in variants ? variants[status as keyof typeof variants] : variants.inactive} capitalize`}
    >
      {status || 'unknown'}
    </Badge>
  );
} 