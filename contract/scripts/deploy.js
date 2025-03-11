const hre = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment of tixets...");

    // Get the deployer's signer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance));

    // Deploy tixets
    const Tixets = await hre.ethers.getContractFactory("tixets", deployer);
    console.log("Deploying tixets...");
    const tixets = await Tixets.deploy();

    await tixets.waitForDeployment();
    const contractAddress = await kryptoTix.getAddress();

    console.log("tixets is deployed to:", contractAddress);
    
    // Wait for block confirmations
    console.log("Waiting for block confirmations...");
    await tixets.deploymentTransaction().wait(5);
    console.log("Deployment confirmed!");

    // Create a test event
    try {
      const eventName = "Test Event";
      const description = "This is a test event";
      const date = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      const price = hre.ethers.parseEther("0.01");
      const totalTickets = 100;

      const createEventTx = await tixets.createEvent(
        eventName,
        description,
        date,
        price,
        totalTickets
      );
      await createEventTx.wait();
      console.log("Test event created successfully!");
    } catch (error) {
      console.log("Failed to create test event:", error.message);
    }

    // Verify contract
    try {
      console.log("Verifying contract...");
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: []
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }

  } catch (error) {
    console.error("Deployment error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
