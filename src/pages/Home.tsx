import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import HomeImage from '@/assets/images/home-image.jpeg'
import MatchImage from '@/assets/images/match-bg.webp'
import { ArrowRight, ChevronLeft, ChevronRight, Trophy, Target, Shield, Clock, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNewsArticles, usePlayers, useAllPlayerStats, useTeamStats, useFixtures } from '@/services/queries'
import { format, formatDistanceToNow, parseISO, subHours } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'

import logo from '@/assets/images/logo.png'
import opponent from '@/assets/images/opponent.png'
import Sponsers from '@/components/Sponsers'

interface Match {
  id: string | number;
  date: string;
  competition: string;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  score: string | null;
  time: string | null;
  status: string;
  hasMatchCentre?: boolean;
  hasTickets?: boolean;
}

const MatchCard = ({ match }: { match: Match }) => {
  return (
    <div className="overflow-hidden border rounded-lg bg-background/95 dark:bg-background/95 backdrop-blur-sm border-border">
      <div className="px-3 py-3 space-y-3 sm:px-6 sm:py-4 sm:space-y-4">
        <div className="flex flex-col space-y-1">
          <span className="text-xs font-medium sm:text-sm text-foreground">{match.date}</span>
          <span className="text-xs text-muted-foreground">{match.competition}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="grid grid-cols-1">
            <img 
              src={match.homeTeam.name === 'The Board FC' ? logo : match.homeTeam.logo} 
              alt={match.homeTeam.name} 
              className="object-cover w-24 h-24 rounded-md dark:bg-gray-200"
            />
            <span className="text-sm font-bold sm:text-base text-foreground">{match.homeTeam.name}</span>
          </div>
          <div className="px-3 text-base font-extrabold sm:text-xl text-foreground">
            {match.score || match.time}
          </div>
          <div className="grid grid-cols-1">
          <img 
              src={match.awayTeam.name === 'The Board FC' ? logo : match.awayTeam.logo} 
              alt={match.awayTeam.name} 
              className="object-cover w-24 h-24 rounded-md dark:bg-gray-200"
            />
            <span className="text-sm font-bold sm:text-base text-foreground">{match.awayTeam.name}</span>
           
          </div>
        </div>
      </div>
    </div>
  )
}

