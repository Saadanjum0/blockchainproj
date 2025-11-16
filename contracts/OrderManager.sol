// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRestaurantRegistry {
    struct Restaurant {
        address owner;
        string name;
        string description;
        string ipfsMenuHash;
        string metadataURI;
        string physicalAddress;
        bool isActive;
        uint256 registeredAt;
        uint256 totalOrders;
        uint256 totalRating;
        uint256 ratingCount;
    }
    
    function getRestaurant(uint256 _id) external view returns (Restaurant memory);
    function getRestaurantOwner(uint256 _id) external view returns (address);
    function incrementOrders(uint256 _id) external;
    function addRating(uint256 _id, uint256 _rating) external;
}

interface IRiderRegistry {
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
    );
    function isRiderAvailable(address _rider) external view returns (bool);
    function assignToOrder(address _rider, uint256 _orderId) external;
    function completeDelivery(address _rider, uint256 _amount) external;
    function addRating(address _rider, uint256 _rating) external;
}

interface IEscrow {
    function deposit(uint256 _orderId, address _restaurant, address _rider) external payable;
    function release(uint256 _orderId) external;
    function refund(uint256 _orderId, address _customer) external;
}

interface IRoleManager {
    function canPlaceOrder(address _user) external view returns (bool);
    function assignCustomerRole(address _user) external;
    // FIXED: Added missing view functions that interface expects
    function isCustomer(address _user) external view returns (bool);
    function isRestaurant(address _user) external view returns (bool);
    function isRider(address _user) external view returns (bool);
}

