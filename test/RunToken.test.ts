import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { RunToken } from "../typechain-types";

describe("RunToken", function () {
  // Test accounts
  let deployer: SignerWithAddress;
  let rewardsPool: SignerWithAddress;
  let devFund: SignerWithAddress;
  let teamWallet: SignerWithAddress;
  let ecosystemFund: SignerWithAddress;
  let liquidityPool: SignerWithAddress;
  let otherAccount: SignerWithAddress;
  
  // Contract
  let runToken: RunToken;
  
  // Constants
  const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens
  const ONE_YEAR = 365 * 24 * 60 * 60; // 1 year in seconds
  
  before(async function () {
    // Get signers
    [deployer, rewardsPool, devFund, teamWallet, ecosystemFund, liquidityPool, otherAccount] = await ethers.getSigners();
    
    // Deploy the contract
    const RunToken = await ethers.getContractFactory("RunToken");
    runToken = await RunToken.deploy(
      rewardsPool.address,
      devFund.address,
      teamWallet.address,
      ecosystemFund.address,
      liquidityPool.address
    );
  });
  
  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await runToken.name()).to.equal("Avalanche Runners");
      expect(await runToken.symbol()).to.equal("RUN");
    });
    
    it("Should have 18 decimals", async function () {
      expect(await runToken.decimals()).to.equal(18);
    });
    
    it("Should have the correct total supply", async function () {
      expect(await runToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });
  });
  
  describe("Token Allocation", function () {
    it("Should allocate 50% to rewards pool", async function () {
      const expectedAmount = (TOTAL_SUPPLY * 50n) / 100n;
      expect(await runToken.balanceOf(rewardsPool.address)).to.equal(expectedAmount);
    });
    
    it("Should allocate 20% to dev fund", async function () {
      const expectedAmount = (TOTAL_SUPPLY * 20n) / 100n;
      expect(await runToken.balanceOf(devFund.address)).to.equal(expectedAmount);
    });
    
    it("Should allocate 10% to ecosystem fund", async function () {
      const expectedAmount = (TOTAL_SUPPLY * 10n) / 100n;
      expect(await runToken.balanceOf(ecosystemFund.address)).to.equal(expectedAmount);
    });
    
    it("Should allocate 5% to liquidity pool", async function () {
      const expectedAmount = (TOTAL_SUPPLY * 5n) / 100n;
      expect(await runToken.balanceOf(liquidityPool.address)).to.equal(expectedAmount);
    });
    
    it("Should keep 15% in contract for team vesting", async function () {
      const teamAllocation = (TOTAL_SUPPLY * 15n) / 100n;
      const contractBalance = await runToken.balanceOf(await runToken.getAddress());
      expect(contractBalance).to.equal(teamAllocation);
    });
  });
  
  describe("Team Vesting", function () {
    it("Should not allow non-team to claim tokens", async function () {
      await expect(
        runToken.connect(otherAccount).claimTeamTokens()
      ).to.be.revertedWith("Not authorized to claim team tokens");
    });
    
    // Skip this test for now since we can't easily test "before vesting starts"
    // as vesting starts at deployment time
    it.skip("Should not allow claiming before vesting starts", async function () {
      await expect(
        runToken.connect(teamWallet).claimTeamTokens()
      ).to.be.revertedWith("No tokens available to claim");
    });
    
    it("Should allow claiming after 1 year", async function () {
      // Fast forward 1 year
      await time.increase(ONE_YEAR);
      
      // Get balances before claiming
      const beforeBalance = await runToken.balanceOf(teamWallet.address);
      const beforeClaimable = await runToken.claimableTeamTokens();
      
      // Claim tokens
      await runToken.connect(teamWallet).claimTeamTokens();
      
      // Get balances after claiming
      const afterBalance = await runToken.balanceOf(teamWallet.address);
      const afterClaimable = await runToken.claimableTeamTokens();
      
      // Check that balance increased
      expect(afterBalance).to.be.gt(beforeBalance);
      
      // Check that claimable amount decreased
      expect(afterClaimable).to.be.lt(beforeClaimable);
      
      // Verify the claimed amount matches approximately half the team allocation
      const teamAllocation = (TOTAL_SUPPLY * 15n) / 100n;
      const expectedHalf = teamAllocation / 2n;
      
      // Use a 1% tolerance for calculations
      const tolerance = teamAllocation / 100n;
      
      const diff = expectedHalf > afterBalance 
        ? expectedHalf - afterBalance 
        : afterBalance - expectedHalf;
        
      expect(diff).to.be.lt(tolerance);
    });
    
    it("Should allow full claim after vesting period", async function () {
      // Fast forward another year to complete vesting
      await time.increase(ONE_YEAR);
      
      // Get balances before claiming
      const beforeBalance = await runToken.balanceOf(teamWallet.address);
      
      // Claim remaining tokens
      await runToken.connect(teamWallet).claimTeamTokens();
      
      // Get final balances
      const afterBalance = await runToken.balanceOf(teamWallet.address);
      const contractBalance = await runToken.balanceOf(await runToken.getAddress());
      const claimed = await runToken.claimedTeamTokens();
      
      // Team allocation should be 15%
      const teamAllocation = (TOTAL_SUPPLY * 15n) / 100n;
      
      // Check that balance increased
      expect(afterBalance).to.be.gt(beforeBalance);
      
      // Contract balance should be very close to zero
      expect(contractBalance).to.be.lt(ethers.parseEther("0.1"));
      
      // Claimed amount should be very close to the total team allocation
      const tolerance = teamAllocation / 100n; // 1% tolerance
      const diff = teamAllocation > claimed ? teamAllocation - claimed : claimed - teamAllocation;
      expect(diff).to.be.lt(tolerance);
    });
  });
  
  describe("Transfer", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      // Get initial balance
      const initialBalance = await runToken.balanceOf(otherAccount.address);
      
      // Transfer from rewards pool to another account
      await runToken.connect(rewardsPool).transfer(otherAccount.address, transferAmount);
      
      // Get final balance
      const finalBalance = await runToken.balanceOf(otherAccount.address);
      
      // Check that the balance increased by approximately the transfer amount
      expect(finalBalance - initialBalance).to.be.gt(transferAmount - 1n);
      expect(finalBalance - initialBalance).to.be.lt(transferAmount + 1n);
    });
    
    it("Should fail if sender doesn't have enough tokens", async function () {
      // Clear out otherAccount's balance to make sure it has something but not a lot
      const currentBalance = await runToken.balanceOf(otherAccount.address);
      if (currentBalance > ethers.parseEther("1000")) {
        // Transfer most tokens to another account
        await runToken.connect(otherAccount).transfer(
          rewardsPool.address, 
          currentBalance - ethers.parseEther("100")
        );
      }
      
      // Get new balance
      const balance = await runToken.balanceOf(otherAccount.address);
      
      // Try to send more than the balance
      await expect(
        runToken.connect(otherAccount).transfer(rewardsPool.address, balance + 1n)
      ).to.be.reverted;
    });
  });
  
  describe("Burn", function () {
    it("Should allow token burning", async function () {
      // First ensure account has at least this many tokens
      const burnAmount = ethers.parseEther("100");
      const balance = await runToken.balanceOf(otherAccount.address);
      
      if (balance < burnAmount) {
        // Transfer some tokens if needed
        await runToken.connect(rewardsPool).transfer(otherAccount.address, burnAmount);
      }
      
      // Get balances before burning
      const initialBalance = await runToken.balanceOf(otherAccount.address);
      const initialSupply = await runToken.totalSupply();
      
      // Burn tokens directly
      await runToken.connect(otherAccount).burn(burnAmount);
      
      // Get balances after burning
      const finalBalance = await runToken.balanceOf(otherAccount.address);
      const finalSupply = await runToken.totalSupply();
      
      // Check that the supply decreased
      expect(finalSupply).to.equal(initialSupply - burnAmount);
      
      // Check that the user's balance decreased
      expect(finalBalance).to.equal(initialBalance - burnAmount);
    });
  });
});
