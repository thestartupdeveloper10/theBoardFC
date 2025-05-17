import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '@/components/image-uploader';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  player_number: number;
  position: string;
  birth_date: string;
  height: number;
  weight: number;
  bio: string;
  profile_image_url: string;
  joined_date: string;
  status: string;
}

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
  const [status, setStatus] = useState(player?.status || 'active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState(player?.profile_image_url || '');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const isEditing = !!player;
  
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
        ...(isEditing ? {} : { 
          created_by: user?.id,
          joined_date: new Date().toISOString().split('T')[0] 
        })
      };
      
      if (isEditing) {
        // Update existing player
        const { error: playerUpdateError } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', player.id);
          
        if (playerUpdateError) throw playerUpdateError;
        
        toast({
          title: "Player updated",
          description: "The player has been updated successfully.",
        });
        
        onSuccess();
      } else {
        // Create new player
        const { data: newPlayerData, error: playerInsertError } = await supabase
          .from('players')
          .insert(playerData)
          .select('id')
          .single();
          
        if (playerInsertError) throw playerInsertError;
        
        if (!newPlayerData?.id) {
          throw new Error("Failed to retrieve new player ID after creation.");
        }

        // Attempt to create initial stats entry for the new player
        // The database might already have a trigger doing this, so handle the potential duplicate error
        const currentSeason = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
        
        try {
          const { error: statsError } = await supabase
            .from('player_stats')
            .insert({
              player_id: newPlayerData.id,
              season: currentSeason,
              matches_played: 0,
              goals: 0,
              assists: 0,
              yellow_cards: 0,
              red_cards: 0,
              minutes_played: 0,
              created_by: user?.id,
            });
            
          if (statsError) {
            // Check if this is a duplicate key error (which is okay in this case)
            if (statsError.code === '23505') {
              console.log('Initial stats already exist - likely created by database trigger');
            } else {
              // For other errors, warn but don't block player creation
              console.warn('Non-critical error creating initial player stats:', statsError);
            }
          }
        } catch (statsErr) {
          // Don't let stats creation failure block player creation
          console.warn('Failed to create initial player stats:', statsErr);
        }
        
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
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-6 space-y-6 px-2">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Select value={position} onValueChange={setPosition}>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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