import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MapPin, Phone, Mail, Clock, Users, Trophy, Heart, Target, Building2, Handshake, ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react'
import { useState } from 'react'

// Temporary data - will be replaced with Supabase data later
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

// Add more details to sponsors data
const sponsors = [
  {
    name: 'TechCorp',
    tier: 'Main Sponsor',
    logo: 'https://placehold.co/200x100',
    description: 'Leading technology solutions provider',
    website: 'https://techcorp.example.com',
    partnershipDetails: 'TechCorp provides cutting-edge technology solutions for our stadium operations and fan engagement platforms.',
    benefits: [
      'Smart stadium management system',
      'Digital ticketing platform',
      'Fan engagement mobile app',
      'Data analytics dashboard'
    ]
  },
  {
    name: 'SportsGear',
    tier: 'Kit Sponsor',
    logo: 'https://placehold.co/200x100',
    description: 'Official kit and equipment supplier',
    website: 'https://sportsgear.example.com',
    partnershipDetails: 'SportsGear equips our team with premium quality kits and training equipment.',
    benefits: [
      'Professional match kits',
      'Training equipment',
      'Fan merchandise',
      'Youth academy gear'
    ]
  },
  {
    name: 'EnergyPlus',
    tier: 'Official Partner',
    logo: 'https://placehold.co/200x100',
    description: 'Sustainable energy solutions',
    website: 'https://energyplus.example.com',
    partnershipDetails: 'EnergyPlus helps us maintain sustainable operations through renewable energy solutions.',
    benefits: [
      'Solar power installation',
      'Energy efficiency systems',
      'Green certification',
      'Carbon footprint reduction'
    ]
  },
  {
    name: 'HealthFit',
    tier: 'Official Partner',
    logo: 'https://placehold.co/200x100',
    description: 'Sports nutrition and wellness',
    website: 'https://healthfit.example.com',
    partnershipDetails: 'HealthFit provides comprehensive nutrition and wellness solutions for our players.',
    benefits: [
      'Custom nutrition plans',
      'Supplementation program',
      'Recovery protocols',
      'Wellness monitoring'
    ]
  }
]

// Add more details to partners data
const partners = [
  {
    name: 'City Youth Foundation',
    type: 'Community Partner',
    logo: 'https://placehold.co/150x150',
    description: 'Supporting youth development programs',
    website: 'https://youthfoundation.example.com',
    impact: 'Over 1000 young people benefit from our joint programs annually.',
    programs: [
      'Youth football camps',
      'Leadership workshops',
      'Education support',
      'Career guidance'
    ]
  },
  {
    name: 'Local Schools Network',
    type: 'Education Partner',
    logo: 'https://placehold.co/150x150',
    description: 'Promoting sports in education',
    website: 'https://schoolsnetwork.example.com',
    impact: 'Partnering with 50+ schools to promote sports education.',
    programs: [
      'School sports programs',
      'Teacher training',
      'Equipment donations',
      'Talent identification'
    ]
  },
  {
    name: 'Sports Academy',
    type: 'Development Partner',
    logo: 'https://placehold.co/150x150',
    description: 'Talent development and training',
    website: 'https://sportsacademy.example.com',
    impact: 'Developing future stars through our comprehensive training programs.',
    programs: [
      'Elite training camps',
      'Scouting network',
      'Performance analysis',
      'Career development'
    ]
  },
  {
    name: 'Charity Foundation',
    type: 'Social Impact Partner',
    logo: 'https://placehold.co/150x150',
    description: 'Community outreach programs',
    website: 'https://charityfoundation.example.com',
    impact: 'Making a difference in our community through various initiatives.',
    programs: [
      'Food bank support',
      'Housing assistance',
      'Education grants',
      'Health awareness'
    ]
  }
]

const ContactForm = () => (
  <Card>
    <CardHeader>
      <CardTitle>Contact Us</CardTitle>
      <CardDescription>Send us a message and we'll get back to you as soon as possible.</CardDescription>
    </CardHeader>
    <CardContent>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Your email" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" placeholder="Message subject" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Your message" className="min-h-[150px]" />
        </div>
        <Button className="w-full">Send Message</Button>
      </form>
    </CardContent>
  </Card>
)

const HistoryTimeline = () => (
  <Card>
    <CardHeader>
      <CardTitle>Club History</CardTitle>
      <CardDescription>A journey through the years</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-8">
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
                <span className="font-bold">{event.year}</span>
                <span className="text-lg font-semibold">{event.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
)

const ValuesSection = () => (
  <Card>
    <CardHeader>
      <CardTitle>Our Values</CardTitle>
      <CardDescription>The principles that guide us</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {values.map((value, index) => (
          <motion.div
            key={value.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-start gap-4"
          >
            <value.icon className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
)

const StadiumSection = () => (
  <Card>
    <CardHeader>
      <CardTitle>Our Stadium</CardTitle>
      <CardDescription>{stadiumInfo.name}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>{stadiumInfo.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <span>{stadiumInfo.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <span>{stadiumInfo.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>{stadiumInfo.openingHours}</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Facilities</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {stadiumInfo.facilities.map((facility, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="text-primary">•</span>
                {facility}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
)

const SponsorsSection = () => {
  const [expandedSponsor, setExpandedSponsor] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Our Sponsors</CardTitle>
        <CardDescription>Proud partners supporting The Board FC</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div
                className="flex items-center gap-6 p-4 rounded-lg border cursor-pointer hover:border-primary transition-colors"
                onClick={() => setExpandedSponsor(expandedSponsor === sponsor.name ? null : sponsor.name)}
              >
                <div className="w-32 h-16 flex-shrink-0">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">{sponsor.name}</h3>
                    <span className="text-sm text-muted-foreground">({sponsor.tier})</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{sponsor.description}</p>
                </div>
                <motion.div
                  animate={{ rotate: expandedSponsor === sponsor.name ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedSponsor === sponsor.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t space-y-4">
                      <p className="text-sm">{sponsor.partnershipDetails}</p>
                      <div>
                        <h4 className="font-medium mb-2">Key Benefits</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {sponsor.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <span className="text-primary">•</span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                            Visit Website <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm">
                          Learn More <Info className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const PartnersSection = () => {
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Partners</CardTitle>
        <CardDescription>Working together for a better community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div
                className="flex items-start gap-4 p-4 rounded-lg border cursor-pointer hover:border-primary transition-colors"
                onClick={() => setExpandedPartner(expandedPartner === partner.name ? null : partner.name)}
              >
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">{partner.name}</h3>
                    <span className="text-sm text-muted-foreground">({partner.type})</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{partner.description}</p>
                </div>
                <motion.div
                  animate={{ rotate: expandedPartner === partner.name ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedPartner === partner.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 border-t space-y-4">
                      <p className="text-sm font-medium text-primary">{partner.impact}</p>
                      <div>
                        <h4 className="font-medium mb-2">Programs</h4>
                        <ul className="space-y-2">
                          {partner.programs.map((program, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <span className="text-primary">•</span>
                              {program}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={partner.website} target="_blank" rel="noopener noreferrer">
                            Visit Website <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm">
                          Get Involved <Users className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">About The Board FC</h1>
        <p className="text-muted-foreground">Learn about our history, values, and facilities.</p>
      </motion.div>

      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <HistoryTimeline />
            <ValuesSection />
            <PartnersSection />
          </div>
          <div className="space-y-8">
            <StadiumSection />
            <SponsorsSection />
            <ContactForm />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 