import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';

interface UsernameRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (username: string) => void;
}

const UsernameRegistrationModal: React.FC<UsernameRegistrationModalProps> = ({ isOpen, onClose, onRegister }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.registerUser(username);
      await tx.wait();

      onRegister(username);
      onClose();
    } catch (error) {
      console.error('Error registering username:', error);
      setError('Error registering username. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-black rounded-lg p-8 w-full max-w-md border-2 border-gradient-to-r from-purple-600 to-cyan-300 shadow-[0_0_10px_rgba(147,51,234,0.5)]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text white text-2xl font-bold mb-4">Create Username</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full p-2 mb-4 bg-black text-white rounded border-bg-gradient-to-r from-purple-600 to-cyan-300 shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                required
              />
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-black text-white border-2 rounded hover:bg-white hover:text-black hover:border-black transition-all transitoion-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black border-2 px-4 py-2 rounded text-white hover:border-black hover:bg-white hover:text-black transition-all transitoion-330"
                >
                  Register
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UsernameRegistrationModal;
