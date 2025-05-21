import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, parseISO, isSameDay, subHours } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Ticket, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useFixtures } from '@/services/queries'



// Define the Fixture interface to match your API data
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
}

// Competition badge styles
const competitionStyles = {
  'League': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Cup': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Friendly': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Tournament': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'default': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

// Status badge styles
const statusStyles = {
  'Upcoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 animate-pulse',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Postponed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'default': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

// Competition display names
const competitionNames = {
  'League': 'Premier League',
  'Cup': 'FA Cup',
  'Friendly': 'Friendly Match',
  'Tournament': 'Tournament'
};

const MatchCard = ({ fixture }: { fixture: Fixture }) => {
  // Parse the match date and subtract 3 hours
  const matchDate = subHours(parseISO(fixture.match_date), 3);
  
  // Handle empty competition value with a fallback
  const competition = fixture.competition && fixture.competition.trim() !== '' 
    ? fixture.competition 
    : 'Other';
  
  // Normalize the status for case-insensitive comparison
  const normalizedStatus = fixture.status.charAt(0).toUpperCase() + fixture.status.slice(1).toLowerCase();
  
  // Get appropriate styles for competition and status
  const competitionStyle = competitionStyles[competition as keyof typeof competitionStyles] || competitionStyles.default;
  
  // Use the normalized status for finding the style
  const statusStyle = statusStyles[normalizedStatus as keyof typeof statusStyles] || statusStyles.default;
  
  // Build team names based on is_home_game flag
  const homeTeam = fixture.is_home_game ? 'The Board FC' : fixture.opponent;
  const awayTeam = fixture.is_home_game ? fixture.opponent : 'The Board FC';
  
  // Build score display if available - FIXED to use case-insensitive comparison
  const scoreDisplay = () => {
    const statusLower = fixture.status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'in progress') {
      if (fixture.home_score !== null && fixture.away_score !== null) {
        return `${fixture.home_score} - ${fixture.away_score}`;
      }
    }
    return null;
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-4 bg-muted/30">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{format(matchDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge className={competitionStyle}>
              {competition && competition !== 'Other'
                ? (competitionNames[competition as keyof typeof competitionNames] || competition)
                : 'Other Match'}
            </Badge>
            
            <Badge className={statusStyle}>
              {normalizedStatus}
            </Badge>
        </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-6">
        <div className="grid grid-cols-7 items-center">
          {/* Home Team */}
          <div className="col-span-3 flex flex-col items-center sm:items-end text-center sm:text-right">
            <div className="font-bold text-base sm:text-lg">{homeTeam}</div>
            {fixture.is_home_game && <div className="text-xs text-muted-foreground">(Home)</div>}
      </div>
          
          {/* Score */}
          <div className="col-span-1 flex justify-center px-2 sm:px-4">
            {scoreDisplay() ? (
              <div className={`font-bold text-xl ${fixture.status.toLowerCase() === 'in progress' ? 'animate-pulse text-primary' : ''}`}>
                {scoreDisplay()}
        </div>
          ) : (
              <div className="text-muted-foreground font-medium">vs</div>
          )}
        </div>
          
          {/* Away Team */}
          <div className="col-span-3 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="font-bold text-base sm:text-lg">{awayTeam}</div>
            {!fixture.is_home_game && <div className="text-xs text-muted-foreground">(Away)</div>}
          </div>
        </div>
        
        {/* Match Info - FIXED TIME FORMAT */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(matchDate, 'HH:mm')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{fixture.location}</span>
      </div>
        </div>
        
        {/* Notes (if available) */}
        {fixture.notes && (
          <div className="mt-4 text-sm text-muted-foreground border-t pt-4 border-border">
            {fixture.notes}
          </div>
        )}
        
        {/* Ticket Link (if available) */}
        {fixture.ticket_link && fixture.status.toLowerCase() === 'upcoming' && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button className="w-full sm:w-auto" size="sm" asChild>
              <a href={fixture.ticket_link} target="_blank" rel="noopener noreferrer">
                <Ticket className="mr-2 h-4 w-4" /> Buy Tickets
              </a>
            </Button>
        </div>
      )}
    </CardContent>
  </Card>
  );
};

// Define a mapping between API status values and tab categories
const statusToTabMapping: Record<string, 'upcoming' | 'completed' | 'postponedOrCancelled'> = {
  'upcoming': 'upcoming',
  'in progress': 'upcoming',
  'completed': 'completed',
  'postponed': 'postponedOrCancelled',
  'cancelled': 'postponedOrCancelled'
};

export default function Fixtures() {
  // State for selected date and filters
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [competitionFilter, setCompetitionFilter] = useState<string>("All");
  
  // Fetch fixtures data using TanStack Query
  const { data: fixtures = [], isLoading, error } = useFixtures();

 
  
  // Filter and group fixtures
  const groupedFixtures = useMemo(() => {
    // Initialize empty arrays for each category
    const upcoming: Fixture[] = [];
    const completed: Fixture[] = [];
    const postponedOrCancelled: Fixture[] = [];
    
    // Categorize each fixture
    fixtures.forEach(fixture => {
      const normalizedStatus = fixture.status.toLowerCase();
      const category = statusToTabMapping[normalizedStatus] || 'upcoming'; // Default to upcoming
      
      if (category === 'upcoming') upcoming.push(fixture);
      else if (category === 'completed') completed.push(fixture);
      else if (category === 'postponedOrCancelled') postponedOrCancelled.push(fixture);
    });
    
    // Apply competition filter if not "All"
    const filterByCompetition = (items: Fixture[]) => {
      if (competitionFilter === "All") return items;
      
      if (competitionFilter === "Other") {
        // Show fixtures with empty or "Other" competition
        return items.filter(f => !f.competition || f.competition.trim() === '' || f.competition === "Other");
      }
      
      return items.filter(f => f.competition === competitionFilter);
    };
    
    return {
      upcoming: filterByCompetition(upcoming),
      completed: filterByCompetition(completed),
      postponedOrCancelled: filterByCompetition(postponedOrCancelled)
    };
  }, [fixtures, competitionFilter]);
  
 
  
  // Filter fixtures for the calendar view by selected date
  const fixturesOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    return fixtures.filter(fixture => {
      const matchDate = subHours(parseISO(fixture.match_date), 3);
      return isSameDay(matchDate, selectedDate);
    });
  }, [fixtures, selectedDate]);
  
  // Get all unique competitions for filter dropdown
  const competitions = useMemo(() => {
    // Get unique competitions but filter out any empty strings
    const uniqueCompetitions = [...new Set(fixtures.map(f => f.competition))]
      .filter(comp => comp && comp.trim() !== ''); // Filter out empty or whitespace-only values
    
    // Check if we have any fixtures with empty competition values
    const hasEmptyCompetitions = fixtures.some(f => !f.competition || f.competition.trim() === '');
    
    // If we have empty competitions, add an "Other" option
    return ["All", ...uniqueCompetitions, ...(hasEmptyCompetitions ? ["Other"] : [])];
  }, [fixtures]);
  
  // Update the datesWithFixtures calculation to properly format dates for the calendar
  const datesWithFixtures = useMemo(() => {
    return fixtures.map(fixture => {
      const date = subHours(parseISO(fixture.match_date), 3);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });
  }, [fixtures]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2 text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold">Fixtures & Results</h1>
        <p className="text-muted-foreground">Stay up to date with all The Board FC matches.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Select value={competitionFilter} onValueChange={setCompetitionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by competition" />
          </SelectTrigger>
          <SelectContent>
            {competitions.map(comp => (
              // Only render if comp is not empty
              comp && comp.trim() !== '' ? (
                <SelectItem key={comp} value={comp}>{comp}</SelectItem>
              ) : null
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>Error loading fixtures. Please try again later.</p>
            </div>
          ) : (
          <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full h-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-8">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="postponed">Postponed/Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <ScrollArea className="h-[600px] pr-4">
                  {groupedFixtures.upcoming.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No upcoming matches found.
                    </div>
                  ) : (
                <div className="space-y-4">
                      {groupedFixtures.upcoming
                        .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
                        .map((fixture, index) => (
                    <motion.div
                            key={fixture.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                            <MatchCard fixture={fixture} />
                    </motion.div>
                  ))}
                </div>
                  )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="completed">
              <ScrollArea className="h-[600px] pr-4">
                  {groupedFixtures.completed.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No completed matches found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {groupedFixtures.completed
                        .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
                        .map((fixture, index) => (
                          <motion.div
                            key={fixture.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <MatchCard fixture={fixture} />
                          </motion.div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="postponed">
                <ScrollArea className="h-[600px] pr-4">
                  {groupedFixtures.postponedOrCancelled.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No postponed or cancelled matches found.
                    </div>
                  ) : (
                <div className="space-y-4">
                      {groupedFixtures.postponedOrCancelled
                        .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
                        .map((fixture, index) => (
                    <motion.div
                            key={fixture.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                            <MatchCard fixture={fixture} />
                    </motion.div>
                  ))}
                </div>
                  )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Match Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border flex justify-center items-center"
                modifiers={{
                  hasFixture: (date) => 
                    datesWithFixtures.some(fixtureDate => 
                      isSameDay(date, fixtureDate)
                    )
                }}
                modifiersStyles={{
                  hasFixture: {
                    backgroundColor: 'green',
                    borderColor: 'green',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                }}
              />
              
              {/* Calendar Legend */}
              <div className="mt-2 flex items-center justify-center text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                <span>Dates with matches</span>
              </div>
              
              {/* Selected Date Fixtures */}
              <div className="mt-6">
                <h3 className="font-medium mb-4">
                  {selectedDate ? (
                    <>Matches on {format(selectedDate, 'MMMM d, yyyy')}</>
                  ) : (
                    <>Select a date</>
                  )}
                </h3>
                
                {fixturesOnSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {fixturesOnSelectedDate.map(fixture => (
                      <div 
                        key={fixture.id} 
                        className="p-3 rounded-md bg-muted/50 border border-border"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">
                            {fixture.is_home_game ? 'Home vs' : 'Away at'} {fixture.opponent}
                          </span>
                          <Badge className={statusStyles[fixture.status as keyof typeof statusStyles] || statusStyles.default}>
                            {fixture.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(subHours(parseISO(fixture.match_date), 3), 'h:mm a')} • {fixture.location}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-md">
                    No matches scheduled for this day.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 