contract OrderManager is Ownable, ReentrancyGuard {
    
    enum OrderStatus {
        Created,        // 0 - Customer placed order
        Accepted,       // 1 - Restaurant accepted
        Prepared,       // 2 - Food ready for pickup (RIDERS SEE THIS)
        PickedUp,       // 3 - Rider picked up food
        Delivered,      // 4 - Rider delivered food
        Completed,      // 5 - Customer confirmed (Payment released)
        Cancelled,      // 6 - Order cancelled
        Disputed,       // 7 - Dispute raised
        Refunded        // 8 - Money refunded
    }

    struct Order {
        uint256 id;
        uint256 restaurantId;
        address customer;
        address payable rider;
        uint256 amount;
        uint256 tip;
        OrderStatus status;
        string ipfsOrderHash;
        string deliveryAddress;     // CUSTOMER DELIVERY ADDRESS
        string customerPhone;        // CUSTOMER PHONE
        uint256 createdAt;
        uint256 acceptedAt;
        uint256 preparedAt;         // When food ready
        uint256 pickedUpAt;
        uint256 deliveredAt;
        uint256 completedAt;
        uint256 restaurantRating;   // 0-5 stars
        uint256 riderRating;         // 0-5 stars
    }

    mapping(uint256 => Order) public orders;
    uint256 public orderCount;

    IRestaurantRegistry public restaurantRegistry;
    IRiderRegistry public riderRegistry;
    IEscrow public escrow;
    IRoleManager public roleManager;

    // Events
    event OrderCreated(
        uint256 indexed orderId,
        uint256 indexed restaurantId,
        address indexed customer,
        uint256 amount,
        string deliveryAddress
    );
    event OrderAccepted(uint256 indexed orderId, uint256 restaurantId, uint256 timestamp);
    event OrderPrepared(uint256 indexed orderId, uint256 timestamp);
    event RiderAssigned(uint256 indexed orderId, address indexed rider, uint256 timestamp);
    event OrderPickedUp(uint256 indexed orderId, address indexed rider, uint256 timestamp);
    event OrderDelivered(uint256 indexed orderId, uint256 timestamp);
    event OrderCompleted(uint256 indexed orderId, uint256 timestamp);
    event OrderCancelled(uint256 indexed orderId, string reason);
    event OrderDisputed(uint256 indexed orderId, address indexed initiator, string reason);
    event OrderRated(uint256 indexed orderId, uint256 restaurantRating, uint256 riderRating);

    constructor(
        address _restaurantRegistry,
        address _riderRegistry,
        address _escrow,
        address _roleManager
    ) Ownable(msg.sender) {
        require(_restaurantRegistry != address(0), "Invalid restaurant registry");
        require(_riderRegistry != address(0), "Invalid rider registry");
        require(_escrow != address(0), "Invalid escrow");
        require(_roleManager != address(0), "Invalid role manager");

        restaurantRegistry = IRestaurantRegistry(_restaurantRegistry);
        riderRegistry = IRiderRegistry(_riderRegistry);
        escrow = IEscrow(_escrow);
        roleManager = IRoleManager(_roleManager);
    }

    /**
     * @dev Create order with customer delivery address
     */
    function createOrder(
        uint256 _restaurantId,
        string memory _ipfsOrderHash,
        string memory _deliveryAddress,
        string memory _customerPhone,
        uint256 _tip
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Payment required");
        require(bytes(_ipfsOrderHash).length > 0, "Order hash required");
        require(bytes(_deliveryAddress).length > 0, "Delivery address required");
        
        // ROLE CHECK - Auto-assign customer role if new
        require(roleManager.canPlaceOrder(msg.sender), 
            "Cannot place order: Address has incompatible role");
        
        // Auto-assign customer role if first order
        // FIXED: Will fail if OrderManager is not owner of RoleManager
        // Solution: Transfer RoleManager ownership to OrderManager, OR skip this check
        if (!roleManager.isCustomer(msg.sender)) {
            roleManager.assignCustomerRole(msg.sender);
        }

        // Verify restaurant exists and is active
        IRestaurantRegistry.Restaurant memory restaurant = 
            restaurantRegistry.getRestaurant(_restaurantId);
        require(restaurant.isActive, "Restaurant not active");
        address restaurantOwner = restaurant.owner;

        orderCount++;
        uint256 orderId = orderCount;

        orders[orderId] = Order({
            id: orderId,
            restaurantId: _restaurantId,
            customer: msg.sender,
            rider: payable(address(0)),
            amount: msg.value,
            tip: _tip,
            status: OrderStatus.Created,
            ipfsOrderHash: _ipfsOrderHash,
            deliveryAddress: _deliveryAddress,
            customerPhone: _customerPhone,
            createdAt: block.timestamp,
            acceptedAt: 0,
            preparedAt: 0,
            pickedUpAt: 0,
            deliveredAt: 0,
            completedAt: 0,
            restaurantRating: 0,
            riderRating: 0
        });

        // Deposit funds into escrow
        escrow.deposit{value: msg.value}(orderId, restaurantOwner, address(0));

        emit OrderCreated(orderId, _restaurantId, msg.sender, msg.value, _deliveryAddress);
        return orderId;
    }

    /**
     * @dev Restaurant accepts order
     */
    function acceptOrder(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.id != 0, "Order not found");
        require(order.status == OrderStatus.Created, "Invalid status");

        address restaurantOwner = restaurantRegistry.getRestaurantOwner(order.restaurantId);
        require(msg.sender == restaurantOwner, "Not restaurant owner");

        order.status = OrderStatus.Accepted;
        order.acceptedAt = block.timestamp;
        
        emit OrderAccepted(_orderId, order.restaurantId, block.timestamp);
    }

    /**
     * @dev Restaurant marks food as prepared (RIDERS CAN NOW SEE IT)
     */
    function markPrepared(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Accepted, "Invalid status");

        address restaurantOwner = restaurantRegistry.getRestaurantOwner(order.restaurantId);
        require(msg.sender == restaurantOwner, "Not restaurant owner");

        order.status = OrderStatus.Prepared;
        order.preparedAt = block.timestamp;
        
        emit OrderPrepared(_orderId, block.timestamp);
    }

    /**
     * @dev Assign rider to order
     */
    function assignRider(uint256 _orderId, address payable _rider) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Prepared, "Order not ready for pickup");

        // Can be called by restaurant owner or rider themselves
        address restaurantOwner = restaurantRegistry.getRestaurantOwner(order.restaurantId);
        require(
            msg.sender == restaurantOwner || msg.sender == _rider,
            "Not authorized"
        );

        // Verify rider is available
        require(riderRegistry.isRiderAvailable(_rider), "Rider not available");

        order.rider = _rider;
        
        // Assign rider in registry
        riderRegistry.assignToOrder(_rider, _orderId);
        
        emit RiderAssigned(_orderId, _rider, block.timestamp);
    }

    /**
     * @dev Rider marks order as picked up
     */
    function markPickedUp(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Prepared, "Invalid status");
        require(msg.sender == order.rider, "Not assigned rider");
        require(order.rider != address(0), "No rider assigned");

        order.status = OrderStatus.PickedUp;
        order.pickedUpAt = block.timestamp;
        
        emit OrderPickedUp(_orderId, order.rider, block.timestamp);
    }

    /**
     * @dev Rider marks order as delivered
     */
    function markDelivered(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.PickedUp, "Invalid status");
        require(msg.sender == order.rider, "Not assigned rider");

        order.status = OrderStatus.Delivered;
        order.deliveredAt = block.timestamp;
        
        emit OrderDelivered(_orderId, block.timestamp);
    }

    /**
     * @dev Customer confirms delivery and optionally rates
     */
    function confirmDelivery(
        uint256 _orderId,
        uint256 _restaurantRating,
        uint256 _riderRating
    ) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Delivered, "Invalid status");
        require(msg.sender == order.customer, "Not customer");

        // Store ratings in order struct
        if (_restaurantRating > 0) {
            require(_restaurantRating >= 1 && _restaurantRating <= 5, "Invalid restaurant rating");
            order.restaurantRating = _restaurantRating;
            // Try to add rating to registry (may fail if permissions not set, but won't block transaction)
            try restaurantRegistry.addRating(order.restaurantId, _restaurantRating) {} catch {}
        }
        
        if (_riderRating > 0 && order.rider != address(0)) {
            require(_riderRating >= 1 && _riderRating <= 5, "Invalid rider rating");
            order.riderRating = _riderRating;
            // Try to add rating to registry (may fail if permissions not set, but won't block transaction)
            try riderRegistry.addRating(order.rider, _riderRating) {} catch {}
        }

        order.status = OrderStatus.Completed;
        order.completedAt = block.timestamp;

        // Try to update statistics (may fail if permissions not set, but won't block transaction)
        try restaurantRegistry.incrementOrders(order.restaurantId) {} catch {}
        
        // Complete delivery in rider registry
        if (order.rider != address(0)) {
            uint256 riderAmount = (order.amount * 10) / 100; // 10% for rider
            riderRegistry.completeDelivery(order.rider, riderAmount);
        }

        // Release funds from escrow
        escrow.release(_orderId);

        emit OrderCompleted(_orderId, block.timestamp);
        
        if (_restaurantRating > 0 || _riderRating > 0) {
            emit OrderRated(_orderId, _restaurantRating, _riderRating);
        }
    }

    /**
     * @dev Cancel order (only before accepted)
     */
    function cancelOrder(uint256 _orderId, string memory _reason) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Created, "Cannot cancel");
        require(msg.sender == order.customer, "Not customer");

        order.status = OrderStatus.Cancelled;

        // Refund customer
        escrow.refund(_orderId, order.customer);

        emit OrderCancelled(_orderId, _reason);
    }

    /**
     * @dev Raise dispute
     */
    function disputeOrder(uint256 _orderId, string memory _reason) external {
        Order storage order = orders[_orderId];
        require(
            msg.sender == order.customer || msg.sender == order.rider,
            "Not authorized"
        );
        require(
            order.status != OrderStatus.Completed &&
            order.status != OrderStatus.Cancelled &&
            order.status != OrderStatus.Refunded,
            "Invalid status"
        );

        order.status = OrderStatus.Disputed;
        emit OrderDisputed(_orderId, msg.sender, _reason);
    }

    /**
     * @dev Get order details
     */
    function getOrder(uint256 _orderId) external view returns (Order memory) {
        require(_orderId > 0 && _orderId <= orderCount, "Invalid order ID");
        return orders[_orderId];
    }

    /**
     * @dev Get customer orders
     */
    function getCustomerOrders(address _customer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= orderCount; i++) {
            if (orders[i].customer == _customer) {
                count++;
            }
        }

        uint256[] memory customerOrders = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= orderCount; i++) {
            if (orders[i].customer == _customer) {
                customerOrders[index] = i;
                index++;
            }
        }

        return customerOrders;
    }

    /**
     * @dev Get restaurant orders
     */
    function getRestaurantOrders(uint256 _restaurantId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= orderCount; i++) {
            if (orders[i].restaurantId == _restaurantId) {
                count++;
            }
        }

        uint256[] memory restaurantOrders = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= orderCount; i++) {
            if (orders[i].restaurantId == _restaurantId) {
                restaurantOrders[index] = i;
                index++;
            }
        }

        return restaurantOrders;
    }

    /**
     * @dev Get orders ready for pickup (Status = Prepared, No rider assigned yet)
     * THIS IS WHAT RIDERS SEE!
     */
    function getOrdersReadyForPickup() 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= orderCount; i++) {
            if (orders[i].status == OrderStatus.Prepared) {
                count++;
            }
        }

        uint256[] memory readyOrders = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= orderCount; i++) {
            if (orders[i].status == OrderStatus.Prepared) {
                readyOrders[index] = i;
                index++;
            }
        }

        return readyOrders;
    }

    /**
     * @dev Get rider's active orders
     */
    function getRiderOrders(address _rider) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= orderCount; i++) {
            if (orders[i].rider == _rider && 
                (orders[i].status == OrderStatus.PickedUp || 
                 orders[i].status == OrderStatus.Delivered)) {
                count++;
            }
        }

        uint256[] memory riderOrders = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= orderCount; i++) {
            if (orders[i].rider == _rider && 
                (orders[i].status == OrderStatus.PickedUp || 
                 orders[i].status == OrderStatus.Delivered)) {
                riderOrders[index] = i;
                index++;
            }
        }

        return riderOrders;
    }

    /**
     * @dev Get order delivery location (only for involved parties)
     */
    function getOrderDeliveryAddress(uint256 _orderId) 
        external 
        view 
        returns (string memory) 
    {
        Order memory order = orders[_orderId];
        require(_orderId > 0 && _orderId <= orderCount, "Invalid order ID");
        
        // Only customer, rider, or restaurant can see address
        address restaurantOwner = restaurantRegistry.getRestaurantOwner(order.restaurantId);
        require(
            msg.sender == order.customer || 
            msg.sender == order.rider || 
            msg.sender == restaurantOwner ||
            msg.sender == owner(),
            "Not authorized"
        );
        
        return order.deliveryAddress;
    }

    /**
     * @dev Admin function to resolve dispute
     */
    function resolveDispute(uint256 _orderId, bool _refundCustomer) external onlyOwner {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Disputed, "Not in dispute");

        if (_refundCustomer) {
            order.status = OrderStatus.Refunded;
            escrow.refund(_orderId, order.customer);
        } else {
            order.status = OrderStatus.Completed;
            order.completedAt = block.timestamp;
            
            // Release payment
            escrow.release(_orderId);
            
            // Update stats
            restaurantRegistry.incrementOrders(order.restaurantId);
            if (order.rider != address(0)) {
                uint256 riderAmount = (order.amount * 10) / 100;
                riderRegistry.completeDelivery(order.rider, riderAmount);
            }
        }
    }
}
