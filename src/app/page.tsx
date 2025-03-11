'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Syne } from 'next/font/google';
import Image from 'next/image';

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

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

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
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/stars.jpg" // Replace with the actual path to your image
            alt="stars"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        
        
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40 z-1"></div>
        
        <motion.div
          className="relative z-10 backdrop-blur-sm py-6 px-8 rounded-lg"
          variants={itemVariants}
        >
          <motion.h1 
            className={`text-5xl md:text-7xl font-bold mb-6 text-white font-syne font-400`}
            variants={itemVariants}
          >
            Welcome to tixets
          </motion.h1>
        </motion.div>
        
        <motion.p 
          className="text-xl md:text-2xl mb-12 max-w-2xl relative z-10 backdrop-blur-md"
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
          className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 relative z-10"
          variants={itemVariants}
        >
          <Link 
            href="/events" 
            className="bg-black/70 border-2 border-white group px-8 py-3 rounded-full text-lg font-semibold flex items-center justify-center hover:bg-white hover:border-black text-white hover:text-black transition-colors"
          >
            Explore Events
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform transition-all" />
          </Link>
          <Link 
            href="/create-event" 
            className="bg-black/70 text-white border-2 border-white group px-8 py-3 rounded-full text-lg font-semibold flex items-center justify-center hover:bg-white hover:border-black hover:text-black transition-colors"
          >
            Create Event
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform transition-all" />
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}
