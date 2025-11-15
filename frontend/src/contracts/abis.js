// Contract ABIs for interacting with smart contracts

export const RESTAURANT_REGISTRY_ABI = [
  {
    "inputs": [],
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
      {"indexed": false, "internalType": "string", "name": "metadataURI", "type": "string"}
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
  }
];

export const ORDER_MANAGER_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_restaurantRegistry", "type": "address"},
      {"internalType": "address", "name": "_riderRegistry", "type": "address"},
      {"internalType": "address", "name": "_escrow", "type": "address"}
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
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "OrderCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "restaurantId", "type": "uint256"}
    ],
    "name": "OrderAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"}
    ],
    "name": "OrderPrepared",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "rider", "type": "address"}
    ],
    "name": "RiderAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "rider", "type": "address"}
    ],
    "name": "OrderPickedUp",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"}
    ],
    "name": "OrderDelivered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"}
    ],
    "name": "OrderCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "OrderCancelled",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_restaurantId", "type": "uint256"},
      {"internalType": "string", "name": "_ipfsOrderHash", "type": "string"},
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
    "name": "markPrepared",
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
    "name": "markPickedUp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_orderId", "type": "uint256"}],
    "name": "markDelivered",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_orderId", "type": "uint256"}],
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
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "uint256", "name": "tip", "type": "uint256"},
          {"internalType": "enum OrderManager.OrderStatus", "name": "status", "type": "uint8"},
          {"internalType": "string", "name": "ipfsOrderHash", "type": "string"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "uint256", "name": "completedAt", "type": "uint256"}
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
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "FundsDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "restaurant", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "rider", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "restaurantAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "riderAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "platformFee", "type": "uint256"}
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_orderId", "type": "uint256"}],
    "name": "getPayment",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "orderId", "type": "uint256"},
          {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "restaurantShare", "type": "uint256"},
          {"internalType": "uint256", "name": "riderShare", "type": "uint256"},
          {"internalType": "uint256", "name": "platformFee", "type": "uint256"},
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
  }
];

// Helper function to get status name from status code
export const getOrderStatusName = (statusCode) => {
  const statuses = [
    "Created",
    "Accepted",
    "Prepared",
    "PickedUp",
    "Delivered",
    "Completed",
    "Cancelled",
    "Disputed",
    "Refunded"
  ];
  return statuses[statusCode] || "Unknown";
};

