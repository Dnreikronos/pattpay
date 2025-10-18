import type { Metadata } from "next";
import { DM_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "pattpay",
  description: "pattpay - Payment platform",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmMono.variable} ${pressStart.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
