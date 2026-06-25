// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPropertyToken {
    struct Property {
        uint256 id;
        string name;
        string location;
        uint256 totalValue;      // in AED (scaled by 1e18)
        uint256 totalSupply;     // total tokens minted
        uint256 rentalYieldBps;  // annual yield in basis points
        bool active;
    }

    event PropertyListed(uint256 indexed propertyId, string name, uint256 totalValue);
    event TokensPurchased(uint256 indexed propertyId, address indexed buyer, uint256 amount);
    event RentalYieldDistributed(uint256 indexed propertyId, uint256 amount);

    function listProperty(string calldata name, string calldata location, uint256 totalValue, uint256 rentalYieldBps) external returns (uint256 propertyId);
    function purchaseTokens(uint256 propertyId, uint256 amount) external payable;
    function distributeRentalYield(uint256 propertyId) external payable;
    function getProperty(uint256 propertyId) external view returns (Property memory);
}
