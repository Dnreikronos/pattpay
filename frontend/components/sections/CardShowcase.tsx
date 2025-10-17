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
  bgVariant: 'wallet' | 'recurring' | 'contracts' | 'fees' | 'analytics' | 'creators'
  ctaText?: string
  accentColor?: string // Subtle pixel art accent
}

const benefitCards: BenefitCard[] = [
  {
    id: 'wallets',
    title: 'Any wallet, <span class="text-brand">anywhere.</span>',
    subtitle: 'Solflare, Backpack, or any wallet—<strong>connect once, pay everywhere.</strong> Your keys, your control.',
    visual: '/cards/Image1.png',
    bgVariant: 'wallet',
    accentColor: '#8B7AE6', // Soft purple
  },
  {
    id: 'recurring',
    title: 'Set it. Forget it. <span class="text-brand">Forever.</span>',
    subtitle: 'Subscriptions that run on <strong>autopilot</strong>—daily, weekly, monthly. <strong>Zero manual work, 100% on-chain.</strong>',
    visual: '/cards/Image2.png',
    bgVariant: 'recurring',
    accentColor: '#6BC9A8', // Soft mint green
  },
  {
    id: 'contracts',
    title: '<span class="text-brand">Smart contracts.</span> Zero trust needed.',
    subtitle: 'Your subscriptions run <strong>on-chain, exactly as coded.</strong> No intermediaries. No downtime. Just pure execution.',
    visual: '/cards/Image3.png',
    bgVariant: 'contracts',
    accentColor: '#6BA3E6', // Soft blue
  },
  {
    id: 'fees',
    title: 'Built on <span class="text-brand">Solana.</span> Built for speed.',
    subtitle: '<strong>Lightning-fast transactions</strong> with minimal network fees. Your subscriptions process <strong>instantly</strong>, without the blockchain bloat.',
    visual: '/cards/Image4.png',
    bgVariant: 'fees',
    accentColor: '#E6B76B', // Soft gold
  },
  {
    id: 'insights',
    title: 'Data you can trust. <span class="text-brand">Live.</span>',
    subtitle: 'Track MRR, churn, success rates, and revenue—<strong>updated every block.</strong> No delays, no estimates.',
    visual: '/cards/Image5.png',
    bgVariant: 'analytics',
    accentColor: '#E68BB7', // Soft pink
  },
  {
    id: 'creators',
    title: 'Made for <span class="text-brand">builders</span> like you.',
    subtitle: 'Payment links, tiered plans, team access. <strong>Launch your subscription business in minutes, not months.</strong>',
    visual: '/cards/Image6.png',
    bgVariant: 'creators',
    accentColor: '#6BC9E6', // Soft cyan
  },
]

const cardBgClasses = {
  wallet: 'bg-[#F5F5F7] border-border text-foreground',
  recurring: 'bg-[#F5F5F7] border-border text-foreground',
  contracts: 'bg-[#F5F5F7] border-border text-foreground',
  fees: 'bg-[#F5F5F7] border-border text-foreground',
  analytics: 'bg-[#F5F5F7] border-border text-foreground',
  creators: 'bg-[#F5F5F7] border-border text-foreground',
}

