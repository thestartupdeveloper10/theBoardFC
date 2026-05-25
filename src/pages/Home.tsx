import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, Trophy, Target, Shield, Clock, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import {
  useNewsArticles,
  usePlayers,
  useAllPlayerStats,
  useTeamStats,
  useFixtures,
} from '@/services/queries'
import { format, parseISO, subHours, formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

import logo from '@/assets/images/logo.png'
import opponent from '@/assets/images/opponent.png'
import MatchImage from '@/assets/images/match-bg.webp'
import Sponsers from '@/components/Sponsers'

// ─── HERO ──────────────────────────────────────────────────────────────────

const HeroSection = () => {
  const { data: fixtures = [] } = useFixtures()
  const { data: teamStats = [] } = useTeamStats()

  const nextMatch = useMemo(
    () =>
      fixtures
        .filter(f => ['upcoming', 'in progress'].includes((f.status || '').toLowerCase()))
        .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())[0],
    [fixtures],
  )

  const recentResults = useMemo(
    () =>
      fixtures
        .filter(f => (f.status || '').toLowerCase() === 'completed')
        .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
        .slice(0, 6),
    [fixtures],
  )

  const currentYear = new Date().getFullYear()
  const latestStat =
    teamStats.find((s: any) => s.season === `${currentYear}-${currentYear + 1}`) || teamStats[0]

  return (
    <section className="relative bg-slate-50 dark:bg-[#060b18] overflow-hidden flex flex-col transition-colors duration-300">
      {/* Ambient glows — visible in both modes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[#4CC7D2]/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-[#eab308]/8 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full bg-[#1A365D]/10 dark:bg-[#1A365D]/20 blur-[90px]" />
      </div>

      {/* Pitch grid — dark lines in light mode, white lines in dark mode */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-[0.022]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative flex-1 container mx-auto px-4 flex items-center py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 w-full items-center">

          {/* LEFT: identity + headline */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#eab308]/30 bg-[#eab308]/8 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#eab308] animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#eab308] uppercase">
                Est. 2020 · Community Club
              </span>
            </div>

            {/* Club emblem + name */}
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(234,179,8,0)',
                    '0 0 40px 16px rgba(234,179,8,0.2)',
                    '0 0 0 0 rgba(234,179,8,0)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-full border-2 border-[#eab308]/30 overflow-hidden flex-shrink-0 bg-white/60 dark:bg-white/5"
              >
                <img
                  src={logo}
                  alt="The Board FC"
                  className="w-full h-full object-contain p-1.5"
                />
              </motion.div>
              <div>
                <p className="text-[11px] font-black tracking-[0.3em] text-[#eab308]">THE BOARD FC</p>
                <p className="text-[10px] text-gray-400 dark:text-white/30 tracking-widest">
                  OFFICIAL CLUB WEBSITE
                </p>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(3.2rem,8vw,5.5rem)] font-black leading-[0.88] tracking-tighter text-gray-900 dark:text-white mb-6">
              <span className="block">THE</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] via-[#f59e0b] to-[#4CC7D2]">
                BEAUTIFUL
              </span>
              <span className="block">GAME.</span>
            </h1>

            <p className="text-gray-500 dark:text-white/45 text-base lg:text-lg max-w-md mb-10 leading-relaxed">
              Tactical craft, community heart — follow every matchday, squad story, and moment of
              magic from The Board FC.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/fixtures">
                <Button
                  size="lg"
                  className="group h-12 px-8 text-xs font-black tracking-[0.18em] uppercase bg-[#eab308] hover:bg-[#ca8a04] text-black rounded-full shadow-[0_0_32px_rgba(234,179,8,0.22)] transition-[color,background-color,box-shadow,transform,scale] duration-300"
                >
                  Matchday &amp; Tickets
                  <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/team">
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 px-8 text-xs font-black tracking-[0.18em] uppercase text-gray-500 dark:text-white/55 border border-gray-300 dark:border-white/10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-[color,background-color,border-color,transform,scale]"
                >
                  Meet the Squad
                </Button>
              </Link>
            </div>

            {/* Season stats strip */}
            {latestStat && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-gray-200 dark:border-white/8"
              >
                {[
                  { label: 'Goals Scored', value: latestStat.goals_for ?? 0, color: '#eab308' },
                  { label: 'Clean Sheets', value: latestStat.clean_sheets ?? 0, color: '#4CC7D2' },
                  { label: 'Goals Against', value: latestStat.goals_against ?? 0, color: '#E63946' },
                ].map(s => (
                  <div key={s.label}>
                    <div
                      className="text-4xl font-black tabular-nums"
                      style={{ color: s.color }}
                    >
                      {s.value}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30 mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT: crest + next match + results */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="flex flex-col gap-5 mx-auto w-full max-w-sm lg:max-w-none"
          >
            {/* Crest visual */}
            <div className="relative aspect-square max-h-64 w-full overflow-hidden rounded-3xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4CC7D2]/6 via-transparent to-[#eab308]/5" />
              <img
                src={logo}
                alt="The Board FC Crest"
                className="w-full h-full object-contain p-10"
              />
              {[
                'top-4 left-4 border-t-2 border-l-2 rounded-tl-xl',
                'top-4 right-4 border-t-2 border-r-2 rounded-tr-xl',
                'bottom-4 left-4 border-b-2 border-l-2 rounded-bl-xl',
                'bottom-4 right-4 border-b-2 border-r-2 rounded-br-xl',
              ].map((cls, i) => (
                <div key={i} className={`absolute w-6 h-6 border-[#eab308]/25 ${cls}`} />
              ))}
            </div>

            {/* Next match card */}
            {nextMatch && (
              <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-white/[0.04] dark:backdrop-blur-sm shadow-sm dark:shadow-none overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-[#eab308]/6">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#eab308] animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#eab308] uppercase">
                    Next Match
                  </span>
                  <span className="ml-auto text-[10px] text-gray-400 dark:text-white/25 uppercase tracking-wider">
                    {nextMatch.competition}
                  </span>
                </div>
                <div className="p-4 flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <img src={logo} alt="The Board FC" className="w-11 h-11 object-contain" />
                    <span className="text-[11px] text-gray-600 dark:text-white/55 text-center font-semibold">
                      The Board FC
                    </span>
                  </div>
                  <div className="text-center flex-shrink-0 px-2">
                    <div className="text-[10px] text-gray-400 dark:text-white/25 mb-1">
                      {format(subHours(parseISO(nextMatch.match_date), 3), 'EEE dd MMM yyyy')}
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">VS</div>
                    <div className="text-base font-bold text-[#4CC7D2] mt-1">
                      {format(subHours(parseISO(nextMatch.match_date), 3), 'HH:mm')}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-white/25 mt-1">
                      {nextMatch.is_home_game ? 'Home' : 'Away'}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <img
                      src={nextMatch.opponent_logo_url || opponent}
                      alt={nextMatch.opponent}
                      className="w-11 h-11 object-cover rounded-lg bg-gray-100 dark:bg-white/10"
                    />
                    <span className="text-[11px] text-gray-600 dark:text-white/55 text-center font-semibold">
                      {nextMatch.opponent}
                    </span>
                  </div>
                </div>
                {nextMatch.ticket_link && (
                  <div className="px-4 pb-4">
                    <a
                      href={nextMatch.ticket_link}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full text-center text-[11px] font-black tracking-[0.2em] uppercase py-2.5 rounded-xl bg-[#eab308]/10 dark:bg-[#eab308]/12 text-[#eab308] hover:bg-[#eab308]/20 dark:hover:bg-[#eab308]/22 transition-colors border border-[#eab308]/20"
                    >
                      Get Tickets
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Recent results ticker */}
            {recentResults.length > 0 && (
              <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/[0.03] p-3 overflow-hidden shadow-sm dark:shadow-none">
                <p className="text-[10px] font-bold tracking-[0.22em] text-gray-400 dark:text-white/22 uppercase mb-3">
                  Recent Results
                </p>
                <div className="overflow-hidden">
                  <div className="flex gap-2 animate-marquee whitespace-nowrap">
                    {[...recentResults, ...recentResults].map((r, i) => {
                      const ourScore = r.is_home_game ? r.home_score : r.away_score
                      const oppScore = r.is_home_game ? r.away_score : r.home_score
                      const outcome =
                        (ourScore ?? 0) > (oppScore ?? 0)
                          ? 'W'
                          : ourScore === oppScore
                          ? 'D'
                          : 'L'
                      const palette = {
                        W: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
                        D: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
                        L: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                      }
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border flex-shrink-0 ${palette[outcome]}`}
                        >
                          {outcome} {ourScore}-{oppScore}
                          <span className="text-gray-400 dark:text-white/30 font-normal">
                            vs {r.opponent}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom nav strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative border-t border-gray-200 dark:border-white/6 bg-white/50 dark:bg-transparent"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <nav className="flex items-center gap-6 text-xs text-gray-400 dark:text-white/30 font-medium">
            {(
              [
                ['News', '/news'],
                ['Fixtures', '/fixtures'],
                ['Squad', '/team'],
                ['Media', '/media'],
              ] as [string, string][]
            ).map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className="hover:text-gray-700 dark:hover:text-white/65 transition-colors tracking-wide"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-white/22">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Season {new Date().getFullYear()}/{(new Date().getFullYear() + 1).toString().slice(2)} Active
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// ─── MATCHES ───────────────────────────────────────────────────────────────

interface MatchDisplay {
  id: string | number
  date: string
  competition: string
  homeTeam: { name: string; logo: string }
  awayTeam: { name: string; logo: string }
  score: string | null
  time: string | null
  status: string
  ticketLink?: string | null
}

const MatchCard = ({ match }: { match: MatchDisplay }) => {
  const isCompleted = match.status === 'FT'
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] dark:backdrop-blur-md shadow-sm dark:shadow-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-white/6">
        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-white/40 uppercase">
          {match.competition}
        </span>
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            isCompleted
              ? 'bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-white/50'
              : 'bg-[#eab308]/10 dark:bg-[#eab308]/12 text-[#eab308] border border-[#eab308]/20'
          }`}
        >
          {match.status}
        </span>
      </div>

      <div className="px-5 py-6">
        <div className="grid grid-cols-3 items-center gap-3">
          {/* Home */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 flex items-center justify-center p-1.5 overflow-hidden">
              <img
                src={match.homeTeam.name === 'The Board FC' ? logo : match.homeTeam.logo}
                alt={match.homeTeam.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[11px] font-bold text-gray-800 dark:text-white text-center leading-tight">
              {match.homeTeam.name}
            </span>
          </div>

          {/* Score / VS */}
          <div className="text-center">
            {isCompleted ? (
              <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                {match.score}
              </div>
            ) : (
              <>
                <div className="text-2xl font-black text-gray-900 dark:text-white">VS</div>
                <div className="text-base font-bold text-[#4CC7D2] mt-1">{match.time}</div>
              </>
            )}
            <div className="text-[10px] text-gray-400 dark:text-white/25 mt-2 uppercase tracking-wide">
              {match.date}
            </div>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/8 flex items-center justify-center p-1.5 overflow-hidden">
              <img
                src={match.awayTeam.name === 'The Board FC' ? logo : match.awayTeam.logo}
                alt={match.awayTeam.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[11px] font-bold text-gray-800 dark:text-white text-center leading-tight">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Ticket CTA */}
        {match.ticketLink && !isCompleted && (
          <a
            href={match.ticketLink}
            target="_blank"
            rel="noreferrer"
            className="block mt-5 text-center text-[11px] font-black tracking-[0.2em] uppercase py-2.5 rounded-xl bg-[#eab308]/10 dark:bg-[#eab308]/12 text-[#eab308] hover:bg-[#eab308]/20 dark:hover:bg-[#eab308]/22 transition-colors border border-[#eab308]/20"
          >
            Get Tickets
          </a>
        )}
      </div>
    </motion.div>
  )
}

const MatchesSection = () => {
  const { data: fixtures = [], isLoading, error } = useFixtures()

  const formattedMatches = useMemo<MatchDisplay[]>(() => {
    if (!fixtures.length) return []
    return fixtures
      .filter(f => !['postponed', 'cancelled'].includes((f.status || '').toLowerCase()))
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
      .slice(0, 3)
      .reverse()
      .map(f => {
        const matchDate = subHours(parseISO(f.match_date), 3)
        const isCompleted = (f.status || '').toLowerCase() === 'completed'
        const isUpcoming = ['upcoming', 'in progress'].includes((f.status || '').toLowerCase())
        const opponentLogo = f.opponent_logo_url || opponent
        const homeTeam = f.is_home_game
          ? { name: 'The Board FC', logo }
          : { name: f.opponent, logo: opponentLogo }
        const awayTeam = f.is_home_game
          ? { name: f.opponent, logo: opponentLogo }
          : { name: 'The Board FC', logo }
        let competition = f.competition || 'Match'
        if (competition.toLowerCase().includes('league')) competition = 'LEAGUE'
        else if (competition.toLowerCase().includes('cup')) competition = 'CUP'
        else if (competition.toLowerCase().includes('friendly')) competition = 'FRIENDLY'
        else competition = competition.toUpperCase()

        return {
          id: f.id,
          date: format(matchDate, 'EEE dd MMM').toUpperCase(),
          competition,
          homeTeam,
          awayTeam,
          score: isCompleted ? `${f.home_score} - ${f.away_score}` : null,
          time: isUpcoming ? format(matchDate, 'HH:mm') : null,
          status: isCompleted ? 'FT' : (f.status || '').toUpperCase(),
          ticketLink: f.ticket_link || null,
        }
      })
  }, [fixtures])

  return (
    <section className="relative py-16 md:py-24 bg-slate-100 dark:bg-[#060b18] overflow-hidden transition-colors duration-300">
      {/* Stadium bg */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={MatchImage}
          alt=""
          className="w-full h-full object-cover opacity-[0.04] dark:opacity-[0.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 dark:from-[#060b18] via-transparent to-slate-100 dark:to-[#060b18]" />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#eab308] uppercase mb-2">
              This Season
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Fixtures &amp; Results
            </h2>
          </div>
          <Link
            to="/fixtures"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 dark:text-white/40 hover:text-[#4CC7D2] transition-colors group"
          >
            All Fixtures
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-52 rounded-2xl bg-gray-200 dark:bg-white/5" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-gray-400 dark:text-white/25">
            Unable to load fixtures.
          </div>
        ) : formattedMatches.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-white/25">
            No fixtures scheduled.
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-3 gap-5">
              {formattedMatches.map(m => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
            <div className="flex gap-4 overflow-x-auto md:hidden snap-x snap-mandatory pb-2">
              {formattedMatches.map(m => (
                <div key={m.id} className="snap-start flex-shrink-0 w-[85vw]">
                  <MatchCard match={m} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

// ─── PLAYER STATS ──────────────────────────────────────────────────────────

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

    const goals = [...statsSource]
      .filter((s: any) => (s.goals || 0) > 0)
      .sort((a: any, b: any) => b.goals - a.goals)
    const assists = [...statsSource]
      .filter((s: any) => (s.assists || 0) > 0)
      .sort((a: any, b: any) => b.assists - a.assists)
    const apps = [...statsSource].sort(
      (a: any, b: any) => (b.matches_played || 0) - (a.matches_played || 0),
    )
    const gk = players.find((p: any) => p.position === 'Goalkeeper')

    const cards: any[] = []

    const push = (stat: any, label: string, value: number, icon: any, color: string) => {
      const p = players.find((x: any) => x.id === stat?.player_id)
      if (p)
        cards.push({
          id: `${label}-${p.id}`,
          playerId: p.id,
          name: `${p.first_name} ${p.last_name}`,
          number: p.player_number,
          position: p.position,
          image: p.profile_image_url,
          label,
          value,
          icon,
          color,
        })
    }

    if (goals[0]) push(goals[0], 'Goals', goals[0].goals, Trophy, '#eab308')
    if (assists[0]) push(assists[0], 'Assists', assists[0].assists, Target, '#4CC7D2')
    if (gk && latestTeamStat)
      cards.push({
        id: `cs-${gk.id}`,
        playerId: gk.id,
        name: `${gk.first_name} ${gk.last_name}`,
        number: gk.player_number,
        position: gk.position,
        image: gk.profile_image_url,
        label: 'Clean Sheets',
        value: latestTeamStat.clean_sheets || 0,
        icon: Shield,
        color: '#4ade80',
      })
    if (apps[0]) push(apps[0], 'Appearances', apps[0].matches_played, Clock, '#f97316')

    return cards
  }, [players, playerStats, teamStats, isLoading, currentSeason])

  if (isLoading)
    return (
      <section className="py-16 bg-white dark:bg-[#080e1c] transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="aspect-[3/4] rounded-3xl bg-gray-100 dark:bg-white/5" />
            ))}
          </div>
        </div>
      </section>
    )

  if (!topPlayers.length) return null

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#080e1c] overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#4CC7D2] uppercase mb-2">
              Season Standouts
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Top Player Stats
            </h2>
          </div>
          <Link
            to="/team"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 dark:text-white/40 hover:text-[#4CC7D2] transition-colors group"
          >
            View Squad
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topPlayers.map((p: any) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="group relative overflow-hidden rounded-3xl aspect-[3/4] cursor-pointer shadow-md dark:shadow-none"
              >
                {/* Photo */}
                <div className="absolute inset-0">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1A365D] to-[#060b18] flex items-center justify-center">
                      <span className="text-8xl font-black text-white/8">
                        {p.number || '?'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Gradient overlay — same in both modes since it's on top of a photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                {/* Jersey number watermark */}
                <div
                  className="absolute -right-3 top-0 text-[8rem] font-black leading-none opacity-[0.06] pointer-events-none select-none"
                  style={{ color: p.color }}
                >
                  {p.number}
                </div>

                {/* Stat badge */}
                <div className="absolute top-3 left-3">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-sm"
                    style={{
                      backgroundColor: `${p.color}20`,
                      border: `1px solid ${p.color}35`,
                    }}
                  >
                    <Icon className="w-3 h-3" style={{ color: p.color }} />
                    <span className="text-[10px] font-black" style={{ color: p.color }}>
                      {p.label}
                    </span>
                  </div>
                </div>

                {/* Player info */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div
                    className="text-4xl font-black tabular-nums mb-1"
                    style={{ color: p.color }}
                  >
                    {p.value}
                  </div>
                  <div className="text-sm font-bold text-white leading-tight">{p.name}</div>
                  <div className="text-[10px] text-white/35 mt-0.5 uppercase tracking-wider">
                    {p.position}
                    {p.number ? ` · #${p.number}` : ''}
                  </div>
                  <Link
                    to={p.playerId ? `/player/${p.playerId}` : '/team'}
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-white/45 hover:text-white transition-colors"
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

// ─── NEWS ──────────────────────────────────────────────────────────────────

const FeaturedNewsSection = () => {
  const { data: newsArticles = [], isLoading, error } = useNewsArticles()

  const articles = useMemo(
    () =>
      [...newsArticles]
        .filter(a => a.is_published)
        .sort((a, b) => {
          const da = new Date(a.publish_date || a.created_at)
          const db = new Date(b.publish_date || b.created_at)
          return db.getTime() - da.getTime()
        })
        .slice(0, 6),
    [newsArticles],
  )

  if (isLoading)
    return (
      <section className="py-16 bg-slate-50 dark:bg-[#060b18] transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 gap-4">
            <Skeleton className="col-span-12 md:col-span-7 aspect-[16/10] rounded-3xl bg-gray-200 dark:bg-white/5" />
            <div className="col-span-12 md:col-span-5 space-y-4">
              <Skeleton className="h-44 rounded-3xl bg-gray-200 dark:bg-white/5" />
              <Skeleton className="h-44 rounded-3xl bg-gray-200 dark:bg-white/5" />
            </div>
          </div>
        </div>
      </section>
    )

  if (error || !articles.length) return null

  const [featured, ...rest] = articles

  const timeAgo = (a: (typeof articles)[0]) => {
    try {
      return formatDistanceToNow(new Date(a.publish_date || a.created_at), { addSuffix: true })
    } catch {
      return ''
    }
  }

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-[#060b18] transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#E63946] uppercase mb-2">
              Latest From The Club
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Club News
            </h2>
          </div>
          <Link
            to="/news"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 dark:text-white/40 hover:text-[#E63946] transition-colors group"
          >
            All News
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-5">
          {/* Featured large */}
          <div className="col-span-12 md:col-span-7">
            <Link to={`/news/${featured.id}`} className="group block h-full">
              <div className="relative h-full min-h-[280px] md:min-h-[480px] rounded-3xl overflow-hidden shadow-md dark:shadow-none">
                <img
                  src={featured.featured_image_url || '/placeholder-news.jpg'}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  {featured.tags?.[0] && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#E63946] text-white mb-3">
                      {featured.tags[0]}
                    </span>
                  )}
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white leading-tight">
                    {featured.title}
                  </h3>
                  <p className="text-sm text-white/40 mt-2">{timeAgo(featured)}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Side stack */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-4 md:gap-5">
            {rest.slice(0, 2).map(a => (
              <Link key={a.id} to={`/news/${a.id}`} className="group flex-1 block">
                <div className="relative rounded-2xl overflow-hidden h-full min-h-[160px] md:min-h-0 shadow-sm dark:shadow-none">
                  <img
                    src={a.featured_image_url || '/placeholder-news.jpg'}
                    alt={a.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    {a.tags?.[0] && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/12 text-white/70 mb-2">
                        {a.tags[0]}
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">
                      {a.title}
                    </h4>
                    <p className="text-[11px] text-white/35 mt-1">{timeAgo(a)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom row */}
          {rest.slice(2, 5).map(a => (
            <div key={a.id} className="col-span-6 md:col-span-4">
              <Link to={`/news/${a.id}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm dark:shadow-none">
                  <img
                    src={a.featured_image_url || '/placeholder-news.jpg'}
                    alt={a.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    {a.tags?.[0] && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/12 text-white/65 mb-1.5">
                        {a.tags[0]}
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">
                      {a.title}
                    </h4>
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

// ─── SPONSORS ──────────────────────────────────────────────────────────────

const SponsorsSection = () => (
  <section className="bg-gray-100 dark:bg-[#08101f] border-t border-gray-200 dark:border-white/6 transition-colors duration-300">
    <Sponsers />
  </section>
)

// ─── ROOT ──────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="bg-slate-50 dark:bg-[#060b18] transition-colors duration-300">
      <HeroSection />
      <MatchesSection />
      <PlayerStatsSection />
      <FeaturedNewsSection />
      <SponsorsSection />
    </div>
  )
}
