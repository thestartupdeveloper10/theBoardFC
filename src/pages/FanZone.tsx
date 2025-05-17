import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Twitter, Instagram, Facebook, Users, Heart, Trophy, Calendar } from 'lucide-react'

// Temporary data - will be replaced with Supabase data later
const fanStories = [
  {
    id: 1,
    title: 'A Family Tradition',
    content: 'For three generations, my family has been supporting The Board FC. Every match day, we gather together to cheer on our team...',
    author: 'Sarah Thompson',
    date: '2024-02-10',
    image: 'https://placehold.co/600x400'
  },
  {
    id: 2,
    title: 'My First Match',
    content: 'Ill never forget my first match at The Board Stadium. The atmosphere was electric, and the passion of the fans was contagious...',
    author: 'James Wilson',
    date: '2024-02-08',
    image: 'https://placehold.co/600x400'
  },
  {
    id: 3,
    title: 'Community Spirit',
    content: 'The Board FC is not just a football club; it is a community',
    author: 'Emma Davis',
    date: '2024-02-05',
    image: 'https://placehold.co/600x400'
  }
]

const communityInitiatives = [
  {
    id: 1,
    title: 'Youth Development Program',
    description: 'Supporting local youth football development through training camps and equipment donations.',
    icon: Users,
    date: 'Ongoing'
  },
  {
    id: 2,
    title: 'Charity Match',
    description: 'Annual charity match raising funds for local community projects.',
    icon: Heart,
    date: 'March 15, 2024'
  },
  {
    id: 3,
    title: 'Fan of the Month',
    description: 'Recognizing outstanding contributions from our fan community.',
    icon: Trophy,
    date: 'Monthly'
  },
  {
    id: 4,
    title: 'Community Day',
    description: 'Open day at the stadium with activities for all ages.',
    icon: Calendar,
    date: 'April 1, 2024'
  }
]

const membershipTiers = [
  {
    name: 'Basic',
    price: '£25',
    benefits: [
      'Match day newsletter',
      '10% off merchandise',
      'Access to fan forum',
      'Monthly e-newsletter'
    ]
  },
  {
    name: 'Premium',
    price: '£50',
    benefits: [
      'All Basic benefits',
      'Priority ticket access',
      'Exclusive match day content',
      'Meet & greet opportunities',
      'Free match day program'
    ]
  },
  {
    name: 'VIP',
    price: '£100',
    benefits: [
      'All Premium benefits',
      'Season ticket priority',
      'Exclusive stadium tours',
      'Player meet & greet',
      'Complimentary food & drink'
    ]
  }
]

const socialMediaPosts = [
  {
    id: 1,
    platform: 'Twitter',
    content: 'Great atmosphere at todays training session! 🔥 #TheBoardFC',
    date: '2 hours ago',
    icon: Twitter
  },
  {
    id: 2,
    platform: 'Instagram',
    content: 'Behind the scenes: Match day preparations 📸',
    date: '5 hours ago',
    icon: Instagram
  },
  {
    id: 3,
    platform: 'Facebook',
    content: 'Join us this weekend for our Community Day! 🎉',
    date: '1 day ago',
    icon: Facebook
  }
]

const FanStoryCard = ({ story }: { story: typeof fanStories[0] }) => (
  <Card className="overflow-hidden">
    <div className="relative h-48">
      <img
        src={story.image}
        alt={story.title}
        className="w-full h-full object-cover"
      />
    </div>
    <CardHeader>
      <CardTitle>{story.title}</CardTitle>
      <CardDescription className="line-clamp-2">{story.content}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">By {story.author}</span>
        <span className="text-muted-foreground">{story.date}</span>
      </div>
    </CardContent>
  </Card>
)

const InitiativeCard = ({ initiative }: { initiative: typeof communityInitiatives[0] }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <initiative.icon className="w-6 h-6 text-primary" />
        <CardTitle className="text-lg">{initiative.title}</CardTitle>
      </div>
      <CardDescription>{initiative.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{initiative.date}</p>
    </CardContent>
  </Card>
)

const MembershipCard = ({ tier }: { tier: typeof membershipTiers[0] }) => (
  <Card>
    <CardHeader>
      <CardTitle>{tier.name}</CardTitle>
      <CardDescription className="text-2xl font-bold">{tier.price}/year</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {tier.benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span className="text-primary">✓</span>
            {benefit}
          </li>
        ))}
      </ul>
      <Button className="w-full mt-4">Join Now</Button>
    </CardContent>
  </Card>
)

const SocialMediaCard = ({ post }: { post: typeof socialMediaPosts[0] }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <post.icon className="w-5 h-5 text-primary" />
        <span className="font-medium">{post.platform}</span>
      </div>
      <p className="text-sm">{post.content}</p>
      <p className="text-xs text-muted-foreground mt-2">{post.date}</p>
    </CardContent>
  </Card>
)

export default function FanZone() {
  const [selectedTab, setSelectedTab] = useState('stories')

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

      <Tabs defaultValue="stories" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8">
          <TabsTrigger value="stories">Fan Stories</TabsTrigger>
          <TabsTrigger value="initiatives">Community</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[800px] pr-4">
          <TabsContent value="stories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fanStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <FanStoryCard story={story} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="initiatives">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityInitiatives.map((initiative, index) => (
                <motion.div
                  key={initiative.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <InitiativeCard initiative={initiative} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="membership">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {membershipTiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <MembershipCard tier={tier} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="social">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socialMediaPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <SocialMediaCard post={post} />
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
} 