// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CharacterNFT
 * @dev NFT contract for Avalanche Runners game characters
 */
contract CharacterNFT is ERC721URIStorage, Ownable {
    // Rarity types
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY }
    
    // Character attributes
    struct Character {
        string name;
        Rarity rarity;
        uint256 level;
        uint256 experience;
        uint256 speed;
        uint256 jump;
        uint256 strength;
        uint256 stamina;
    }
    
    // Token ID counter
    uint256 private _nextTokenId;
    
    // Mapping from token ID to character
    mapping(uint256 => Character) private _characters;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Events
    event CharacterMinted(address indexed owner, uint256 tokenId, Rarity rarity);
    event LevelUp(address indexed owner, uint256 tokenId, uint256 newLevel);
    
    constructor() ERC721("Avalanche Runners Character", "ARUN") Ownable(msg.sender) {}
    
    // Mint a new character with random traits
    function mintCharacter(address to, string memory name) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        // Generate random traits (in a real contract, use Chainlink VRF for randomness)
        Rarity rarity = _generateRandomRarity();
        (uint256 speed, uint256 jump, uint256 strength, uint256 stamina) = _generateStats(rarity);
        
        _characters[tokenId] = Character({
            name: name,
            rarity: rarity,
            level: 1,
            experience: 0,
            speed: speed,
            jump: jump,
            strength: strength,
            stamina: stamina
        });
        
        _safeMint(to, tokenId);
        if (bytes(_baseTokenURI).length > 0) {
            _setTokenURI(tokenId, string(abi.encodePacked(tokenId)));
        }
        
        emit CharacterMinted(to, tokenId, rarity);
        return tokenId;
    }
    
    // Add experience to a character
    function addExperience(uint256 tokenId, uint256 amount) external {
        require(_ownerExists(tokenId), "Character does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        Character storage character = _characters[tokenId];
        character.experience += amount;
        
        // Simple level up logic (1000 XP per level)
        uint256 newLevel = (character.experience / 1000) + 1;
        if (newLevel > character.level) {
            character.level = newLevel;
            emit LevelUp(msg.sender, tokenId, newLevel);
        }
    }
    
    // Get character details
    function getCharacter(uint256 tokenId) external view returns (
        string memory name,
        Rarity rarity,
        uint256 level,
        uint256 experience,
        uint256 speed,
        uint256 jump,
        uint256 strength,
        uint256 stamina
    ) {
        require(_ownerExists(tokenId), "Character does not exist");
        Character memory character = _characters[tokenId];
        return (
            character.name,
            character.rarity,
            character.level,
            character.experience,
            character.speed,
            character.jump,
            character.strength,
            character.stamina
        );
    }
    
    // Set base URI for metadata
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    // Override for token URI generation
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // Check if token exists and has an owner
    function _ownerExists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    // Override required by Solidity
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    // Generate random rarity (simplified - use Chainlink VRF in production)
    function _generateRandomRarity() private view returns (Rarity) {
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100;
        
        if (rand < 60) return Rarity.COMMON;      // 60%
        if (rand < 85) return Rarity.RARE;        // 25%
        if (rand < 98) return Rarity.EPIC;        // 13%
        return Rarity.LEGENDARY;                  // 2%
    }
    
    // Generate random stats based on rarity
    function _generateStats(Rarity rarity) private view returns (
        uint256 speed, 
        uint256 jump, 
        uint256 strength, 
        uint256 stamina
    ) {
        // Base stats
        uint8[4] memory baseStats;
        
        if (rarity == Rarity.COMMON) {
            baseStats = [70, 70, 70, 70];
        } else if (rarity == Rarity.RARE) {
            baseStats = [80, 80, 80, 80];
        } else if (rarity == Rarity.EPIC) {
            baseStats = [90, 90, 90, 90];
        } else { // LEGENDARY
            baseStats = [100, 100, 100, 100];
        }
        
        // Add some randomness to each stat
        speed = baseStats[0] + (uint256(keccak256(abi.encodePacked(block.timestamp, "speed", msg.sender))) % 21);
        jump = baseStats[1] + (uint256(keccak256(abi.encodePacked(block.timestamp, "jump", msg.sender))) % 21);
        strength = baseStats[2] + (uint256(keccak256(abi.encodePacked(block.timestamp, "strength", msg.sender))) % 21);
        stamina = baseStats[3] + (uint256(keccak256(abi.encodePacked(block.timestamp, "stamina", msg.sender))) % 21);
    }
}