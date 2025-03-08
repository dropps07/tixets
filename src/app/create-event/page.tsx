'use client';

import React, { useState, FormEvent } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, DollarSign, Users, Info, Loader2 } from 'lucide-react';

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
        className="max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-4xl font-bold mb-8 text text-center" //this is a heading
          variants={itemVariants}
        >
          Create Event  
        </motion.h1>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              className="bg-red-900/20 p-4 rounded-lg border border-red-500 mb-6"
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
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 space-y-6 border border-gray-700"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="name" className="block mb-2 text-gray-300">Event Name</label>
            <div className="relative">
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 pl-10 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 transition-colors"
                required
                disabled={loading}
              />
              <Info className="absolute left-3 top-3.5 text-purple-500" size={20} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="description" className="block mb-2 text-gray-300">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 transition-colors"
              rows={4}
              required
              disabled={loading}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="date" className="block mb-2 text-gray-300">Date and Time</label>
            <div className="relative">
              <input
                type="datetime-local"
                id="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-3 pl-10 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 transition-colors"
                required
                disabled={loading}
              />
              <Calendar className="absolute left-3 top-3.5 text-purple-500" size={20} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="price" className="block mb-2 text-gray-300">Ticket Price (EDU)</label>
            <div className="relative">
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={handleChange}
                step="0.001"
                min="0"
                className="w-full p-3 pl-10 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 transition-colors"
                required
                disabled={loading}
              />
              <DollarSign className="absolute left-3 top-3.5 text-purple-500" size={20} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="totalTickets" className="block mb-2 text-gray-300">Total Tickets</label>
            <div className="relative">
              <input
                type="number"
                id="totalTickets"
                value={formData.totalTickets}
                onChange={handleChange}
                min="1"
                className="w-full p-3 pl-10 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 transition-colors"
                required
                disabled={loading}
              />
              <Users className="absolute left-3 top-3.5 text-purple-500" size={20} />
            </div>
          </motion.div>

          <motion.button 
            type="submit" 
            className="w-full bg-white text-black px-4 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            variants={itemVariants}
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
        </motion.form>
      </motion.div>
    </div>
  );
}