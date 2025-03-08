'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Instagram, Twitter, Linkedin, User, Calendar, Ticket, Eye, Clock, Tag } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';

interface UserProfile {
  username: string;
  bio: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  hostedEvents: number;
  attendedEvents: number;
  isRegistered: boolean;
  purchasedTickets: { eventId: number; eventName: string }[];
}

interface EventDetails {
  id: number;
  name: string;
  description: string;
  date: number;
  price: ethers.BigNumber;
  totalTickets: number;
  ticketsSold: number;
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
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0">
        <div className="w-24 h-24 border-8 border-gray-700 rounded-full"></div>
      </div>
      <div className="absolute inset-0">
        <div className="w-24 h-24 border-t-8 border-purple-500 rounded-full animate-spin"></div>
      </div>
    </div>
    <motion.p 
      className="mt-4 text-lg text-gray-400"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Loading profile...
    </motion.p>
  </div>
);

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          setLoading(true);
          setError(null);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          
          const userProfile = await contract.getUserProfile(address);
          
          let socialLinks;
          try {
            socialLinks = JSON.parse(userProfile[2] || '{}');
          } catch (e) {
            console.error('Error parsing social links:', e);
            socialLinks = {};
          }

          const eventCount = await contract.nextEventId();
          const purchasedTickets = [];
          let attendedEventsCount = 0;

          for (let i = 1; i < eventCount.toNumber(); i++) {
            const ticketCount = await contract.getUserTickets(i);
            if (ticketCount.toNumber() > 0) {
              const event = await contract.getEvent(i);
              purchasedTickets.push({ eventId: i, eventName: event.name });
              attendedEventsCount++;
            }
          }

          const profile: UserProfile = {
            username: userProfile[0],
            bio: userProfile[1],
            socialLinks: socialLinks,
            hostedEvents: 0,
            attendedEvents: attendedEventsCount,
            isRegistered: userProfile[4],
            purchasedTickets: purchasedTickets
          };

          setProfile(profile);
          setBio(profile.bio);
          setInstagram(profile.socialLinks.instagram || '');
          setTwitter(profile.socialLinks.twitter || '');
          setLinkedin(profile.socialLinks.linkedin || '');
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setError(`Failed to load profile: ${(error as Error).message}`);
          setLoading(false);
        }
      } else {
        setError('Please install MetaMask to use this feature.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      try {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        const socialLinks = JSON.stringify({ instagram, twitter, linkedin });
        
        const tx = await contract.updateUserProfile(bio, socialLinks, '');
        await tx.wait();

        setEditing(false);
        const address = await signer.getAddress();
        const updatedProfile = await contract.getUserProfile(address);
        
        const parsedSocialLinks = JSON.parse(updatedProfile[2] || '{}');
        setProfile(prevProfile => ({
          ...prevProfile!,
          bio: updatedProfile[1],
          socialLinks: parsedSocialLinks,
        }));
        
        setBio(updatedProfile[1]);
        setInstagram(parsedSocialLinks.instagram || '');
        setTwitter(parsedSocialLinks.twitter || '');
        setLinkedin(parsedSocialLinks.linkedin || '');
        
        setLoading(false);
      } catch (error) {
        console.error('Error updating profile:', error);
        setError(`Failed to update profile: ${(error as Error).message}`);
        setLoading(false);
      }
    }
  };

  const handleViewTicketDetails = async (eventId: number) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const eventDetails = await contract.getEvent(eventId);
      
      setSelectedEvent({
        id: eventId,
        name: eventDetails.name,
        description: eventDetails.description,
        date: eventDetails.date.toNumber(),
        price: eventDetails.price,
        totalTickets: eventDetails.totalTickets.toNumber(),
        ticketsSold: eventDetails.ticketsSold.toNumber(),
      });
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError(`Failed to fetch event details: ${(error as Error).message}`);
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
        <div className="bg-red-900/20 p-6 rounded-lg border border-red-500">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </motion.div>
    );
  }

  if (!profile) {
    return (
      <motion.div 
        className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <User size={64} className="mx-auto mb-4 text-purple-500" />
        <h2 className="text-2xl font-semibold mb-2">No Profile Found</h2>
        <p className="text-gray-400">Please connect your wallet to view your profile.</p>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 gradient-text text-center"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        Profile
      </motion.h1>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="lg:col-span-2"
          variants={itemVariants}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">{profile.username}</h2>
              <motion.button
                onClick={() => setEditing(!editing)}
                className="gradient-button p-2 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit2 size={20} />
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {editing ? (
                <motion.form 
                  onSubmit={handleUpdateProfile}
                  key="edit-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-400 mb-1">Instagram</label>
                    <div className="flex items-center bg-gray-700/50 border border-gray-600 rounded-lg">
                      <Instagram size={20} className="ml-3 text-gray-400" />
                      <input
                        type="text"
                        id="instagram"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full p-3 bg-transparent text-white focus:outline-none"
                        placeholder="Username"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-400 mb-1">Twitter</label>
                    <div className="flex items-center bg-gray-700/50 border border-gray-600 rounded-lg">
                      <Twitter size={20} className="ml-3 text-gray-400" />
                      <input
                        type="text"
                        id="twitter"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className="w-full p-3 bg-transparent text-white focus:outline-none"
                        placeholder="Username"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-400 mb-1">LinkedIn</label>
                    <div className="flex items-center bg-gray-700/50 border border-gray-600 rounded-lg">
                      <Linkedin size={20} className="ml-3 text-gray-400" />
                      <input
                        type="text"
                        id="linkedin"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="w-full p-3 bg-transparent text-white focus:outline-none"
                        placeholder="Profile URL"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="bg-white w-full py-3 rounded-lg text-black font-semibold transition-all"
                  >
                    Save Profile
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="profile-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-gray-300 mb-6">{profile.bio || 'No bio provided'}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                      <div className="flex items-center mb-2">
                        <Calendar size={20} className="text-purple-500 mr-2" />
                        <span className="text-gray-400">Hosted Events</span>
                      </div>
                      <span className="text-2xl font-bold gradient-text">{profile.hostedEvents}</span>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                      <div className="flex items-center mb-2">
                        <Ticket size={20} className="text-purple-500 mr-2" />
                        <span className="text-gray-400">Attended Events</span>
                      </div>
                      <span className="text-2xl font-bold gradient-text">{profile.attendedEvents}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries({ instagram, twitter, linkedin }).map(([platform, value]) => 
                      value && (
                        <a
                          key={platform}
                          href={platform === 'linkedin' ? value : `https://${platform}.com/${value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center bg-gray-700/30 p-3 rounded-lg border border-gray-600 text-gray-300 hover:border-purple-500 transition-all"
                        >
                          {platform === 'instagram' && <Instagram size={20} className="text-purple-500 mr-2" />}
                          {platform === 'twitter' && <Twitter size={20} className="text-purple-500 mr-2" />}
                          {platform === 'linkedin' && <Linkedin size={20} className="text-purple-500 mr-2" />}
                          <span>{value}</span>
                        </a>
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Your Tickets</h2>
            
            {profile.purchasedTickets.length > 0 ? (
              <div className="space-y-4">
                {profile.purchasedTickets.map((ticket) => (
                  <motion.div 
                    key={ticket.eventId}
                    className="bg-gray-700/30 rounded-lg border border-gray-600 overflow-hidden hover:border-purple-500 transition-all"
                    whileHover={{ scale: 1.02 }}
                  >
                    <button
                      onClick={() => handleViewTicketDetails(ticket.eventId)}
                      className="w-full p-4 text-left"
                    >
                      <h3 className="font-semibold text-white mb-2">{ticket.eventName}</h3>
                      <div className="flex items-center text-gray-400">
                        <Eye size={16} className="mr-2 text-purple-500" />
                        <span>Click to view details</span>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ticket size={48} className="mx-auto mb-4 text-purple-500" />
                <p className="text-gray-400">No tickets purchased yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-800 p-8 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <h2 className="text-2xl font-bold mb-4 gradient-text">{selectedEvent.name}</h2>
              
              <div className="bg-gray-900 p-4 rounded-lg mb-4 border border-gray-700">
                <div className="mb-4 aspect-video bg-gray-800 rounded flex items-center justify-center">
                  <Image src="/api/placeholder/" width='400'height='225' alt="Event" className="rounded" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Calendar size={16} className="mr-2 text-purple-500" />
                    <span>{new Date(selectedEvent.date * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Clock size={16} className="mr-2 text-purple-500" />
                    <span>{new Date(selectedEvent.date * 1000).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Tag size={16} className="mr-2 text-purple-500" />
                    <span>{ethers.utils.formatEther(selectedEvent.price)} AIA</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-gray-300 mb-1">
                      <span className="flex items-center">
                        <Ticket size={16} className="mr-2 text-purple-500" />
                        <span>{selectedEvent.ticketsSold} / {selectedEvent.totalTickets}</span>
                      </span>
                      <span>{Math.round((selectedEvent.ticketsSold / selectedEvent.totalTickets) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(selectedEvent.ticketsSold / selectedEvent.totalTickets) * 100} 
                      className="h-2 bg-gray-700"
                    />
                  </div>
                </div>
              </div>
              
              <p className="text-gray-400 mb-4">{selectedEvent.description}</p>
              
              <button 
                className="gradient-button px-4 py-3 rounded-lg text-white font-semibold w-full hover:opacity-90 transition-opacity"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}