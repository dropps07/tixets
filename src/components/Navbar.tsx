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
 
  // Updated EDU Chain parameters based on the provided image
  const EDUCHAIN_PARAMS = {
    chainId: '0x' + Number(656476).toString(16), // Chain ID 656476 from the image
    chainName: 'EDU Chain Testnet',
    nativeCurrency: {
      name: 'EDU',
      symbol: 'EDU',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.open-campus-codex.gelato.digital'],
    blockExplorerUrls: ['https://edu-chain-testnet.blockscout.com'],
  };

  // Close profile dropdown when clicking outside
  useEffect(() => { // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      document.body.style.paddingTop = `${0}px`;
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
      console.log('Attempting to switch to EduChain with chainId:', EDUCHAIN_PARAMS.chainId);
      // Using the correct format for chainId (with '0x' prefix)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EDUCHAIN_PARAMS.chainId }],
      });
      console.log('Successfully switched to EduChain');
      return true;
    } catch (switchError: any) {
      console.log('Error switching to EduChain:', switchError);
      console.log('Error code:', switchError.code);
      
      // This error code indicates that the chain has not been added to MetaMask
      // Error code might be 4902, -32603, or other values depending on wallet provider
      if (switchError.code === 4902 || switchError.code === -32603 || 
          (switchError.message && switchError.message.includes("Unrecognized chain ID"))) {
        console.log('Chain not added yet, attempting to add EDU Chain');
        try {
          console.log('Adding EDU Chain with params:', EDUCHAIN_PARAMS);
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [EDUCHAIN_PARAMS],
          });
          console.log('EDU Chain added successfully, now switching');
          
          // Sometimes we need to wait a moment after adding the chain
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try switching again after adding
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: EDUCHAIN_PARAMS.chainId }],
          });
          console.log('Successfully switched to EDU Chain after adding');
          return true;
        } catch (addError: any) {
          console.error('Error adding EDU Chain:', addError);
          // More user-friendly error that doesn't require manual action yet
          console.log('Will continue with connection on current network');
          return true; // Return true to continue the connection flow
        }
      } else {
        console.error('Unknown error switching network:', switchError);
        // More user-friendly approach - continue with connection on current network
        console.log('Will continue with connection on current network');
        return true; // Return true to continue the connection flow
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access first
        console.log('Requesting account access...');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Accounts:', accounts);
        
        if (accounts.length === 0) {
          console.log('No accounts returned');
          return;
        }
        
        // Set connected immediately to improve UX
        const currentAddress = accounts[0];
        setAddress(currentAddress);
        setIsConnected(true);
        
        // Use let instead of const so we can reassign later
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Try to switch networks - but continue even if it fails
        try {
          console.log('Checking network...');
          const network = await provider.getNetwork();
          const eduChainId = parseInt(EDUCHAIN_PARAMS.chainId, 16);
          
          console.log('Current network chainId:', network.chainId);
          console.log('Expected EDU Chain chainId:', eduChainId);
          
          if (network.chainId !== eduChainId) {
            await switchToEduChain();
            // Get fresh provider after network switch attempt
            provider = new ethers.providers.Web3Provider(window.ethereum);
          }
        } catch (networkError) {
          console.error('Network switching error:', networkError);
          // Continue with current network
        }
        
        // Now we can proceed with connection - even if network switch failed
        const signer = provider.getSigner();
        
        // Check if the contract is deployed on this network
        try {
          console.log('Checking contract at address:', CONTRACT_ADDRESS);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          
          // Simple call to check if contract exists (code size > 0)
          const code = await provider.getCode(CONTRACT_ADDRESS);
          if (code === '0x') {
            console.log('Contract not found on this network');
            setShowModal(true); // Still show the modal for testing
            return;
          }
          
          console.log('Fetching user profile...');
          const profile = await contract.getUserProfile(currentAddress);
          console.log('Profile fetched:', profile);
          
          if (profile && profile.username) {
            setUsername(profile.username);
            fetchProfileData(contract, currentAddress);
          } else {
            console.log('Opening username registration modal');
            setShowModal(true);
          }
        } catch (contractError) {
          console.error('Contract interaction error:', contractError);
          console.log('Opening username registration modal anyway');
          setShowModal(true); // Show modal regardless of error
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Helper function to check user profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkUserProfile = async (address: any) => {
    try {
      console.log('Checking user profile for address:', address);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Check if the contract is deployed on this network before proceeding
      try {
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
          console.log('Contract not found on this network');
          // Still show the modal but in a "new user" state
          setShowModal(true);
          return;
        }
      } catch (codeError) {
        console.error('Error checking contract code:', codeError);
      }
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      try {
        const profile = await contract.getUserProfile(address);
        console.log('Profile retrieved:', profile);
        
        if (profile && profile.username) {
          setUsername(profile.username);
          fetchProfileData(contract, address);
        } else {
          console.log('No username found, opening registration modal');
          setShowModal(true);
        }
      } catch (profileError) {
        console.error('Error getting profile from contract:', profileError);
        // If the contract call fails, we'll assume this is a new user
        console.log('Opening registration modal after error');
        setShowModal(true);
      }
    } catch (error) {
      console.error('General error checking user profile:', error);
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
          console.log('Not on EDU Chain - continuing but with warning');
          // Don't disconnect - just warn
          // Instead of immediately disconnecting, we'll just log a warning
          // This improves user experience by not requiring switching back immediately
        } else {
          console.log('Switched to EDU Chain - reconnecting');
          // Reconnecting if switched to the correct chain
          checkConnection();
        }
      };
      
      // Handle account changes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleAccountsChanged = (accounts: string | any[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          console.log('No accounts - user disconnected wallet');
          setIsConnected(false);
          setAddress('');
          setUsername('');
        } else {
          // Account changed, update state and check profile
          console.log('Account changed to:', accounts[0]);
          setAddress(accounts[0]);
          checkUserProfile(accounts[0]);
        }
      };
      
      // Add listeners
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
