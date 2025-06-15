import { ethers } from "hardhat";

async function main() {
  // Get the default provider
  const provider = ethers.provider;
  
  console.log("Testing Hardhat configuration...\n");
  
  try {
    // Get network info
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);
    
    // Get gas price
    const gasPrice = await provider.getFeeData();
    console.log(`Current gas price: ${ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei')} gwei`);
    
    // Get accounts if available
    const accounts = await ethers.getSigners();
    console.log(`\nAvailable accounts (${accounts.length}):`);
    
    for (let i = 0; i < Math.min(accounts.length, 3); i++) {
      const balance = await provider.getBalance(accounts[i].address);
      console.log(`${i}: ${accounts[i].address} (${ethers.formatEther(balance)} AVAX)`);
    }
    
    if (accounts.length > 3) {
      console.log(`... and ${accounts.length - 3} more accounts`);
    }
    
  } catch (error) {
    console.error("Error testing configuration:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
