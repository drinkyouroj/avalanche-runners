// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title RunToken
 * @dev The $RUN token for the Avalanche Runners game
 */
contract RunToken is ERC20, Ownable, ERC20Burnable {
    // Constants
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens with 18 decimals
    
    // Allocation percentages (out of 100)
    uint8 public constant REWARDS_POOL_PERCENT = 50;
    uint8 public constant DEV_FUND_PERCENT = 20;
    uint8 public constant TEAM_PERCENT = 15;
    uint8 public constant ECOSYSTEM_PERCENT = 10;
    uint8 public constant LIQUIDITY_PERCENT = 5;
    
    // Allocation addresses
    address public immutable rewardsPool;
    address public immutable devFund;
    address public immutable teamWallet;
    address public immutable ecosystemFund;
    address public immutable liquidityPool;
    
    // Team vesting
    uint256 public immutable VESTING_START;
    uint256 public constant VESTING_DURATION = 730 days; // 2 years
    
    // Track claimed team tokens
    uint256 public teamTokensClaimed;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TeamTokensClaimed(address indexed to, uint256 amount);

    constructor(
        address _rewardsPool,
        address _devFund,
        address _teamWallet,
        address _ecosystemFund,
        address _liquidityPool
    ) ERC20("Avalanche Runners", "RUN") Ownable(msg.sender) {
        require(_rewardsPool != address(0), "Rewards pool cannot be zero address");
        require(_devFund != address(0), "Dev fund cannot be zero address");
        require(_teamWallet != address(0), "Team wallet cannot be zero address");
        require(_ecosystemFund != address(0), "Ecosystem fund cannot be zero address");
        require(_liquidityPool != address(0), "Liquidity pool cannot be zero address");
        
        // Set allocation addresses
        rewardsPool = _rewardsPool;
        devFund = _devFund;
        teamWallet = _teamWallet;
        ecosystemFund = _ecosystemFund;
        liquidityPool = _liquidityPool;
        
        // Set vesting start time
        VESTING_START = block.timestamp;
        
        // Calculate token amounts
        uint256 rewardsAmount = (TOTAL_SUPPLY * REWARDS_POOL_PERCENT) / 100;
        uint256 devAmount = (TOTAL_SUPPLY * DEV_FUND_PERCENT) / 100;
        uint256 teamAmount = (TOTAL_SUPPLY * TEAM_PERCENT) / 100;
        uint256 ecosystemAmount = (TOTAL_SUPPLY * ECOSYSTEM_PERCENT) / 100;
        uint256 liquidityAmount = (TOTAL_SUPPLY * LIQUIDITY_PERCENT) / 100;
        
        // Mint all tokens to this contract first
        _mint(address(this), TOTAL_SUPPLY);
        emit TokensMinted(address(this), TOTAL_SUPPLY);
        
        // Transfer initial allocations
        _transfer(address(this), rewardsPool, rewardsAmount);
        _transfer(address(this), devFund, devAmount);
        _transfer(address(this), ecosystemFund, ecosystemAmount);
        _transfer(address(this), liquidityPool, liquidityAmount);
        
        // Note: Team allocation remains in the contract for vesting
    }
    
    /**
     * @dev Allows team to claim vested tokens
     * Tokens vest over 2 years with linear vesting
     */
    function claimTeamTokens() external {
        require(msg.sender == teamWallet, "Not authorized to claim team tokens");
        
        uint256 totalVested = (TOTAL_SUPPLY * TEAM_PERCENT) / 100;
        uint256 claimable = claimableTeamTokens();
        
        require(claimable > 0, "No tokens available to claim");
        
        if (block.timestamp >= VESTING_START + VESTING_DURATION) {
            // Fully vested
            teamTokensClaimed = totalVested; // All claimed
        } else {
            // Partially vested
            teamTokensClaimed += claimable;
        }
        
        _transfer(address(this), teamWallet, claimable);
        emit TeamTokensClaimed(teamWallet, claimable);
    }
    
    /**
     * @dev Override decimals to match the standard 18 decimal places
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    /**
     * @dev Returns the amount of team tokens that have been claimed
     */
    function claimedTeamTokens() public view returns (uint256) {
        return teamTokensClaimed;
    }
    
    /**
     * @dev Returns the amount of team tokens that are currently claimable
     */
    function claimableTeamTokens() public view returns (uint256) {
        uint256 totalVested = (TOTAL_SUPPLY * TEAM_PERCENT) / 100;
        
        if (block.timestamp < VESTING_START) {
            return 0;
        } else if (block.timestamp >= VESTING_START + VESTING_DURATION) {
            return totalVested - teamTokensClaimed;
        } else {
            uint256 elapsed = block.timestamp - VESTING_START;
            uint256 vested = (totalVested * elapsed) / VESTING_DURATION;
            return vested - teamTokensClaimed;
        }
    }
}
