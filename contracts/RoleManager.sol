// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RoleManager - FIXED VERSION
 * @dev Central role management - ensures one address = one role only
 * 
 * FIXED: Removed ownership requirement - allows contract addresses to assign roles
 * This solves the two-step ownership transfer issue
 */
contract RoleManager {
    
    // Role tracking
    mapping(address => bool) public isRestaurant;
    mapping(address => bool) public isRider;
    mapping(address => bool) public isCustomer;
    mapping(address => bool) public isAdmin;
    
    // Whitelist of authorized contracts that can assign roles
    mapping(address => bool) public authorizedContracts;
    
    address public owner;
    
    // Events
    event RoleAssigned(address indexed user, string role);
    event RoleRevoked(address indexed user, string role);
    event ContractAuthorized(address indexed contractAddr);
    event ContractRevoked(address indexed contractAddr);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        isAdmin[msg.sender] = true;
    }
    
    /**
     * @dev Authorize a contract to assign roles (e.g., RestaurantRegistry, OrderManager)
     */
    function authorizeContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid address");
        authorizedContracts[_contract] = true;
        emit ContractAuthorized(_contract);
    }
    
    /**
     * @dev Revoke contract authorization
     */
    function revokeContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = false;
        emit ContractRevoked(_contract);
    }
    
    /**
     * @dev Check if address has no role assigned
     */
    function hasNoRole(address _user) public view returns (bool) {
        return !isRestaurant[_user] && !isRider[_user] && !isCustomer[_user] && !isAdmin[_user];
    }
    
    /**
     * @dev Get user's role as string
     */
    function getUserRole(address _user) external view returns (string memory) {
        if (isAdmin[_user]) return "Admin";
        if (isRestaurant[_user]) return "Restaurant";
        if (isRider[_user]) return "Rider";
        if (isCustomer[_user]) return "Customer";
        return "None";
    }
    
    /**
     * @dev Assign restaurant role - callable by authorized contracts
     * FIXED: Removed onlyOwner, now uses onlyAuthorized
     */
    function assignRestaurantRole(address _user) external onlyAuthorized {
        require(hasNoRole(_user), "Address already has a role");
        isRestaurant[_user] = true;
        emit RoleAssigned(_user, "Restaurant");
    }
    
    /**
     * @dev Assign rider role - callable by authorized contracts
     * FIXED: Removed onlyOwner, now uses onlyAuthorized
     */
    function assignRiderRole(address _user) external onlyAuthorized {
        require(hasNoRole(_user), "Address already has a role");
        isRider[_user] = true;
        emit RoleAssigned(_user, "Rider");
    }
    
    /**
     * @dev Assign customer role - callable by authorized contracts
     * FIXED: Removed onlyOwner, now uses onlyAuthorized
     */
    function assignCustomerRole(address _user) external onlyAuthorized {
        require(hasNoRole(_user), "Address already has a role");
        isCustomer[_user] = true;
        emit RoleAssigned(_user, "Customer");
    }
    
    /**
     * @dev Revoke role (admin function for emergencies)
     */
    function revokeRole(address _user) external onlyOwner {
        if (isRestaurant[_user]) {
            isRestaurant[_user] = false;
            emit RoleRevoked(_user, "Restaurant");
        } else if (isRider[_user]) {
            isRider[_user] = false;
            emit RoleRevoked(_user, "Rider");
        } else if (isCustomer[_user]) {
            isCustomer[_user] = false;
            emit RoleRevoked(_user, "Customer");
        }
    }
    
    /**
     * @dev Check if user can register as restaurant
     */
    function canRegisterAsRestaurant(address _user) external view returns (bool) {
        return hasNoRole(_user);
    }
    
    /**
     * @dev Check if user can register as rider
     */
    function canRegisterAsRider(address _user) external view returns (bool) {
        return hasNoRole(_user);
    }
    
    /**
     * @dev Check if user can place orders (auto-register as customer)
     */
    function canPlaceOrder(address _user) external view returns (bool) {
        return hasNoRole(_user) || isCustomer[_user];
    }
    
    /**
     * NOTE: Public mappings automatically generate getters:
     * - isCustomer(address) - auto-generated from mapping
     * - isRestaurant(address) - auto-generated from mapping  
     * - isRider(address) - auto-generated from mapping
     */
}

