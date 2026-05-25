import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, ShoppingBag, Camera, ArrowRight, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import hoodie1 from '@/assets/images/merch/hood1.jpeg'
import hoodie2 from '@/assets/images/merch/hood2.jpeg'
import image1 from '@/assets/images/fan/1.jpeg'
import image2 from '@/assets/images/fan/2.jpeg'
import image3 from '@/assets/images/fan/3.jpeg'
import image4 from '@/assets/images/fan/4.jpeg'
import image5 from '@/assets/images/fan/5.jpeg'
import image6 from '@/assets/images/fan/6.jpeg'
import image7 from '@/assets/images/fan/7.jpeg'
import image8 from '@/assets/images/fan/8.jpeg'
import image9 from '@/assets/images/fan/9.jpeg'
import image10 from '@/assets/images/fan/10.jpeg'

const galleryImages = [
  { id: 1, src: image1 },
  { id: 2, src: image2 },
  { id: 3, src: image3 },
  { id: 4, src: image4 },
  { id: 5, src: image5 },
  { id: 6, src: image6 },
  { id: 7, src: image7 },
  { id: 8, src: image8 },
  { id: 9, src: image9 },
  { id: 10, src: image10 },
]

const merchandise = [
  {
    id: 1,
    name: 'Classic Team Hoodie',
    price: 'Ksh 1,500',
    image: hoodie1,
    description: 'Stay warm and show your support. Official club crest, heavyweight fleece.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tag: 'Best Seller',
    tagColor: '#eab308',
  },
  {
    id: 2,
    name: 'Premium Away Day Hoodie',
    price: 'Ksh 1,500',
    image: hoodie2,
    description: 'Embroidered logo, premium weight cotton blend. Perfect for away days.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tag: 'New',
    tagColor: '#4CC7D2',
  },
]

// ─── LIGHTBOX ──────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <motion.img
          src={src}
          alt="Fan photo"
          className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl"
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  )
}

