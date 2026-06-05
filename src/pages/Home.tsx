import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Trophy, Target, Shield, Clock, ChevronRight, MapPin,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, parseISO, subHours, formatDistanceToNow } from 'date-fns'
import {
  useNewsArticles,
  usePlayers,
  useAllPlayerStats,
  useTeamStats,
  useFixtures,
  usePlayer,
} from '@/services/queries'
import logo from '@/assets/images/logo.png'
import opponent from '@/assets/images/opponent.png'
import teamPhoto from '@/assets/images/home-image.jpeg'
import Sponsers from '@/components/Sponsers'

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// CSS vars switch automatically with .dark class — see globals.css
const C = {
  bg:           'var(--hp-bg)',
  bg2:          'var(--hp-bg2)',
  card:         'var(--hp-card)',
  text:         'var(--hp-text)',
  muted:        'var(--hp-muted)',
  faint:        'var(--hp-faint)',
  border:       'var(--hp-border)',
  borderStrong: 'var(--hp-border-strong)',
  surface:      'var(--hp-surface)',
  surfaceHover: 'var(--hp-surface-hover)',
  divider:      'var(--hp-divider)',
  // accent colours stay constant across modes
  gold:   '#f0b429',
  teal:   '#06b6d4',
  red:    '#ef4444',
  green:  '#22c55e',
}

// Hero section is ALWAYS dark (cinematic photo background)
const HERO = {
  bg:      '#060914',
  bg2:     '#07080f',
  surface: 'rgba(255,255,255,0.02)',
  border:  'rgba(255,255,255,0.065)',
  divider: 'rgba(255,255,255,0.08)',
  muted:   'rgba(255,255,255,0.48)',
  faint:   'rgba(255,255,255,0.22)',
}

