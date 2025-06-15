import { ethers } from "hardhat";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function main() {
  console.log("Checking environment configuration...\n");

  // Check if FUJI_PRIVATE_KEY exists
  const fujiKey = process.env.FUJI_PRIVATE_KEY;
  console.log(`FUJI_PRIVATE_KEY is ${fujiKey ? 'set' : 'NOT set'}`);
  
  if (fujiKey) {
    // Check if the private key starts with 0x, add it if missing
    const privateKey = fujiKey.startsWith('0x') ? fujiKey : `0x${fujiKey}`;
    
    try {
      // Try to create a wallet from the private key
      const wallet = new ethers.Wallet(privateKey);
      console.log("✅ Private key is valid");
      console.log(`Address: ${wallet.address}`);
      
      // Try to connect to Fuji testnet
      console.log("\nConnecting to Fuji testnet...");
      const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
      const signer = wallet.connect(provider);
      
      // Get the balance
      const balance = await provider.getBalance(wallet.address);
      console.log(`Balance: ${ethers.formatEther(balance)} AVAX`);
      
    } catch (error) {
      console.error("❌ Error with private key:", error instanceof Error ? error.message : error);
    }
  } else {
    console.log("\nPlease add your FUJI_PRIVATE_KEY to the .env file");
    console.log("Example:");
    console.log("FUJI_PRIVATE_KEY=your_private_key_here_without_0x_prefix");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
