'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function HowItWorksSimplified() {
  return (
    <div className="relative flex flex-col">
      <HowPattPayWorksSection />
    </div>
  )
}

// ========================================
// How PattPay Works
// ========================================
function HowPattPayWorksSection() {
  return (
    <section
      className="relative overflow-hidden bg-background flex items-center justify-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="mx-auto max-w-7xl px-[10%] w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          >
            <h2 className="font-['Press_Start_2P'] text-4xl lg:text-5xl xl:text-6xl text-[#111827] leading-tight">
              How PattPay Works
            </h2>

            <p className="font-['DM_Mono'] text-lg lg:text-xl text-[#111827]/70 leading-relaxed">
              Every layer of PattPay works in sync — from users and creators on the surface,
              to automated smart contracts powering it all below.
            </p>

            <motion.a
              href="#"
              className="inline-block font-['DM_Mono'] text-base lg:text-lg text-[#4F46E5]
                         underline underline-offset-4 decoration-2 hover:decoration-[3px]
                         transition-all duration-300"
              whileHover={{ x: 8 }}
            >
              Learn more about how PattPay automates recurring payments →
            </motion.a>
          </motion.div>

          {/* Right: Layers Image with Animations */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Main Layers Image with float animation */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
                style={{
                  filter: 'drop-shadow(0 40px 80px rgba(129, 140, 248, 0.15))'
                }}
              >
                <Image
                  src="/Layers.png"
                  alt="PattPay layered architecture"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  priority
                />

                {/* Core glow effect (pulsing at the bottom layer) */}
                <motion.div
                  className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-32 h-32 -z-10"
                  style={{
                    background: 'radial-gradient(circle, rgba(129, 140, 248, 0.4) 0%, transparent 70%)',
                    filter: 'blur(40px)'
                  }}
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              {/* Floating particles between layers */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-2 h-2 bg-[#818CF8]/40 rounded-full"
                  style={{
                    left: `${20 + i * 12}%`,
                    top: `${30 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [0, -40, 0],
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1.3, 0.5]
                  }}
                  transition={{
                    duration: 3.5 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut"
                  }}
                />
              ))}

              {/* Soft diffuse shadow underneath */}
              <motion.div
                className="absolute inset-0 -z-20"
                style={{
                  background: 'radial-gradient(circle at 50% 70%, rgba(129, 140, 248, 0.1) 0%, transparent 60%)',
                  filter: 'blur(60px)'
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

