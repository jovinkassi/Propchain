// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../interfaces/IPropertyToken.sol";

/// @title PropertyToken — Fractional real estate ownership token for UAE properties
contract PropertyToken is ERC20, AccessControl, ReentrancyGuard, Pausable, IPropertyToken {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    bytes32 public constant KYC_ROLE = keccak256("KYC_ROLE");

    uint256 private _propertyIdCounter;

    mapping(uint256 => Property) private _properties;
    // propertyId => holder => token balance
    mapping(uint256 => mapping(address => uint256)) public propertyBalances;
    // propertyId => total tokens sold
    mapping(uint256 => uint256) public propertySoldSupply;
    // KYC verified addresses
    mapping(address => bool) public kycVerified;
    // accumulated yield per token for each property
    mapping(uint256 => uint256) public yieldPerToken;
    // last claimed yield snapshot per holder
    mapping(uint256 => mapping(address => uint256)) public yieldSnapshot;

    uint256 public constant TOKEN_PRICE = 1e15; // 0.001 ETH per token (Sepolia testnet price)

    constructor() ERC20("Propchain Property Token", "PROP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyKYC() {
        require(kycVerified[msg.sender], "PropertyToken: KYC required");
        _;
    }

    function setKYC(address account, bool status) external onlyRole(KYC_ROLE) {
        kycVerified[account] = status;
    }

    function listProperty(
        string calldata name,
        string calldata location,
        uint256 totalValue,
        uint256 rentalYieldBps
    ) external onlyRole(PROPERTY_MANAGER_ROLE) returns (uint256 propertyId) {
        require(totalValue > 0, "PropertyToken: invalid value");
        require(rentalYieldBps <= 10000, "PropertyToken: yield exceeds 100%");

        propertyId = ++_propertyIdCounter;

        _properties[propertyId] = Property({
            id: propertyId,
            name: name,
            location: location,
            totalValue: totalValue,
            totalSupply: totalValue / TOKEN_PRICE,
            rentalYieldBps: rentalYieldBps,
            active: true
        });

        emit PropertyListed(propertyId, name, totalValue);
    }

    function purchaseTokens(uint256 propertyId, uint256 amount)
        external
        payable
        nonReentrant
        whenNotPaused
        onlyKYC
    {
        Property storage prop = _properties[propertyId];
        require(prop.active, "PropertyToken: property not active");
        require(amount > 0, "PropertyToken: zero amount");
        require(
            propertySoldSupply[propertyId] + amount <= prop.totalSupply,
            "PropertyToken: exceeds supply"
        );
        require(msg.value >= amount * TOKEN_PRICE, "PropertyToken: insufficient payment");

        _claimYield(propertyId, msg.sender);

        propertyBalances[propertyId][msg.sender] += amount;
        propertySoldSupply[propertyId] += amount;

        _mint(msg.sender, amount);

        emit TokensPurchased(propertyId, msg.sender, amount);
    }

    function distributeRentalYield(uint256 propertyId) external payable onlyRole(PROPERTY_MANAGER_ROLE) {
        require(msg.value > 0, "PropertyToken: no yield sent");
        uint256 sold = propertySoldSupply[propertyId];
        require(sold > 0, "PropertyToken: no token holders");

        yieldPerToken[propertyId] += (msg.value * 1e18) / sold;

        emit RentalYieldDistributed(propertyId, msg.value);
    }

    function claimYield(uint256 propertyId) external nonReentrant {
        _claimYield(propertyId, msg.sender);
    }

    function pendingYield(uint256 propertyId, address holder) public view returns (uint256) {
        uint256 balance = propertyBalances[propertyId][holder];
        uint256 perToken = yieldPerToken[propertyId] - yieldSnapshot[propertyId][holder];
        return (balance * perToken) / 1e18;
    }

    function _claimYield(uint256 propertyId, address holder) internal {
        uint256 pending = pendingYield(propertyId, holder);
        yieldSnapshot[propertyId][holder] = yieldPerToken[propertyId];
        if (pending > 0) {
            (bool sent, ) = holder.call{value: pending}("");
            require(sent, "PropertyToken: yield transfer failed");
        }
    }

    function getProperty(uint256 propertyId) external view returns (Property memory) {
        return _properties[propertyId];
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    receive() external payable {}
}
