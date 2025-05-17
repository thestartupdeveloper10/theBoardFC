import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, X, User, Calendar, ArrowRight, Flag, Ruler, Weight } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePlayers } from '@/services/queries'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

const positions = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward']

// Sample staff data (you can replace with real data later)
const staff = [
  {
    id: 1,
    name: 'Michael Thompson',
    role: 'Head Coach',
    image: 'https://placehold.co/400',
    bio: 'Former professional player with over 15 years of coaching experience.'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Assistant Coach',
    image: 'https://placehold.co/400',
    bio: 'UEFA Pro License holder specializing in tactical development.'
  },
  {
    id: 3,
    name: 'Dr. Robert Chen',
    role: 'Team Doctor',
    image: 'https://placehold.co/400',
    bio: 'Sports medicine specialist with 20 years experience in professional football.'
  }
]

interface Player {
  id: string;
  first_name: string;
  last_name: string;
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

// Colors by position for the futuristic UI
const positionColors = {
  Goalkeeper: {
    primary: 'from-yellow-500 to-orange-500',
    secondary: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-500'
  },
  Defender: {
    primary: 'from-blue-500 to-cyan-500',
    secondary: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-500'
  },
  Midfielder: {
    primary: 'from-green-500 to-emerald-500',
    secondary: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-500'
  },
  Forward: {
    primary: 'from-red-500 to-rose-500',
    secondary: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-500'
  }
};

const PlayerCard = ({ player, onClick }: { player: Player, onClick: () => void }) => {
  // Get position-specific styling
  const positionStyle = positionColors[player.position as keyof typeof positionColors] || positionColors.Midfielder;
  
  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`relative h-full overflow-hidden cursor-pointer backdrop-blur-sm border-2 ${positionStyle.border} bg-background/60 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-${positionStyle.text}/10`}
        onClick={onClick}
      >
        {/* Gradient Header */}
        <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-r ${positionStyle.primary} opacity-80`} />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge 
            variant={player.status === 'active' ? 'default' : 'destructive'}
            className="uppercase text-xs font-bold"
          >
            {player.status}
          </Badge>
      </div>
        
        {/* Player Number */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-background/80 backdrop-blur-sm text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center">
            {player.player_number || "?"}
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 pt-16 px-6 pb-6 flex flex-col items-center">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative mb-4"
          >
            <div className={`absolute inset-0 rounded-full ${positionStyle.secondary} -m-2 animate-pulse`} />
            <Avatar className="w-24 h-24 border-4 border-background">
              {player.profile_image_url ? (
                <AvatarImage 
                  src={player.profile_image_url} 
                  alt={`${player.first_name} ${player.last_name}`} 
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-muted-foreground/10">
                  {player.first_name[0]}{player.last_name[0]}
                </AvatarFallback>
              )}
            </Avatar>
          </motion.div>
          
          {/* Name and Position */}
          <motion.div 
            className="text-center space-y-1 mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-bold text-xl">
              {player.first_name} {player.last_name}
            </h3>
            <p className={`${positionStyle.text} font-medium`}>{player.position}</p>
          </motion.div>
          
          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-3 w-full gap-3 mt-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`${positionStyle.secondary} rounded-lg p-3 text-center`}>
              <div className="font-bold text-lg">{player.height || '-'}</div>
              <div className="text-xs text-muted-foreground">Height (cm)</div>
            </div>
            <div className={`${positionStyle.secondary} rounded-lg p-3 text-center`}>
              <div className="font-bold text-lg">{player.weight || '-'}</div>
              <div className="text-xs text-muted-foreground">Weight (kg)</div>
            </div>
            <div className={`${positionStyle.secondary} rounded-lg p-3 text-center`}>
              <div className="font-bold text-lg">{player.joined_date ? format(new Date(player.joined_date), 'yyyy') : '-'}</div>
              <div className="text-xs text-muted-foreground">Joined</div>
            </div>
          </motion.div>
          
          {/* View Profile Button */}
          <motion.div 
            className="mt-4 w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="ghost" 
              className={`w-full ${positionStyle.secondary} hover:bg-opacity-80 flex items-center justify-center gap-2`}
            >
              View Profile <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
      </div>
  </Card>
    </motion.div>
)
}

const PlayerDetailModal = ({ player, open, onOpenChange }: { 
  player: Player | null, 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) => {
  if (!player) return null;
  
  // Get position-specific styling
  const positionStyle = positionColors[player.position as keyof typeof positionColors] || positionColors.Midfielder;
  
  // Format dates if available
  const formattedBirthDate = player.birth_date ? format(new Date(player.birth_date), 'MMMM d, yyyy') : 'Not available';
  const formattedJoinedDate = player.joined_date ? format(new Date(player.joined_date), 'MMMM d, yyyy') : 'Not available';
  
  // Calculate age if birth date is available
  const age = player.birth_date 
    ? Math.floor((new Date().getTime() - new Date(player.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
    : null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="justify-center align-center w-full">
      <DialogContent className="max-w-[400px] md:max-w-[700px] lg:max-w-[800px] p-0 overflow-hidden h-full md:max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Background gradient header */}
          <div className={`absolute inset-x-0 top-0 h-28 sm:h-32 md:h-40 bg-gradient-to-r ${positionStyle.primary}`} />
          
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 rounded-full p-1.5 sm:p-2 bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
          
          <div className="relative z-10 pt-6 sm:pt-8 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Left Column - Image and basic info */}
              <div className="md:col-span-1 flex flex-col items-center text-center space-y-2 sm:space-y-4">
                {/* Player number */}
                <div className="bg-background/90 backdrop-blur-sm text-2xl sm:text-3xl md:text-4xl font-bold rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center mb-1 sm:mb-2">
                  {player.player_number || "?"}
                </div>
                
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="relative"
                >
                  <div className={`absolute inset-0 rounded-full ${positionStyle.secondary} -m-2 sm:-m-3 animate-pulse`} />
                  <Avatar className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 border-2 sm:border-4 border-background">
                    {player.profile_image_url ? (
                      <AvatarImage 
                        src={player.profile_image_url} 
                        alt={`${player.first_name} ${player.last_name}`} 
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-muted-foreground/10 text-xl sm:text-2xl md:text-3xl">
                        {player.first_name[0]}{player.last_name[0]}
                      </AvatarFallback>
                    )}
          </Avatar>
                </motion.div>
                
                {/* Name and position */}
                <div className="space-y-0.5 sm:space-y-1 mt-2 sm:mt-4">
                  <h2 className="text-xl sm:text-2xl font-bold">{player.first_name} {player.last_name}</h2>
                  <p className={`${positionStyle.text} font-medium text-base sm:text-lg`}>{player.position}</p>
                </div>
                
                {/* Status */}
                <Badge 
                  variant={player.status === 'active' ? 'default' : 'destructive'}
                  className="uppercase text-xs font-bold"
                >
                  {player.status}
                </Badge>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 w-full mt-2 sm:mt-4">
                  <div className={`${positionStyle.secondary} rounded-lg p-2 sm:p-3 flex flex-col items-center`}>
                    <Ruler className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-1 opacity-70" />
                    <div className="font-bold text-sm sm:text-base">{player.height || '-'} cm</div>
                  </div>
                  <div className={`${positionStyle.secondary} rounded-lg p-2 sm:p-3 flex flex-col items-center`}>
                    <Weight className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-1 opacity-70" />
                    <div className="font-bold text-sm sm:text-base">{player.weight || '-'} kg</div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Detailed info */}
              <div className="md:col-span-2 space-y-4 sm:space-y-6 mt-4 md:mt-0">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold border-b pb-1 sm:pb-2">Player Profile</h3>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Birth Date</div>
                        <div className="font-medium text-sm sm:text-base">{formattedBirthDate}</div>
                        {age && <div className="text-xs sm:text-sm text-muted-foreground">Age: {age} years</div>}
          </div>
        </div>
                    
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Joined Club</div>
                        <div className="font-medium text-sm sm:text-base">{formattedJoinedDate}</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <h3 className="text-lg sm:text-xl font-bold border-b pb-1 sm:pb-2">Biography</h3>
                  <div className="prose-sm sm:prose-base dark:prose-invert max-w-none">
                    {player.bio ? (
                      <p className="text-sm sm:text-base">{player.bio}</p>
                    ) : (
                      <p className="text-sm sm:text-base text-muted-foreground italic">No biography available for this player.</p>
                    )}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 sm:mt-6 md:mt-8 flex justify-center md:justify-start"
                >
                  <Button 
                    size="sm"
                    className={`bg-gradient-to-r ${positionStyle.primary} hover:opacity-90 text-xs sm:text-sm`}
                    asChild
                  >
                    <Link to={`/player/${player.id}`}>
                      View Full Statistics
                    </Link>
                  </Button>
                </motion.div>
              </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)
}

const StaffCard = ({ member }: { member: typeof staff[0] }) => (
  <motion.div
    whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}
    whileTap={{ scale: 0.98 }}
  >
    <Card className="overflow-hidden backdrop-blur-sm bg-background/60 border-2 border-primary/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary to-primary-foreground opacity-80" />
      
      <div className="relative z-10 pt-12 px-6 pb-6 flex flex-col items-center">
        <Avatar className="w-24 h-24 border-4 border-background mb-4">
          <AvatarImage src={member.image} alt={member.name} />
          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        
        <div className="text-center space-y-1 mb-4">
          <h3 className="font-bold text-xl">{member.name}</h3>
          <p className="text-primary font-medium">{member.role}</p>
        </div>
        
        <p className="text-sm text-muted-foreground text-center">{member.bio}</p>
      </div>
  </Card>
  </motion.div>
)

// Helper function to group players by position
const groupPlayersByPosition = (players: Player[]) => {
  const positionOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
  const grouped = players.reduce((acc, player) => {
    if (!acc[player.position]) {
      acc[player.position] = []
    }
    acc[player.position].push(player)
    return acc
  }, {} as Record<string, Player[]>)

  // Return positions in the correct order
  return positionOrder.map(position => ({
    position,
    players: grouped[position] || []
  }))
}

export default function Team() {
  const [selectedPosition, setSelectedPosition] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)


  
  
  // Use TanStack Query to fetch actual player data
  const { data: players = [], isLoading, error } = usePlayers();

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesPosition = selectedPosition === 'All' || player.position === selectedPosition;
      const matchesSearch = 
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.player_number && player.player_number.toString().includes(searchQuery));
      return matchesPosition && matchesSearch;
    });
  }, [selectedPosition, searchQuery, players]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2">Our Team</h1>
        <p className="text-muted-foreground">Meet the players and staff that make The Board FC special.</p>
      </motion.div>

      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="players">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map(position => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[800px] pr-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Error loading players. Please try again later.
              </div>
            ) : filteredPlayers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-8"
              >
                No players found matching your criteria.
              </motion.div>
            ) : (
              <div className="space-y-12">
                <AnimatePresence>
                {groupPlayersByPosition(filteredPlayers).map(({ position, players }) => (
                  players.length > 0 && (
                    <motion.div
                      key={position}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">{position}s</h2>
                        <div className="h-px flex-grow bg-border" />
                        <span className="text-muted-foreground text-sm">
                          {players.length} {players.length === 1 ? 'player' : 'players'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {players.map((player, index) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <PlayerCard 
                              player={player} 
                              onClick={() => setSelectedPlayer(player)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )
                ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="staff">
          <ScrollArea className="h-[800px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StaffCard member={member} />
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

        <PlayerDetailModal
          player={selectedPlayer}
          open={!!selectedPlayer}
          onOpenChange={(open) => !open && setSelectedPlayer(null)}
        />
    </div>
  )
} 