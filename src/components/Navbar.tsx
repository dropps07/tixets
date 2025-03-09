'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
 
const EDUCHAIN_PARAMS = {
  chainId: '0x' + Number(656476).toString(16), // Convert to hex with 0x prefix
  chainName: 'EduChain',
  nativeCurrency: {
    name: 'Wei',
    symbol: 'EDU',
    decimals: 18,
  },
  rpcUrls: ['https://open-campus-codex.gelato.digital'],
  blockExplorerUrls: ['https://opencampus-codex.blockscout.com'],
};
  // REPLACE checkConnection function (lines 17-47) with:
const checkConnection = useCallback(async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Check if we're connected to EduChain first
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      
      // Convert EDUCHAIN_PARAMS.chainId to the format needed for comparison
      const eduChainId = parseInt(EDUCHAIN_PARAMS.chainId, 16);
      
      // If not on EduChain, don't proceed with auto-connection
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
      } else {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }
}, [EDUCHAIN_PARAMS.chainId]);

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
  } catch (switchError: any) {
    // If the network is not added, prompt the user to add it
    if (switchError.code === 4902) {
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
const checkUserProfile = async (address: string) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    const profile = await contract.getUserProfile(address);
    if (profile.username) {
      setUsername(profile.username);
    } else {
      setShowModal(true);
    }
  } catch (error) {
    console.error('Error checking user profile:', error);
    setShowModal(true);
  }
};

// Add wallet event listeners
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
        // Reconnect if switched to the correct chain
        checkConnection();
      }
    };
    
    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
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
