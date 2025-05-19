import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import hoodie1 from '@/assets/images/merch/hood1.jpeg'
import hoodie2 from '@/assets/images/merch/hood2.jpeg'

// New merchandise data
const merchandise = [
  {
    id: 1,
    name: 'Classic Team Hoodie',
    price: 'Ksh 1,500',
    image: hoodie1,
    description: 'Stay warm and show your support with our classic team hoodie featuring the official club crest.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Grey'],
    featured: true
  },
  {
    id: 2,
    name: 'Premium Away Day Hoodie',
    price: 'Ksh 1,500',
    image: hoodie2,
    description: 'Premium quality hoodie with embroidered logo and away team colors.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Red', 'Blue'],
    featured: true
  }
]

// Gallery images
const galleryImages = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  src: `./src/assets/images/fan/${i + 1}.jpeg`,
  alt: `Fan gallery image ${i + 1}`
}))


// New component for merchandise items
const MerchandiseCard = ({ item }: { item: typeof merchandise[0] }) => (
  <Card className="overflow-hidden">
    <div className="relative h-84 overflow-hidden group">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {item.featured && (
        <Badge className="absolute top-2 right-2 bg-primary">Featured</Badge>
      )}
    </div>
    <CardHeader>
      <CardTitle>{item.name}</CardTitle>
      <CardDescription className="text-xl font-bold text-primary">{item.price}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">{item.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {item.sizes.map(size => (
          <Badge key={size} variant="outline">{size}</Badge>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {item.colors.map(color => (
          <div key={color} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.toLowerCase() }}></div>
            <span className="text-xs">{color}</span>
          </div>
        ))}
      </div>
      
      {/* <Button className="w-full">Add to Cart</Button> */}
    </CardContent>
  </Card>
)

// Updated Gallery component for timeline view
const TimelineGalleryCard = ({ image, index }: { image: typeof galleryImages[0], index: number }) => {
  const isLeft = index % 2 === 0;
  
  return (
    <motion.div 
      className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-4 mb-8`}
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Image card */}
      <div className="w-full md:w-[calc(50%-2rem)]">
        <div className="relative overflow-hidden rounded-lg shadow-md group">
          <img 
            src={image.src} 
            alt={image.alt} 
            className="w-full h-64 object-cover object-top transition-all duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-bold px-4 py-2 bg-black/50 rounded-md">
              {index + 1}
            </span>
          </div>
        </div>
      </div>
      
      {/* Timeline connector */}
      <div className="relative flex-shrink-0 w-4 self-stretch flex flex-col items-center">
        <div className="w-4 h-4 bg-primary rounded-full z-10"></div>
        <motion.div 
          className="w-0.5 bg-primary/30 absolute inset-0 origin-top"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        ></motion.div>
      </div>
      
      {/* Content/info */}
      <div className="w-full md:w-[calc(50%-2rem)] p-4">
        {/* <h3 className="font-bold text-lg mb-1">Fan Moment {index + 1}</h3> */}
        {/* <p className="text-muted-foreground text-sm">
          {isLeft 
            ? "Celebrating together with our amazing fans during a home match." 
            : "The passion and support of The Board FC supporters never fails to inspire."}
        </p> */}
      </div>
    </motion.div>
  );
};

export default function FanZone() {
  const [selectedTab, setSelectedTab] = useState('gallery')
  const [selectedTag, setSelectedTag] = useState('all')
  
  // Tags for filtering gallery images
  const galleryTags = ['all', 'matchday', 'fans', 'celebration', 'away']
  
  // Filter images based on selected tag (for demo, we'll use modulo to simulate filtering)
  const filteredImages = selectedTag === 'all' 
    ? galleryImages 
    : galleryImages.filter((image, index) => {
        if (selectedTag === 'matchday') return index % 3 === 0;
        if (selectedTag === 'fans') return index % 3 === 1;
        if (selectedTag === 'celebration') return index % 4 === 2;
        if (selectedTag === 'away') return index % 5 === 0;
        return true;
      });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Fan Zone</h1>
        <p className="text-muted-foreground">Join our community and be part of The Board FC family.</p>
      </motion.div>

      <Tabs defaultValue="gallery" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 mb-8">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="merchandise">Shop</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[800px] pr-4">
          <TabsContent value="gallery">
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Timeline Gallery</h2>
                <p className="text-muted-foreground">Scroll through our memories throughout the season</p>
                
                {/* Tag filter buttons */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {galleryTags.map(tag => (
                    <Button 
                      key={tag} 
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                      className="capitalize"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Timeline container */}
              <div className="relative">
                {/* Main vertical timeline line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform -translate-x-1/2"></div>
                
                {/* Timeline items */}
                <div className="space-y-0">
                  {filteredImages.map((image, index) => (
                    <TimelineGalleryCard key={image.id} image={image} index={index} />
                  ))}
                </div>
                
                {/* Empty state if no images match filter */}
                {filteredImages.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No images found with this tag.</p>
                    <Button 
                      variant="link" 
                      onClick={() => setSelectedTag('all')}
                      className="mt-2"
                    >
                      Show all images
                    </Button>
                  </div>
                )}
                
                {/* End of timeline */}
                {filteredImages.length > 0 && (
                  <div className="flex justify-center mt-8 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-3 h-3 bg-background rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Photo submission CTA */}
              <div className="mt-12 bg-muted p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">Add Your Photo to Our Timeline</h3>
                <p className="mb-4">Share your fan moments and be part of our visual club history</p>
                <Button variant="default">Upload Your Photos</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="merchandise">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Official Merchandise</h2>
                <Button variant="outline">View All</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {merchandise.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <MerchandiseCard item={item} />
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}