'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Image from 'next/image'

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
  brand: 'bg-brand/[0.06] border-border',
  dark: 'bg-[#111827] text-white border-[#1F2937]',
  secondary: 'bg-brand-300/15 border-brand-300/20',
  neutral: 'bg-surface border-border',
}

export default function PhantomStyleCards() {
  const trackRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

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
        className="relative hidden lg:block bg-background py-20 overflow-hidden"
        onKeyDown={handleKeyDown}
        role="region"
        aria-label="PattPay Benefits Showcase"
        tabIndex={0}
      >
        {/* Header - Above cards */}
        <div className="mx-auto max-w-[1440px] px-10 mb-16">
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
        <div className="relative min-h-[520px] flex items-center">
          <div className="w-full relative overflow-visible pl-[10%] md:pl-[15%] lg:pl-[20%]">
            <motion.div
              ref={trackRef}
              className="flex gap-6"
              animate={{
                x: calculateDesktopTranslateX()
              }}
              transition={{
                type: shouldReduceMotion ? 'tween' : 'spring',
                stiffness: 200,
                damping: 25,
                duration: shouldReduceMotion ? 0 : 1.2
              }}
            >
              {benefitCards.map((card, index) => (
                <DesktopCard
                  key={card.id}
                  card={card}
                  index={index}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </motion.div>

            {/* Gradient mask on right only */}
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>

          {/* Navigation Arrows - Absolute position (only in this section) */}
          <button
            onClick={goToPrevious}
            disabled={activeCardIndex === 0}
            className={`
              absolute left-6 top-1/2 -translate-y-1/2 z-20
              w-12 h-12 rounded-full bg-brand text-white
              flex items-center justify-center
              transition-all duration-300 cursor-pointer
              ${activeCardIndex === 0
                ? 'opacity-0 pointer-events-none'
                : 'opacity-80 hover:opacity-100 hover:scale-110 hover:shadow-[2px_2px_0_0_rgba(129,140,248,1)]'
              }
            `}
            aria-label="Previous card"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </button>

          <button
            onClick={goToNext}
            disabled={activeCardIndex >= 1}
            className={`
              absolute right-6 top-1/2 -translate-y-1/2 z-20
              w-12 h-12 rounded-full bg-brand text-white
              flex items-center justify-center
              transition-all duration-300 cursor-pointer
              ${activeCardIndex >= 1
                ? 'opacity-0 pointer-events-none'
                : 'opacity-80 hover:opacity-100 hover:scale-110 hover:shadow-[2px_2px_0_0_rgba(129,140,248,1)]'
              }
            `}
            aria-label="Next card"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Mobile/Tablet version: button-controlled carousel */}
      <section className="relative lg:hidden bg-background py-16 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
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

// Desktop card component with advanced hover states
function DesktopCard({
  card,
  index,
  shouldReduceMotion
}: {
  card: BenefitCard
  index: number
  shouldReduceMotion: boolean | null
}) {
  const bgClass = cardBgClasses[card.bgVariant]
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || shouldReduceMotion) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = e.clientX
    const mouseY = e.clientY

    // Calculate direction from mouse to center
    const deltaX = (mouseX - centerX) / rect.width
    const deltaY = (mouseY - centerY) / rect.height

    // Push away from mouse (opposite direction)
    setMousePosition({
      x: -deltaX * 15,
      y: -deltaY * 15
    })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
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
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
      }}
      whileHover={{
        scale: 1.02,
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
        <div className="absolute top-6 right-6">
          <span
            className={`
            font-['DM_Mono'] text-xs px-2.5 py-1 rounded-full border
            ${card.bgVariant === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-brand/10 border-brand/20 text-brand'}
          `}
          >
            {card.badge}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 mt-4">
        <h3 className="font-['Press_Start_2P'] text-lg leading-tight">
          {card.title}
        </h3>
        <p className="font-['DM_Mono'] text-sm leading-relaxed opacity-80">
          {card.subtitle}
        </p>
      </div>

      {/* Visual */}
      <div className="relative w-full h-36 my-6">
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
      </div>

      {/* CTA */}
      <motion.a
        href="#"
        className={`
          inline-flex items-center gap-2 font-['DM_Mono'] text-sm
          underline underline-offset-4 decoration-1
          transition-all duration-300
          ${card.bgVariant === 'dark' ? 'text-white hover:text-brand-300' : 'text-brand hover:text-brand-600'}
        `}
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
  card,
  index
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
      initial={{ opacity: 1, scale: 1 }}
      role="article"
      aria-label={card.title}
    >
      {card.badge && (
        <div className="absolute top-6 right-6">
          <span
            className={`
            font-['DM_Mono'] text-xs px-2.5 py-1 rounded-full border
            ${card.bgVariant === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-brand/10 border-brand/20 text-brand'}
          `}
          >
            {card.badge}
          </span>
        </div>
      )}

      <div className="space-y-2.5 mt-3">
        <h3 className="font-['Press_Start_2P'] text-base leading-tight">
          {card.title}
        </h3>
        <p className="font-['DM_Mono'] text-xs leading-relaxed opacity-80">
          {card.subtitle}
        </p>
      </div>

      <div className="relative w-full h-28 my-4">
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
      </div>

      <a
        href="#"
        className={`
          inline-flex items-center gap-2 font-['DM_Mono'] text-xs
          underline underline-offset-4
          ${card.bgVariant === 'dark' ? 'text-white' : 'text-brand'}
        `}
      >
        {card.ctaText || 'Learn more'}
        <span>→</span>
      </a>
    </motion.article>
  )
}
