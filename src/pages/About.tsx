import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MapPin, Phone, Mail, Clock, Users, Trophy, Heart, Target, Building2, ExternalLink, Calendar, Award, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useState } from 'react'

// Simplified data structure
const clubHistory = [
  {
    year: '1995',
    title: 'Foundation',
    description: 'The Board FC was founded by a group of passionate football enthusiasts in the heart of the city.'
  },
  {
    year: '2005',
    title: 'First Promotion',
    description: 'The club achieved its first major promotion, moving up to the professional league.'
  },
  {
    year: '2015',
    title: 'Stadium Opening',
    description: 'The Board Stadium was inaugurated, providing a state-of-the-art home for the club.'
  },
  {
    year: '2020',
    title: 'Community Award',
    description: 'Recognized for outstanding contribution to local community development.'
  }
]

const values = [
  {
    title: 'Excellence',
    description: 'Striving for the highest standards in everything we do.',
    icon: Trophy
  },
  {
    title: 'Community',
    description: 'Building strong relationships with our local community.',
    icon: Users
  },
  {
    title: 'Integrity',
    description: 'Maintaining the highest standards of honesty and fairness.',
    icon: Heart
  },
  {
    title: 'Innovation',
    description: 'Embracing new ideas and approaches to improve.',
    icon: Target
  }
]

const stadiumInfo = {
  name: 'The Board Stadium',
  capacity: '25,000',
  address: '123 Football Street, City Center',
  phone: '+44 123 456 7890',
  email: 'info@theboardfc.com',
  openingHours: 'Monday - Friday: 9:00 AM - 5:00 PM',
  facilities: [
    'Modern seating with excellent views',
    'State-of-the-art training facilities',
    'Fan shop and merchandise store',
    'Restaurants and bars',
    'Parking for 5,000 vehicles'
  ]
}

const keyPartners = [
  {
    name: 'TechCorp',
    type: 'Main Sponsor',
    logo: 'https://placehold.co/200x100',
    description: 'Leading technology solutions provider'
  },
  {
    name: 'SportsGear',
    type: 'Kit Sponsor',
    logo: 'https://placehold.co/200x100',
    description: 'Official kit and equipment supplier'
  },
  {
    name: 'City Youth Foundation',
    type: 'Community Partner',
    logo: 'https://placehold.co/150x150',
    description: 'Supporting youth development programs'
  },
  {
    name: 'Local Schools Network',
    type: 'Education Partner',
    logo: 'https://placehold.co/150x150',
    description: 'Promoting sports in education'
  }
]

export default function About() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Story</h1>
        <p className="text-lg text-muted-foreground">
          Founded in 1995, The Board FC has grown from a small local team to a community fixture, 
          centered on our values of excellence, integrity, and innovation.
        </p>
      </motion.div>

      {/* Bento grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Club history - Large tile */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-2 overflow-hidden"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Our Journey
              </CardTitle>
              <CardDescription>From humble beginnings to where we are today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {clubHistory.map((event, index) => (
                  <motion.div
                    key={event.year}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative pl-8 border-l-2 border-primary"
                  >
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{event.year}</span>
                        <span className="text-lg font-semibold">{event.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Values - Small tile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-full"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Our Values
              </CardTitle>
              <CardDescription>The principles that guide us</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {values.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5">
                      <value.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{value.title}</h3>
                      <p className="text-xs text-muted-foreground">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stadium and Partners section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Stadium info - Medium tile */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Our Stadium
              </CardTitle>
              <CardDescription>Home of The Board FC</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg overflow-hidden mb-4 h-40">
                <img 
                  src="https://placehold.co/800x400" 
                  alt="Stadium" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{stadiumInfo.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Capacity: {stadiumInfo.capacity}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{stadiumInfo.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key partners - Large tile */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Partners & Sponsors
              </CardTitle>
              <CardDescription>The organizations that support our vision</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {keyPartners.map((partner, index) => (
                  <motion.div
                    key={partner.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                    className="flex flex-col items-center text-center p-4 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="w-16 h-16 flex-shrink-0 mb-3">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="font-medium text-sm">{partner.name}</h3>
                    <p className="text-xs text-muted-foreground">{partner.type}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CTA section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-12"
      >
        <h2 className="text-2xl font-bold mb-4">Want to know more?</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Feel free to reach out to us with any questions or to learn more about our club.
        </p>
        <Button asChild size="lg">
          <Link to="/contact">Contact Us</Link>
        </Button>
      </motion.div>
    </div>
  )
} 