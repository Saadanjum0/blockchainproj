// Contract ABIs for interacting with smart contracts
// ⚠️ CORRECTED VERSION - Matches Deployed Contracts

export const RESTAURANT_REGISTRY_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_roleManager", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "restaurantId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "newIpfsHash", "type": "string"}
    ],
    "name": "MenuUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "restaurantId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "ipfsMenuHash", "type": "string"}
    ],
    "name": "RestaurantRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "restaurantId", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "name": "RestaurantStatusChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "restaurantId", "type": "uint256"}
    ],
    "name": "RestaurantInfoUpdated",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_restaurantId", "type": "uint256"}],
    "name": "getRestaurant",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "ipfsMenuHash", "type": "string"},
          {"internalType": "string", "name": "metadataURI", "type": "string"},
          {"internalType": "string", "name": "physicalAddress", "type": "string"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "registeredAt", "type": "uint256"},
          {"internalType": "uint256", "name": "totalOrders", "type": "uint256"},
          {"internalType": "uint256", "name": "totalRating", "type": "uint256"},
          {"internalType": "uint256", "name": "ratingCount", "type": "uint256"}
        ],
        "internalType": "struct RestaurantRegistry.Restaurant",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "string", "name": "_ipfsMenuHash", "type": "string"},
      {"internalType": "string", "name": "_metadataURI", "type": "string"},
      {"internalType": "string", "name": "_physicalAddress", "type": "string"}
    ],
    "name": "registerRestaurant",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "restaurantCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "ownerToRestaurant",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_restaurantId", "type": "uint256"},
      {"internalType": "string", "name": "_newIpfsHash", "type": "string"}
    ],
    "name": "updateMenu",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_restaurantId", "type": "uint256"},
      {"internalType": "bool", "name": "_isActive", "type": "bool"}
    ],
    "name": "setRestaurantStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_restaurantId", "type": "uint256"},
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "string", "name": "_physicalAddress", "type": "string"}
    ],
    "name": "updateRestaurantInfo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "isRestaurantOwner",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_restaurantId", "type": "uint256"}],
    "name": "getRestaurantOwner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveRestaurantsCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const RIDER_REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "rider", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "vehicleType", "type": "string"}
    ],
    "name": "RiderRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "rider", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "isAvailable", "type": "bool"}
    ],
    "name": "RiderAvailabilityChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "rider", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "name": "RiderStatusChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "rider", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"}
    ],
    "name": "RiderAssignedToOrder",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "rider", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"}
    ],
    "name": "RiderCompletedDelivery",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_rider", "type": "address"}],
    "name": "getRider",
    "outputs": [
      {"internalType": "address", "name": "riderAddress", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "phoneNumber", "type": "string"},
      {"internalType": "string", "name": "vehicleType", "type": "string"},
      {"internalType": "string", "name": "metadataURI", "type": "string"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "isAvailable", "type": "bool"},
      {"internalType": "uint256", "name": "registeredAt", "type": "uint256"},
      {"internalType": "uint256", "name": "totalDeliveries", "type": "uint256"},
      {"internalType": "uint256", "name": "totalEarnings", "type": "uint256"},
      {"internalType": "uint256", "name": "totalRating", "type": "uint256"},
      {"internalType": "uint256", "name": "ratingCount", "type": "uint256"},
      {"internalType": "uint256", "name": "currentOrderId", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAvailableRiders",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_phoneNumber", "type": "string"},
      {"internalType": "string", "name": "_vehicleType", "type": "string"},
      {"internalType": "string", "name": "_metadataURI", "type": "string"}
    ],
    "name": "registerRider",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bool", "name": "_isAvailable", "type": "bool"}],
    "name": "setAvailability",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bool", "name": "_isActive", "type": "bool"}],
    "name": "setRiderStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_phoneNumber", "type": "string"},
      {"internalType": "string", "name": "_vehicleType", "type": "string"}
    ],
    "name": "updateRiderInfo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_rider", "type": "address"}],
    "name": "isRiderAvailable",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_rider", "type": "address"}],
    "name": "getRiderCurrentOrder",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalRiders",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveRidersCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const ORDER_MANAGER_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_restaurantRegistry", "type": "address"},
      {"internalType": "address", "name": "_riderRegistry", "type": "address"},
      {"internalType": "address", "name": "_escrow", "type": "address"},
      {"internalType": "address", "name": "_roleManager", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "restaurantId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "customer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "deliveryAddress", "type": "string"}
    ],
    "name": "OrderCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": true, "internalType": "uint8", "name": "oldStatus", "type": "uint8"},
      {"indexed": true, "internalType": "uint8", "name": "newStatus", "type": "uint8"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "OrderStatusChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": false, "internalType": "uint8", "name": "restaurantRating", "type": "uint8"},
      {"indexed": false, "internalType": "uint8", "name": "riderRating", "type": "uint8"}
    ],
    "name": "RatingsSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "PaymentReleased",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_restaurantId", "type": "uint256"},
      {"internalType": "string", "name": "_ipfsOrderHash", "type": "string"},
      {"internalType": "string", "name": "_deliveryAddress", "type": "string"},
      {"internalType": "string", "name": "_customerPhone", "type": "string"},
      {"internalType": "uint256", "name": "_tip", "type": "uint256"}
    ],
    "name": "createOrder",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_orderId", "type": "uint256"}],
    "name": "acceptOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_orderId", "type": "uint256"}],
    "name": "markAsPrepared",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_orderId", "type": "uint256"},
      {"internalType": "address", "name": "_rider", "type": "address"}
    ],
    "name": "assignRider",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_orderId", "type": "uint256"}],
    "name": "pickupOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_orderId", "type": "uint256"}],
    "name": "markAsDelivered",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_orderId", "type": "uint256"},
      {"internalType": "uint8", "name": "_restaurantRating", "type": "uint8"},
      {"internalType": "uint8", "name": "_riderRating", "type": "uint8"}
    ],
    "name": "confirmDelivery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_orderId", "type": "uint256"},
      {"internalType": "string", "name": "_reason", "type": "string"}
    ],
    "name": "cancelOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_orderId", "type": "uint256"}],
    "name": "getOrder",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "uint256", "name": "restaurantId", "type": "uint256"},
          {"internalType": "address", "name": "customer", "type": "address"},
          {"internalType": "address payable", "name": "rider", "type": "address"},
          {"internalType": "uint128", "name": "amount", "type": "uint128"},
          {"internalType": "uint128", "name": "tip", "type": "uint128"},
          {"internalType": "uint32", "name": "createdAt", "type": "uint32"},
          {"internalType": "uint32", "name": "acceptedAt", "type": "uint32"},
          {"internalType": "uint32", "name": "preparedAt", "type": "uint32"},
          {"internalType": "uint32", "name": "pickedUpAt", "type": "uint32"},
          {"internalType": "uint32", "name": "deliveredAt", "type": "uint32"},
          {"internalType": "uint32", "name": "completedAt", "type": "uint32"},
          {"internalType": "uint8", "name": "status", "type": "uint8"},
          {"internalType": "uint8", "name": "restaurantRating", "type": "uint8"},
          {"internalType": "uint8", "name": "riderRating", "type": "uint8"},
          {"internalType": "string", "name": "ipfsOrderHash", "type": "string"},
          {"internalType": "string", "name": "deliveryAddress", "type": "string"},
          {"internalType": "string", "name": "customerPhone", "type": "string"}
        ],
        "internalType": "struct OrderManager.Order",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_customer", "type": "address"}],
    "name": "getCustomerOrders",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "orderCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_restaurantId", "type": "uint256"}],
    "name": "getRestaurantOrders",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOrdersReadyForPickup",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_rider", "type": "address"}],
    "name": "getRiderOrders",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_orderId", "type": "uint256"},
      {"internalType": "string", "name": "_reason", "type": "string"}
    ],
    "name": "disputeOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_orderId", "type": "uint256"},
      {"internalType": "bool", "name": "_refundCustomer", "type": "bool"}
    ],
    "name": "resolveDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256[]", "name": "_orderIds", "type": "uint256[]"}],
    "name": "processPendingRatings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256[]", "name": "_orderIds", "type": "uint256[]"}],
    "name": "processPendingStats",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const ESCROW_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_platformWallet", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "restaurant", "type": "address"}
    ],
    "name": "FundsDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "restaurantAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "riderAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "platformAmount", "type": "uint256"}
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "customer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "FundsRefunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "newOrderManager", "type": "address"}
    ],
    "name": "OrderManagerUpdated",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_orderId", "type": "uint256"}],
    "name": "getPayment",
    "outputs": [
      {
        "components": [
          {"internalType": "uint128", "name": "totalAmount", "type": "uint128"},
          {"internalType": "uint128", "name": "restaurantShare", "type": "uint128"},
          {"internalType": "uint64", "name": "riderShare", "type": "uint64"},
          {"internalType": "uint64", "name": "platformFee", "type": "uint64"},
          {"internalType": "address", "name": "restaurant", "type": "address"},
          {"internalType": "address", "name": "rider", "type": "address"},
          {"internalType": "bool", "name": "released", "type": "bool"},
          {"internalType": "bool", "name": "refunded", "type": "bool"}
        ],
        "internalType": "struct Escrow.Payment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_orderId", "type": "uint256"}],
    "name": "getPaymentStatus",
    "outputs": [
      {"internalType": "bool", "name": "exists", "type": "bool"},
      {"internalType": "bool", "name": "released", "type": "bool"},
      {"internalType": "bool", "name": "refunded", "type": "bool"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}],
    "name": "calculateFees",
    "outputs": [
      {"internalType": "uint256", "name": "restaurantAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "riderAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "platformAmount", "type": "uint256"}
    ],
    "stateMutability": "pure",
    "type": "function"
  }
];

export const ROLE_MANAGER_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "role", "type": "string"}
    ],
    "name": "RoleAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "role", "type": "string"}
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "contractAddr", "type": "address"}
    ],
    "name": "ContractAuthorized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "contractAddr", "type": "address"}
    ],
    "name": "ContractRevoked",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isRestaurant",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isRider",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isCustomer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isAdmin",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "authorizedContracts",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_contract", "type": "address"}],
    "name": "authorizeContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_contract", "type": "address"}],
    "name": "revokeContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "hasNoRole",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserRole",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "assignRestaurantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "assignRiderRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "assignCustomerRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "canRegisterAsRestaurant",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "canRegisterAsRider",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "canPlaceOrder",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Helper function to get status name from status code
export const getOrderStatusName = (statusCode) => {
  const statuses = [
    "Created",      // 0
    "Accepted",     // 1
    "Assigned",     // 2  
    "PickedUp",     // 3
    "Delivered",    // 4
    "Completed",    // 5
    "Cancelled",    // 6
    "Disputed",     // 7
    "Refunded"      // 8
  ];
  return statuses[statusCode] || "Unknown";
};
