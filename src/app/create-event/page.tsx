'use client';

import React, { useState, FormEvent } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, DollarSign, Users, Info, Loader2, Clock } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1 
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

interface FormData {
  name: string;
  description: string;
  date: string;
  price: string;
  totalTickets: string;
}

export default function CreateEvent() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    date: '',
    price: '',
    totalTickets: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const eventDate = Math.floor(new Date(formData.date).getTime() / 1000);
        const priceInWei = ethers.utils.parseEther(formData.price);

        const tx = await contract.createEvent(
          formData.name, 
          formData.description, 
          eventDate, 
          priceInWei, 
          formData.totalTickets
        );
        
        await tx.wait();
        router.push('/events');
      } catch (error: unknown) {
        console.error('Error creating event:', error);
        if (error instanceof Error) {
          setError(error.message || 'Error creating event. Please try again.');
        } else {
          setError('Error creating event. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please install MetaMask to create events.');
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="max-w-2xl mx-auto border-2 border-gray-700 p-8 rounded-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-4xl font-bold mb-12 gradient-text text-center relative"
          variants={itemVariants}
        >
          Create Event
          <div className="rounded absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-purple-600 to-cyan-300 shadow-[0_0_10px_rgba(147,51,234,0.5)]"></div>
        </motion.h1>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              className="bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-red-500">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
  
        <motion.form 
          onSubmit={handleSubmit} 
          className="backdrop-blur-sm space-y-8"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="relative">
            <label htmlFor="name" className="block mb-2 text-white font-medium">Event Name</label>
            <div className="relative">
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 pr-10 bg-black text-white rounded-tr-lg rounded-lg border border-gray-600 focus:border-purple-500 transition-colors"
                required
                disabled={loading}
                placeholder="Enter Your Event title"
              />
              <Info className="absolute right-3 top-3.5 text-cyan-300" size={20} />
            </div>
          </motion.div>
  
          <motion.div variants={itemVariants}>
            <label htmlFor="description" className="block mb-2 text-white font-medium">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 bg-black text-white rounded-lg rounded-br-lg border border-gray-600 focus:border-purple-500 transition-colors"
              rows={4}
              required
              disabled={loading}
              placeholder="What makes your event special? Share all the exciting details!"
            />
          </motion.div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First row: Date and Price */}
            <motion.div variants={itemVariants}>
              <label htmlFor="date" className="block mb-2 text-white font-medium">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 text-cyan-300" size={20} />
                <input
                  type="date"
                  id="eventDate"
                  value={formData.date ? formData.date.split('T')[0] : ''}
                  onChange={(e) => {
                    const timeValue = formData.date ? formData.date.split('T')[1] : '';
                    setFormData(prev => ({ ...prev, date: `${e.target.value}T${timeValue}` }));
                  }}
                  className="w-full p-3 pl-10 bg-black text-white rounded border border-gray-600 focus:border-purple-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </motion.div>
  
            <motion.div variants={itemVariants}>
              <label htmlFor="price" className="block mb-2 text-white font-medium">Ticket Price (EDU)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-cyan-300" size={20} />
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.001"
                  min="0"
                  className="w-full p-3 pl-10 bg-black text-white rounded border border-gray-600 focus:border-purple-500 transition-colors"
                  required
                  disabled={loading}
                  placeholder="0.00"
                />
              </div>
            </motion.div>
  
            {/* Second row: Time and Total Tickets */}
            <motion.div variants={itemVariants}>
              <label htmlFor="eventTime" className="block mb-2 text-white font-medium">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 text-cyan-300" size={20} />
                <input
                  type="time"
                  id="eventTime"
                  value={formData.date ? formData.date.split('T')[1] || '' : ''}
                  onChange={(e) => {
                    const dateValue = formData.date ? formData.date.split('T')[0] : '';
                    setFormData(prev => ({ ...prev, date: `${dateValue}T${e.target.value}` }));
                  }}
                  className="w-full p-3 pl-10 bg-black text-white rounded border border-gray-600 focus:border-purple-500 transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </motion.div>
  
            <motion.div variants={itemVariants}>
              <label htmlFor="totalTickets" className="block mb-2 text-white font-medium">Total Tickets</label>
              <div className="relative">
                <Users className="absolute left-3 top-3.5 text-cyan-300" size={20} />
                <input
                  type="number"
                  id="totalTickets"
                  value={formData.totalTickets}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-3 pl-10 bg-black text-white rounded border border-gray-600 focus:border-purple-500 transition-colors"
                  required
                  disabled={loading}
                  placeholder="How many people can attend?"
                />
              </div>
            </motion.div>
          </div>
  
          <motion.div 
            className="pt-4 border-t border-gray-700"
            variants={itemVariants}
          >
            <motion.button 
              type="submit" 
              className="w-full bg-white text-black px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Creating Event...
                </span>
              ) : (
                'Create Event'
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}
