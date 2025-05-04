'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { User, Calendar, Ticket, LogOut } from 'lucide-react';
import UsernameRegistrationModal from './UsernameRegistrationModal';

const Navbar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    hostedEvents: 0,
    attendedEvents: 0,
    bio: '',
  });
  
  const profileRef = useRef<HTMLDivElement | null>(null); // Explicitly type the ref
  const navbarHeight = useRef(0);
 
  const EDUCHAIN_PARAMS = {
    chainId: '0x' + Number(656476).toString(16), // Convert to hex with 0x prefix
    chainName: 'EDU Chain Testnet',
    nativeCurrency: {
      name: 'Wei',
      symbol: 'EDU',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.open-campus-codex.gelato.digital'],
    blockExplorerUrls: ['https://edu-chain-testnet.blockscout.com'],
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: { target: any; }) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);
  
  // Add padding to body to prevent content overlap
  useEffect(() => {
    const navbarElement = document.getElementById('main-navbar');
    if (navbarElement) {
      // Get the actual height of the navbar including margins
      const height = navbarElement.offsetHeight + 8; // Just a tiny bit of extra space (8px)
      navbarHeight.current = height;
      
      // Add padding to the top of the body or main content
      document.body.style.paddingTop = `${height}px`; // Exact height of navbar
    }
    
    // Cleanup function
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, []);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Checking if we're connected to EduChain first
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        
        // Converting EDUCHAIN_PARAMS.chainId to the format needed for comparison
        const eduChainId = parseInt(EDUCHAIN_PARAMS.chainId, 16);
        
        // If not on EduChain, not proceeding with auto-connection
        if (network.chainId !== eduChainId) {
          console.log('Not connected to EduChain. Please connect to correct network.');
          return;
        }
        
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
        setIsConnected(true);

        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const profile = await contract.getUserProfile(address);
        if (profile.username) {
          setUsername(profile.username);
          
          // Fetch additional profile data if username exists
          fetchProfileData(contract, address);
        } else {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  }, [EDUCHAIN_PARAMS.chainId]);

  // Fetch additional profile data
  const fetchProfileData = async (contract: ethers.Contract, userAddress: string) => {
    try {
      // Get user profile from contract
      const userData = await contract.getUserProfile(userAddress);
      
      // Gather ticket information for attended events count
      const eventIdCounter = await contract.nextEventId();
      let eventsAttended = 0;

      for (let i = 1; i < eventIdCounter.toNumber(); i++) {
        const ticketCount = await contract.getUserTickets(i);
        if (ticketCount.toNumber() > 0) {
          eventsAttended++;
        }
      }

      // Update profile data state
      setProfileData({
        hostedEvents: 0, // Assuming this would be populated elsewhere
        attendedEvents: eventsAttended,
        bio: userData[1] || 'No bio provided'
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // Initial connection check
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const switchToEduChain = async () => {
    try {
      // Using the correct format for chainId (with '0x' prefix)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EDUCHAIN_PARAMS.chainId }],
      });
      console.log('Switched to EduChain');
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (switchError) {
      
      // If the network is not added, prompt the user to add it
      if (switchError === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [EDUCHAIN_PARAMS],
          });
          // Try switching again after adding
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: EDUCHAIN_PARAMS.chainId }],
          });
          return true;
        } catch (addError) {
          console.error('Error adding EduChain:', addError);
          alert('Failed to add EduChain network. Please add it manually.');
          return false;
        }
      } else {
        console.error('Error switching network:', switchError);
        alert('Failed to switch to EduChain. Please switch manually.');
        return false;
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Use let instead of const so we can reassign later
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Check if on the correct network and switch if needed
        const network = await provider.getNetwork();
        const eduChainId = parseInt(EDUCHAIN_PARAMS.chainId, 16); 
        
        if (network.chainId !== eduChainId) {
          const switched = await switchToEduChain();
          if (!switched) return; // Exit if network switch failed
          
          // Get fresh provider after network switch
          provider = new ethers.providers.Web3Provider(window.ethereum);
        }
        
        // Now we can proceed with connection
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
        setIsConnected(true);

        // Interact with the contract
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        try {
          const profile = await contract.getUserProfile(address);
          if (profile.username) {
            setUsername(profile.username);
            fetchProfileData(contract, address);
          } else {
            setShowModal(true);
          }
        } catch (contractError) {
          console.error('Error fetching user profile:', contractError);
          setShowModal(true); // Assume new user if contract call fails
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Helper function to check user profile
  const checkUserProfile = async (address: any) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const profile = await contract.getUserProfile(address);
      if (profile.username) {
        setUsername(profile.username);
        fetchProfileData(contract, address);
      } else {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setShowModal(true);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    setUsername('');
    setProfileData({
      hostedEvents: 0,
      attendedEvents: 0,
      bio: '',
    });
    setProfileOpen(false);
  };

  // Adding wallet event listeners
  useEffect(() => {
    if (window.ethereum) {
      // Handle chain changes
      const handleChainChanged = (chainId: string) => {
        console.log('Network changed to:', chainId);
        const eduChainIdHex = EDUCHAIN_PARAMS.chainId;
        
        if (chainId !== eduChainIdHex) {
          setIsConnected(false);
          setAddress('');
          setUsername('');
          alert('Please connect to EduChain network to use this application');
        } else {
          // Reconnecting if switched to the correct chain
          checkConnection();
        }
      };
      
      // Handle account changes
      const handleAccountsChanged = (accounts: string | any[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setIsConnected(false);
          setAddress('');
          setUsername('');
        } else {
          // Account changed, update state and check profile
          setAddress(accounts[0]);
          checkUserProfile(accounts[0]);
        }
      };
      
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Cleanup listeners on component unmount
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [EDUCHAIN_PARAMS.chainId, checkConnection]);


  const handleUsernameRegistration = (newUsername: React.SetStateAction<string>) => {
    setUsername(newUsername);
  };

  return (
    <>
      <motion.div
        id="main-navbar"
        className="fixed top-3 left-0 right-0 flex justify-center z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        >
        <div className="w-11/12 max-w-6xl py-4 px-6 md:px-10 backdrop-blur-md border border-gray-800/40 rounded-2xl ">
          <div className="flex justify-between items-center">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-1 md:space-x-8">
            <Link href="/" className="text-2xl font-bold relative group">
              <span className="gradient-text">Tixets</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-cyan-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <div className="hidden md:flex space-x-6 ml-6">
              <Link href="/events" className="text-white opacity-80 hover:opacity-100 relative group px-1">
                Events
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-300 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/create-event" className="text-white opacity-80 hover:opacity-100 relative group px-1">
                Create Event
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-300 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
          </div>
  
          {/* Right side items */}
          <div className="flex items-center space-x-6">
            {/* Profile dropdown */}
            {isConnected ? (
              <div className="relative" ref={profileRef}>
                <motion.button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 relative group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-cyan-300 blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                    <div className="relative z-10 bg-black bg-opacity-80 p-1.5 rounded-full">
                      <User size={18} className="text-white" />
                    </div>
                  </div>
                  <span className="text-white opacity-90 group-hover:opacity-100 hidden md:block truncate max-w-32">
                    {username || address?.substring(0, 6) + '...' || 'Profile'}
                  </span>
                </motion.button>
                
                {/* Profile dropdown menu */}
                {profileOpen && (
                  <motion.div 
                  className="absolute right-0 mt-2 w-72 bg-black/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg overflow-hidden z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 border-b border-gray-800">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-purple-600 to-cyan-300 p-0.5 rounded-full">
                          <div className="bg-black p-1 rounded-full">
                            <User size={22} className="text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-white">{username}</p>
                          <p className="text-gray-400 text-xs truncate">{address}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-300 line-clamp-2">
                        {profileData.bio}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-px bg-gray-800">
                      <div className="bg-black/95 p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar size={14} className="text-cyan-300" />
                          <span className="text-gray-400 text-xs">Hosted</span>
                        </div>
                        <p className="text-white font-medium">{profileData.hostedEvents}</p>
                      </div>
                      
                      <div className="bg-black/95 p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Ticket size={14} className="text-cyan-300" />
                          <span className="text-gray-400 text-xs">Attended</span>
                        </div>
                        <p className="text-white font-medium">{profileData.attendedEvents}</p>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link href="/profile" className="flex items-center space-x-3 p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
                        <User size={16} className="text-purple-400" />
                        <span className="text-white">View Full Profile</span>
                      </Link>
                      
                      <button 
                        onClick={disconnectWallet}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} className="text-red-400" />
                        <span className="text-white">Disconnect Wallet</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <motion.button
                onClick={connectWallet}
                className="relative overflow-hidden px-5 py-2 rounded-xl bg-transparent text-white font-medium border border-gray-700 group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600/20 to-cyan-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center">
                  <span className="mr-2 text-cyan-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-wallet" viewBox="0 0 16 16">
  <path d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 0 12.5zm1 1.732V12.5A1.5 1.5 0 0 0 2.5 14h12a.5.5 0 0 0 .5-.5V5H2a2 2 0 0 1-1-.268M1 3a1 1 0 0 0 1 1h12V2H2a1 1 0 0 0-1 1"/>
</svg>
                  </span>
                  Connect Wallet
                </span>
              </motion.button>
            )}
            
            {/* Hamburger menu for mobile - Optional */}
            <button className="md:hidden text-white p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
                  </div>
        </div>
      </motion.div>
      
      {/* Removed the spacer div since we're using the body padding approach */}
  
      <UsernameRegistrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onRegister={handleUsernameRegistration}
      />
    </>
  );
};

export default Navbar;
