'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.2 
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <motion.section 
        className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-black "></div>
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6 text-white relative z-10"
          variants={itemVariants}
        >
          Welcome to tixets
        </motion.h1>
        <motion.p 
  className="text-xl md:text-2xl mb-12 max-w-2xl"
  style={{
    background: "linear-gradient(90deg,rgb(146, 39, 124),rgb(211, 113, 33),rgb(209, 37, 160))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  }}
  variants={itemVariants}
>
  We are excited to present a decentralized event ticketing platform built on the EduChain blockchain.
</motion.p>
        <motion.div
          className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6"
          variants={itemVariants}
        >
          <Link 
  href="/events" 
  className="bg-black border-2 border-white group px-8 py-3 rounded-full text-lg font-semibold flex items-center justify-center hover:bg-white hover:border-black text-white hover:text-black transition-colors"
>
  Explore Events
  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
</Link>
          <Link 
            href="/create-event" 
            className="bg-black text-white border-2 border-white group px-8 py-3 rounded-full text-lg font-semibold flex items-center justify-center hover:bg-white hover:border-black hover:text-black transition-colors"
          >
            Create Event
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}
