'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, ChevronUp, MessageCircle, Book, Mail } from 'lucide-react';
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
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    if (activeQuestion === index) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(index);
    }
  };

  const features = [
    {
      title: "Smart Contract Ticketing",
      description: "Automates ticket issuance, resale, and refunds on EduChain.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="8" rx="1"></rect><path d="M10 8V6a2 2 0 1 1 4 0v2"></path><path d="M8 12h8"></path></svg>
    },
    {
      title: "Decentralized Identity Verification",
      description: "Prevents bot purchases using blockchain-based identity checks.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    },
    {
      title: "P2P Ticket Resale",
      description: "Enables fair resale while preventing scalping and fraud.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="5"></circle><path d="M15 9a3 3 0 0 1 0 6"></path><path d="M16 9 v6"></path><path d="M15 15h6"></path></svg>
    },
    {
      title: "Multi-Currency Payments",
      description: "Accepts EduChain tokens and other cryptocurrencies for seamless transactions.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m8 14 4-4 4 4"></path><path d="M12 10v7"></path></svg>
    }
  ];

  const testimonials = [
    {
      name: "Alex Rivera",
      role: "Event Organizer",
      content: "Using tixets has transformed how we manage events. No more fake tickets or scalping issues!",
      image: "/testimonial1.jpg"
    },
    {
      name: "Samantha Chen",
      role: "Music Festival Attendee",
      content: "I love the peace of mind knowing my ticket is authentic and secured on the blockchain.",
      image: "/testimonial2.jpg"
    },
    {
      name: "Michael Jordan",
      role: "Concert Promoter",
      content: "The resale controls have eliminated price gouging at our events. Our fans are much happier!",
      image: "/testimonial3.jpg"
    }
  ];

  const faqs = [
    {
      question: "How does blockchain ticketing work?",
      answer: "Our platform issues tickets as unique tokens on the EduChain blockchain. Each ticket has a verifiable ownership history and cannot be duplicated or forged."
    },
    {
      question: "Can I resell my ticket if I can't attend?",
      answer: "Yes! Our platform allows peer-to-peer resale with enforced price caps to prevent scalping while ensuring you can recover your investment if plans change."
    },
    {
      question: "What cryptocurrencies are accepted?",
      answer: "We accept EduChain native tokens as well as other major cryptocurrencies. Our platform handles all conversions transparently."
    },
    {
      question: "How is my identity verified?",
      answer: "We use a decentralized identity protocol that verifies you're a real person without storing your personal data, preventing bots from mass-purchasing tickets."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <motion.section 
        className="min-h-[75vh] flex flex-col justify-center items-center text-center px-4 relative overflow-hidden"
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

      {/* Features Section */}
      <motion.section 
        className="py-20 px-4 bg-black/90"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center text-white"
            variants={itemVariants}
          >
            Revolutionary Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-black/70 border border-white/20 backdrop-blur-md p-6 rounded-lg"
                variants={itemVariants}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      
      {/* Why Choose Us Section */}
      <motion.section 
        className="py-20 px-4 bg-black"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center text-white"
            variants={itemVariants}
          >
            Why Choose Our Platform?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-black/70 border border-white/20 backdrop-blur-md p-6 rounded-lg"
              variants={itemVariants}
            >
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Truly Decentralized</h3>
              <p className="text-gray-300">Eliminate intermediaries with our blockchain solution. All transactions occur directly on EduChain, ensuring transparent pricing and eliminating manipulation.</p>
            </motion.div>
            
            <motion.div 
              className="bg-black/70 border border-white/20 backdrop-blur-md p-6 rounded-lg"
              variants={itemVariants}
            >
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Enhanced Security</h3>
              <p className="text-gray-300">Our blockchain technology provides unparalleled security, making ticket counterfeiting and duplication technically impossible.</p>
            </motion.div>
            
            <motion.div 
              className="bg-black/70 border border-white/20 backdrop-blur-md p-6 rounded-lg"
              variants={itemVariants}
            >
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Intuitive Interface</h3>
              <p className="text-gray-300">Experience a modern, frictionless platform built with Next.js and Tailwind CSS that makes buying and selling tickets effortless for everyone.</p>
            </motion.div>
            
            <motion.div 
              className="bg-black/70 border border-white/20 backdrop-blur-md p-6 rounded-lg"
              variants={itemVariants}
            >
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Real-Time Transfers</h3>
              <p className="text-gray-300">Instant ticket ownership transfers with immediate blockchain verification, eliminating wait times and providing instant confirmation.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section 
        className="py-20 px-4 bg-black"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center text-white"
            variants={itemVariants}
          >
            What People Are Saying
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-black/70 border border-white/20 backdrop-blur-md p-6 rounded-lg text-center"
                variants={itemVariants}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 bg-gray-800">
                  {/* Replace with actual testimonial images or use placeholders */}
                  <div className="w-full h-full flex items-center justify-center text-white text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>
                <p className="text-gray-300 italic mb-4">"{testimonial.content}"</p>
                <h4 className="text-white font-semibold">{testimonial.name}</h4>
                <p className="text-gray-400 text-sm">{testimonial.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        className="py-20 px-4 bg-black/90"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center text-white"
            variants={itemVariants}
          >
            Frequently Asked Questions
          </motion.h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="border border-white/20 rounded-lg overflow-hidden"
                variants={itemVariants}
              >
                <button
                  className="w-full flex justify-between items-center p-4 text-left bg-black/70 text-white hover:bg-black/90 transition-colors"
                  onClick={() => toggleQuestion(index)}
                >
                  <span className="text-lg font-medium">{faq.question}</span>
                  {activeQuestion === index ? (
                    <ChevronUp className="flex-shrink-0" />
                  ) : (
                    <ChevronDown className="flex-shrink-0" />
                  )}
                </button>
                {activeQuestion === index && (
                  <div className="p-4 bg-black/50 text-gray-300">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Flashcards Section */}
      <motion.section 
        className="py-20 px-4 bg-black"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center text-white"
            variants={itemVariants}
          >
            Educational Resources
          </motion.h2>
          
          <motion.div 
            className="bg-black/70 border border-white/20 backdrop-blur-md p-8 rounded-lg text-center max-w-2xl mx-auto"
            variants={itemVariants}
          >
            <Book size={48} className="mb-6 text-white mx-auto" />
            <h3 className="text-2xl font-bold mb-4 text-white">Blockchain Ticketing Flashcards</h3>
            <p className="text-gray-300 mb-8">Learn all about blockchain technology, decentralized ticketing, and how our platform works with our interactive educational flashcards.</p>
            <Link 
              href="/flashcards" 
              className="bg-black/70 text-white border-2 border-white group px-8 py-3 rounded-full text-lg font-semibold inline-flex items-center justify-center hover:bg-white hover:border-black hover:text-black transition-colors"
            >
              Explore Flashcards
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Us Section */}
      <motion.section 
        className="py-20 px-4 bg-purple-900"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center text-white"
            variants={itemVariants}
          >
            Contact Us
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div 
              className="bg-purple-800/70 border border-white/20 backdrop-blur-md p-6 rounded-lg text-center flex flex-col items-center"
              variants={itemVariants}
            >
              <MessageCircle size={40} className="mb-4 text-white" />
              <h3 className="text-2xl font-bold mb-3 text-white">Technical Support</h3>
              <p className="text-gray-200 mb-6">Our dedicated team is available 24/7 to assist with platform questions and provide guidance on using our blockchain ticketing system.</p>
              <Link 
                href="/support" 
                className="bg-purple-800/70 text-white border-2 border-white group px-6 py-3 rounded-full text-md font-semibold flex items-center justify-center hover:bg-white hover:border-purple-800 hover:text-purple-800 transition-colors"
              >
                Get Support
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <motion.div 
              className="bg-purple-800/70 border border-white/20 backdrop-blur-md p-6 rounded-lg text-center flex flex-col items-center"
              variants={itemVariants}
            >
              <Mail size={40} className="mb-4 text-white" />
              <h3 className="text-2xl font-bold mb-3 text-white">Business Collaboration</h3>
              <p className="text-gray-200 mb-6">Interested in partnership opportunities or implementing our blockchain ticketing solution for your events? Let's connect.</p>
              <Link 
                href="/contact" 
                className="bg-purple-800/70 text-white border-2 border-white group px-6 py-3 rounded-full text-md font-semibold flex items-center justify-center hover:bg-white hover:border-purple-800 hover:text-purple-800 transition-colors"
              >
                Contact Us
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-purple-950 py-10 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-300">© 2025 tixets. All rights reserved.</p>
          <div className="mt-6 flex justify-center space-x-6">
            <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy</Link>
            <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
