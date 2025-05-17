import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast, useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageUploader } from '@/components/image-uploader';
import emailjs from '@emailjs/browser';
import { emailConfig } from '@/config/emailjs';
import { useNavigate } from 'react-router-dom';

interface Fixture {
  id: string;
  match_date: string;
  opponent: string;
  location: string;
  is_home_game: boolean;
  competition: string;
  ticket_link: string;
  notes: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  opponent_logo_url?: string;
}

interface MatchFormProps {
  fixture?: Fixture;
  onSuccess: () => void;
}

async function sendNotificationEmails(fixture: any, notificationType: 'new' | 'update' | 'cancel' | 'completed') {
  try {
    // Fetch all active players with email addresses
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, first_name, last_name, email')
      .eq('status', 'active')
      .not('email', 'is', null);

    if (playersError) throw new Error(`Error fetching players: ${playersError.message}`);
    if (!players || players.length === 0) {
      console.log('No active players with email addresses found');
      return;
    }

    // Format match date for the message
    const matchDate = parseISO(fixture.match_date);
    const formattedDate = format(matchDate, 'EEEE, MMMM do, yyyy');
    const formattedTime = format(matchDate, 'h:mm a');
    
    // Create notification message based on type
    let subject = '';
    let message = '';
    
    switch (notificationType) {
      case 'new':
        subject = `New Match Scheduled: ${fixture.is_home_game ? 'Home' : 'Away'} vs ${fixture.opponent}`;
        message = `A new match has been scheduled for ${formattedDate} at ${formattedTime}. 
                  We will be playing ${fixture.is_home_game ? 'at home' : 'away'} against ${fixture.opponent} 
                  in the ${fixture.competition}.`;
        break;
      case 'update':
        subject = `Match Update: ${fixture.is_home_game ? 'Home' : 'Away'} vs ${fixture.opponent}`;
        message = `The match against ${fixture.opponent} has been updated. 
                  It is now scheduled for ${formattedDate} at ${formattedTime}. 
                  We will be playing ${fixture.is_home_game ? 'at home' : 'away'} 
                  in the ${fixture.competition}.`;
        break;
      case 'completed':
        subject = `Match Result: ${fixture.is_home_game ? 'Home' : 'Away'} vs ${fixture.opponent}`;
        const teamScore = fixture.is_home_game ? fixture.home_score : fixture.away_score;
        const opponentScore = fixture.is_home_game ? fixture.away_score : fixture.home_score;
        const result = teamScore > opponentScore ? 'won' : teamScore < opponentScore ? 'lost' : 'drew';
        
        message = `Our match against ${fixture.opponent} has been completed.
                  Final score: The Board FC ${teamScore} - ${opponentScore} ${fixture.opponent}.
                  We ${result} the match played on ${formattedDate}.
                  ${fixture.notes ? `\n\nAdditional notes: ${fixture.notes}` : ''}
                  
                  Check the team website for upcoming fixtures!`;
        break;
      case 'cancel':
        subject = `Match Cancelled: ${fixture.is_home_game ? 'Home' : 'Away'} vs ${fixture.opponent}`;
        message = `The match against ${fixture.opponent} that was scheduled for ${formattedDate} 
                  has been ${fixture.status}. Further updates will be provided when available.
                  ${fixture.notes ? `\n\nReason: ${fixture.notes}` : ''}`;
        break;
    }

    // Send email to each player using EmailJS
    for (const player of players) {
      try {
        // Prepare template parameters
        const templateParams = {
          to_name: `${player.first_name} ${player.last_name}`,
          to_email: player.email,
          subject: subject,
          message: message,
          team_name: 'The Board FC'
        };

        // Send email using EmailJS
        await emailjs.send(
          emailConfig.serviceId,
          emailConfig.templateId,
          templateParams,
          emailConfig.publicKey
        );

        // Log notification in the database
        await supabase
          .from('notification_logs')
          .insert({
            player_id: player.id,
            fixture_id: fixture.id,
            notification_type: 'email',
            subject,
            sent_at: new Date().toISOString(),
          });
      } catch (emailError) {
        console.error(`Failed to send email to ${player.email}:`, emailError);
        // Continue with next player even if one fails
      }
    }

    return { success: true, message: `Sent notifications to ${players.length} players` };
  } catch (error) {
    console.error('Error sending notification emails:', error);
    throw new Error(`Email sending failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function MatchForm({ fixture, onSuccess }: MatchFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(emailConfig.publicKey);
  }, []);
  
  const [matchDate, setMatchDate] = useState(fixture ? format(parseISO(fixture.match_date), "yyyy-MM-dd'T'HH:mm") : '');
  const [opponent, setOpponent] = useState(fixture?.opponent || '');
  const [location, setLocation] = useState(fixture?.location || '');
  const [isHomeGame, setIsHomeGame] = useState(fixture?.is_home_game ?? true);
  const [competition, setCompetition] = useState(fixture?.competition || '');
  const [ticketLink, setTicketLink] = useState(fixture?.ticket_link || '');
  const [notes, setNotes] = useState(fixture?.notes || '');
  const [homeScore, setHomeScore] = useState(fixture?.home_score?.toString() || '');
  const [awayScore, setAwayScore] = useState(fixture?.away_score?.toString() || '');
  const [status, setStatus] = useState(fixture?.status || 'upcoming');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opponentLogoUrl, setOpponentLogoUrl] = useState(fixture?.opponent_logo_url || '');
  
  const isEditing = !!fixture;
  
  // Track previous status for cancellation notifications
  const [previousStatus, setPreviousStatus] = useState(fixture?.status || 'upcoming');
  
  // Update previousStatus when fixture changes
  useEffect(() => {
    if (fixture) {
      setPreviousStatus(fixture.status);
    }
  }, [fixture]);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const fixtureData = {
        match_date: matchDate,
        opponent,
        location,
        is_home_game: isHomeGame,
        competition,
        ticket_link: ticketLink,
        notes,
        home_score: homeScore ? parseInt(homeScore, 10) : null,
        away_score: awayScore ? parseInt(awayScore, 10) : null,
        status,
        opponent_logo_url: opponentLogoUrl,
        ...(isEditing ? {} : { created_by: user?.id })
      };
      
      let result;
      
      if (isEditing) {
        // Update existing fixture
        const { data, error } = await supabase
          .from('fixtures')
          .update(fixtureData)
          .eq('id', fixture.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: "Fixture updated",
          description: "The fixture has been updated successfully.",
        });
        
        // Check if status changed to postponed or canceled
        if (['postponed', 'canceled'].includes(status) && !['postponed', 'canceled'].includes(previousStatus)) {
          // Send cancellation notifications
          await sendNotificationEmails(result, 'cancel');
        } 
        // Check if match was marked as completed with scores
        else if (status === 'completed' && previousStatus !== 'completed' && 
                homeScore !== '' && awayScore !== '') {
          // Send completion notification with scores
          await sendNotificationEmails(result, 'completed');
        }
        // Send regular update notification for other changes
        else if (status !== previousStatus) {
          await sendNotificationEmails(result, 'update');
        }
        
      } else {
        // Create new fixture
        const { data, error } = await supabase
          .from('fixtures')
          .insert(fixtureData)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: "Fixture created",
          description: "The new fixture has been created successfully.",
        });
        
        // Send new fixture notifications (unless it's already marked cancelled)
        if (!['postponed', 'canceled'].includes(status)) {
          await sendNotificationEmails(result, 'new');
        }
      }
      
      onSuccess();
    } catch (err: any) {
      console.error('Error saving fixture:', err);
      setError(err.message || 'An error occurred while saving the fixture.');
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
          {/* Match Basic Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Match Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matchDate">Date and Time</Label>
                <Input
                  id="matchDate"
                  type="datetime-local"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="competition">Competition</Label>
                <Select value={competition} onValueChange={setCompetition}>
                  <SelectTrigger id="competition">
                    <SelectValue placeholder="Select competition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="League">League</SelectItem>
                    <SelectItem value="Cup">Cup</SelectItem>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                    <SelectItem value="Tournament">Tournament</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Team Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Team Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="isHomeGame" 
                  checked={isHomeGame} 
                  onCheckedChange={(checked) => setIsHomeGame(checked === true)}
                />
                <Label htmlFor="isHomeGame">Home Game</Label>
              </div>

              {/* Opponent Logo Upload */}
              <ImageUploader
                currentImageUrl={opponentLogoUrl}
                onImageUploaded={setOpponentLogoUrl}
                folder="logos"
                label="Opponent Logo (optional)"
                showUrlInput={false}
                deleteOldImage={true}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload the opponent team's logo. If none is provided, a default logo will be used.
              </p>
            </div>
          </div>

          {/* Venue Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Venue Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ticketLink">Ticket Link (Optional)</Label>
                <Input
                  id="ticketLink"
                  value={ticketLink}
                  onChange={(e) => setTicketLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Match Status and Score Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Match Status & Score</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Match Status</Label>
                <Select 
                  value={status} 
                  onValueChange={setStatus} 
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="homeScore">Home Score</Label>
                  <Input
                    id="homeScore"
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="awayScore">Away Score</Label>
                  <Input
                    id="awayScore"
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
        
        {/* Submit Button - Fixed at the bottom */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-background/80 backdrop-blur-sm">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Fixture' : 'Create Fixture')}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
} 