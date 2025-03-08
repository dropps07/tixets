require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("Please set your PRIVATE_KEY in a .env file");
  process.exit(1);
}

module.exports = {
  solidity: "0.8.7", // Adjusted to be within the range of your contract's pragma
  networks: {
    opencampus: {
      url: "https://rpc.open-campus-codex.gelato.digital",
      chainId: 656476,
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY.replace(/^0x/, '')}`] : [], // Ensure 0x prefix
      gas: 3000000, // Gas limit
      gasPrice: 40000000000, // 40 gwei
      // EIP-1559 specific settings
      maxFeePerGas: 40000000000, // 40 gwei
      maxPriorityFeePerGas: 40000000000, // 40 gwei
    },
  },
};