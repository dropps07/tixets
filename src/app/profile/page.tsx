'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { motion } from 'framer-motion';
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

// Animation configurations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
};

const ProfileLoader = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="relative w-24 h-24">
      <div className="w-24 h-24 border-4 border-8 border-transparent rounded-full"></div>
      <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-white rounded-full animate-spin"></div>
    </div>
    <motion.p 
      className="mt-4 text-gray-400"
      animate={{ opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      Fetching user data...
    </motion.p>
  </div>
);

export default function Profile() {
  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [eventDetail, setEventDetail] = useState<EventDetails | null>(null);

  // Fetch user profile data
  useEffect(() => {
    async function getUserProfile() {
      if (typeof window.ethereum === 'undefined') {
        setErrorMessage('MetaMask extension is required to view profile');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Get user data from contract
        const userData = await contract.getUserProfile(userAddress);
        
        // Parse social links
        let parsedSocialLinks: { instagram: string; twitter: string; linkedin: string } = {
          instagram: '',
          twitter: '',
          linkedin: ''
        };
        try {
          parsedSocialLinks = JSON.parse(userData[2] || '{}');
        } catch (err) {
          console.error('Failed to parse social links:', err);
        }

        // Gather ticket information
        const eventIdCounter = await contract.nextEventId();
        const tickets = [];
        let eventsAttended = 0;

        for (let i = 1; i < eventIdCounter.toNumber(); i++) {
          const ticketCount = await contract.getUserTickets(i);
          if (ticketCount.toNumber() > 0) {
            const eventData = await contract.getEvent(i);
            tickets.push({ 
              eventId: i, 
              eventName: eventData.name 
            });
            eventsAttended++;
          }
        }

        // Construct profile object
        const userProfile: UserProfile = {
          username: userData[0],
          bio: userData[1],
          socialLinks: parsedSocialLinks,
          hostedEvents: 0, // Assuming this would be populated elsewhere
          attendedEvents: eventsAttended,
          isRegistered: userData[4],
          purchasedTickets: tickets
        };

        // Update state
        setProfile(userProfile);
        setFormData({
          bio: userProfile.bio,
          instagram: userProfile.socialLinks.instagram || '',
          twitter: userProfile.socialLinks.twitter || '',
          linkedin: userProfile.socialLinks.linkedin || ''
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setErrorMessage(`Could not load profile data: ${(err as Error).message}`);
        setIsLoading(false);
      }
    }

    getUserProfile();
  }, []);

  // Update profile handler
  const saveProfileChanges = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (typeof window.ethereum === 'undefined') return;
    
    try {
      setIsLoading(true);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Prepare social links JSON
      const socialLinksJson = JSON.stringify({
        instagram: formData.instagram,
        twitter: formData.twitter,
        linkedin: formData.linkedin
      });
      
      // Submit transaction
      const transaction = await contract.updateUserProfile(formData.bio, socialLinksJson, '');
      await transaction.wait();

      // Get updated profile data
      const userAddress = await signer.getAddress();
      const updatedData = await contract.getUserProfile(userAddress);
      const updatedSocials = JSON.parse(updatedData[2] || '{}');
      
      // Update state
      setProfile(prev => ({
        ...prev!,
        bio: updatedData[1],
        socialLinks: updatedSocials,
      }));
      
      setFormData({
        bio: updatedData[1],
        instagram: updatedSocials.instagram || '',
        twitter: updatedSocials.twitter || '',
        linkedin: updatedSocials.linkedin || ''
      });
      
      setIsEditMode(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setErrorMessage(`Update failed: ${(err as Error).message}`);
      setIsLoading(false);
    }
  };

  // Helper to fetch event details
  const fetchEventDetails = async (eventId: number) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const event = await contract.getEvent(eventId);
      
      setEventDetail({
        id: eventId,
        name: event.name,
        description: event.description,
        date: event.date.toNumber(),
        price: event.price,
        totalTickets: event.totalTickets.toNumber(),
        ticketsSold: event.ticketsSold.toNumber(),
      });
    } catch (err) {
      console.error('Event details error:', err);
      setErrorMessage(`Could not retrieve event information: ${(err as Error).message}`);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Loading state
  if (isLoading) return <ProfileLoader />;

  // Error state
  if (errorMessage) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-red-900/30 p-6 rounded-lg border border-red-500 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-3">Profile Error</h2>
          <p className="text-gray-300">{errorMessage}</p>
        </div>
      </motion.div>
    );
  }

  // No profile state
  if (!profile) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-screen p-4"
        {...fadeInUp}
      >
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700 max-w-md w-full">
          <User size={60} className="mx-auto mb-4 text-purple-500" />
          <h2 className="text-2xl font-semibold mb-3">Profile Not Found</h2>
          <p className="text-gray-400 px-6">Please connect your wallet to access your profile information.</p>
        </div>
      </motion.div>
    );
  }

  // Render profile
  return (
    <div className="min-h-screen w-full bg-black">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.h1 
          className="text-4xl font-bold mb-10 gradient-text text-center"
          {...fadeInUp}
        >
          My Profile
        </motion.h1>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Main Profile Section */}
          <motion.div 
            className="lg:col-span-8"
            variants={fadeInUp}
          >
            <div className="backdrop-blur-sm rounded-xl shadow-xl border-2 border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold gradient-text">{profile.username}</h2>
                  <motion.button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="p-3 rounded-full border-2 border-yellow-300 "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 size={18} />
                  </motion.button>
                </div>

                {isEditMode ? (
                  <motion.form 
                    onSubmit={saveProfileChanges}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">About Me</label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-black/80 border border-gray-100 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        rows={4}
                      />
                    </div>
                    
                    {/* Social Media Fields */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-300">Social Media</h3>
                      
                      <div>
                        <div className="flex items-center bg-black/80 border border-gray-600 rounded-lg hover:border-gray-400 transition-colors">
                          <Instagram size={18} className="ml-4 text-purple-400" />
                          <input
                            type="text"
                            id="instagram"
                            value={formData.instagram}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-transparent text-white focus:outline-none"
                            placeholder="Instagram username"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center bg-black/80 border border-gray-600 rounded-lg hover:border-gray-400 transition-colors">
                          <Twitter size={18} className="ml-4 text-purple-400" />
                          <input
                            type="text"
                            id="twitter"
                            value={formData.twitter}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-transparent text-white focus:outline-none"
                            placeholder="Twitter username"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center bg-black/80 border border-gray-600 rounded-lg hover:border-gray-400 transition-colors">
                          <Linkedin size={18} className="ml-4 text-purple-400" />
                          <input
                            type="text"
                            id="linkedin"
                            value={formData.linkedin}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-transparent text-white focus:outline-none"
                            placeholder="LinkedIn profile URL"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      className="mt-4 bg-white w-full py-3 rounded-lg text-black font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Update Profile
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="mb-8">
                      <p className="text-white text-lg">{profile.bio || 'No biography provided'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-black/60 p-5 rounded-xl border-2 border-gray-100">
                        <div className="flex items-center space-x-3 mb-3">
                          <Calendar size={22} className="text-cyan-300" />
                          <span className="text-gray-100 font-medium">Hosted Events</span>
                        </div>
                        <span className="text-3xl font-bold gradient-text">{profile.hostedEvents}</span>
                      </div>
                      
                      <div className="bg-black/60 p-5 rounded-xl border-2 border-gray-100">
                        <div className="flex items-center space-x-3 mb-3">
                          <Ticket size={22} className="text-cyan-300" />
                          <span className="text-gray-100 font-medium">Events Attended</span>
                        </div>
                        <span className="text-3xl font-bold gradient-text">{profile.attendedEvents}</span>
                      </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="pt-4 space-y-3">
                      <h3 className="text-xl font-semibold text-gray-300 mb-4">Connect With Me</h3>
                      
                      {Object.entries({ 
                        instagram: formData.instagram, 
                        twitter: formData.twitter, 
                        linkedin: formData.linkedin 
                      }).map(([platform, value]) => 
                        value && (
                          <a
                            key={platform}
                            href={platform === 'linkedin' ? value : `https://${platform}.com/${value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center bg-gray-700/20 p-4 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700/40 hover:border-purple-500 transition-all"
                          >
                            {platform === 'instagram' && <Instagram size={20} className="text-purple-500 mr-3" />}
                            {platform === 'twitter' && <Twitter size={20} className="text-purple-500 mr-3" />}
                            {platform === 'linkedin' && <Linkedin size={20} className="text-purple-500 mr-3" />}
                            <span className="font-medium">{value}</span>
                          </a>
                        )
                      )}
                      
                      {!formData.instagram && !formData.twitter && !formData.linkedin && (
                        <div className="text-center py-6 text-gray-500">
                          No social profiles added
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tickets Section */}
          <motion.div 
            className="lg:col-span-4"
            variants={fadeInUp}
          >
            <div className="backdrop-blur-sm rounded-xl shadow-xl border-2 border-gray-100 overflow-hidden h-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 gradient-text">My Event Tickets</h2>
                
                {profile.purchasedTickets.length > 0 ? (
                  <div className="space-y-4">
                    {profile.purchasedTickets.map((ticket) => (
                      <motion.div 
                        key={ticket.eventId}
                        className="bg-black/40 rounded-xl border border-white hover:border-cyan-300 transition-all"
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <button
                          onClick={() => fetchEventDetails(ticket.eventId)}
                          className="w-full p-4 text-left"
                        >
                          <h3 className="font-semibold text-white mb-2 truncate">{ticket.eventName}</h3>
                          <div className="flex items-center text-gray-100 text-sm">
                            <Eye size={14} className="mr-2 text-cyan-300" />
                            <span>View ticket details</span>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Ticket size={48} className="text-cyan-300 mb-4 opacity-60" />
                    <p className="text-gray-300 mb-1">No tickets purchased</p>
                    <p className="text-gray-500 text-sm">Your purchased event tickets will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Event Details Modal */}
        {eventDetail && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 gradient-text">{eventDetail.name}</h2>
                
                <div className="bg-gray-900/70 rounded-xl mb-6 overflow-hidden border border-gray-700">
                  <div className="aspect-video bg-gray-800 relative">
                    <Image 
                      src="/api/placeholder/400/225" 
                      width={400} 
                      height={225} 
                      alt={eventDetail.name} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-300">
                        <Calendar size={16} className="mr-2 text-purple-500" />
                        <span>{new Date(eventDetail.date * 1000).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <Clock size={16} className="mr-2 text-purple-500" />
                        <span>{new Date(eventDetail.date * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Tag size={16} className="mr-2 text-purple-500" />
                      <span>{ethers.utils.formatEther(eventDetail.price)} EDU</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-gray-300 mb-2">
                        <span className="flex items-center">
                          <Ticket size={16} className="mr-2 text-purple-500" />
                          <span>Tickets: {eventDetail.ticketsSold} / {eventDetail.totalTickets}</span>
                        </span>
                        <span>{Math.round((eventDetail.ticketsSold / eventDetail.totalTickets) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(eventDetail.ticketsSold / eventDetail.totalTickets) * 100} 
                        className="h-2 bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Event Description</h3>
                  <p className="text-gray-400">{eventDetail.description}</p>
                </div>
                
                <button 
                  className="gradient-button w-full py-3 rounded-lg text-black font-semibold hover:opacity-90 transition-opacity"
                  onClick={() => setEventDetail(null)}
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
