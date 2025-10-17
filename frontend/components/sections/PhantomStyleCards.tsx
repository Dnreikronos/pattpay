'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, MotionValue, useMotionValue, useSpring } from 'framer-motion'
import Image from 'next/image'
import PixelClouds from '../../app/components/PixelClouds'

interface BenefitCard {
  id: string
  badge?: string
  title: string
  subtitle: string
  visual: string
  bgVariant: 'brand' | 'dark' | 'secondary' | 'neutral'
  ctaText?: string
}

const benefitCards: BenefitCard[] = [
  {
    id: 'wallets',
    badge: '1.0',
    title: 'Multiple wallets, one flow.',
    subtitle: 'Connect Phantom and other wallets; manage everything in a single dashboard.',
    visual: '/cards/wallet.svg',
    bgVariant: 'brand',
  },
  {
    id: 'recurring',
    badge: '2.0',
    title: 'Recurring by design.',
    subtitle: 'Automated on-chain subscriptions with configurable billing cycles.',
    visual: '/cards/loop.svg',
    bgVariant: 'secondary',
  },
  {
    id: 'contracts',
    badge: '3.0',
    title: 'Smart contracts that just run.',
    subtitle: 'Deploy, execute, and monitor subscriptions with secure smart contracts.',
    visual: '/cards/engine.svg',
    bgVariant: 'dark',
  },
  {
    id: 'fees',
    badge: '4.0',
    title: 'Fees you can actually ignore.',
    subtitle: 'Low costs on Solana, full transparency per transaction.',
    visual: '/cards/fee.svg',
    bgVariant: 'neutral',
  },
  {
    id: 'insights',
    badge: '5.0',
    title: 'Insights in real-time.',
    subtitle: 'Live metrics: churn rate, MRR, payment success, and more.',
    visual: '/cards/analytics.svg',
    bgVariant: 'secondary',
  },
  {
    id: 'creators',
    badge: '6.0',
    title: 'Built for creators & businesses.',
    subtitle: 'Payment links, subscription plans, and team-based permissions.',
    visual: '/cards/bridge.svg',
    bgVariant: 'brand',
  },
]

const cardBgClasses = {
  brand: 'bg-brand border-border',
  dark: 'bg-[#111827] text-white border-[#1F2937]',
  secondary: 'bg-brand-300 border-brand-300',
  neutral: 'bg-surface border-border',
}

