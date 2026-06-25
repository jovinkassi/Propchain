// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title L2Bridge — Lock PROP on L1, mint on L2 (Arbitrum)
contract L2Bridge is Ownable, ReentrancyGuard {
    IERC20 public immutable propToken;

    mapping(bytes32 => bool) public processedMessages;

    event TokensLocked(address indexed sender, uint256 amount, address indexed l2Recipient);
    event TokensReleased(address indexed recipient, uint256 amount, bytes32 messageId);

    constructor(address _propToken) Ownable(msg.sender) {
        propToken = IERC20(_propToken);
    }

    /// Lock PROP tokens on L1 to bridge to L2
    function lockTokens(uint256 amount, address l2Recipient) external nonReentrant {
        require(amount > 0, "Bridge: zero amount");
        require(l2Recipient != address(0), "Bridge: zero address");

        propToken.transferFrom(msg.sender, address(this), amount);

        emit TokensLocked(msg.sender, amount, l2Recipient);
    }

    /// Release PROP tokens on L1 when bridging back from L2 (called by relayer)
    function releaseTokens(address recipient, uint256 amount, bytes32 messageId) external onlyOwner nonReentrant {
        require(!processedMessages[messageId], "Bridge: already processed");
        processedMessages[messageId] = true;

        propToken.transfer(recipient, amount);

        emit TokensReleased(recipient, amount, messageId);
    }
}
