"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Navbar() {

  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            <Image
              src="/text-logo.png"
              alt="PattPay"
              width={280}
              height={80}
              className="h-14 w-auto sm:h-16 md:h-20 pixelated"
              style={{ imageRendering: 'pixelated' }}
              priority
            />
          </Link>

          {/* Get Started Button */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-brand hover:text-brand-600 transition-all duration-200 text-xs sm:text-sm group hover:gap-3 hover:-translate-y-[1px]"
            style={{ fontFamily: "var(--font-press-start)", fontWeight: 400 }}
          >
            <span className="group-hover:tracking-wider transition-all duration-200">Get Started</span>
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="group-hover:scale-110 transition-transform duration-200"
            >
              <Image
                src="/arrow-right.svg"
                alt="arrow"
                width={20}
                height={20}
                style={{ filter: 'brightness(0) saturate(100%) invert(37%) sepia(94%) saturate(1678%) hue-rotate(227deg) brightness(91%) contrast(93%)' }}
              />
            </motion.div>
          </Link>
        </div>
      </div>
    </nav>
  )
}