export default function PhantomStyleCards() {
  const trackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Scroll-based deck animation
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end']
  })

  // Map scroll progress to deck spread
  // Cards start stacked in center, then spread out
  // 0.4-0.8 = deck spreading animation (stays stacked longer)
  // They stay spread after 0.8 (when section ends)
  const deckProgress = useTransform(scrollYProgress, [0.4, 0.8], [0, 1], {
    clamp: true
  })

  // Move the entire track - slightly left of center when stacked, with left padding when spread
  // When spread, we want the padding-left like before (pl-[20%])
  // Approximate 20% of viewport for desktop
  const leftPadding = typeof window !== 'undefined' ? window.innerWidth * 0.15 : 300

  // Base offset for deck animation (slightly left of center when stacked, leftPadding when spread)
  // Position between left and center
  const stackedPosition = typeof window !== 'undefined' ? -window.innerWidth * 0.1 : -150
  const baseTrackOffset = useTransform(deckProgress, [0, 1], [stackedPosition, leftPadding])

  // Navigation offset as motion value with spring animation
  const navOffsetValue = useMotionValue(0)
  const smoothNavOffset = useSpring(navOffsetValue, {
    stiffness: shouldReduceMotion ? 1000 : 200,
    damping: shouldReduceMotion ? 100 : 25,
    duration: shouldReduceMotion ? 0 : 1.2
  })

  // Update navigation offset when activeCardIndex changes
  useEffect(() => {
    const offset = activeCardIndex === 0 ? 0 : -(3 * 384)
    navOffsetValue.set(offset)
  }, [activeCardIndex, navOffsetValue])

  // Combine base offset + navigation offset
  const trackOffset = useTransform(
    [baseTrackOffset, smoothNavOffset, deckProgress],
    ([base, nav, progress]) => {
      // Only apply navigation when deck is fully spread
      const navAmount = progress > 0.9 ? nav : 0
      return (base as number) + (navAmount as number)
    }
  )

  // Navigation buttons opacity - only show when fully spread
  const navOpacity = useTransform(deckProgress, [0.8, 1], [0, 1])

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Navigation handlers
  const goToPrevious = () => {
    if (activeCardIndex > 0) {
      setActiveCardIndex(activeCardIndex - 1)
    }
  }

  const goToNext = () => {
    if (activeCardIndex < benefitCards.length - 1) {
      setActiveCardIndex(activeCardIndex + 1)
    }
  }

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }

  // Calculate translateX based on active card index
  // Desktop: Move enough to show remaining cards (1 click only)
  // We show 2-3 cards initially, clicking once shows the rest
  const calculateDesktopTranslateX = () => {
    if (activeCardIndex === 0) return 0
    // Move approximately 3 cards worth to show remaining cards
    return -(3 * 384)
  }

  const calculateMobileTranslateX = () => {
    if (activeCardIndex === 0) return 0
    // Move 2 cards worth on mobile
    return -(2 * (isMobile ? 300 : 360))
  }

  return (
    <>
      {/* Desktop version: button-controlled carousel */}
      <section
        ref={sectionRef}
        className="relative hidden lg:block bg-background py-20 overflow-hidden"
        onKeyDown={handleKeyDown}
        role="region"
        aria-label="PattPay Benefits Showcase"
        tabIndex={0}
      >
        {/* Pixel Clouds Background */}
        <div className="absolute inset-0 pointer-events-none">
          <PixelClouds />
        </div>
        {/* Header - Above cards */}
        <div className="mx-auto max-w-[1440px] px-10 mb-16 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-relaxed text-foreground mb-6"
              style={{ fontFamily: "var(--font-press-start)", fontWeight: 400 }}
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Why PattPay?
            </motion.h2>

            <motion.p
              className="font-mono text-base md:text-lg lg:text-xl text-muted leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              Discover the benefits that make PattPay the ideal choice for on-chain recurring payments.
            </motion.p>
          </div>
        </div>

        {/* Cards carousel - Full width */}
        <div className="relative min-h-[520px] flex items-center justify-center z-10">
          <div className="w-full relative overflow-visible" style={{ perspective: '1500px', perspectiveOrigin: 'center center' }}>
            <motion.div
              ref={trackRef}
              className="flex gap-6"
              style={{
                transformStyle: 'preserve-3d',
                x: trackOffset
              }}
            >
              {benefitCards.map((card, index) => (
                <DesktopCard
                  key={card.id}
                  card={card}
                  index={index}
                  totalCards={benefitCards.length}
                  shouldReduceMotion={shouldReduceMotion}
                  deckProgress={deckProgress}
                />
              ))}
            </motion.div>

            {/* Gradient mask on right - only visible when spread */}
            <motion.div
              className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"
              style={{
                opacity: deckProgress
              }}
            />
          </div>

          {/* Navigation Arrows - Absolute position (only visible when spread) */}
          <motion.button
            onClick={goToPrevious}
            disabled={activeCardIndex === 0}
            className={`
              absolute left-6 top-1/2 -translate-y-1/2 z-20
              w-12 h-12 rounded-full bg-brand text-white
              flex items-center justify-center
              transition-all duration-300 cursor-pointer
              hover:scale-110 hover:shadow-[2px_2px_0_0_rgba(129,140,248,1)]
            `}
            aria-label="Previous card"
            style={{
              opacity: activeCardIndex === 0 ? 0 : navOpacity,
              pointerEvents: activeCardIndex === 0 ? 'none' : 'auto'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </motion.button>

          <motion.button
            onClick={goToNext}
            disabled={activeCardIndex >= 1}
            className={`
              absolute right-6 top-1/2 -translate-y-1/2 z-20
              w-12 h-12 rounded-full bg-brand text-white
              flex items-center justify-center
              transition-all duration-300 cursor-pointer
              hover:scale-110 hover:shadow-[2px_2px_0_0_rgba(129,140,248,1)]
            `}
            aria-label="Next card"
            style={{
              opacity: activeCardIndex >= 1 ? 0 : navOpacity,
              pointerEvents: activeCardIndex >= 1 ? 'none' : 'auto'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </motion.button>
        </div>
      </section>

      {/* Mobile/Tablet version: button-controlled carousel */}
      <section className="relative lg:hidden bg-background py-16 overflow-hidden">
        {/* Pixel Clouds Background */}
        <div className="absolute inset-0 pointer-events-none">
          <PixelClouds />
        </div>
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center mb-12 space-y-6">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-relaxed text-foreground"
              style={{ fontFamily: "var(--font-press-start)", fontWeight: 400 }}
            >
              Why PattPay?
            </h2>
            <p className="font-mono text-base md:text-lg lg:text-xl text-muted leading-relaxed max-w-3xl mx-auto">
              Discover the benefits that make PattPay the ideal choice for on-chain recurring payments.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-6"
                animate={{
                  x: calculateMobileTranslateX()
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30
                }}
              >
                {benefitCards.map((card, index) => (
                  <MobileCard
                    key={card.id}
                    card={card}
                    index={index}
                  />
                ))}
              </motion.div>
            </div>

            {/* Mobile Navigation Arrows */}
            <button
              onClick={goToPrevious}
              disabled={activeCardIndex === 0}
              className={`
                absolute left-0 top-1/2 -translate-y-1/2 z-10
                w-10 h-10 rounded-full bg-brand text-white
                flex items-center justify-center
                transition-all duration-300 cursor-pointer
                ${activeCardIndex === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-80 hover:opacity-100'
                }
              `}
              aria-label="Previous card"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
              </svg>
            </button>

            <button
              onClick={goToNext}
              disabled={activeCardIndex >= 1}
              className={`
                absolute right-0 top-1/2 -translate-y-1/2 z-10
                w-10 h-10 rounded-full bg-brand text-white
                flex items-center justify-center
                transition-all duration-300 cursor-pointer
                ${activeCardIndex >= 1
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-80 hover:opacity-100'
                }
              `}
              aria-label="Next card"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

// Animation variants for stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

// Desktop card component with advanced hover states
function DesktopCard({
  card,
  index,
  totalCards,
  shouldReduceMotion,
  deckProgress
}: {
  card: BenefitCard
  index: number
  totalCards: number
  shouldReduceMotion: boolean | null
  deckProgress: MotionValue<number>
}) {
  const bgClass = cardBgClasses[card.bgVariant]
  const cardRef = useRef<HTMLDivElement>(null)

  // Mouse interaction with motion values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { stiffness: 150, damping: 15 })
  const smoothMouseY = useSpring(mouseY, { stiffness: 150, damping: 15 })

  // Calculate deck position transforms
  // When deckProgress = 0: cards are stacked in center
  // When deckProgress = 1: cards are in their carousel positions

  // Calculate the center position and the final spread position
  // Total cards width when spread: 6 cards * 360px + 5 gaps * 24px = 2280px
  // Center of that: 1140px
  // Each card's natural position from left: index * (360 + 24)
  // To center all at same point, we need to move each card FROM its natural position TO the center

  const centerPoint = ((totalCards - 1) * (360 + 24)) / 2 // Center of all cards
  const naturalPosition = index * (360 + 24) // This card's natural flex position
  const offsetToCenter = centerPoint - naturalPosition // How much to move to reach center

  // X position: move from center point to natural spread position
  const deckX = useTransform(deckProgress, [0, 1], [
    offsetToCenter, // Move to center when stacked
    0 // Natural flex position when spread
  ])

  // Combine deck X with mouse X
  const cardX = useTransform([deckX, smoothMouseX], ([deck, mouse]) => (deck as number) + (mouse as number))

  // Rotation: slight rotation for 3D stacked effect
  const deckRotate = useTransform(deckProgress, [0, 1], [
    index * 1.5, // Each card rotated slightly more (0°, 1.5°, 3°, 4.5°...)
    0 // Straight when spread
  ])

  // Scale: all same size when stacked (no scaling)
  const deckScale = useTransform(deckProgress, [0, 1], [
    1, // Same size when stacked
    1 // Same size when spread
  ])

  // Opacity: all visible when stacked
  const deckOpacity = useTransform(deckProgress, [0, 0.3, 1], [
    1, // Fully visible
    1,
    1
  ])

  // Y offset: vertical offset to create visible stack with perspective
  // Cards further back are higher up (negative Y)
  const deckY = useTransform(deckProgress, [0, 1], [
    -index * 8, // More negative = higher on screen, creates "looking down at deck" effect
    0 // No offset when spread
  ])

  // Z offset for true 3D depth
  const deckZ = useTransform(deckProgress, [0, 1], [
    -index * 20, // Cards go back in Z space
    0
  ])

  // Combine deck Y with mouse Y
  const cardY = useTransform([deckY, smoothMouseY], ([deck, mouse]) => (deck as number) + (mouse as number))

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || shouldReduceMotion) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const clientX = e.clientX
    const clientY = e.clientY

    // Calculate direction from mouse to center
    const deltaX = (clientX - centerX) / rect.width
    const deltaY = (clientY - centerY) / rect.height

    // Push away from mouse (opposite direction)
    mouseX.set(-deltaX * 15)
    mouseY.set(-deltaY * 15)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.article
      ref={cardRef}
      className={`
        relative w-[360px] h-[480px] shrink-0 rounded-2xl p-7 border-2
        flex flex-col justify-between
        transition-all duration-300 ease-out
        focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2
        ${bgClass}
        ${card.bgVariant === 'dark' ? 'text-white' : 'text-fg'}
      `}
      initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      style={{
        x: cardX,
        y: cardY,
        z: deckZ,
        rotateX: deckRotate,
        scale: deckScale,
        opacity: deckOpacity,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{
        boxShadow: '4px 4px 0 0 rgba(129, 140, 248, 1)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="article"
      aria-label={card.title}
      data-card-index={index}
    >
      {/* Badge */}
      {card.badge && (
        <motion.div
          className="absolute top-6 right-6"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span
            className={`
            font-['DM_Mono'] text-xs px-2.5 py-1 rounded-full border
            ${card.bgVariant === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-brand/10 border-brand/20 text-brand'}
          `}
          >
            {card.badge}
          </span>
        </motion.div>
      )}

      {/* Content with stagger animation */}
      <motion.div
        className="space-y-3 mt-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h3
          className="font-['Press_Start_2P'] text-lg leading-tight"
          variants={itemVariants}
        >
          {card.title}
        </motion.h3>
        <motion.p
          className="font-['DM_Mono'] text-sm leading-relaxed opacity-80"
          variants={itemVariants}
        >
          {card.subtitle}
        </motion.p>
      </motion.div>

      {/* Visual with fade in and scale */}
      <motion.div
        className="relative w-full h-36 my-6"
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: card.bgVariant === 'dark'
              ? 'radial-gradient(circle at 50% 50%, rgba(129, 140, 248, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.08) 0%, transparent 70%)',
          }}
        >
          <Image
            src={card.visual}
            alt={card.title}
            width={160}
            height={160}
            className="pixelated opacity-90"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </motion.div>

      {/* CTA with fade in */}
      <motion.a
        href="#"
        className={`
          inline-flex items-center gap-2 font-['DM_Mono'] text-sm
          underline underline-offset-4 decoration-1
          transition-all duration-300
          ${card.bgVariant === 'dark' ? 'text-white hover:text-brand-300' : 'text-brand hover:text-brand-600'}
        `}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.4 }}
        whileHover={{ x: 4 }}
      >
        {card.ctaText || 'Learn more'}
        <span>→</span>
      </motion.a>
    </motion.article>
  )
}

// Mobile card component (simplified, no complex hover)
function MobileCard({
  card
}: {
  card: BenefitCard
  index: number
}) {
  const bgClass = cardBgClasses[card.bgVariant]

  return (
    <motion.article
      className={`
        relative min-w-[280px] sm:min-w-[340px] h-[420px] shrink-0 rounded-2xl p-6 border-2
        flex flex-col justify-between
        ${bgClass}
        ${card.bgVariant === 'dark' ? 'text-white' : 'text-fg'}
      `}
      initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.95 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      role="article"
      aria-label={card.title}
    >
      {card.badge && (
        <motion.div
          className="absolute top-6 right-6"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span
            className={`
            font-['DM_Mono'] text-xs px-2.5 py-1 rounded-full border
            ${card.bgVariant === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-brand/10 border-brand/20 text-brand'}
          `}
          >
            {card.badge}
          </span>
        </motion.div>
      )}

      <motion.div
        className="space-y-2.5 mt-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h3
          className="font-['Press_Start_2P'] text-base leading-tight"
          variants={itemVariants}
        >
          {card.title}
        </motion.h3>
        <motion.p
          className="font-['DM_Mono'] text-xs leading-relaxed opacity-80"
          variants={itemVariants}
        >
          {card.subtitle}
        </motion.p>
      </motion.div>

      <motion.div
        className="relative w-full h-28 my-4"
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: card.bgVariant === 'dark'
              ? 'radial-gradient(circle at 50% 50%, rgba(129, 140, 248, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.08) 0%, transparent 70%)',
          }}
        >
          <Image
            src={card.visual}
            alt={card.title}
            width={120}
            height={120}
            className="pixelated opacity-90"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </motion.div>

      <motion.a
        href="#"
        className={`
          inline-flex items-center gap-2 font-['DM_Mono'] text-xs
          underline underline-offset-4
          ${card.bgVariant === 'dark' ? 'text-white' : 'text-brand'}
        `}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {card.ctaText || 'Learn more'}
        <span>→</span>
      </motion.a>
    </motion.article>
  )
}