export default function CardShowcase() {
  const trackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)

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
  // Use state to avoid hydration mismatch
  const [viewportValues, setViewportValues] = useState({ leftPadding: 300, stackedPosition: -150 })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportValues({
        leftPadding: window.innerWidth * 0.15,
        stackedPosition: -window.innerWidth * 0.1
      })
    }
  }, [])

  // Base offset for deck animation (slightly left of center when stacked, leftPadding when spread)
  const baseTrackOffset = useTransform(deckProgress, [0, 1], [viewportValues.stackedPosition, viewportValues.leftPadding])

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
    (latest: number[]) => {
      const [base, nav, progress] = latest
      // Only apply navigation when deck is fully spread
      const navAmount = progress > 0.9 ? nav : 0
      return base + navAmount
    }
  )

  // Navigation buttons opacity - only show when fully spread
  const navOpacity = useTransform(deckProgress, [0.8, 1], [0, 1])


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

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const currentOffset = e.clientX - dragStartX

    // Threshold to change card: 100px
    if (Math.abs(currentOffset) > 100) {
      if (currentOffset > 0) {
        // Dragging right = go to previous
        goToPrevious()
      } else {
        // Dragging left = go to next
        goToNext()
      }
      setIsDragging(false)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    <>
      {/* Desktop version: button-controlled carousel */}
      <section
        ref={sectionRef}
        className="relative hidden lg:block bg-background py-12 md:py-16 lg:py-20 overflow-hidden"
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
        <div className="mx-auto max-w-[1440px] px-6 md:px-8 lg:px-10 mb-10 md:mb-12 lg:mb-16 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-relaxed text-foreground mb-4 md:mb-6"
              style={{ fontFamily: "var(--font-press-start)", fontWeight: 400 }}
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Why <span className="text-brand">PattPay?</span>
            </motion.h2>

            <motion.p
              className="font-mono text-sm md:text-base lg:text-lg xl:text-xl text-muted leading-relaxed max-w-3xl mx-auto px-4"
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
        <div
          className="relative min-h-[480px] md:min-h-[520px] flex items-center justify-center z-10"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isDragging ? 'grabbing' : 'col-resize' }}
        >
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
              absolute left-2 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20
              w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand text-white
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
            <Image
              src="/chevron-right.svg"
              alt="previous"
              width={20}
              height={20}
              className="rotate-180 brightness-0 invert md:w-6 md:h-6"
            />
          </motion.button>

          <motion.button
            onClick={goToNext}
            disabled={activeCardIndex >= 1}
            className={`
              absolute right-2 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20
              w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand text-white
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
            <Image
              src="/chevron-right.svg"
              alt="next"
              width={20}
              height={20}
              className="brightness-0 invert md:w-6 md:h-6"
            />
          </motion.button>
        </div>
      </section>

      {/* Mobile/Tablet version: horizontal scroll */}
      <section className="relative lg:hidden bg-background py-10 md:py-12 overflow-hidden">
        {/* Pixel Clouds Background */}
        <div className="absolute inset-0 pointer-events-none">
          <PixelClouds />
        </div>
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-8 md:mb-10 space-y-4 md:space-y-6 px-4">
            <h2
              className="text-xl sm:text-2xl md:text-3xl leading-relaxed text-foreground"
              style={{ fontFamily: "var(--font-press-start)", fontWeight: 400 }}
            >
              Why <span className="text-brand">PattPay?</span>
            </h2>
            <p className="font-mono text-sm md:text-base text-muted leading-relaxed max-w-2xl mx-auto">
              Discover the benefits that make PattPay the ideal choice for on-chain recurring payments.
            </p>
          </div>

          {/* Scroll container */}
          <div className="relative">
            <div
              id="mobile-cards-scroll"
              className="overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory scroll-smooth"
            >
              <div className="flex gap-3 sm:gap-4 md:gap-5 px-4 md:px-6 pb-6">
                {benefitCards.map((card, index) => (
                  <MobileCard
                    key={card.id}
                    card={card}
                    index={index}
                  />
                ))}
                {/* Spacer for better last card visibility */}
                <div className="w-4 shrink-0" aria-hidden="true" />
              </div>
            </div>

            {/* Scroll indicator hint - more visible */}
            <div className="absolute bottom-6 right-0 w-24 h-[calc(100%-24px)] bg-gradient-to-l from-background via-background/90 to-transparent pointer-events-none" />

            {/* Mobile Navigation Arrows - Fixed position */}
            <button
              onClick={() => {
                const container = document.getElementById('mobile-cards-scroll');
                if (container) container.scrollBy({ left: -280, behavior: 'smooth' });
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-brand/90 text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-brand hover:scale-105 active:scale-95"
              aria-label="Previous card"
            >
              <Image
                src="/chevron-right.svg"
                alt="previous"
                width={18}
                height={18}
                className="rotate-180 brightness-0 invert"
              />
            </button>

            <button
              onClick={() => {
                const container = document.getElementById('mobile-cards-scroll');
                if (container) container.scrollBy({ left: 280, behavior: 'smooth' });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-brand/90 text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-brand hover:scale-105 active:scale-95"
              aria-label="Next card"
            >
              <Image
                src="/chevron-right.svg"
                alt="next"
                width={18}
                height={18}
                className="brightness-0 invert"
              />
            </button>

            {/* Scroll dots indicator */}
            <div className="flex justify-center gap-1.5 mt-4 md:hidden">
              {benefitCards.map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-muted/40"
                  aria-hidden="true"
                />
              ))}
            </div>
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
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }
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
        relative w-[340px] lg:w-[360px] h-[460px] lg:h-[480px] shrink-0 rounded-none p-6 lg:p-7 border-4
        flex flex-col justify-between
        transition-all duration-300 ease-out
        focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2
        ${bgClass}
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
        borderColor: card.accentColor,
      }}
      whileHover={{
        boxShadow: `8px 8px 0 0 ${card.accentColor}`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="article"
      aria-label={card.title}
      data-card-index={index}
    >
      {/* Pixel art pattern background */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${card.accentColor} 1px, transparent 1px), linear-gradient(90deg, ${card.accentColor} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${card.accentColor}, transparent)`,
          opacity: 0.3,
        }}
      />

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${card.accentColor})`,
          opacity: 0.3,
        }}
      />

      {/* Corner pixel decorations */}
      <div
        className="absolute top-0 right-0 w-2 h-2 pointer-events-none"
        style={{ backgroundColor: card.accentColor, opacity: 0.4 }}
      />
      <div
        className="absolute bottom-0 left-0 w-2 h-2 pointer-events-none"
        style={{ backgroundColor: card.accentColor, opacity: 0.4 }}
      />

      {/* Large accent area behind content */}
      <div
        className="absolute top-0 left-0 w-full h-32 opacity-[0.05] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${card.accentColor} 0%, transparent 70%)`,
        }}
      />

      {/* Content with stagger animation */}
      <motion.div
        className="space-y-4 lg:space-y-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h3
          className="text-xl lg:text-2xl leading-tight"
          style={{ fontFamily: "var(--font-press-start)", fontWeight: 400 }}
          variants={itemVariants}
          dangerouslySetInnerHTML={{ __html: card.title }}
        />
        <motion.p
          className="font-['DM_Mono'] text-base lg:text-lg leading-relaxed opacity-80"
          variants={itemVariants}
          dangerouslySetInnerHTML={{ __html: card.subtitle }}
        />
      </motion.div>

      {/* Visual with fade in and scale */}
      <motion.div
        className="relative w-full h-32 lg:h-36"
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          }}
        >
          <Image
            src={card.visual}
            alt={card.title}
            width={160}
            height={160}
            className="pixelated lg:w-[180px] lg:h-[180px]"
            style={{ imageRendering: 'pixelated' }}
            priority={index === 0}
          />
        </div>
      </motion.div>
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
        relative w-[260px] sm:w-[280px] md:w-[320px] h-[280px] sm:h-[340px] md:h-[380px] shrink-0 rounded-none p-3 sm:p-4 md:p-5 border-2 sm:border-3 md:border-4
        flex flex-col justify-between snap-center
        ${bgClass}
      `}
      initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.95 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        borderColor: card.accentColor,
      }}
      role="article"
      aria-label={card.title}
    >
      {/* Pixel art pattern background - lighter on mobile */}
      <div
        className="absolute inset-0 opacity-[0.06] sm:opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${card.accentColor} 1px, transparent 1px), linear-gradient(90deg, ${card.accentColor} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${card.accentColor}, transparent)`,
          opacity: 0.3,
        }}
      />

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${card.accentColor})`,
          opacity: 0.3,
        }}
      />

      {/* Corner pixel decorations - hidden on mobile for cleaner look */}
      <div
        className="absolute top-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 pointer-events-none hidden sm:block"
        style={{ backgroundColor: card.accentColor, opacity: 0.4 }}
      />
      <div
        className="absolute bottom-0 left-0 w-1.5 h-1.5 sm:w-2 sm:h-2 pointer-events-none hidden sm:block"
        style={{ backgroundColor: card.accentColor, opacity: 0.4 }}
      />

      {/* Large accent area behind content */}
      <div
        className="absolute top-0 left-0 w-full h-24 sm:h-32 opacity-[0.04] sm:opacity-[0.05] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${card.accentColor} 0%, transparent 70%)`,
        }}
      />

      <motion.div
        className="space-y-2 sm:space-y-2.5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h3
          className="text-xs leading-tight sm:text-sm md:text-base"
          style={{ fontFamily: "var(--font-press-start)", fontWeight: 400 }}
          variants={itemVariants}
          dangerouslySetInnerHTML={{ __html: card.title }}
        />
        <motion.p
          className="font-['DM_Mono'] text-[10px] leading-snug sm:text-xs md:text-sm sm:leading-relaxed opacity-80"
          variants={itemVariants}
          dangerouslySetInnerHTML={{ __html: card.subtitle }}
        />
      </motion.div>

      <motion.div
        className="relative w-full h-20 sm:h-20 md:h-24"
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          }}
        >
          <Image
            src={card.visual}
            alt={card.title}
            width={100}
            height={100}
            className="pixelated sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px]"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </motion.div>
    </motion.article>
  )
}