// Update the MatchesSection to use real data
const MatchesSection = () => {
  // Fetch fixtures data using TanStack Query
  const { data: fixtures = [], isLoading, error } = useFixtures();
  
  // Convert API fixtures to match the format expected by MatchCard
  const formattedMatches = useMemo(() => {
    if (!fixtures || fixtures.length === 0) return [];
    
    // Filter out postponed and cancelled matches, then sort and limit to 3
    return fixtures
      .filter(fixture => {
        const status = fixture.status.toLowerCase();
        return !['postponed', 'cancelled'].includes(status);
      })
      .slice(0, 3)
      .map(fixture => {
        // Adjust the match date by subtracting 3 hours
        const matchDate = subHours(parseISO(fixture.match_date), 3);
        
        // Determine if the match is completed or upcoming
        const isCompleted = fixture.status.toLowerCase() === 'completed';
        const isUpcoming = ['upcoming', 'in progress'].includes(fixture.status.toLowerCase());
        
        // Format the date
        const formattedDate = format(matchDate, 'EEE dd MMM yyyy').toUpperCase();
        
        // Format score or time with adjusted date
        let scoreOrTime = format(matchDate, 'HH:mm');
        if (isCompleted && fixture.home_score !== null && fixture.away_score !== null) {
          scoreOrTime = `${fixture.home_score} - ${fixture.away_score}`;
        }
        
        // Use opponent_logo_url if available, otherwise use default
        const opponentLogo = fixture.opponent_logo_url || opponent;
        
        // Determine which teams are playing
        const homeTeam = fixture.is_home_game 
          ? { name: 'The Board FC', logo: logo } 
          : { name: fixture.opponent, logo: opponentLogo };
          
        const awayTeam = fixture.is_home_game 
          ? { name: fixture.opponent, logo: opponentLogo } 
          : { name: 'The Board FC', logo: logo };
        
        // Format the competition name
        let competition = fixture.competition || 'Other Match';
        if (competition.toLowerCase().includes('league')) {
          competition = 'LEAGUE';
        } else if (competition.toLowerCase().includes('cup')) {
          competition = 'CUP';
        } else if (competition.toLowerCase().includes('friendly')) {
          competition = 'FRIENDLY';
        } else {
          competition = competition.toUpperCase();
        }
        
        return {
          id: fixture.id,
          date: formattedDate,
          competition: competition,
          homeTeam,
          awayTeam,
          score: isCompleted ? scoreOrTime : null,
          time: isUpcoming ? scoreOrTime : null,
          status: isCompleted ? 'FT' : fixture.status.toUpperCase(),
          broadcaster: null, // You could add this data to your fixtures table if needed
          hasMatchCentre: true,
          hasTickets: isUpcoming && fixture.ticket_link !== null
        };
      });
  }, [fixtures]);
  
  return (
    <section className="relative py-10 sm:py-12 md:py-16 bg-muted dark:bg-muted/50">
      <h2 className="mb-6 text-2xl font-bold text-center sm:text-3xl md:mb-8 text-foreground">Matches</h2>
      <div className="relative px-4 mx-auto">
        <div
          className="absolute inset-0 w-full h-full bg-center bg-cover"
          style={{
            backgroundImage: `url(${MatchImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>
        
        <div className="relative flex items-center justify-center py-8 md:py-20">
          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-full rounded-lg h-60" />
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="p-8 text-center rounded-lg bg-red-50/10 backdrop-blur-sm">
              <p>Unable to load fixture data. Please try again later.</p>
            </div>
          ) : formattedMatches.length === 0 ? (
            // Empty state
            <div className="p-8 text-center rounded-lg text-muted-foreground bg-background/70 backdrop-blur-sm">
              <p>No upcoming matches scheduled at this time.</p>
            </div>
          ) : (
            // Display matches
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {formattedMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
        
        <div className="relative pb-8 text-center">
          <Link to="/fixtures">
            <Button variant="outline" className="bg-background/50 backdrop-blur-sm hover:bg-background/80">
              View All Fixtures
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}


// interface NewsItem {
//   id: string;
//   title: string;
//   summary: string;
//   content: string;
//   featured_image_url: string;
//   is_published: boolean;
//   publish_date: string | null;  // Note: Handle nullable field
//   tags: string[];
//   created_at: string;
//   updated_at: string;
// }

// Update the card component
// const NewsCard = ({ news }: { news: NewsItem }) => {
//   // Get the first tag as category
//   const category = news.tags && news.tags.length > 0 ? news.tags[0] : 'News';
  
//   // Calculate time ago from publish_date or use created_at as fallback
//   const dateToUse = news.publish_date ? news.publish_date : news.created_at;
//   const timeAgo = dateToUse ? formatDistanceToNow(parseISO(dateToUse), { addSuffix: false }) : 'Recently';
  
//   // Check if it's a premium article
//   const isPremium = news.tags && news.tags.includes('Premium');
  
//   return (
//     <motion.div
//       className="relative overflow-hidden border rounded-lg cursor-pointer group bg-background dark:bg-background/95 border-border"
//       whileHover="hover"
//     >
//       {/* Image */}
//       <Link to={`/news/${news.id}`}>
//       <div className="relative aspect-video">
//         <img 
//           src={news.featured_image_url || '/placeholder-news.jpg'} 
//           alt={news.title} 
//           className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
//           onError={(e) => {
//             // Fallback if image fails to load
//             (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
//           }}
//         />
//         <div className="absolute inset-0 transition-colors bg-black/40 group-hover:bg-black/60" />
        
//         {/* Category Badge */}
//         <div className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/90 dark:bg-primary/80 rounded-full text-xs text-primary-foreground flex items-center gap-2">
//           {category}
//         </div>

//         {/* Premium Badge */}
//         {isPremium && (
//           <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-secondary/90 dark:bg-secondary/80 rounded-full text-xs text-secondary-foreground flex items-center gap-2">
//             Premium
//           </div>
//         )}
//       </div>
//       </Link>
//       {/* Title */}
//       <motion.div 
//         className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 to-transparent"
//         initial={{ opacity: 0.8, y: 10 }}
//         variants={{
//           hover: { opacity: 1, y: 0 }
//         }}
//       >
//         <h3 className="text-sm font-bold leading-tight text-white sm:text-base md:text-lg">{news.title}</h3>
//         <p className="mt-1 text-xs sm:text-sm text-white/70">{timeAgo} ago</p>
//       </motion.div>
//     </motion.div>
//   )
// }

// Update the FeaturedNewsSection component
const FeaturedNewsSection = () => {
  const { data: newsArticles = [], isLoading, error } = useNewsArticles();
  
  // Sort articles by date to show latest first
  const sortedArticles = [...newsArticles].sort((a, b) => {
    const dateA = a.publish_date ? new Date(a.publish_date) : new Date(a.created_at);
    const dateB = b.publish_date ? new Date(b.publish_date) : new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Get first 6 articles for featured display
  const featuredArticles = sortedArticles.slice(0, 6);
  
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted dark:bg-muted/50">
      <div className="container px-4 mx-auto">
        <motion.div 
          className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold sm:text-2xl text-foreground">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              FEATURED NEWS
            </span>
          </h2>
          <Link 
            to="/news" 
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 sm:text-sm"
          >
            View All News
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {isLoading ? (
          // Loading skeleton with bento grid layout
          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            <Skeleton className="col-span-12 md:col-span-6 lg:col-span-8 aspect-[16/9] rounded-xl" />
            <Skeleton className="col-span-12 md:col-span-6 lg:col-span-4 aspect-[4/3] rounded-xl" />
            <Skeleton className="col-span-6 lg:col-span-4 aspect-video rounded-xl" />
            <Skeleton className="col-span-6 lg:col-span-4 aspect-video rounded-xl" />
            <Skeleton className="col-span-12 lg:col-span-4 aspect-video rounded-xl" />
          </div>
        ) : error ? (
          // Error state
          <div className="p-8 text-center text-red-500 rounded-lg bg-red-50">
            <p>Error loading news. Please try again later.</p>
          </div>
        ) : featuredArticles.length > 0 ? (
          // Bento grid layout with animations
          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            {/* Featured article (large) */}
            <motion.div 
              className="col-span-12 md:col-span-6 lg:col-span-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Link to={`/news/${featuredArticles[0].id}`}>
                <div className="relative h-full overflow-hidden rounded-xl group">
                  <motion.img 
                    src={featuredArticles[0].featured_image_url || '/placeholder-news.jpg'} 
                    alt={featuredArticles[0].title} 
                    className="w-full h-full object-cover aspect-[16/9]"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
                    }}
                  />
                  <div className="absolute inset-0 transition-all duration-300 bg-gradient-to-t from-black/80 via-black/50 to-transparent group-hover:via-black/60" />
                  
                  {/* Category Badge */}
                  {featuredArticles[0].tags && featuredArticles[0].tags.length > 0 && (
                    <div className="absolute px-3 py-1 text-xs rounded-full top-3 left-3 bg-primary/90 text-primary-foreground">
                      {featuredArticles[0].tags[0]}
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                        {featuredArticles[0].title}
                      </h3>
                      <p className="hidden mb-2 text-sm text-white/80 md:block line-clamp-2 sm:text-base">
                        {featuredArticles[0].summary}
                      </p>
                      <p className="text-xs text-white/60">
                        {featuredArticles[0].publish_date
                          ? format(parseISO(featuredArticles[0].publish_date), 'MMMM d, yyyy')
                          : format(parseISO(featuredArticles[0].created_at), 'MMMM d, yyyy')}
                        {' • '}
                        {formatDistanceToNow(
                          parseISO(featuredArticles[0].publish_date || featuredArticles[0].created_at), 
                          { addSuffix: false }
                        )} ago
                      </p>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Secondary featured article */}
            <motion.div 
              className="col-span-12 md:col-span-6 lg:col-span-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {featuredArticles[1] && (
                <Link to={`/news/${featuredArticles[1].id}`}>
                  <div className="relative h-full overflow-hidden rounded-xl group">
                    <motion.img 
                      src={featuredArticles[1].featured_image_url || '/placeholder-news.jpg'} 
                      alt={featuredArticles[1].title} 
                      className="w-full h-full object-cover aspect-[4/3]"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
                      }}
                    />
                    <div className="absolute inset-0 transition-all duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:via-black/60" />
                    
                    {/* Category Badge */}
                    {featuredArticles[1].tags && featuredArticles[1].tags.length > 0 && (
                      <div className="absolute px-3 py-1 text-xs rounded-full top-3 left-3 bg-primary/90 text-primary-foreground">
                        {featuredArticles[1].tags[0]}
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="mb-1 text-lg font-bold text-white">
                        {featuredArticles[1].title}
                      </h3>
                      <p className="text-xs text-white/60">
                        {formatDistanceToNow(
                          parseISO(featuredArticles[1].publish_date || featuredArticles[1].created_at), 
                          { addSuffix: false }
                        )} ago
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
            
            {/* Smaller articles row */}
            {[2, 3, 4].map((index, i) => (
              featuredArticles[index] && (
                <motion.div 
                  key={featuredArticles[index].id} 
                  className={`col-span-6 lg:col-span-4 ${index === 4 ? 'col-span-12 lg:col-span-4' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}
                >
                  <Link to={`/news/${featuredArticles[index].id}`}>
                    <div className="relative h-full overflow-hidden rounded-xl group">
                      <motion.img 
                        src={featuredArticles[index].featured_image_url || '/placeholder-news.jpg'} 
                        alt={featuredArticles[index].title} 
                        className="object-cover w-full h-full aspect-video"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-news.jpg';
                        }}
                      />
                      <div className="absolute inset-0 transition-all duration-300 bg-gradient-to-t from-black/80 to-transparent group-hover:from-black/90" />
                      
                      {/* Category Badge */}
                      {featuredArticles[index].tags && featuredArticles[index].tags.length > 0 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 rounded-full text-xs text-primary-foreground">
                          {featuredArticles[index].tags[0]}
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-sm font-bold text-white line-clamp-2">
                          {featuredArticles[index].title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            ))}
          </div>
        ) : (
          // Empty state
          <div className="p-8 text-center rounded-lg text-muted-foreground bg-muted/30">
            <p>No news articles available at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// Add this new interface and data
// interface PlayerStat {
//   id: number
//   name: string
//   number: string
//   position: string
//   image: string
//   statType: 'goals' | 'assists' | 'cleanSheets' | 'appearances'
//   statValue: number
//   statIcon: typeof Trophy | typeof Target | typeof Shield | typeof Clock
//   statLabel: string
// }


// Enhanced PlayerStatsSection with auto-scroll and real data
const PlayerStatsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  
  // Fetch real data from API
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: playerStats = [], isLoading: statsLoading } = useAllPlayerStats();
  const { data: teamStats = [], isLoading: teamStatsLoading } = useTeamStats();
  
  const isLoading = playersLoading || statsLoading || teamStatsLoading;

  // Compute top players with their stats
  const topPlayers = useMemo(() => {
    if (isLoading || players.length === 0) return [];
    
    // Find the latest team stats for clean sheets
    const latestTeamStat = teamStats.length > 0 ? teamStats[0] : null;
    
    // Get goalkeepers for clean sheets
    const goalkeepers = players.filter(player => player.position === 'Goalkeeper');
    
    // Get top goal scorer
    const goalScorers = [...playerStats]
      .filter(stat => stat.goals > 0)
      .sort((a, b) => b.goals - a.goals);
    
    // Get top assist provider
    const assistProviders = [...playerStats]
      .filter(stat => stat.assists > 0)
      .sort((a, b) => b.assists - a.assists);
    
    // Get player with most appearances
    const appearances = [...playerStats]
      .sort((a, b) => b.matches_played - a.matches_played);
    
    const formattedPlayers = [];
    
    // Add top goal scorer
    if (goalScorers.length > 0) {
      const topScorer = goalScorers[0];
      const player = players.find(p => p.id === topScorer.player_id);
      if (player) {
        formattedPlayers.push({
          id: player.id,
          name: `${player.first_name} ${player.last_name}`,
          number: player.player_number,
          position: player.position,
          image: player.profile_image_url || 'https://via.placeholder.com/500x600?text=Player+Image',
          statType: 'goals',
          statValue: topScorer.goals,
    statIcon: Trophy,
          statLabel: 'Goals',
          accentColor: 'rgb(234, 179, 8)'
        });
      }
    }
    
    // Add top assist provider
    if (assistProviders.length > 0) {
      const topAssist = assistProviders[0];
      const player = players.find(p => p.id === topAssist.player_id);
      if (player) {
        formattedPlayers.push({
          id: player.id,
          name: `${player.first_name} ${player.last_name}`,
          number: player.player_number,
          position: player.position,
          image: player.profile_image_url || 'https://via.placeholder.com/500x600?text=Player+Image',
          statType: 'assists',
          statValue: topAssist.assists,
    statIcon: Target,
          statLabel: 'Assists',
          accentColor: 'rgb(34, 211, 238)'
        });
      }
    }
    
    // Add goalkeeper with clean sheets (using team stats)
    if (goalkeepers.length > 0 && latestTeamStat) {
      const goalkeeper = goalkeepers[0];
      formattedPlayers.push({
        id: goalkeeper.id,
        name: `${goalkeeper.first_name} ${goalkeeper.last_name}`,
        number: goalkeeper.player_number,
        position: goalkeeper.position,
        image: goalkeeper.profile_image_url || 'https://via.placeholder.com/500x600?text=Player+Image',
        statType: 'cleanSheets',
        statValue: latestTeamStat.clean_sheets || 0,
    statIcon: Shield,
        statLabel: 'Clean Sheets',
        accentColor: 'rgb(74, 222, 128)'
      });
    }
    
    // Add player with most appearances
    if (appearances.length > 0) {
      const mostAppearances = appearances[0];
      const player = players.find(p => p.id === mostAppearances.player_id);
      if (player) {
        formattedPlayers.push({
          id: player.id,
          name: `${player.first_name} ${player.last_name}`,
          number: player.player_number,
          position: player.position,
          image: player.profile_image_url || 'https://via.placeholder.com/500x600?text=Player+Image',
          statType: 'appearances',
          statValue: mostAppearances.matches_played,
    statIcon: Clock,
          statLabel: 'Appearances',
          accentColor: 'rgb(239, 68, 68)'
        });
      }
    }
    
    // Add total goals for the team
    if (latestTeamStat) {
      // Get a random attacking player to represent team goals
      // const attackers = players.filter(player => 
      //   player.position === 'Forward' || player.position === 'Striker' || player.position === 'Winger'
      // );
      
      
      formattedPlayers.push({
        id: 'team-goals',
        name: 'Team',
        number: '',
        position: 'The Board FC',
        image: logo || 'https://via.placeholder.com/500x600?text=Team+Image',
        statType: 'teamGoals',
        statValue: latestTeamStat.goals_for || 0,
        statIcon: Trophy,
        statLabel: 'Team Goals',
        accentColor: 'rgb(139, 92, 246)'
      });
    }
    
    return formattedPlayers;
  }, [players, playerStats, teamStats, isLoading]);

  // Auto-scroll effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoPlay && topPlayers.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % topPlayers.length);
      }, 8000); // Change slide every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoPlay, topPlayers.length]);

  const nextSlide = () => {
    setAutoPlay(false); // Pause autoplay when manually navigating
    setCurrentIndex(prev => (prev + 1) % topPlayers.length);
  };

  const prevSlide = () => {
    setAutoPlay(false); // Pause autoplay when manually navigating
    setCurrentIndex(prev => (prev - 1 + topPlayers.length) % topPlayers.length);
  };

  // Resume autoplay after a period of inactivity
  useEffect(() => {
    if (!autoPlay) {
      const timeout = setTimeout(() => {
        setAutoPlay(true);
      }, 10000); // Resume autoplay after 10 seconds of inactivity
      
      return () => clearTimeout(timeout);
    }
  }, [autoPlay, currentIndex]);

  if (isLoading) {
    return (
      <section className="py-16 overflow-hidden lg:py-24 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <div className="container px-4 mx-auto">
          <h2 className="mb-12 text-2xl font-bold text-center md:text-3xl text-foreground">
           TOP PLAYER STATISTICS
          </h2>
          
          <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
            <Skeleton className="w-[280px] h-[380px] md:w-[350px] md:h-[450px] rounded-lg" />
            <Skeleton className="w-[280px] h-[200px] rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (topPlayers.length === 0) {
    return (
      <section className="py-16 overflow-hidden lg:py-24 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-6 text-2xl font-bold md:text-3xl text-foreground">
           TOP PLAYER STATISTICS
          </h2>
          <p className="text-muted-foreground">No player statistics available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 overflow-hidden lg:py-24 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
      <div className="container px-4 mx-auto">
        <h2 className="mb-12 text-2xl font-bold text-center md:text-3xl text-foreground">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
          TOP PLAYER STATISTICS
          </span>
        </h2>
        
        <div className="relative">
          {/* Navigation Buttons - Always visible */}
          <motion.button
            onClick={prevSlide}
            className="absolute z-10 p-2 -translate-y-1/2 rounded-full shadow-lg left-2 sm:left-4 top-1/2 bg-background/90 hover:bg-background sm:p-3"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            className="absolute z-10 p-2 -translate-y-1/2 rounded-full shadow-lg right-2 sm:right-4 top-1/2 bg-background/90 hover:bg-background sm:p-3"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </motion.button>

          {/* Main carousel container with 3D perspective */}
          <div className="perspective-[1200px] h-[500px] md:h-[600px]">
            <AnimatePresence mode="wait">
              {topPlayers.map((player, index) => (
                index === currentIndex && (
              <motion.div
                key={player.id}
                className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, rotateY: -20, scale: 0.9 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, rotateY: 20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <div className="flex flex-col items-center justify-center w-full gap-8 md:flex-row md:gap-16">
                      {/* Player Image with Card */}
                      <motion.div
                        className="relative group"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="absolute transition duration-1000 rounded-lg opacity-75 -inset-1 bg-gradient-to-r from-primary/30 to-primary-foreground/30 blur-lg group-hover:opacity-100 group-hover:duration-200 animate-gradient-pulse"></div>
                        <div className="relative overflow-hidden border rounded-lg shadow-xl bg-background border-border">
                          <div className="h-[250px] sm:h-[350px] md:h-[450px] w-[280px] sm:w-[350px] overflow-hidden">
                    <img
                      src={player.image}
                      alt={player.name}
                              className="object-cover object-top w-full h-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x600?text=Player+Image';
                              }}
                            />
                            
                            {/* Add stat badge to top-right corner */}
                            <div 
                              className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full"
                              style={{ borderColor: player.accentColor, borderWidth: '2px' }}
                            >
                              <player.statIcon className="w-4 h-4" style={{ color: player.accentColor }} />
                              <span className="text-lg font-bold text-white">{player.statValue}</span>
                            </div>
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-8 h-8 font-bold text-white rounded-full sm:h-10 sm:w-10 bg-primary/10 backdrop-blur-sm">
                                    {player.number || '#'}
                                  </div>
                                  <p className="text-sm text-white/80">{player.position}</p>
                                </div>
                              
                              </div>
                              
                              <h3 className="text-lg font-bold text-white sm:text-xl">{player.name}</h3>
                            </div>
                          </div>
                        </div>
                  </motion.div>

                  {/* Stats Card */}
                      <div className="flex flex-col gap-6">
                  <motion.div
                          className="bg-background/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 border border-border w-[280px] sm:w-[320px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          <div className="mb-6 text-center">
                            <h3 className="mb-1 text-lg font-bold sm:text-xl text-foreground">{player.statLabel}</h3>
                            <div className="w-20 h-1 mx-auto rounded-full" style={{ background: player.accentColor }} />
                          </div>
                          
                          <div className="flex items-center justify-center mb-4">
                            <motion.div 
                              className="text-3xl font-extrabold text-transparent md:text-8xl bg-clip-text"
                              style={{ 
                                color: `${player.accentColor}` 
                              }}
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ 
                                type: "spring", 
                                delay: 0.3,
                                duration: 0.8 
                              }}
                            >
                             <h1>{player.statValue}</h1> 
                            </motion.div>
                          </div>
                          
                          <motion.div
                            className="mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div 
                              className="flex items-center justify-center p-3 rounded-lg"
                              style={{ backgroundColor: `${player.accentColor}20` }}
                            >
                              <player.statIcon className="w-5 h-5 mr-2" style={{ color: player.accentColor }} />
                              <span className="text-sm font-medium">Leading the team in {player.statLabel.toLowerCase()}</span>
                        </div>
                          </motion.div>
                        </motion.div>
                        
                        <motion.div 
                          className="flex justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          <Link 
                            to={`/player/${player.id}`} 
                            className="items-center hidden gap-2 px-6 font-medium text-white rounded-full md:py-3 md:flex"
                            style={{ 
                              background: `linear-gradient(135deg, ${player.accentColor}, var(--primary))` 
                            }}
                          >
                            <User className="w-4 h-4" />
                            View Full Profile
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )
            ))}
            </AnimatePresence>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {topPlayers.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setAutoPlay(false);
                }}
                className={`h-2 transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-10 bg-primary"
                    : "w-2 bg-primary/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="space-y-0">
      {/* Hero Section - Made fullscreen with video background */}
      <section className="relative flex items-center justify-center h-screen md:items-end">
        <div
          className="absolute inset-0 w-auto h-full bg-top bg-cover"
          style={{
            backgroundImage: `url(${HomeImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/50" />
        </div>
        <div className="relative px-4 mx-auto mb-0 text-center text-white md:mb-28">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-4xl font-extrabold tracking-tight md:text-8xl md:mb-6"
          >
      Welcome to The Board FC
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto mb-6 text-lg font-light underline sm:text-xl md:text-2xl lg:text-3xl md:mb-8"
          >
            The Beautiful Game's Architects | #Better Together
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-row justify-center gap-4"
          >
            <Link to={'/fixtures'}>
            <Button size="lg" className="px-4 py-5 text-base sm:text-lg sm:px-8 sm:py-6">
              View Fixtures
            </Button>
            </Link>
            <Link to={'/team'}>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-4 py-5 text-base text-white sm:text-lg sm:px-8 sm:py-6 sm:mt-0 bg-white/10 hover:bg-white/20 border-white/20"
            >
              Meet the Team
            </Button>
            </Link>
          </motion.div>
        </div>
        {/* Scroll indicator */}
        <motion.div 
          className="absolute -translate-x-1/2 bottom-8 left-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="flex justify-center w-6 h-10 border-2 rounded-full border-white/50">
            <div className="w-1 h-2 mt-2 rounded-full bg-white/50" />
          </div>
        </motion.div>
      </section>

      {/* Matches Section */}
      <MatchesSection />

      {/* Updated Player Stats Section */}
      <PlayerStatsSection />

      {/* Featured News Section */}
      <FeaturedNewsSection />

      {/* Sponsors Section */}
      <Sponsers/>
    </div>
  )
} 