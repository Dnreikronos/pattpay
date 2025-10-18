'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PixelClouds from '../../app/components/PixelClouds'
import PixelButton from '../../app/components/PixelButton'
import Image from 'next/image'

interface FAQItem {
  id: string
  question: string
  answer: string
  icon: string
  color: string
}

const faqs: FAQItem[] = [
  {
    id: 'what-is-pattpay',
    question: 'What is PattPay?',
    answer: 'PattPay is a Web3 subscription gateway built on Solana. It enables automatic recurring payments through smart contracts—no banks, no intermediaries, just direct wallet-to-wallet transactions.',
    icon: '/bank.png',
    color: '#4F46E5',
  },
  {
    id: 'how-recurring-works',
    question: 'How do recurring payments work on-chain?',
    answer: 'You authorize a subscription once. After that, smart contracts automatically execute transfers at your chosen intervals (daily, weekly, monthly). Everything happens on-chain with full transparency.',
    icon: '/loop.png',
    color: '#818CF8',
  },
  {
    id: 'supported-wallets',
    question: 'Which wallets are supported?',
    answer: 'Any Solana wallet works with PattPay—including Solflare, Backpack, Phantom, and more. Connect once, pay everywhere.',
    icon: '/wallet.png',
    color: '#6BC9A8',
  },
  {
    id: 'fees',
    question: 'What are the fees?',
    answer: 'PattPay leverages Solana\'s ultra-low transaction costs (less than $0.01 per transaction). There are no hidden fees—just transparent, on-chain execution.',
    icon: '/coin.png',
    color: '#F2B94B',
  },
  {
    id: 'cancel-subscription',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes. You maintain full control of your wallet and subscriptions. Cancel anytime directly from your dashboard—no waiting, no middlemen.',
    icon: '/power.png',
    color: '#E68BB7',
  },
  {
    id: 'security',
    question: 'Is my data secure?',
    answer: 'Absolutely. All transactions are recorded on-chain via audited smart contracts. No custodians, no centralized servers—just cryptographic security and transparency.',
    icon: '/lock.png',
    color: '#6BA3E6',
  },
]

