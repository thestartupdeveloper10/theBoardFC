import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageUploader } from '@/components/image-uploader';
// import emailjs from '@emailjs/browser';
// import { emailConfig } from '@/config/emailjs';
import { Fixture } from '@/types/fixture';
import { usePlayers } from '@/services/queries';


interface MatchFormProps {
  fixture?: Fixture;
  onSuccess: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // Create notification message based on type
    let subject = '';

    switch (notificationType) {
      case 'new':
        subject = `New Match Scheduled: ${fixture.is_home_game ? 'Home' : 'Away'} vs ${fixture.opponent}`;
        break;
      case 'update':
        subject = `Match Update: ${fixture.is_home_game ? 'Home' : 'Away'} vs ${fixture.opponent}`;
        break;
      case 'completed':
        subject = `Match Result: ${fixture.is_home_game ? 'Home' : 'Away'} vs ${fixture.opponent}`;
        break;
      case 'cancel':
        subject = `Match Cancelled: ${fixture.is_home_game ? 'Home' : 'Away'} vs ${fixture.opponent}`;
        break;
    }

    // Send email to each player using EmailJS
    for (const player of players) {
      try {
        // Prepare template parameters
        // const templateParams = {
        //   to_name: `${player.first_name} ${player.last_name}`,
        //   to_email: player.email,
        //   subject: subject,
        //   message: message,
        //   team_name: 'The Board FC'
        // };

        // Send email using EmailJS

        // await emailjs.send(
        //   emailConfig.serviceId,
        //   emailConfig.templateId,
        //   templateParams,
        //   emailConfig.publicKey
        // );

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
  const { toast } = useToast();
  const { data: players = [] } = usePlayers();

  // Email service paused — re-enable by un-commenting emailjs.init and sendNotificationEmails calls
  // useEffect(() => {
  //   emailjs.init(emailConfig.publicKey);
  // }, []);

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
  const [matchPosterUrl, setMatchPosterUrl] = useState(fixture?.match_poster_url || '');
  const [mvpPlayerId, setMvpPlayerId] = useState(fixture?.mvp_player_id || '');
  const [mvpNote, setMvpNote] = useState(fixture?.mvp_note || '');
  
  const isEditing = !!fixture;
  
  // previousStatus tracked for email notifications — re-enable with email service
  // const [previousStatus, setPreviousStatus] = useState(fixture?.status || 'upcoming');
  // useEffect(() => { if (fixture) setPreviousStatus(fixture.status); }, [fixture]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const fixtureData: Record<string, any> = {
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
        ...(isEditing ? {} : { created_by: user?.id }),
      };

      // These columns require the DB migration to exist.
      // Only include them in the payload when they carry a value so the form
      // doesn't break if the migration hasn't been run yet.
      if (matchPosterUrl) fixtureData.match_poster_url = matchPosterUrl;
      if (status === 'completed' && mvpPlayerId) {
        fixtureData.mvp_player_id = mvpPlayerId;
        fixtureData.mvp_note = mvpNote || null;
      }
      
      if (isEditing) {
        // Update existing fixture
        const { error } = await supabase
          .from('fixtures')
          .update(fixtureData)
          .eq('id', fixture.id)
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Fixture updated",
          description: "The fixture has been updated successfully.",
        });
        
        // Email notifications paused — re-enable when email service is restarted
        // if (['postponed', 'canceled'].includes(status) && !['postponed', 'canceled'].includes(previousStatus)) {
        //   await sendNotificationEmails(result, 'cancel');
        // } else if (status === 'completed' && previousStatus !== 'completed' &&
        //         homeScore !== '' && awayScore !== '') {
        //   await sendNotificationEmails(result, 'completed');
        // } else if (status !== previousStatus) {
        //   await sendNotificationEmails(result, 'update');
        // }
        
      } else {
        // Create new fixture
        const { error } = await supabase
          .from('fixtures')
          .insert(fixtureData)
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Fixture created",
          description: "The new fixture has been created successfully.",
        });
        
        // Email notifications paused
        // if (!['postponed', 'canceled'].includes(status)) {
        //   await sendNotificationEmails(result, 'new');
        // }
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
      <form onSubmit={handleSubmit} className="max-w-2xl px-2 py-6 mx-auto space-y-6">
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
              
              <div className="flex items-center py-2 space-x-2">
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
              <p className="mt-1 text-xs text-muted-foreground">
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

          {/* Match Poster Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Match Poster</h3>
            <ImageUploader
              currentImageUrl={matchPosterUrl}
              onImageUploaded={setMatchPosterUrl}
              folder="posters"
              label="Match Poster (optional)"
              showUrlInput={false}
              deleteOldImage={true}
            />
            <p className="text-xs text-muted-foreground">
              Upload a matchday poster — displayed as a full-width banner on the home page for upcoming matches.
            </p>
          </div>

          {/* MVP Section — only shown for completed matches */}
          {status === 'completed' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Match MVP</h3>
              <div className="space-y-2">
                <Label htmlFor="mvpPlayer">MVP Player (optional)</Label>
                <Select
                  value={mvpPlayerId || 'none'}
                  onValueChange={(v) => setMvpPlayerId(v === 'none' ? '' : v)}
                >
                  <SelectTrigger id="mvpPlayer">
                    <SelectValue placeholder="Select MVP player" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No MVP selected</SelectItem>
                    {(players as any[])
                      .filter((p) => p.status === 'active')
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.first_name} {p.last_name}
                          {p.player_number ? ` (#${p.player_number})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {mvpPlayerId && (
                <div className="space-y-2">
                  <Label htmlFor="mvpNote">Performance Note (optional)</Label>
                  <Input
                    id="mvpNote"
                    value={mvpNote}
                    onChange={(e) => setMvpNote(e.target.value)}
                    placeholder="e.g. Hat-trick & 2 assists"
                  />
                </div>
              )}
            </div>
          )}
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