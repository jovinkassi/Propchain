// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title PropchainVault — Stake PROP tokens and earn yield
contract PropchainVault is Ownable, ReentrancyGuard {
    IERC20 public immutable propToken;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewardDebt;
    }

    uint256 public rewardPerSecond;
    uint256 public accRewardPerShare;
    uint256 public lastRewardTime;
    uint256 public totalStaked;

    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(address _propToken, uint256 _rewardPerSecond) Ownable(msg.sender) {
        propToken = IERC20(_propToken);
        rewardPerSecond = _rewardPerSecond;
        lastRewardTime = block.timestamp;
    }

    function _updatePool() internal {
        if (block.timestamp <= lastRewardTime || totalStaked == 0) {
            lastRewardTime = block.timestamp;
            return;
        }
        uint256 elapsed = block.timestamp - lastRewardTime;
        uint256 reward = elapsed * rewardPerSecond;
        accRewardPerShare += (reward * 1e18) / totalStaked;
        lastRewardTime = block.timestamp;
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Vault: zero amount");
        _updatePool();

        StakeInfo storage info = stakes[msg.sender];
        if (info.amount > 0) {
            uint256 pending = (info.amount * accRewardPerShare) / 1e18 - info.rewardDebt;
            if (pending > 0) _safeRewardTransfer(msg.sender, pending);
        }

        propToken.transferFrom(msg.sender, address(this), amount);
        info.amount += amount;
        totalStaked += amount;
        info.rewardDebt = (info.amount * accRewardPerShare) / 1e18;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        require(info.amount >= amount, "Vault: insufficient stake");
        _updatePool();

        uint256 pending = (info.amount * accRewardPerShare) / 1e18 - info.rewardDebt;
        if (pending > 0) _safeRewardTransfer(msg.sender, pending);

        info.amount -= amount;
        totalStaked -= amount;
        info.rewardDebt = (info.amount * accRewardPerShare) / 1e18;

        propToken.transfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    function claimReward() external nonReentrant {
        _updatePool();
        StakeInfo storage info = stakes[msg.sender];
        uint256 pending = (info.amount * accRewardPerShare) / 1e18 - info.rewardDebt;
        require(pending > 0, "Vault: no rewards");
        info.rewardDebt = (info.amount * accRewardPerShare) / 1e18;
        _safeRewardTransfer(msg.sender, pending);
        emit RewardClaimed(msg.sender, pending);
    }

    function pendingReward(address user) external view returns (uint256) {
        StakeInfo storage info = stakes[user];
        uint256 acc = accRewardPerShare;
        if (block.timestamp > lastRewardTime && totalStaked > 0) {
            acc += ((block.timestamp - lastRewardTime) * rewardPerSecond * 1e18) / totalStaked;
        }
        return (info.amount * acc) / 1e18 - info.rewardDebt;
    }

    function _safeRewardTransfer(address to, uint256 amount) internal {
        uint256 bal = address(this).balance;
        (bool sent, ) = to.call{value: bal < amount ? bal : amount}("");
        require(sent, "Vault: transfer failed");
    }

    function fundRewards() external payable onlyOwner {}
    function setRewardPerSecond(uint256 _rps) external onlyOwner { rewardPerSecond = _rps; }

    receive() external payable {}
}
