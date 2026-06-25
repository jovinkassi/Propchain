// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title PropchainLending — Borrow ETH using PROP tokens as collateral
contract PropchainLending is Ownable, ReentrancyGuard {
    IERC20 public immutable propToken;

    uint256 public constant LTV_RATIO = 60;       // 60% loan-to-value
    uint256 public constant INTEREST_RATE_BPS = 500; // 5% annual
    uint256 public constant LIQUIDATION_THRESHOLD = 75; // liquidate at 75% LTV

    struct Loan {
        uint256 collateral;   // PROP tokens locked
        uint256 borrowed;     // ETH borrowed
        uint256 borrowedAt;
        bool active;
    }

    mapping(address => Loan) public loans;
    uint256 public propPriceInWei; // oracle price: 1 PROP = X wei

    event Borrowed(address indexed user, uint256 collateral, uint256 borrowed);
    event Repaid(address indexed user, uint256 repaid);
    event Liquidated(address indexed user, address indexed liquidator);

    constructor(address _propToken, uint256 _propPrice) Ownable(msg.sender) {
        propToken = IERC20(_propToken);
        propPriceInWei = _propPrice;
    }

    function borrow(uint256 collateralAmount) external nonReentrant {
        require(!loans[msg.sender].active, "Lending: existing loan");
        require(collateralAmount > 0, "Lending: zero collateral");

        propToken.transferFrom(msg.sender, address(this), collateralAmount);

        uint256 maxBorrow = (collateralAmount * propPriceInWei * LTV_RATIO) / 100;
        require(address(this).balance >= maxBorrow, "Lending: insufficient liquidity");

        loans[msg.sender] = Loan({
            collateral: collateralAmount,
            borrowed: maxBorrow,
            borrowedAt: block.timestamp,
            active: true
        });

        (bool sent, ) = msg.sender.call{value: maxBorrow}("");
        require(sent, "Lending: transfer failed");

        emit Borrowed(msg.sender, collateralAmount, maxBorrow);
    }

    function repay() external payable nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(loan.active, "Lending: no active loan");

        uint256 interest = _calculateInterest(loan.borrowed, loan.borrowedAt);
        uint256 totalDue = loan.borrowed + interest;
        require(msg.value >= totalDue, "Lending: insufficient repayment");

        uint256 collateral = loan.collateral;
        delete loans[msg.sender];

        propToken.transfer(msg.sender, collateral);

        if (msg.value > totalDue) {
            (bool refunded, ) = msg.sender.call{value: msg.value - totalDue}("");
            require(refunded, "Lending: refund failed");
        }

        emit Repaid(msg.sender, totalDue);
    }

    function liquidate(address borrower) external nonReentrant {
        Loan storage loan = loans[borrower];
        require(loan.active, "Lending: no active loan");

        uint256 collateralValue = (loan.collateral * propPriceInWei) / 1e18;
        uint256 currentLTV = (loan.borrowed * 100) / collateralValue;
        require(currentLTV >= LIQUIDATION_THRESHOLD, "Lending: not liquidatable");

        uint256 collateral = loan.collateral;
        delete loans[borrower];

        propToken.transfer(msg.sender, collateral);

        emit Liquidated(borrower, msg.sender);
    }

    function _calculateInterest(uint256 principal, uint256 borrowedAt) internal view returns (uint256) {
        uint256 elapsed = block.timestamp - borrowedAt;
        return (principal * INTEREST_RATE_BPS * elapsed) / (10000 * 365 days);
    }

    function updatePropPrice(uint256 newPrice) external onlyOwner {
        propPriceInWei = newPrice;
    }

    function fundLiquidity() external payable onlyOwner {}

    receive() external payable {}
}