// ─── HERO ──────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-[82vh] overflow-hidden bg-[#060b18] flex items-center">
      {/* Fan photo mosaic background */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-2">
        {galleryImages.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-[#060b18]/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060b18] via-[#060b18]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060b18] via-transparent to-[#060b18]/40" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#eab308]/8 blur-[120px]" />

      <div className="relative container mx-auto px-4 py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#eab308]/25 bg-[#eab308]/8 mb-8">
            <Users className="w-3.5 h-3.5 text-[#eab308]" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#eab308] uppercase">
              The Board FC Community
            </span>
          </div>

          <h1 className="text-[clamp(4rem,12vw,9rem)] font-black leading-[0.85] tracking-tighter mb-6">
            <span className="block text-white">FAN</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] via-[#f59e0b] to-[#4CC7D2]">
              ZONE
            </span>
          </h1>

          <p className="text-white/50 text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Where The Board FC fans come alive — your moments, your voice, your club.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="#gallery">
              <Button
                size="lg"
                className="group h-12 px-8 text-xs font-black tracking-[0.18em] uppercase bg-[#eab308] hover:bg-[#ca8a04] text-black rounded-full shadow-[0_0_32px_rgba(234,179,8,0.22)] transition-[color,background-color,box-shadow,transform,scale]"
              >
                <Camera className="mr-2 w-3.5 h-3.5" />
                Fan Gallery
              </Button>
            </a>
            <a href="#merch">
              <Button
                variant="ghost"
                size="lg"
                className="h-12 px-8 text-xs font-black tracking-[0.18em] uppercase text-white/55 border border-white/10 rounded-full hover:bg-white/5 hover:text-white transition-[color,background-color,border-color,transform,scale]"
              >
                <ShoppingBag className="mr-2 w-3.5 h-3.5" />
                Shop Merch
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/25" />
          <div className="w-1 h-1 rounded-full bg-white/25" />
        </motion.div>
      </div>
    </section>
  )
}

// ─── GALLERY ───────────────────────────────────────────────────────────────

function GallerySection({ onOpen }: { onOpen: (src: string) => void }) {
  return (
    <section id="gallery" className="py-16 md:py-24 bg-white dark:bg-[#080e1c] transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#4CC7D2] uppercase mb-2">
              Community Moments
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Fan Gallery
            </h2>
          </div>
          <span className="text-sm text-gray-400 dark:text-white/30 font-medium">
            {galleryImages.length} photos
          </span>
        </div>

        {/* Masonry grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {galleryImages.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              className="break-inside-avoid mb-3 group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm dark:shadow-none"
              onClick={() => onOpen(img.src)}
            >
              <img
                src={img.src}
                alt={`Fan moment ${i + 1}`}
                className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#eab308] flex items-center justify-center flex-shrink-0">
                    <Camera className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                    View
                  </span>
                </div>
              </div>
              {/* Number badge */}
              <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-black text-white">{i + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── MERCH ─────────────────────────────────────────────────────────────────

function MerchSection() {
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({})

  return (
    <section id="merch" className="py-16 md:py-24 bg-slate-50 dark:bg-[#060b18] transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#E63946] uppercase mb-2">
              Represent the club
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Official Merch
            </h2>
          </div>
          <Link
            to="/contact"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 dark:text-white/40 hover:text-[#E63946] transition-colors group"
          >
            Enquire
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {merchandise.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group flex flex-col rounded-3xl overflow-hidden border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none"
            >
              {/* Photo */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Tag badge */}
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase text-black"
                  style={{ backgroundColor: item.tagColor }}
                >
                  {item.tag}
                </div>

                {/* Price */}
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/15">
                  <span className="text-sm font-black text-[#eab308]">{item.price}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-white/40 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Size selector */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-white/30 uppercase mb-2">
                    Size
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {item.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() =>
                          setSelectedSizes(prev => ({
                            ...prev,
                            [item.id]: prev[item.id] === size ? '' : size,
                          }))
                        }
                        className={`w-9 h-9 rounded-lg text-xs font-bold border transition-[color,background-color,border-color] ${
                          selectedSizes[item.id] === size
                            ? 'bg-[#eab308] border-[#eab308] text-black'
                            : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 hover:border-[#eab308]/50 hover:text-[#eab308]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link to="/contact">
                  <Button className="w-full h-11 text-xs font-black tracking-[0.15em] uppercase bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-white/90 text-white dark:text-gray-900 rounded-xl transition-[color,background-color,transform,scale]">
                    <ShoppingBag className="mr-2 w-3.5 h-3.5" />
                    Order Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── COMMUNITY CTA ─────────────────────────────────────────────────────────

function CommunitySection() {
  return (
    <section className="relative py-20 md:py-28 bg-[#060b18] overflow-hidden">
      {/* Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#eab308]/6 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-[#4CC7D2]/6 blur-[80px]" />
      </div>

      <div className="relative container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#4CC7D2]/20 bg-[#4CC7D2]/6 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4CC7D2] animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#4CC7D2] uppercase">
              Est. 2020
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-4">
            Become part of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] to-[#4CC7D2]">
              something bigger.
            </span>
          </h2>

          <p className="text-white/45 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            The Board FC is more than a club — it's a community. Follow the journey, attend
            matchdays, and be part of the story.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-10 mb-12">
            {[
              { value: '2020', label: 'Founded' },
              { value: '∞', label: 'Ambition' },
              { value: '1', label: 'Community' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-[#eab308]">{s.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/contact">
              <Button
                size="lg"
                className="group h-12 px-8 text-xs font-black tracking-[0.18em] uppercase bg-[#eab308] hover:bg-[#ca8a04] text-black rounded-full shadow-[0_0_32px_rgba(234,179,8,0.22)] transition-[color,background-color,box-shadow,transform,scale]"
              >
                Get in Touch
                <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/fixtures">
              <Button
                variant="ghost"
                size="lg"
                className="h-12 px-8 text-xs font-black tracking-[0.18em] uppercase text-white/55 border border-white/10 rounded-full hover:bg-white/5 hover:text-white transition-[color,background-color,border-color,transform,scale]"
              >
                Next Matchday
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── ROOT ──────────────────────────────────────────────────────────────────

export default function FanZone() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  return (
    <div className="bg-slate-50 dark:bg-[#060b18]">
      <HeroSection />
      <GallerySection onOpen={setLightboxSrc} />
      <MerchSection />
      <CommunitySection />

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  )
}
