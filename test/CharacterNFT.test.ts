// test/CharacterNFT.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { CharacterNFT } from "../typechain-types";

describe("CharacterNFT", function () {
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let characterNFT: CharacterNFT;

  before(async function () {
    [owner, player1] = await ethers.getSigners();
    
    // Deploy the CharacterNFT contract
    const CharacterNFT = await ethers.getContractFactory("CharacterNFT");
    characterNFT = await CharacterNFT.deploy();
    await characterNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have the right name and symbol", async function () {
      expect(await characterNFT.name()).to.equal("Avalanche Runners Character");
      expect(await characterNFT.symbol()).to.equal("ARUN");
    });

    it("Should be owned by deployer", async function () {
      expect(await characterNFT.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint a character", async function () {
      await expect(characterNFT.mintCharacter(player1.address, "Runner1"))
        .to.emit(characterNFT, "CharacterMinted");
        // Note: We don't check the exact rarity as it's random
    });

    it("Should set correct token owner", async function () {
      expect(await characterNFT.ownerOf(0)).to.equal(player1.address);
    });

    it("Should not allow non-owner to mint", async function () {
      await expect(
        characterNFT.connect(player1).mintCharacter(player1.address, "Hacker")
      ).to.be.revertedWithCustomError(characterNFT, "OwnableUnauthorizedAccount");
    });

    it("Should have correct character attributes", async function () {
      const [name, rarity, level] = await characterNFT.getCharacter(0);
      expect(name).to.equal("Runner1");
      expect(rarity).to.be.lessThan(4); // 0-3 for COMMON-LEGENDARY
      expect(level).to.equal(1);
    });
  });

  describe("Experience and Leveling", function () {
    it("Should allow adding experience", async function () {
      await characterNFT.connect(player1).addExperience(0, 500);
      const [,, level, exp] = await characterNFT.getCharacter(0);
      expect(exp).to.equal(500);
      expect(level).to.equal(1); // Still level 1
    });

    it("Should level up with enough experience", async function () {
      await expect(characterNFT.connect(player1).addExperience(0, 600)) // 500 + 600 = 1100
        .to.emit(characterNFT, "LevelUp")
        .withArgs(player1.address, 0, 2);
      
      const [,, level, exp] = await characterNFT.getCharacter(0);
      expect(exp).to.equal(1100);
      expect(level).to.equal(2);
    });

    it("Should not allow others to add experience", async function () {
      await expect(
        characterNFT.addExperience(0, 100)
      ).to.be.revertedWith("Not the owner");
    });
  });

  describe("Metadata URI", function () {
    it("Should set base URI correctly", async function () {
      await characterNFT.setBaseURI("https://game.example/api/metadata");
      
      // Mint a new NFT to test the URI
      await characterNFT.mintCharacter(player1.address, "Runner2");
      
      // Check if the tokenURI is set properly for the new NFT
      const uri = await characterNFT.tokenURI(1);
      expect(uri).to.include("https://game.example/api/metadata");
    });
  });

  describe("Rarity Distribution", function () {
    let rarities: number[] = [0, 0, 0, 0]; // Initialize with zeros for each rarity
    const NUM_TESTS = 20;

    it("Should have reasonable rarity distribution", async function () {
      // Mint multiple characters to test distribution
      for (let i = 2; i < NUM_TESTS + 2; i++) {
        await characterNFT.mintCharacter(player1.address, `Runner${i}`);
        const [,rarity] = await characterNFT.getCharacter(i);
        rarities[Number(rarity)]++;
      }

      // Check distribution is within expected ranges
      console.log("Rarity distribution:");
      console.log(`Common: ${rarities[0]} (expected ~60%)`);
      console.log(`Rare: ${rarities[1]} (expected ~25%)`);
      console.log(`Epic: ${rarities[2]} (expected ~13%)`);
      console.log(`Legendary: ${rarities[3]} (expected ~2%)`);

      // With small sample size, we only check that we have at least some of each
      expect(rarities[0]).to.be.greaterThan(0); // At least some common
      expect(rarities[1] + rarities[2] + rarities[3]).to.be.greaterThan(0); // At least some rare+
    });
  });
});