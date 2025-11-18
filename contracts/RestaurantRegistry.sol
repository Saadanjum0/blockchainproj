// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRoleManager {
    function hasNoRole(address _user) external view returns (bool);
    function canRegisterAsRestaurant(address _user) external view returns (bool);
    function assignRestaurantRole(address _user) external;
    // FIXED: Added missing function that interface expects
    function isRestaurant(address _user) external view returns (bool);
}

contract RestaurantRegistry is Ownable, ReentrancyGuard {
    
    struct Restaurant {
        address owner;
        string name;
        string description;
        string ipfsMenuHash;
        string metadataURI;
        string physicalAddress;  // Restaurant location
        bool isActive;
        uint256 registeredAt;
        uint256 totalOrders;
        uint256 totalRating;
        uint256 ratingCount;
    }

    IRoleManager public roleManager;
    address public orderManager;
    
    mapping(uint256 => Restaurant) public restaurants;
    mapping(address => uint256) public ownerToRestaurant;
    uint256 public restaurantCount;

    modifier onlyOrderManager() {
        require(msg.sender == orderManager, "Only OrderManager");
        _;
    }

    event RestaurantRegistered(
        uint256 indexed restaurantId,
        address indexed owner,
        string name,
        string ipfsMenuHash
    );
    event MenuUpdated(uint256 indexed restaurantId, string newIpfsHash);
    event RestaurantStatusChanged(uint256 indexed restaurantId, bool isActive);
    event RestaurantInfoUpdated(uint256 indexed restaurantId);

    constructor(address _roleManager) Ownable(msg.sender) {
        require(_roleManager != address(0), "Invalid RoleManager address");
        roleManager = IRoleManager(_roleManager);
    }

    /**
     * @dev Set OrderManager address (only owner can call this once)
     */
    function setOrderManager(address _orderManager) external onlyOwner {
        require(_orderManager != address(0), "Invalid address");
        require(orderManager == address(0), "Already set");
        orderManager = _orderManager;
    }

    /**
     * @dev Register new restaurant with role check
     */
    function registerRestaurant(
        string memory _name,
        string memory _description,
        string memory _ipfsMenuHash,
        string memory _metadataURI,
        string memory _physicalAddress
    ) external nonReentrant returns (uint256) {
        // ROLE ISOLATION CHECK
        require(roleManager.canRegisterAsRestaurant(msg.sender), 
            "Cannot register: Address already has another role");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_ipfsMenuHash).length > 0, "Menu hash required");
        require(ownerToRestaurant[msg.sender] == 0, "Already registered");

        restaurantCount++;
        uint256 restaurantId = restaurantCount;

        restaurants[restaurantId] = Restaurant({
            owner: msg.sender,
            name: _name,
            description: _description,
            ipfsMenuHash: _ipfsMenuHash,
            metadataURI: _metadataURI,
            physicalAddress: _physicalAddress,
            isActive: true,
            registeredAt: block.timestamp,
            totalOrders: 0,
            totalRating: 0,
            ratingCount: 0
        });

        ownerToRestaurant[msg.sender] = restaurantId;
        
        // Assign restaurant role - WILL FAIL if RestaurantRegistry is not owner of RoleManager
        // After ownership transfer, this will work
        roleManager.assignRestaurantRole(msg.sender);

        emit RestaurantRegistered(restaurantId, msg.sender, _name, _ipfsMenuHash);
        return restaurantId;
    }

    /**
     * @dev Update restaurant menu
     */
    function updateMenu(
        uint256 _restaurantId,
        string memory _newIpfsHash
    ) external {
        require(_restaurantId > 0 && _restaurantId <= restaurantCount, "Invalid ID");
        require(restaurants[_restaurantId].owner == msg.sender, "Not owner");
        require(bytes(_newIpfsHash).length > 0, "Hash required");

        restaurants[_restaurantId].ipfsMenuHash = _newIpfsHash;
        emit MenuUpdated(_restaurantId, _newIpfsHash);
    }

    /**
     * @dev Update restaurant information
     */
    function updateRestaurantInfo(
        uint256 _restaurantId,
        string memory _name,
        string memory _description,
        string memory _physicalAddress
    ) external {
        require(_restaurantId > 0 && _restaurantId <= restaurantCount, "Invalid ID");
        require(restaurants[_restaurantId].owner == msg.sender, "Not owner");
        
        if (bytes(_name).length > 0) {
            restaurants[_restaurantId].name = _name;
        }
        if (bytes(_description).length > 0) {
            restaurants[_restaurantId].description = _description;
        }
        if (bytes(_physicalAddress).length > 0) {
            restaurants[_restaurantId].physicalAddress = _physicalAddress;
        }
        
        emit RestaurantInfoUpdated(_restaurantId);
    }

    /**
     * @dev Toggle restaurant status (Open/Closed)
     */
    function setRestaurantStatus(uint256 _restaurantId, bool _isActive) external {
        require(_restaurantId > 0 && _restaurantId <= restaurantCount, "Invalid ID");
        require(restaurants[_restaurantId].owner == msg.sender, "Not owner");

        restaurants[_restaurantId].isActive = _isActive;
        emit RestaurantStatusChanged(_restaurantId, _isActive);
    }

    /**
     * @dev Get restaurant details
     */
    function getRestaurant(uint256 _restaurantId)
        external
        view
        returns (Restaurant memory)
    {
        require(_restaurantId > 0 && _restaurantId <= restaurantCount, "Invalid ID");
        return restaurants[_restaurantId];
    }

    /**
     * @dev Check if address is restaurant owner
     */
    function isRestaurantOwner(address _user) external view returns (bool) {
        return ownerToRestaurant[_user] != 0;
    }

    /**
     * @dev Increment orders count (only callable by OrderManager)
     */
    function incrementOrders(uint256 _restaurantId) external onlyOrderManager {
        require(_restaurantId > 0 && _restaurantId <= restaurantCount, "Invalid ID");
        restaurants[_restaurantId].totalOrders++;
    }

    /**
     * @dev Add rating (only callable by OrderManager)
     */
    function addRating(uint256 _restaurantId, uint256 _rating) external onlyOrderManager {
        require(_restaurantId > 0 && _restaurantId <= restaurantCount, "Invalid ID");
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        
        restaurants[_restaurantId].totalRating += _rating;
        restaurants[_restaurantId].ratingCount++;
    }

    /**
     * @dev Get restaurant owner by ID
     */
    function getRestaurantOwner(uint256 _restaurantId) external view returns (address) {
        require(_restaurantId > 0 && _restaurantId <= restaurantCount, "Invalid ID");
        return restaurants[_restaurantId].owner;
    }

    /**
     * @dev Get active restaurants count
     */
    function getActiveRestaurantsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= restaurantCount; i++) {
            if (restaurants[i].isActive) {
                count++;
            }
        }
        return count;
    }
}
