'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Tag, Ticket } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';

interface Event {
  id: number;
  name: string;
  description: string;
  date: number;
  price: ethers.BigNumber;
  totalTickets: number;
  ticketsSold: number;
}

interface UserTickets {
  [eventId: number]: number;
}

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

const CustomLoader = () => (
  <div className="min-h-screen w-full bg-black">

  <div className="flex flex-col items-center justify-center h-[60vh]">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0">
        <div className="w-24 h-24 border-8 border-transparent rounded-full"></div>
      </div>
      <div className="absolute inset-0">
        <div className="w-24 h-24 border-t-8 border-white rounded-full animate-spin"></div>
      </div>
    </div>
    <motion.p 
      className="mt-4 text-lg text-gray-400"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1, repeat: Infinity }}
      >
      Exlporing events...
    </motion.p>
  </div>
  </div>
);

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [userTickets, setUserTickets] = useState<UserTickets>({});
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          setLoading(true);
          setError(null);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          
          const eventCount = await contract.nextEventId();
          const fetchedEvents: Event[] = [];
          const userTicketsObj: UserTickets = {};
          
          for (let i = 1; i < eventCount.toNumber(); i++) {
            const event = await contract.getEvent(i);
            fetchedEvents.push({
              id: i,
              name: event.name,
              description: event.description,
              date: event.date.toNumber(),
              price: event.price,
              totalTickets: event.totalTickets.toNumber(),
              ticketsSold: event.ticketsSold.toNumber(),
            });
            const userTicketCount = await contract.getUserTickets(i);
            userTicketsObj[i] = userTicketCount.toNumber();
          }
          setEvents(fetchedEvents);
          setUserTickets(userTicketsObj);
        } catch (error) {
          console.error('Error fetching events:', error);
          setError('Failed to load events. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Please install MetaMask to use this feature.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    activeTab === 'upcoming' ? new Date(event.date * 1000) > new Date() : new Date(event.date * 1000) <= new Date()
  );

  const handleBuyTicket = async (eventId: number, price: ethers.BigNumber) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const tx = await contract.purchaseTicket(eventId, 1, { value: price });
        await tx.wait();

        const updatedUserTickets = { ...userTickets };
        updatedUserTickets[eventId] = (updatedUserTickets[eventId] || 0) + 1;
        setUserTickets(updatedUserTickets);

        const updatedEvent = await contract.getEvent(eventId);
        setEvents(prevEvents => prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, ticketsSold: updatedEvent.ticketsSold.toNumber() }
            : event
        ));

        setSelectedEvent({
          ...events.find(e => e.id === eventId)!,
          ticketsSold: updatedEvent.ticketsSold.toNumber()
        });
      } catch (error) {
        console.error('Error buying ticket:', error);
        alert('Failed to buy ticket. Please try again.');
      }
    } else {
      alert('Please install MetaMask to buy tickets.');
    }
  };

  if (loading) return <CustomLoader />;

  if (error) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-[60vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-black/20 p-6 rounded-lg border border-red-500">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black">
    <div className="container mx-auto px-4 py-8 bg-black">
      <motion.h1 
        className="text-4xl font-bold mb-8 gradient-text text-center"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        >
        Events
        <div className="rounded absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-purple-600 to-cyan-300 shadow-[0_0_10px_rgba(147,51,234,0.5)]"></div>
      </motion.h1>
      
      <motion.div 
        className="flex justify-center mb-8 bg-black p-1 rounded-full max-w-xs mx-auto border border-gray-800"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        >
        <button
          className={`px-6 py-2 rounded-full transition-all duration-300 ${activeTab === 'upcoming' ? 'gradient-bg text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('upcoming')}
          >
          Upcoming
        </button>
        <button
          className={`px-6 py-2 rounded-full transition-all duration-300 ${activeTab === 'past' ? 'gradient-bg text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('past')}
          >
          Past
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          >
          {filteredEvents.length > 0 ? (
            <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
              initial="hidden"
              animate="visible"
              >
              {filteredEvents.map((event) => (
                <motion.div 
                key={event.id} 
                className="bg-black backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300"
                variants={itemVariants}
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2 gradient-text">{event.name}</h2>
                    <p className="text-gray-300 mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar size={16} className="mr-2 text-cyan" />
                        <span>{new Date(event.date * 1000).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock size={16} className="mr-2 text-cyan" />
                        <span>{new Date(event.date * 1000).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Tag size={16} className="mr-2 text-cyan" />
                        <span>{ethers.utils.formatEther(event.price)} EDU</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                          <span className="flex items-center">
                            <Ticket size={16} className="mr-2 text-cyan" />
                            <span>{event.ticketsSold} / {event.totalTickets}</span>
                          </span>
                          <span>{Math.round((event.ticketsSold / event.totalTickets) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(event.ticketsSold / event.totalTickets) * 100} 
                          className="h-2 bg-black"
                          />
                      </div>
                    </div>

                    {activeTab === 'upcoming' && (
                      userTickets[event.id] ? (
                        <button 
                          className=" px-4 py-3 rounded-lg inline-block text-black font-semibold w-full hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedEvent(event)}
                          >
                          View Your Ticket
                        </button>
                      ) : (
                        <button 
                          className={`px-4 py-3 rounded-lg inline-block font-semibold w-full transition-all
                            ${event.ticketsSold >= event.totalTickets 
                              ? 'bg-gray-700 text-gray-300 cursor-not-allowed' 
                              : 'gradient-button text-black hover:opacity-90'}`}
                          onClick={() => handleBuyTicket(event.id, event.price)}
                          disabled={event.ticketsSold >= event.totalTickets}
                        >
                          {event.ticketsSold >= event.totalTickets 
                            ? 'Sold Out' 
                            : `Buy Ticket (${ethers.utils.formatEther(event.price)} EDU)`}
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
            className="text-center py-12 bg-black/50 rounded-xl border border-gray-700"
            variants={itemVariants}
              initial="hidden"
              animate="visible"
              >
              <Calendar size={64} className="mx-auto mb-4 text-purple-500" />
              <h2 className="text-2xl font-semibold mb-2">No {activeTab} Events</h2>
              <p className="text-gray-400">Check back later for {activeTab} events.</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {selectedEvent && (
        <motion.div 
        className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-black p-8 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            >
            <h2 className="text-2xl font-bold mb-4 gradient-text">{selectedEvent.name} - Your Ticket</h2>
            <div className="bg-black/80 p-4 rounded-lg mb-4 border border-gray-700">
              <div className="mb-4 aspect-video bg-gray-800 rounded flex items-center justify-center">
                <Image src="/api/placeholder" width={400} height={225} alt="Event" className="rounded" />
              </div>
              <div className="space-y-2">
                <p className="text-gray-300"><strong>Date:</strong> {new Date(selectedEvent.date * 1000).toLocaleString()}</p>
                <p className="text-gray-300"><strong>Price:</strong> {ethers.utils.formatEther(selectedEvent.price)} EDU</p>
                <p className="text-gray-300"><strong>Your Tickets:</strong> {userTickets[selectedEvent.id]}</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">{selectedEvent.description}</p>
            <button 
              className="gradient-button px-4 py-3 rounded-lg inline-block text-black font-semibold w-full hover:opacity-90 transition-opacity"
              onClick={() => setSelectedEvent(null)}
              >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
      </div>
  );
}
