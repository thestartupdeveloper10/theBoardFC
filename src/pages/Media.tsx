import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Image as ImageIcon } from 'lucide-react'

// Temporary data - will be replaced with Supabase data later
const mediaCategories = ['All', 'Photos', 'Videos']

const photos = [
  {
    id: 1,
    title: 'Match Day Atmosphere',
    description: 'Fans cheering during the season opener',
    image: 'https://placehold.co/800x600',
    category: 'Photos',
    date: '2024-02-10'
  },
  {
    id: 2,
    title: 'Team Training',
    description: 'Players during morning training session',
    image: 'https://placehold.co/800x600',
    category: 'Photos',
    date: '2024-02-08'
  },
  {
    id: 3,
    title: 'Community Event',
    description: 'Youth players meeting the team',
    image: 'https://placehold.co/800x600',
    category: 'Photos',
    date: '2024-02-05'
  },
  {
    id: 4,
    title: 'Stadium View',
    description: 'The Board Stadium at sunset',
    image: 'https://placehold.co/800x600',
    category: 'Photos',
    date: '2024-02-03'
  }
]

const videos = [
  {
    id: 1,
    title: 'Match Highlights',
    description: 'Highlights from our latest match',
    thumbnail: 'https://placehold.co/800x600',
    category: 'Videos',
    date: '2024-02-10'
  },
  {
    id: 2,
    title: 'Behind the Scenes',
    description: 'A day in the life of our players',
    thumbnail: 'https://placehold.co/800x600',
    category: 'Videos',
    date: '2024-02-08'
  },
  {
    id: 3,
    title: 'Training Session',
    description: 'Watch our team in action during training',
    thumbnail: 'https://placehold.co/800x600',
    category: 'Videos',
    date: '2024-02-05'
  },
  {
    id: 4,
    title: 'Fan Reactions',
    description: 'Fans celebrating our latest victory',
    thumbnail: 'https://placehold.co/800x600',
    category: 'Videos',
    date: '2024-02-03'
  }
]

const PhotoCard = ({ photo }: { photo: typeof photos[0] }) => (
  <Card className="overflow-hidden group">
    <div className="relative aspect-video">
      <img
        src={photo.image}
        alt={photo.title}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-white" />
      </div>
    </div>
    <CardHeader>
      <CardTitle className="text-lg">{photo.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{photo.description}</p>
      <p className="text-xs text-muted-foreground mt-2">{photo.date}</p>
    </CardContent>
  </Card>
)

const VideoCard = ({ video }: { video: typeof videos[0] }) => (
  <Card className="overflow-hidden group">
    <div className="relative aspect-video">
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Play className="w-8 h-8 text-white" />
      </div>
    </div>
    <CardHeader>
      <CardTitle className="text-lg">{video.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{video.description}</p>
      <p className="text-xs text-muted-foreground mt-2">{video.date}</p>
    </CardContent>
  </Card>
)

export default function Media() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredPhotos = selectedCategory === 'All' || selectedCategory === 'Photos'
    ? photos
    : []

  const filteredVideos = selectedCategory === 'All' || selectedCategory === 'Videos'
    ? videos
    : []

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Media Gallery</h1>
        <p className="text-muted-foreground">Browse photos and videos from The Board FC.</p>
      </motion.div>

      <Tabs defaultValue="All" className="w-full" onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          {mediaCategories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="h-[800px] pr-4">
          {selectedCategory === 'All' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Photos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPhotos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <PhotoCard photo={photo} />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6">Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <VideoCard video={video} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedCategory === 'Photos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PhotoCard photo={photo} />
                </motion.div>
              ))}
            </div>
          )}

          {selectedCategory === 'Videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <VideoCard video={video} />
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  )
} 