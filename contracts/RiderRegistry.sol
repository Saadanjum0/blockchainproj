// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRoleManager {
    function hasNoRole(address _user) external view returns (bool);
    function canRegisterAsRider(address _user) external view returns (bool);
    function assignRiderRole(address _user) external;
    function isRider(address _user) external view returns (bool);
}

contract RiderRegistry is Ownable, ReentrancyGuard {
    
    struct Rider {
        address riderAddress;
        string name;
        string phoneNumber;
        string vehicleType;
        string metadataURI;
        bool isActive;
        bool isAvailable;
        uint256 registeredAt;
        uint256 totalDeliveries;
        uint256 totalEarnings;
        uint256 totalRating;
        uint256 ratingCount;
        uint256 currentOrderId;
    }

    IRoleManager public roleManager;
    address public orderManager;
    
    mapping(address => Rider) public riders;
    mapping(address => bool) public isRegistered;
    address[] public riderList;

    event RiderRegistered(address indexed rider, string name, string vehicleType);
    event RiderStatusChanged(address indexed rider, bool isActive);
    event RiderAvailabilityChanged(address indexed rider, bool isAvailable);
    event RiderAssignedToOrder(address indexed rider, uint256 indexed orderId);
    event RiderCompletedDelivery(address indexed rider, uint256 indexed orderId);

    modifier onlyOrderManager() {
        require(msg.sender == orderManager, "Not authorized");
        _;
    }

    constructor(address _roleManager) Ownable(msg.sender) {
        require(_roleManager != address(0), "Invalid RoleManager address");
        roleManager = IRoleManager(_roleManager);
    }
    
    function setOrderManager(address _orderManager) external onlyOwner {
        require(_orderManager != address(0), "Invalid address");
        orderManager = _orderManager;
    }

    /**
     * @dev Register as rider - OPTIMIZED to avoid stack too deep
     */
    function registerRider(
        string memory _name,
        string memory _phoneNumber,
        string memory _vehicleType,
        string memory _metadataURI
    ) external nonReentrant {
        // CRITICAL FIX: Role isolation check
        require(roleManager.canRegisterAsRider(msg.sender), 
            "Cannot register: Address already has another role");
        
        require(!isRegistered[msg.sender], "Already registered");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_vehicleType).length > 0, "Vehicle type required");

        // Create rider directly in storage to avoid stack issues
        Rider storage newRider = riders[msg.sender];
        newRider.riderAddress = msg.sender;
        newRider.name = _name;
        newRider.phoneNumber = _phoneNumber;
        newRider.vehicleType = _vehicleType;
        newRider.metadataURI = _metadataURI;
        newRider.isActive = true;
        newRider.isAvailable = true;
        newRider.registeredAt = block.timestamp;
        // Other fields default to 0

        isRegistered[msg.sender] = true;
        riderList.push(msg.sender);

        // CRITICAL FIX: Assign rider role - WILL FAIL if RiderRegistry is not authorized in RoleManager
        // After deployment, make sure to call RoleManager.authorizeContract(riderRegistryAddress)
        roleManager.assignRiderRole(msg.sender);

        emit RiderRegistered(msg.sender, _name, _vehicleType);
    }

    function setAvailability(bool _isAvailable) external {
        require(isRegistered[msg.sender], "Not registered");
        require(!_isAvailable || riders[msg.sender].currentOrderId == 0, "Complete delivery first");
        
        riders[msg.sender].isAvailable = _isAvailable;
        emit RiderAvailabilityChanged(msg.sender, _isAvailable);
    }

    function setRiderStatus(bool _isActive) external {
        require(isRegistered[msg.sender], "Not registered");
        
        riders[msg.sender].isActive = _isActive;
        if (!_isActive) {
            riders[msg.sender].isAvailable = false;
        }
        
        emit RiderStatusChanged(msg.sender, _isActive);
    }

    function updateRiderInfo(
        string memory _name,
        string memory _phoneNumber,
        string memory _vehicleType
    ) external {
        require(isRegistered[msg.sender], "Not registered");
        
        Rider storage rider = riders[msg.sender];
        if (bytes(_name).length > 0) rider.name = _name;
        if (bytes(_phoneNumber).length > 0) rider.phoneNumber = _phoneNumber;
        if (bytes(_vehicleType).length > 0) rider.vehicleType = _vehicleType;
    }

    /**
     * @dev Get rider details - returns individual values to avoid stack too deep
     * Frontend can reconstruct struct from these values
     */
    function getRider(address _rider) external view returns (
        address riderAddress,
        string memory name,
        string memory phoneNumber,
        string memory vehicleType,
        string memory metadataURI,
        bool isActive,
        bool isAvailable,
        uint256 registeredAt,
        uint256 totalDeliveries,
        uint256 totalEarnings,
        uint256 totalRating,
        uint256 ratingCount,
        uint256 currentOrderId
    ) {
        require(isRegistered[_rider], "Not registered");
        Rider storage r = riders[_rider];
        return (
            r.riderAddress,
            r.name,
            r.phoneNumber,
            r.vehicleType,
            r.metadataURI,
            r.isActive,
            r.isAvailable,
            r.registeredAt,
            r.totalDeliveries,
            r.totalEarnings,
            r.totalRating,
            r.ratingCount,
            r.currentOrderId
        );
    }

    function getAvailableRiders() external view returns (address[] memory) {
        uint256 count = _countAvailableRiders();
        address[] memory available = new address[](count);
        
        uint256 index = 0;
        uint256 listLength = riderList.length;
        for (uint256 i = 0; i < listLength; i++) {
            if (_isRiderAvailable(riderList[i])) {
                available[index] = riderList[i];
                index++;
            }
        }

        return available;
    }

    function isRiderAvailable(address _rider) external view returns (bool) {
        return _isRiderAvailable(_rider);
    }

    function assignToOrder(address _rider, uint256 _orderId) external onlyOrderManager {
        require(isRegistered[_rider], "Not registered");
        require(riders[_rider].isActive, "Not active");
        require(riders[_rider].currentOrderId == 0, "Already on delivery");
        
        riders[_rider].currentOrderId = _orderId;
        riders[_rider].isAvailable = false;
        
        emit RiderAssignedToOrder(_rider, _orderId);
    }

    function completeDelivery(address _rider, uint256 _amount) external onlyOrderManager {
        require(isRegistered[_rider], "Not registered");
        require(riders[_rider].currentOrderId != 0, "No active delivery");
        
        uint256 orderId = riders[_rider].currentOrderId;
        
        riders[_rider].totalDeliveries++;
        riders[_rider].totalEarnings += _amount;
        riders[_rider].currentOrderId = 0;
        riders[_rider].isAvailable = true;
        
        emit RiderCompletedDelivery(_rider, orderId);
    }

    function addRating(address _rider, uint256 _rating) external onlyOrderManager {
        require(isRegistered[_rider], "Not registered");
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        
        riders[_rider].totalRating += _rating;
        riders[_rider].ratingCount++;
    }

    function getRiderCurrentOrder(address _rider) external view returns (uint256) {
        require(isRegistered[_rider], "Not registered");
        return riders[_rider].currentOrderId;
    }

    function getTotalRiders() external view returns (uint256) {
        return riderList.length;
    }

    function getActiveRidersCount() external view returns (uint256) {
        uint256 count = 0;
        uint256 listLength = riderList.length;
        for (uint256 i = 0; i < listLength; i++) {
            if (riders[riderList[i]].isActive) {
                count++;
            }
        }
        return count;
    }

    // Internal helper functions to reduce stack depth
    function _isRiderAvailable(address _rider) internal view returns (bool) {
        return isRegistered[_rider] && 
               riders[_rider].isActive && 
               riders[_rider].isAvailable &&
               riders[_rider].currentOrderId == 0;
    }

    function _countAvailableRiders() internal view returns (uint256) {
        uint256 count = 0;
        uint256 listLength = riderList.length;
        for (uint256 i = 0; i < listLength; i++) {
            if (_isRiderAvailable(riderList[i])) {
                count++;
            }
        }
        return count;
    }
}
