import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '@/components/image-uploader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCreatePlayer, useUpdatePlayer } from '@/services/mutations';
import { Player } from '@/types/player';


interface PlayerFormProps {
  player?: Player;
  onSuccess: () => void;
}

export function PlayerForm({ player, onSuccess }: PlayerFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(player?.first_name || '');
  const [lastName, setLastName] = useState(player?.last_name || '');
  const [email, setEmail] = useState(player?.email || '');
  const [playerNumber, setPlayerNumber] = useState(player?.player_number?.toString() || '');
  const [position, setPosition] = useState(player?.position || '');
  const [birthDate, setBirthDate] = useState(player?.birth_date || '');
  const [height, setHeight] = useState(player?.height?.toString() || '');
  const [weight, setWeight] = useState(player?.weight?.toString() || '');
  const [bio, setBio] = useState(player?.bio || '');
  const [joinedDate, setJoinedDate] = useState(player?.joined_date || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState(player?.status || 'active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState(player?.profile_image_url || '');
  
  
  const isEditing = !!player;
  
  const createPlayerMutation = useCreatePlayer();
  const updatePlayerMutation = useUpdatePlayer();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const playerData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        player_number: playerNumber ? parseInt(playerNumber, 10) : null,
        position,
        birth_date: birthDate || null,
        height: height ? parseInt(height, 10) : null,
        weight: weight ? parseInt(weight, 10) : null,
        bio,
        profile_image_url: profileImageUrl,

        status,
        ...(isEditing ? { joined_date: joinedDate } : { 
          created_by: user?.id,
          joined_date: joinedDate || new Date().toISOString().split('T')[0] 
        })
      };
      
      if (isEditing) {
        // Update existing player using React Query mutation
        await updatePlayerMutation.mutateAsync({
          id: player.id,
          ...playerData
        });
        
        toast({
          title: "Player updated",
          description: "The player has been updated successfully.",
        });
        
        onSuccess();
      } else {
        // Create new player using React Query mutation
        const newPlayerData = await createPlayerMutation.mutateAsync(playerData);
        
        if (!newPlayerData?.id) {
          throw new Error("Failed to retrieve new player ID after creation.");
        }

        // Create initial stats is now handled by the API layer or database triggers
        
        toast({
          title: "Player created",
          description: "The new player has been created successfully.",
        });
        
        // Call onSuccess first to close any dialogs
        onSuccess();
        
        // Then navigate to the player stats page
        navigate(`/admin/players/${newPlayerData.id}/stats`);
      }
    } catch (err: any) {
      console.error('Error saving player:', err);
      setError(err.message || 'An error occurred while saving the player.');
      toast({
        title: "Error saving player",
        description: err.message || 'An unexpected error occurred.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <ScrollArea className="h-[calc(100vh-200px)] px-4 md:px-6">
      <form onSubmit={handleSubmit} className="max-w-2xl px-2 py-6 mx-auto space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                Used for team communications and match notifications
              </p>
            </div>
          </div>

          {/* Player Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Player Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="playerNumber">Player Number</Label>
                <Input
                  id="playerNumber"
                  type="number"
                  value={playerNumber}
                  onChange={(e) => setPlayerNumber(e.target.value)}
                  min="1"
                  max="99"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select key="position-select" value={position} onValueChange={setPosition}>
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                    <SelectItem value="Defender">Defender</SelectItem>
                    <SelectItem value="Midfielder">Midfielder</SelectItem>
                    <SelectItem value="Forward">Forward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Physical Attributes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Physical Attributes</h3>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinedDate">Joined Date</Label>
              <Input
                id="joinedDate"
                type="date"
                value={joinedDate}
                onChange={(e) => setJoinedDate(e.target.value)}
              />
              </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="injured">Injured</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Profile Image Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Profile Image</h3>
            <ImageUploader
              currentImageUrl={profileImageUrl}
              onImageUploaded={setProfileImageUrl}
              folder="players"
              label="Profile Image"
            />
          </div>
        </div>
        
        {/* Submit Button - Fixed at the bottom */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-background/80 backdrop-blur-sm">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Player' : 'Create Player')}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
} 