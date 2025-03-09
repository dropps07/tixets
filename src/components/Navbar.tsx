'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { Search, User} from 'lucide-react';
import UsernameRegistrationModal from './UsernameRegistrationModal';

const Navbar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setAddress(address);
          setIsConnected(true);

          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          const profile = await contract.getUserProfile(address);
          if (profile.username) {
            setUsername(profile.username);
          } else {
            setShowModal(true);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);
  const EDUCHAIN_PARAMS = {
    chainId: '656476', //   EduChain ID)
    chainName: 'EduChain',
    nativeCurrency: {
      name: 'Wei',
      symbol: 'EDU',
      decimals: 18,
    },
    rpcUrls: ['https://open-campus-codex.gelato.digital'], // RPC URL
    blockExplorerUrls: ['https://opencampus-codex.blockscout.com'], // explorer URL
  };
  
  const switchToEduChain = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EDUCHAIN_PARAMS.chainId }],
      });
      console.log('Switched to EduChain');
    } catch (switchError: any) {
      // If the network is not added, prompt the user to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [EDUCHAIN_PARAMS],
          });
        } catch (addError) {
          console.error('Error adding EduChain:', addError);
        }
      } else {
        console.error('Error switching network:', switchError);
      }
    }
  };
  
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
  
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
        setIsConnected(true);
  
        const network = await provider.getNetwork();
        if (network.chainId !== parseInt(EDUCHAIN_PARAMS.chainId, 16)) {
          await switchToEduChain();
        }
  
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const profile = await contract.getUserProfile(address);
        if (profile.username) {
          setUsername(profile.username);
        } else {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };
  
  const handleUsernameRegistration = (newUsername: string) => {
    setUsername(newUsername);
  };

  return (
    <>
      <motion.nav 
        className="relative py-4 px-6 md:px-10 bg-black border-b border-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
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
            {/* Search button with hover effect */}
            <button className="text-white opacity-80 hover:opacity-100 relative p-2 group">
              <Search size={20} />
              <span className="absolute inset-0 rounded-full border border-transparent group-hover:border-gray-700 transition-all duration-300"></span>
            </button>
            
            {/* Conditional rendering for connected/not connected state */}
            {isConnected ? (
              <Link href="/profile" className="flex items-center space-x-2 relative group">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-cyan-300 blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative z-10 bg-black bg-opacity-80 p-1.5 rounded-full">
                    <User size={18} className="text-white" />
                  </div>
                </div>
                <span className="text-white opacity-90 group-hover:opacity-100 hidden md:block truncate max-w-32">
                  {username || address?.substring(0, 6) + '...' || 'Profile'}
                </span>
              </Link>
            ) : (
              <motion.button
                onClick={connectWallet}
                className="relative overflow-hidden px-5 py-2 rounded-xl bg-transparent text-white font-medium border border-gray-800 group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600/20 to-cyan-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center">
                  <span className="mr-2 text-cyan-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
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
      </motion.nav>
  
      <UsernameRegistrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onRegister={handleUsernameRegistration}
      />
    </>
  );
};

export default Navbar;