const dn: React.CSSProperties = { fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif" }
const bf: React.CSSProperties = { fontFamily: "'Outfit', system-ui, sans-serif" }

// ─── HERO ─────────────────────────────────────────────────────────────────────

const HeroSection = () => {
  const { data: fixtures = [] } = useFixtures()
  const { data: teamStats = [] } = useTeamStats()

  const nextMatch = useMemo(() => {
    const now = new Date()
    return fixtures
      .filter(f => {
        const s = (f.status || '').toLowerCase()
        return ['upcoming', 'in_progress', 'in progress'].includes(s) &&
          subHours(parseISO(f.match_date), 3) >= now
      })
      .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())[0]
  }, [fixtures])

  const lastMatchWithMVP = useMemo(
    () =>
      (fixtures as any[])
        .filter(f => (f.status || '').toLowerCase() === 'completed' && f.mvp_player_id)
        .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())[0],
    [fixtures],
  )

  const { data: mvpPlayer } = usePlayer(lastMatchWithMVP?.mvp_player_id || '')

  const currentYear = new Date().getFullYear()
  const latestStat =
    teamStats.find((s: any) => s.season === `${currentYear}-${currentYear + 1}`) || teamStats[0]

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: HERO.bg, minHeight: '100svh', display: 'flex', flexDirection: 'column' }}
    >
      {/* ── Background photo + overlays ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <img
          src={teamPhoto}
          alt="The Board FC Squad"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 20%' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(6,9,20,.6) 0%, rgba(6,9,20,.05) 36%, rgba(6,9,20,.18) 56%, rgba(6,9,20,.94) 84%, #060914 100%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, rgba(6,9,20,.7) 0%, transparent 30%, transparent 70%, rgba(6,9,20,.55) 100%)',
        }} />
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col" style={{ minHeight: '100svh' }}>

        

        {/* Centre hero text */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 md:py-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-bold tracking-[0.45em] mb-5 text-[9px] sm:text-[10px]"
            style={{ color: C.gold, ...bf }}
          >
            EST. 2020 · NAIROBI, KENYA
          </motion.p>

          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ delay: 0.38, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                ...dn,
                fontSize: 'clamp(5.5rem, 20vw, 15rem)',
                lineHeight: 0.84,
                color: 'white',
                letterSpacing: '0.06em',
                textShadow: '0 8px 80px rgba(0,0,0,0.55)',
              }}
            >
              THE<br />BOARD
            </motion.h1>
          </div>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.78, duration: 0.55 }}
            className="flex items-center gap-4 my-4 md:my-5"
          >
            <div className="h-px max-w-[72px] flex-1" style={{ background: `linear-gradient(to right, transparent, ${C.gold})` }} />
            <div className="w-2 h-2 rotate-45 flex-shrink-0" style={{ background: C.gold }} />
            <div className="h-px max-w-[72px] flex-1" style={{ background: `linear-gradient(to left, transparent, ${C.gold})` }} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.92 }}
            style={{ ...dn, fontSize: 'clamp(1.2rem, 4vw, 2.2rem)', letterSpacing: '0.32em', color: C.teal }}
          >
            FOOTBALL CLUB
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-3 mt-8 md:mt-10 flex-wrap justify-center"
          >
            <Link to="/fixtures">
              <button
                className="h-11 px-7 rounded-full text-[11px] font-black tracking-[0.2em] uppercase flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: C.gold, color: '#000', ...bf, boxShadow: `0 0 28px ${C.gold}40` }}
              >
                View Fixtures <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
            <Link to="/team">
              <button
                className="h-11 px-7 rounded-full text-[11px] font-black tracking-[0.2em] uppercase transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.58)', ...bf }}
              >
                Meet the Squad
              </button>
            </Link>
          </motion.div>
        </div>

        {/* ── Bottom info bar — always dark (lives over the photo) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          style={{
            background: 'rgba(4,6,16,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderTop: `1px solid ${HERO.border}`,
          }}
        >
          <div className="container mx-auto px-4 lg:px-8">
            <div
              className="grid grid-cols-1 md:grid-cols-2"
              style={{ borderColor: HERO.divider }}
            >
              {/* ─ Next Match ─ */}
              <div
                className="py-5 md:pr-8"
                style={{ borderBottom: `1px solid ${HERO.divider}`, borderRight: undefined }}
              >
                <div className="md:border-b-0" style={{ borderColor: HERO.divider }} />
                <p className="text-[9px] font-bold tracking-[0.32em] mb-3.5 flex items-center gap-2" style={{ color: C.gold, ...bf }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: C.gold }} />
                  {nextMatch ? `NEXT MATCH · ${(nextMatch.competition || '').toUpperCase()}` : 'NEXT MATCH'}
                </p>
                {nextMatch ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1.5 w-16 flex-shrink-0">
                        <img src={logo} className="w-10 h-10 object-contain" />
                        <span className="text-[10px] font-semibold leading-tight text-center" style={{ color: HERO.muted, ...bf }}>
                          The Board FC
                        </span>
                      </div>
                      <div className="flex-1 text-center">
                        <div style={{ ...dn, fontSize: '2.1rem', color: 'white', letterSpacing: '0.1em' }}>VS</div>
                        <div className="text-[10px] tracking-wider mt-0.5" style={{ color: HERO.faint, ...bf }}>
                          {format(subHours(parseISO(nextMatch.match_date), 3), 'EEE dd MMM · HH:mm')}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)', ...bf }}>
                          <MapPin className="w-2.5 h-2.5" />{nextMatch.location}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 w-16 flex-shrink-0">
                        <img
                          src={nextMatch.opponent_logo_url || opponent}
                          className="w-10 h-10 object-contain rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        />
                        <span className="text-[10px] font-semibold leading-tight text-center max-w-[64px]" style={{ color: HERO.muted, ...bf }}>
                          {nextMatch.opponent}
                        </span>
                      </div>
                    </div>
                    {nextMatch.ticket_link && (
                      <a
                        href={nextMatch.ticket_link}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-[10px] font-black tracking-[0.2em] uppercase h-9 px-5 rounded-full transition-all hover:opacity-85"
                        style={{ background: C.gold, color: '#000', ...bf }}
                      >
                        Get Tickets <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-sm" style={{ color: HERO.faint, ...bf }}>No upcoming fixtures scheduled.</p>
                )}
              </div>

              {/* ─ MVP or Season Stats ─ */}
              <div className="py-5 md:pl-8" style={{ borderTop: `1px solid ${HERO.divider}` }}>
                <p className="text-[9px] font-bold tracking-[0.32em] mb-3.5 flex items-center gap-2" style={{ color: C.teal, ...bf }}>
                  <Trophy className="w-3 h-3 flex-shrink-0" style={{ color: C.teal }} />
                  {mvpPlayer
                    ? `LAST MATCH MVP · VS ${(lastMatchWithMVP?.opponent || '').toUpperCase()}`
                    : 'SEASON RECORD'}
                </p>
                {mvpPlayer ? (
                  <div className="flex items-center gap-4">
                    {mvpPlayer.profile_image_url ? (
                      <img
                        src={mvpPlayer.profile_image_url}
                        alt={`${mvpPlayer.first_name} ${mvpPlayer.last_name}`}
                        className="w-16 h-16 rounded-xl object-cover object-top flex-shrink-0"
                        style={{ border: `1.5px solid ${C.teal}32` }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${C.teal}0e`, border: `1.5px solid ${C.teal}22` }}
                      >
                        <span style={{ ...dn, fontSize: '1.4rem', color: `${C.teal}55` }}>
                          {mvpPlayer.player_number ? `#${mvpPlayer.player_number}` : '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <div style={{ ...dn, fontSize: '1.55rem', color: 'white', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                        {mvpPlayer.first_name} {mvpPlayer.last_name}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: HERO.faint, ...bf }}>
                        {mvpPlayer.position}{mvpPlayer.player_number ? ` · #${mvpPlayer.player_number}` : ''}
                      </div>
                      {lastMatchWithMVP?.mvp_note && (
                        <div className="text-[11px] mt-1.5 italic" style={{ color: HERO.muted, ...bf }}>
                          "{lastMatchWithMVP.mvp_note}"
                        </div>
                      )}
                    </div>
                  </div>
                ) : latestStat ? (
                  <div className="flex items-center gap-5 md:gap-7">
                    {[
                      { l: 'W',  v: latestStat.wins ?? 0,          c: C.green },
                      { l: 'D',  v: latestStat.draws ?? 0,         c: 'rgba(255,255,255,0.7)' },
                      { l: 'L',  v: latestStat.losses ?? 0,        c: C.red },
                      { l: 'GF', v: latestStat.goals_for ?? 0,     c: C.gold },
                      { l: 'CS', v: latestStat.clean_sheets ?? 0,  c: C.teal },
                    ].map(s => (
                      <div key={s.l} className="text-center">
                        <div style={{ ...dn, fontSize: '1.9rem', lineHeight: 1, color: s.c }}>{s.v}</div>
                        <div className="text-[9px] tracking-widest uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.22)', ...bf }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── MATCH POSTER ─────────────────────────────────────────────────────────────

const MatchPosterSection = () => {
  const { data: fixtures = [] } = useFixtures()
  // null = auto (defaults to latest); number = user-selected
  const [manualIdx, setManualIdx] = useState<number | null>(null)

  // All fixtures with a poster, sorted oldest → newest (so [n-1] is the latest/upcoming)
  const posters = useMemo(
    () =>
      (fixtures as any[])
        .filter(f => f.match_poster_url)
        .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
        .slice(-3),
    [fixtures],
  )

  if (posters.length === 0) return null

  const n = posters.length
  // Default: latest poster in center (index n-1 = upcoming or most recent)
  const activeIdx = manualIdx !== null ? Math.min(manualIdx, n - 1) : n - 1
  const active = posters[activeIdx]

  // Slot assignment using modular diff
  const slot = (i: number) => {
    const d = ((i - activeIdx) + n) % n
    if (d === 0) return 'center'
    if (d === 1) return 'right'
    if (d === n - 1) return 'left'
    return 'hidden'
  }

  // Per-slot animation values
  const sv = {
    center: { x: 0,      scale: 1,    zIndex: 3, opacity: 1   },
    left:   { x: '-64%', scale: 0.82, zIndex: 2, opacity: 0.9 },
    right:  { x: '64%',  scale: 0.82, zIndex: 2, opacity: 0.9 },
    hidden: { x: 0,      scale: 0,    zIndex: 0, opacity: 0   },
  } as const

  return (
    <section className="py-16 md:py-24" style={{ background: C.bg2 }}>
      <div className="container mx-auto px-4 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[9px] font-black tracking-[0.5em] mb-1.5" style={{ color: C.gold, ...bf }}>
            MATCHDAY
          </p>
          <h2
            style={{ ...dn, fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: C.text, letterSpacing: '0.1em' }}
          >
            MATCH POSTERS
          </h2>
        </div>

        {/* ── Carousel ── */}
        <div className="flex flex-col items-center">
          {/*
            Container sets the "stage" size for the center poster.
            Side posters overflow via x-transform — no overflow:hidden needed.
          */}
          <div
            className="relative"
            style={{
              width:  'clamp(200px, 52vw, 290px)',
              height: 'clamp(300px, 78vw, 430px)',
            }}
          >
            {posters.map((poster, idx) => {
              const s   = slot(idx)
              const val = sv[s as keyof typeof sv]
              const clickable = s === 'left' || s === 'right'

              return (
                <motion.div
                  key={poster.id ?? idx}
                  className="absolute inset-0"
                  animate={{ x: val.x, scale: val.scale, zIndex: val.zIndex, opacity: val.opacity }}
                  transition={{ type: 'spring', stiffness: 270, damping: 28 }}
                  style={{ cursor: clickable ? 'pointer' : 'default', originX: '50%', originY: '50%' }}
                  onClick={clickable ? () => setManualIdx(idx) : undefined}
                  whileHover={clickable ? { opacity: 1, scale: (val as any).scale * 1.03 } : undefined}
                >
                  {/* Gold ambient glow behind active poster */}
                  {s === 'center' && (
                    <div
                      className="absolute -inset-4 rounded-3xl blur-2xl opacity-25 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse, ${C.gold}, transparent 70%)` }}
                    />
                  )}

                  <div
                    className="relative w-full h-full rounded-2xl overflow-hidden"
                    style={{
                      border: s === 'center'
                        ? `1px solid ${C.gold}30`
                        : `1px solid ${C.border}`,
                      boxShadow: s === 'center'
                        ? `0 0 55px ${C.gold}1e, 0 30px 80px rgba(0,0,0,0.35)`
                        : '0 8px 32px rgba(0,0,0,0.18)',
                    }}
                  >
                    <img
                      src={poster.match_poster_url}
                      alt={`Match vs ${poster.opponent}`}
                      className="w-full h-full object-cover"
                      style={{ filter: clickable ? 'brightness(0.75)' : 'none' }}
                      draggable={false}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Active poster info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="mt-6 text-center"
            >
              <p
                className="text-[9px] font-bold tracking-[0.28em] uppercase"
                style={{ color: C.faint, ...bf }}
              >
                {(active.status || '').toLowerCase() === 'completed'
                  ? 'Previous Match'
                  : 'Next Match'}
                {active.competition ? ` · ${active.competition.toUpperCase()}` : ''}
              </p>
              <p className="text-sm font-bold mt-1" style={{ color: C.text, ...bf }}>
                vs {active.opponent}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: C.faint, ...bf }}>
                {format(subHours(parseISO(active.match_date), 3), 'EEE dd MMM yyyy')}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Ticket CTA */}
          <AnimatePresence mode="wait">
            {active.ticket_link && (
              <motion.a
                key={`ticket-${activeIdx}`}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                href={active.ticket_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-5 text-[11px] font-black tracking-[0.22em] uppercase h-11 px-8 rounded-full transition-all hover:opacity-85 active:scale-95"
                style={{ background: C.gold, color: '#000', boxShadow: `0 0 32px ${C.gold}35`, ...bf }}
              >
                Get Tickets <ArrowRight className="w-3 h-3" />
              </motion.a>
            )}
          </AnimatePresence>

          {/* Navigation dots */}
          {n > 1 && (
            <div className="flex items-center gap-2 mt-5">
              {posters.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setManualIdx(idx)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:      idx === activeIdx ? '20px' : '8px',
                    height:     '8px',
                    background: idx === activeIdx ? C.gold : C.border,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── FIXTURES & RESULTS ───────────────────────────────────────────────────────

const FixturesSection = () => {
  const { data: fixtures = [], isLoading, error } = useFixtures()
  const [tab, setTab] = useState<'upcoming' | 'results'>('upcoming')

  const upcoming = useMemo(() => {
    const now = new Date()
    return fixtures
      .filter(f => {
        const s = (f.status || '').toLowerCase()
        return ['upcoming', 'in_progress', 'in progress'].includes(s) &&
          subHours(parseISO(f.match_date), 3) >= now
      })
      .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
      .slice(0, 6)
  }, [fixtures])

  const results = useMemo(
    () =>
      fixtures
        .filter(f => (f.status || '').toLowerCase() === 'completed')
        .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
        .slice(0, 6),
    [fixtures],
  )

  const shown = tab === 'upcoming' ? upcoming : results
  const rp: Record<string, string> = { W: C.green, D: C.gold, L: C.red }

  return (
    <section className="py-20 md:py-28" style={{ background: C.bg }}>
      <div className="container mx-auto px-4 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.38em] mb-2" style={{ color: C.gold, ...bf }}>
              THIS SEASON
            </p>
            <h2 style={{ ...dn, fontSize: 'clamp(2.8rem, 7vw, 5rem)', color: C.text, lineHeight: 0.88 }}>
              FIXTURES &amp;<br />RESULTS
            </h2>
          </div>
          <div
            className="flex items-center gap-1 p-1 rounded-full self-start sm:self-auto"
            style={{ background: C.surface }}
          >
            {(['upcoming', 'results'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-5 py-2 rounded-full text-[10px] font-black tracking-[0.18em] uppercase transition-all"
                style={tab === t
                  ? { background: C.gold, color: '#000', ...bf }
                  : { color: C.faint, ...bf }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 rounded-2xl" style={{ background: C.surface }} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-sm" style={{ color: C.faint, ...bf }}>
            Unable to load fixtures.
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{ color: C.faint, ...bf }}>
            {tab === 'upcoming' ? 'No upcoming fixtures scheduled.' : 'No results recorded yet.'}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              {shown.map((fixture, i) => {
                const matchDate = subHours(parseISO(fixture.match_date), 3)
                const isCompleted = (fixture.status || '').toLowerCase() === 'completed'
                const ourScore  = fixture.is_home_game ? fixture.home_score : fixture.away_score
                const oppScore  = fixture.is_home_game ? fixture.away_score : fixture.home_score
                const result =
                  isCompleted && ourScore !== null && oppScore !== null
                    ? ourScore > oppScore ? 'W' : ourScore === oppScore ? 'D' : 'L'
                    : null

                return (
                  <motion.div
                    key={fixture.id}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045 }}
                    className="flex items-center gap-3 md:gap-5 px-4 py-3.5 rounded-2xl transition-all"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    {/* Date */}
                    <div className="text-center w-10 flex-shrink-0">
                      <div style={{ ...dn, fontSize: '1.55rem', lineHeight: 1, color: C.text }}>
                        {format(matchDate, 'dd')}
                      </div>
                      <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: C.faint, ...bf }}>
                        {format(matchDate, 'MMM')}
                      </div>
                    </div>

                    <div className="w-px h-8 flex-shrink-0" style={{ background: C.border }} />

                    {/* Competition pill */}
                    <div className="hidden sm:block flex-shrink-0">
                      <span
                        className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: C.surface, color: C.faint, border: `1px solid ${C.border}`, ...bf }}
                      >
                        {fixture.competition}
                      </span>
                    </div>

                    {/* Teams + score */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                        <span className="text-[12px] font-semibold truncate hidden sm:block" style={{ color: C.text, ...bf }}>
                          {fixture.is_home_game ? 'The Board FC' : fixture.opponent}
                        </span>
                        <img
                          src={fixture.is_home_game ? logo : (fixture.opponent_logo_url || opponent)}
                          className="w-8 h-8 object-contain rounded-lg flex-shrink-0"
                          style={{ background: C.surface }}
                        />
                      </div>

                      <div className="text-center flex-shrink-0 w-20">
                        {isCompleted ? (
                          <div style={{ ...dn, fontSize: '1.45rem', color: C.text, letterSpacing: '0.06em' }}>
                            {fixture.home_score} – {fixture.away_score}
                          </div>
                        ) : (
                          <div>
                            <div style={{ ...dn, fontSize: '1.1rem', letterSpacing: '0.1em', color: C.muted }}>VS</div>
                            <div className="text-[10px] font-bold" style={{ color: C.teal, ...bf }}>
                              {format(matchDate, 'HH:mm')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img
                          src={fixture.is_home_game ? (fixture.opponent_logo_url || opponent) : logo}
                          className="w-8 h-8 object-contain rounded-lg flex-shrink-0"
                          style={{ background: C.surface }}
                        />
                        <span className="text-[12px] font-semibold truncate hidden sm:block" style={{ color: C.text, ...bf }}>
                          {fixture.is_home_game ? fixture.opponent : 'The Board FC'}
                        </span>
                      </div>
                    </div>

                    {/* Result badge */}
                    {result && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                        style={{
                          background: `${rp[result]}15`,
                          border: `1px solid ${rp[result]}30`,
                          color: rp[result],
                          ...bf,
                        }}
                      >
                        {result}
                      </div>
                    )}

                    {/* Venue */}
                    <div className="hidden lg:flex items-center gap-1 w-28 flex-shrink-0">
                      <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: C.faint }} />
                      <span className="text-[10px] truncate" style={{ color: C.faint, ...bf }}>
                        {fixture.location}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        )}

        <div className="mt-9 flex justify-center">
          <Link
            to="/fixtures"
            className="flex items-center gap-2 text-sm font-semibold group transition-colors"
            style={{ color: C.faint, ...bf }}
          >
            <span className="group-hover:opacity-80 transition-opacity">All Fixtures &amp; Results</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── PLAYER STATS ─────────────────────────────────────────────────────────────

const PlayerStatsSection = () => {
  const { data: players = [], isLoading: playersLoading } = usePlayers()
  const { data: playerStats = [], isLoading: statsLoading } = useAllPlayerStats()
  const { data: teamStats = [], isLoading: teamStatsLoading } = useTeamStats()
  const isLoading = playersLoading || statsLoading || teamStatsLoading

  const currentYear = new Date().getFullYear()
  const currentSeason = `${currentYear}-${currentYear + 1}`

  const topPlayers = useMemo(() => {
    if (isLoading || !players.length) return []

    const seasonStats = (playerStats || []).filter((s: any) => s.season === currentSeason)
    const statsSource = seasonStats.length ? seasonStats : playerStats || []
    const latestTeamStat =
      (teamStats || []).find((s: any) => s.season === currentSeason) || teamStats?.[0]

    const goals   = [...statsSource].filter((s: any) => (s.goals || 0) > 0).sort((a: any, b: any) => b.goals - a.goals)
    const assists = [...statsSource].filter((s: any) => (s.assists || 0) > 0).sort((a: any, b: any) => b.assists - a.assists)
    const apps    = [...statsSource].sort((a: any, b: any) => (b.matches_played || 0) - (a.matches_played || 0))
    const gk      = players.find((p: any) => p.position === 'Goalkeeper')

    const cards: any[] = []
    const push = (stat: any, label: string, value: number, icon: any, color: string) => {
      const p = players.find((x: any) => x.id === stat?.player_id)
      if (p) cards.push({ id: `${label}-${p.id}`, playerId: p.id, name: `${p.first_name} ${p.last_name}`, number: p.player_number, position: p.position, image: p.profile_image_url, label, value, icon, color })
    }

    if (goals[0])   push(goals[0],   'Goals',       goals[0].goals,         Trophy, C.gold)
    if (assists[0]) push(assists[0], 'Assists',     assists[0].assists,      Target, C.teal)
    if (gk && latestTeamStat)
      cards.push({ id: `cs-${gk.id}`, playerId: gk.id, name: `${gk.first_name} ${gk.last_name}`, number: gk.player_number, position: gk.position, image: gk.profile_image_url, label: 'Clean Sheets', value: latestTeamStat.clean_sheets || 0, icon: Shield, color: C.green })
    if (apps[0])    push(apps[0],    'Appearances', apps[0].matches_played, Clock,  '#f97316')

    return cards
  }, [players, playerStats, teamStats, isLoading, currentSeason])

  if (isLoading)
    return (
      <section className="py-20" style={{ background: C.bg2 }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] rounded-3xl" style={{ background: C.surface }} />
            ))}
          </div>
        </div>
      </section>
    )

  if (!topPlayers.length) return null

  return (
    <section className="py-20 md:py-28" style={{ background: C.bg2 }}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.38em] mb-2" style={{ color: C.teal, ...bf }}>
              SEASON LEADERS
            </p>
            <h2 style={{ ...dn, fontSize: 'clamp(2.8rem, 7vw, 5rem)', color: C.text, lineHeight: 0.88 }}>
              SQUAD<br />STANDOUTS
            </h2>
          </div>
          <Link to="/team" className="flex items-center gap-1.5 text-sm font-semibold group" style={{ color: C.faint, ...bf }}>
            <span className="group-hover:opacity-80 transition-opacity">View Squad</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {topPlayers.map((p: any) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -7, scale: 1.016 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="group relative overflow-hidden rounded-3xl aspect-[3/4] cursor-pointer"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}
              >
                <div className="absolute inset-0">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1a2744, #060914)' }}>
                      <span style={{ ...dn, fontSize: '8rem', color: 'rgba(255,255,255,0.05)', position: 'absolute', right: '-6px', top: '0', lineHeight: 1 }}>
                        {p.number}
                      </span>
                    </div>
                  )}
                </div>
                {/* Photo cards always have a dark overlay — text stays white */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute top-3 left-3">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-md"
                    style={{ background: `${p.color}18`, border: `1px solid ${p.color}2e` }}
                  >
                    <Icon className="w-3 h-3" style={{ color: p.color }} />
                    <span className="text-[10px] font-black" style={{ color: p.color, ...bf }}>{p.label}</span>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div style={{ ...dn, fontSize: '3.2rem', lineHeight: 1, color: p.color }}>{p.value}</div>
                  <div className="text-[13px] font-bold text-white leading-tight mt-0.5" style={bf}>{p.name}</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5" style={bf}>
                    {p.position}{p.number ? ` · #${p.number}` : ''}
                  </div>
                  <Link
                    to={p.playerId ? `/player/${p.playerId}` : '/team'}
                    className="inline-flex items-center gap-1 mt-3 text-[11px] text-white/35 hover:text-white/70 transition-colors"
                    style={bf}
                  >
                    View Profile <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── NEWS ─────────────────────────────────────────────────────────────────────

const NewsSection = () => {
  const { data: newsArticles = [], isLoading, error } = useNewsArticles()

  const articles = useMemo(
    () =>
      [...newsArticles]
        .filter((a: any) => a.is_published)
        .sort((a: any, b: any) => {
          const da = new Date(a.publish_date || a.created_at)
          const db = new Date(b.publish_date || b.created_at)
          return db.getTime() - da.getTime()
        })
        .slice(0, 6),
    [newsArticles],
  )

  if (isLoading)
    return (
      <section className="py-20" style={{ background: C.bg }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7 aspect-[16/10] rounded-3xl" style={{ background: C.surface }} />
            <div className="col-span-12 md:col-span-5 space-y-4">
              {[1, 2].map(i => <div key={i} className="h-44 rounded-3xl" style={{ background: C.surface }} />)}
            </div>
          </div>
        </div>
      </section>
    )

  if (error || !articles.length) return null

  const [featured, ...rest] = articles

  const timeAgo = (a: any) => {
    try { return formatDistanceToNow(new Date(a.publish_date || a.created_at), { addSuffix: true }) }
    catch { return '' }
  }

  return (
    <section className="py-20 md:py-28" style={{ background: C.bg }}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.38em] mb-2" style={{ color: C.red, ...bf }}>
              LATEST FROM THE CLUB
            </p>
            <h2 style={{ ...dn, fontSize: 'clamp(2.8rem, 7vw, 5rem)', color: C.text, lineHeight: 0.88 }}>
              CLUB<br />NEWS
            </h2>
          </div>
          <Link to="/news" className="flex items-center gap-1.5 text-sm font-semibold group" style={{ color: C.faint, ...bf }}>
            <span className="group-hover:opacity-80 transition-opacity">All News</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-3 md:gap-4">
          {/* Featured */}
          <div className="col-span-12 md:col-span-7">
            <Link to={`/news/${featured.id}`} className="group block h-full">
              <div className="relative h-full min-h-[280px] md:min-h-[480px] rounded-3xl overflow-hidden">
                <img
                  src={featured.featured_image_url || '/placeholder-news.jpg'}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  {featured.tags?.[0] && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3"
                      style={{ background: C.red, color: 'white', ...bf }}
                    >
                      {featured.tags[0]}
                    </span>
                  )}
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white leading-tight" style={bf}>
                    {featured.title}
                  </h3>
                  <p className="text-[11px] text-white/35 mt-2" style={bf}>{timeAgo(featured)}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Side stack */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-3 md:gap-4">
            {rest.slice(0, 2).map((a: any) => (
              <Link key={a.id} to={`/news/${a.id}`} className="group flex-1 block">
                <div className="relative rounded-2xl overflow-hidden h-full min-h-[160px] md:min-h-0">
                  <img
                    src={a.featured_image_url || '/placeholder-news.jpg'}
                    alt={a.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    {a.tags?.[0] && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-2 bg-white/10 text-white/60" style={bf}>
                        {a.tags[0]}
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-white leading-tight line-clamp-2" style={bf}>{a.title}</h4>
                    <p className="text-[10px] text-white/30 mt-1" style={bf}>{timeAgo(a)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom row */}
          {rest.slice(2, 5).map((a: any) => (
            <div key={a.id} className="col-span-6 md:col-span-4">
              <Link to={`/news/${a.id}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                  <img
                    src={a.featured_image_url || '/placeholder-news.jpg'}
                    alt={a.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    {a.tags?.[0] && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-1.5 bg-white/10 text-white/55" style={bf}>
                        {a.tags[0]}
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-white leading-tight line-clamp-2" style={bf}>{a.title}</h4>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── SPONSORS ─────────────────────────────────────────────────────────────────

const SponsorsSection = () => (
  <section style={{ background: C.bg2, borderTop: `1px solid ${C.border}` }}>
    <Sponsers />
  </section>
)

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div style={{ background: C.bg }}>
      <HeroSection />
      <MatchPosterSection />
      <FixturesSection />
      <PlayerStatsSection />
      <NewsSection />
      <SponsorsSection />
    </div>
  )
}
