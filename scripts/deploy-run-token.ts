import { ethers, network, run } from "hardhat";
import { RunToken } from "../typechain-types";

async function main() {
  console.log("🚀 Starting $RUN token deployment...");

  // Get the deployer's account
  const [deployer] = await ethers.getSigners();
  console.log(`🔑 Using account: ${deployer.address}`);

  // For testing purposes, we'll use the deployer's address for all allocations
  // In production, replace these with actual wallet addresses
  const allocationAddresses = {
    rewardsPool: deployer.address,      // Replace with actual rewards pool address
    devFund: deployer.address,          // Replace with actual dev fund address
    teamWallet: deployer.address,       // Replace with actual team wallet address
    ecosystemFund: deployer.address,    // Replace with actual ecosystem fund address
    liquidityPool: deployer.address     // Replace with actual liquidity pool address
  };

  console.log("📋 Allocation addresses:");
  console.log("  - Rewards Pool:", allocationAddresses.rewardsPool);
  console.log("  - Dev Fund:", allocationAddresses.devFund);
  console.log("  - Team Wallet:", allocationAddresses.teamWallet);
  console.log("  - Ecosystem Fund:", allocationAddresses.ecosystemFund);
  console.log("  - Liquidity Pool:", allocationAddresses.liquidityPool);

  // Deploy the RunToken contract
  console.log("\n📦 Deploying RunToken contract...");
  const RunToken = await ethers.getContractFactory("RunToken");
  const runToken = await RunToken.deploy(
    allocationAddresses.rewardsPool,
    allocationAddresses.devFund,
    allocationAddresses.teamWallet,
    allocationAddresses.ecosystemFund,
    allocationAddresses.liquidityPool
  );

  await runToken.waitForDeployment();
  const runTokenAddress = await runToken.getAddress();
  
  console.log(`✅ RunToken deployed to: ${runTokenAddress}`);

  // Verify the contract on Snowtrace (if not on local network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n🔍 Verifying contract on Snowtrace...");
    try {
      await run("verify:verify", {
        address: runTokenAddress,
        constructorArguments: [
          allocationAddresses.rewardsPool,
          allocationAddresses.devFund,
          allocationAddresses.teamWallet,
          allocationAddresses.ecosystemFund,
          allocationAddresses.liquidityPool
        ],
      });
      console.log("✅ Contract verified on Snowtrace");
    } catch (error) {
      console.error("❌ Contract verification failed:", error);
    }
  }

  // Log token details
  const name = await runToken.name();
  const symbol = await runToken.symbol();
  const totalSupply = await runToken.totalSupply();
  const decimals = await runToken.decimals();
  
  console.log("\n📊 Token Details:");
  console.log(`  - Name: ${name}`);
  console.log(`  - Symbol: ${symbol}`);
  console.log(`  - Decimals: ${decimals}`);
  console.log(`  - Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
  
  // Log allocation details
  console.log("\n📊 Token Allocation:");
  console.log(`  - Rewards Pool: ${ethers.formatEther(await runToken.balanceOf(allocationAddresses.rewardsPool))} ${symbol} (50%)`);
  console.log(`  - Dev Fund: ${ethers.formatEther(await runToken.balanceOf(allocationAddresses.devFund))} ${symbol} (20%)`);
  console.log(`  - Team (Vested): ${ethers.formatEther(await runToken.balanceOf(runTokenAddress))} ${symbol} (15%)`);
  console.log(`  - Ecosystem Fund: ${ethers.formatEther(await runToken.balanceOf(allocationAddresses.ecosystemFund))} ${symbol} (10%)`);
  console.log(`  - Liquidity Pool: ${ethers.formatEther(await runToken.balanceOf(allocationAddresses.liquidityPool))} ${symbol} (5%)`);

  return {
    runToken: runTokenAddress,
    ...allocationAddresses
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
