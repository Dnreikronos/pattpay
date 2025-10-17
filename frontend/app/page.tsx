"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import PixelClouds from "./components/PixelClouds";
import PixelButton from "./components/PixelButton";
import PhantomStyleCards from "../components/sections/PhantomStyleCards";

export default function Home() {
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });

  // Parallax effect for the city image
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <PixelClouds />

      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-screen flex-col items-center justify-center py-16 gap-12 md:gap-20">

            <div className="space-y-8 text-center max-w-5xl w-full">

              <motion.h1
                initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-relaxed text-foreground px-4"
                style={{ fontFamily: "var(--font-press-start)", fontWeight: 400 }}
              >
                The Future of <span className="text-brand">Recurring Payments</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="font-mono text-base md:text-lg lg:text-xl text-muted leading-relaxed max-w-3xl mx-auto px-4"
              >
                Automate payments between creators and Web3 businesses with zero intermediaries.
                Set it once, and let smart contracts handle the rest — transparent, fast, and secure.
              </motion.p>


              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
              >
                <PixelButton variant="primary">
                  Get Started
                  <span className="inline-block ml-2">→</span>
                </PixelButton>
                <PixelButton variant="secondary">
                  View Demo
                </PixelButton>
              </motion.div>
            </div>

            <motion.div
              ref={imageRef}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-6xl relative"
              style={{ opacity }}
            >
              <motion.div
                style={{ y }}
                className="relative"
              >
                <motion.div
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0
                  }}
                  className="relative"
                >
                  <Image
                    src="/Main-Image.png"
                    alt="The Pixel Finance City - PattPay's DeFi Ecosystem"
                    width={1400}
                    height={787}
                    className="w-full h-auto pixelated"
                    priority
                  />

                  <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
                    <div className="absolute inset-x-0 top-1/2 h-1/2 bg-gradient-to-t from-brand/40 via-accent/20 to-transparent" />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -left-4 w-24 h-24 bg-brand/10 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Showcase - Phantom-style horizontal scroll */}
      <PhantomStyleCards />
    </main>
  );
}