// FAQ Accordion Item Component - Creative Pixel Art Design
function FAQAccordion({ faq, isOpen, onToggle, index }: {
  faq: FAQItem
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isOpen}
      aria-controls={`faq-answer-${faq.id}`}
    >
      {/* Pixel art container with isometric style */}
      <div
        className={`
          relative bg-surface border-4 transition-all duration-300
          ${isOpen ? '' : 'border-border'}
          hover:-translate-y-1
        `}
        style={{
          borderColor: isOpen ? faq.color : undefined,
          boxShadow: isOpen
            ? `8px 8px 0 0 ${faq.color}33`
            : undefined
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = faq.color
            e.currentTarget.style.boxShadow = `6px 6px 0 0 ${faq.color}4D`
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = ''
            e.currentTarget.style.boxShadow = ''
          }
        }}
      >
        {/* Diagonal stripe pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity duration-300"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              ${faq.color},
              ${faq.color} 2px,
              transparent 2px,
              transparent 12px
            )`,
          }}
        />

        {/* Animated pixel dots on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${faq.color} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Left accent stripe - pixel style */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none"
          style={{ backgroundColor: faq.color }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isOpen ? 1 : 0.3 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Top pixel corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-4 border-l-4 pointer-events-none" style={{ borderColor: faq.color }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-4 border-r-4 pointer-events-none" style={{ borderColor: faq.color }} />

        {/* Content area */}
        <div className="relative p-5 md:p-6 lg:p-8">
          {/* Question header with emoji icon */}
          <div className="flex items-start gap-4 md:gap-6">
            {/* Icon pixel box */}
            <motion.div
              className="shrink-0 w-12 h-12 md:w-14 md:h-14 border-4 flex items-center justify-center relative overflow-hidden"
              style={{
                borderColor: faq.color,
                backgroundColor: `${faq.color}15`
              }}
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: isOpen
                  ? `4px 4px 0 0 ${faq.color}40`
                  : `2px 2px 0 0 ${faq.color}20`
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Pixel corner decoration inside icon box */}
              <div className="absolute top-0 right-0 w-1.5 h-1.5" style={{ backgroundColor: faq.color }} />
              <div className="absolute bottom-0 left-0 w-1.5 h-1.5" style={{ backgroundColor: faq.color }} />

              <Image
                src={faq.icon}
                alt={faq.question}
                width={32}
                height={32}
                className="relative z-10 pixelated w-8 h-8 md:w-9 md:h-9 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>

            {/* Question text */}
            <div className="flex-1 min-w-0">
              <h3
                className="text-base md:text-lg lg:text-xl text-foreground leading-tight mb-1"
                style={{ fontFamily: "var(--font-press-start)", fontWeight: 400 }}
              >
                {faq.question}
              </h3>

              {/* Pixel separator line */}
              <motion.div
                className="h-[3px] mt-3 mb-2"
                style={{ backgroundColor: faq.color }}
                initial={{ width: 0 }}
                animate={{ width: isOpen ? '100%' : '40px' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            {/* Expand/collapse pixel indicator */}
            <motion.div
              className="shrink-0 w-8 h-8 md:w-10 md:h-10 border-3 flex items-center justify-center relative"
              style={{ borderColor: faq.color }}
              animate={{
                rotate: isOpen ? 90 : -90,
                backgroundColor: isOpen ? `${faq.color}20` : 'transparent'
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Chevron pixel art SVG */}
              <Image
                src="/chevron-right.svg"
                alt={isOpen ? 'collapse' : 'expand'}
                width={20}
                height={20}
                className="pixelated"
                style={{
                  imageRendering: 'pixelated',
                  filter: `brightness(0) saturate(100%)`,
                  color: faq.color
                }}
              />
            </motion.div>
          </div>

          {/* Answer with AnimatePresence */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                id={`faq-answer-${faq.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="pt-4 pl-16 md:pl-20 pr-12">
                  {/* Pixel quote mark decoration */}
                  <div className="flex gap-1 mb-3">
                    <div className="w-2 h-2" style={{ backgroundColor: faq.color, opacity: 0.4 }} />
                    <div className="w-2 h-2" style={{ backgroundColor: faq.color, opacity: 0.3 }} />
                    <div className="w-2 h-2" style={{ backgroundColor: faq.color, opacity: 0.2 }} />
                  </div>

                  <p className="font-mono text-sm md:text-base lg:text-lg text-muted leading-relaxed">
                    {faq.answer}
                  </p>

                  {/* Bottom pixel decoration */}
                  <div className="flex gap-1 mt-4 justify-end">
                    <div className="w-2 h-2" style={{ backgroundColor: faq.color, opacity: 0.2 }} />
                    <div className="w-2 h-2" style={{ backgroundColor: faq.color, opacity: 0.3 }} />
                    <div className="w-2 h-2" style={{ backgroundColor: faq.color, opacity: 0.4 }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom pixel corners */}
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-4 border-l-4 pointer-events-none" style={{ borderColor: faq.color }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-4 border-r-4 pointer-events-none" style={{ borderColor: faq.color }} />
      </div>
    </motion.div>
  )
}

// Main FAQ Section Component
export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null)

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <section className="relative bg-background py-12 md:py-16 lg:py-20 overflow-hidden">
      {/* Pixel Clouds Background */}
      <div className="absolute inset-0 pointer-events-none">
        <PixelClouds />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 md:mb-12 lg:mb-16">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-relaxed text-foreground mb-4 md:mb-6"
            style={{ fontFamily: "var(--font-press-start)", fontWeight: 400 }}
            initial={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Frequently Asked <span className="text-brand">Questions</span>
          </motion.h2>

          <motion.p
            className="font-mono text-sm md:text-base lg:text-lg text-muted leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            Everything you need to know about PattPay and recurring payments on Solana.
          </motion.p>
        </div>

        {/* FAQ List - Single Column */}
        <div className="space-y-4 md:space-y-5 lg:space-y-6 mb-10 md:mb-12 lg:mb-16">
          {faqs.map((faq, index) => (
            <FAQAccordion
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => toggleFAQ(faq.id)}
              index={index}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <PixelButton variant="primary" className="text-lg md:text-xl px-8 md:px-12 py-4 md:py-6">
            Acessar a Plataforma
            <Image
              src="/arrow-right.svg"
              alt="arrow"
              width={20}
              height={20}
              className="inline-block ml-3 brightness-0 invert"
            />
          </PixelButton>
        </motion.div>
      </div>
    </section>
  )
}
