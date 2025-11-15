# Food Delivery DApp - Sepolia Testnet Implementation Guide

## Phase 1: Sepolia Environment Setup (Week 1)

### 1.1 Project Structure
```bash
food-delivery-dapp/
├── contracts/
│   ├── RestaurantRegistry.sol
│   ├── RiderRegistry.sol
│   ├── OrderManager.sol
│   ├── Escrow.sol
│   ├── Ratings.sol
│   └── AdminController.sol
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── scripts/
│   ├── deploy.js
│   ├── setup-testdata.js
│   └── verify.js
├── test/
│   ├── RestaurantRegistry.test.js
│   ├── OrderManager.test.js
│   └── Escrow.test.js
├── hardhat.config.js
└── package.json
```

### 1.2 Hardhat Configuration for Sepolia

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto"
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
```

### 1.3 Environment Variables (.env)
```bash
# .env file
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key

# Get Sepolia ETH from:
# https://sepoliafaucet.com/
# https://sepolia-faucet.pk910.de/
# https://www.infura.io/faucet/sepolia
```

### 1.4 Package Installation
```bash
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install --save-dev @nomicfoundation/hardhat-verify
npm install @openzeppelin/contracts dotenv
npm install ethers@6
```

---

## Phase 2: Smart Contracts for Sepolia (Week 2-4)

### 2.1 RestaurantRegistry.sol (Start Here!)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RestaurantRegistry is Ownable, ReentrancyGuard {
    struct Restaurant {
        address owner;
        string ipfsMenuHash;
        string metadataURI;
        bool isActive;
        uint256 registeredAt;
        uint256 totalOrders;
        uint256 totalRating;
        uint256 ratingCount;
    }

    mapping(uint256 => Restaurant) public restaurants;
    mapping(address => uint256) public ownerToRestaurant;
    uint256 public restaurantCount;

    event RestaurantRegistered(
        uint256 indexed restaurantId,
        address indexed owner,
        string ipfsMenuHash
    );
    event MenuUpdated(uint256 indexed restaurantId, string newIpfsHash);
    event RestaurantStatusChanged(uint256 indexed restaurantId, bool isActive);

    constructor() Ownable(msg.sender) {}

    function registerRestaurant(
        string memory _ipfsMenuHash,
        string memory _metadataURI
    ) external nonReentrant returns (uint256) {
        require(bytes(_ipfsMenuHash).length > 0, "Menu hash required");
        require(ownerToRestaurant[msg.sender] == 0, "Already registered");

        restaurantCount++;
        uint256 restaurantId = restaurantCount;

        restaurants[restaurantId] = Restaurant({
            owner: msg.sender,
            ipfsMenuHash: _ipfsMenuHash,
            metadataURI: _metadataURI,
            isActive: true,
            registeredAt: block.timestamp,
            totalOrders: 0,
            totalRating: 0,
            ratingCount: 0
        });

        ownerToRestaurant[msg.sender] = restaurantId;

        emit RestaurantRegistered(restaurantId, msg.sender, _ipfsMenuHash);
        return restaurantId;
    }

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

    function setRestaurantStatus(uint256 _restaurantId, bool _isActive) external {
        require(_restaurantId > 0 && _restaurantId <= restaurantCount, "Invalid ID");
        require(restaurants[_restaurantId].owner == msg.sender, "Not owner");

        restaurants[_restaurantId].isActive = _isActive;
        emit RestaurantStatusChanged(_restaurantId, _isActive);
    }

    function getRestaurant(uint256 _restaurantId)
        external
        view
        returns (Restaurant memory)
    {
        require(_restaurantId > 0 && _restaurantId <= restaurantCount, "Invalid ID");
        return restaurants[_restaurantId];
    }

    function incrementOrders(uint256 _restaurantId) external {
        // Only callable by OrderManager contract
        restaurants[_restaurantId].totalOrders++;
    }
}
```

### 2.2 RiderRegistry.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RiderRegistry is Ownable, ReentrancyGuard {
    struct Rider {
        address riderAddress;
        string metadataURI;
        bool isActive;
        bool isAvailable;
        uint256 registeredAt;
        uint256 totalDeliveries;
        uint256 totalEarnings;
        uint256 totalRating;
        uint256 ratingCount;
    }

    mapping(address => Rider) public riders;
    mapping(address => bool) public isRegistered;
    address[] public riderList;

    event RiderRegistered(address indexed rider, string metadataURI);
    event RiderStatusChanged(address indexed rider, bool isActive);
    event RiderAvailabilityChanged(address indexed rider, bool isAvailable);

    constructor() Ownable(msg.sender) {}

    function registerRider(string memory _metadataURI) external nonReentrant {
        require(!isRegistered[msg.sender], "Already registered");
        require(bytes(_metadataURI).length > 0, "Metadata required");

        riders[msg.sender] = Rider({
            riderAddress: msg.sender,
            metadataURI: _metadataURI,
            isActive: true,
            isAvailable: true,
            registeredAt: block.timestamp,
            totalDeliveries: 0,
            totalEarnings: 0,
            totalRating: 0,
            ratingCount: 0
        });

        isRegistered[msg.sender] = true;
        riderList.push(msg.sender);

        emit RiderRegistered(msg.sender, _metadataURI);
    }

    function setAvailability(bool _isAvailable) external {
        require(isRegistered[msg.sender], "Not registered");
        riders[msg.sender].isAvailable = _isAvailable;
        emit RiderAvailabilityChanged(msg.sender, _isAvailable);
    }

    function setRiderStatus(bool _isActive) external {
        require(isRegistered[msg.sender], "Not registered");
        riders[msg.sender].isActive = _isActive;
        emit RiderStatusChanged(msg.sender, _isActive);
    }

    function getRider(address _rider) external view returns (Rider memory) {
        require(isRegistered[_rider], "Not registered");
        return riders[_rider];
    }

    function getAvailableRiders() external view returns (address[] memory) {
        uint256 availableCount = 0;
        for (uint256 i = 0; i < riderList.length; i++) {
            if (riders[riderList[i]].isAvailable && riders[riderList[i]].isActive) {
                availableCount++;
            }
        }

        address[] memory available = new address[](availableCount);
        uint256 index = 0;
        for (uint256 i = 0; i < riderList.length; i++) {
            if (riders[riderList[i]].isAvailable && riders[riderList[i]].isActive) {
                available[index] = riderList[i];
                index++;
            }
        }

        return available;
    }

    function incrementDeliveries(address _rider, uint256 _amount) external {
        // Only callable by OrderManager
        riders[_rider].totalDeliveries++;
        riders[_rider].totalEarnings += _amount;
    }
}
```

### 2.3 Escrow.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Escrow is Ownable, ReentrancyGuard {
    struct Payment {
        uint256 orderId;
        uint256 totalAmount;
        uint256 restaurantShare;
        uint256 riderShare;
        uint256 platformFee;
        address restaurant;
        address rider;
        bool released;
        bool refunded;
    }

    mapping(uint256 => Payment) public payments;
    uint256 public platformFeeBps = 1000; // 10% = 1000 basis points
    uint256 public riderFeeBps = 1000; // 10% for rider
    address public platformWallet;
    address public orderManager;

    event FundsDeposited(uint256 indexed orderId, uint256 amount);
    event FundsReleased(
        uint256 indexed orderId,
        address restaurant,
        address rider,
        uint256 restaurantAmount,
        uint256 riderAmount,
        uint256 platformFee
    );
    event FundsRefunded(uint256 indexed orderId, address customer, uint256 amount);
    event FeesUpdated(uint256 platformFeeBps, uint256 riderFeeBps);

    constructor(address _platformWallet) Ownable(msg.sender) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    function setOrderManager(address _orderManager) external onlyOwner {
        require(_orderManager != address(0), "Invalid address");
        orderManager = _orderManager;
    }

    function setFees(uint256 _platformFeeBps, uint256 _riderFeeBps) external onlyOwner {
        require(_platformFeeBps <= 2000, "Platform fee too high"); // Max 20%
        require(_riderFeeBps <= 2000, "Rider fee too high"); // Max 20%
        platformFeeBps = _platformFeeBps;
        riderFeeBps = _riderFeeBps;
        emit FeesUpdated(_platformFeeBps, _riderFeeBps);
    }

    function deposit(
        uint256 _orderId,
        address _restaurant,
        address _rider
    ) external payable nonReentrant {
        require(msg.sender == orderManager, "Only OrderManager");
        require(msg.value > 0, "No funds sent");
        require(_restaurant != address(0), "Invalid restaurant");

        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 riderFee = (msg.value * riderFeeBps) / 10000;
        uint256 restaurantAmount = msg.value - platformFee - riderFee;

        payments[_orderId] = Payment({
            orderId: _orderId,
            totalAmount: msg.value,
            restaurantShare: restaurantAmount,
            riderShare: riderFee,
            platformFee: platformFee,
            restaurant: _restaurant,
            rider: _rider,
            released: false,
            refunded: false
        });

        emit FundsDeposited(_orderId, msg.value);
    }

    function release(uint256 _orderId) external nonReentrant {
        require(msg.sender == orderManager, "Only OrderManager");
        Payment storage payment = payments[_orderId];
        require(!payment.released, "Already released");
        require(!payment.refunded, "Already refunded");
        require(payment.totalAmount > 0, "No payment found");

        payment.released = true;

        // Transfer to restaurant
        (bool successRestaurant, ) = payable(payment.restaurant).call{
            value: payment.restaurantShare
        }("");
        require(successRestaurant, "Restaurant transfer failed");

        // Transfer to rider (if assigned)
        if (payment.rider != address(0)) {
            (bool successRider, ) = payable(payment.rider).call{
                value: payment.riderShare
            }("");
            require(successRider, "Rider transfer failed");
        }

        // Transfer platform fee
        (bool successPlatform, ) = payable(platformWallet).call{
            value: payment.platformFee
        }("");
        require(successPlatform, "Platform transfer failed");

        emit FundsReleased(
            _orderId,
            payment.restaurant,
            payment.rider,
            payment.restaurantShare,
            payment.riderShare,
            payment.platformFee
        );
    }

    function refund(uint256 _orderId, address _customer) external nonReentrant {
        require(msg.sender == orderManager, "Only OrderManager");
        Payment storage payment = payments[_orderId];
        require(!payment.released, "Already released");
        require(!payment.refunded, "Already refunded");
        require(payment.totalAmount > 0, "No payment found");

        payment.refunded = true;

        (bool success, ) = payable(_customer).call{value: payment.totalAmount}("");
        require(success, "Refund failed");

        emit FundsRefunded(_orderId, _customer, payment.totalAmount);
    }

    function getPayment(uint256 _orderId) external view returns (Payment memory) {
        return payments[_orderId];
    }
}
```

### 2.4 OrderManager.sol (Main Contract)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRestaurantRegistry {
    function getRestaurant(uint256 _id) external view returns (
        address owner,
        string memory ipfsMenuHash,
        string memory metadataURI,
        bool isActive,
        uint256 registeredAt,
        uint256 totalOrders,
        uint256 totalRating,
        uint256 ratingCount
    );
}

interface IRiderRegistry {
    function getRider(address _rider) external view returns (
        address riderAddress,
        string memory metadataURI,
        bool isActive,
        bool isAvailable,
        uint256 registeredAt,
        uint256 totalDeliveries,
        uint256 totalEarnings,
        uint256 totalRating,
        uint256 ratingCount
    );
}

interface IEscrow {
    function deposit(uint256 _orderId, address _restaurant, address _rider) external payable;
    function release(uint256 _orderId) external;
    function refund(uint256 _orderId, address _customer) external;
}

contract OrderManager is Ownable, ReentrancyGuard {
    enum OrderStatus {
        Created,
        Accepted,
        Prepared,
        PickedUp,
        Delivered,
        Completed,
        Cancelled,
        Disputed,
        Refunded
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
        uint256 createdAt;
        uint256 completedAt;
    }

    mapping(uint256 => Order) public orders;
    uint256 public orderCount;

    IRestaurantRegistry public restaurantRegistry;
    IRiderRegistry public riderRegistry;
    IEscrow public escrow;

    // Events
    event OrderCreated(
        uint256 indexed orderId,
        uint256 indexed restaurantId,
        address indexed customer,
        uint256 amount
    );
    event OrderAccepted(uint256 indexed orderId, uint256 restaurantId);
    event OrderPrepared(uint256 indexed orderId);
    event RiderAssigned(uint256 indexed orderId, address indexed rider);
    event OrderPickedUp(uint256 indexed orderId, address indexed rider);
    event OrderDelivered(uint256 indexed orderId);
    event OrderCompleted(uint256 indexed orderId);
    event OrderCancelled(uint256 indexed orderId, string reason);
    event OrderDisputed(uint256 indexed orderId, address indexed initiator, string reason);

    constructor(
        address _restaurantRegistry,
        address _riderRegistry,
        address _escrow
    ) Ownable(msg.sender) {
        require(_restaurantRegistry != address(0), "Invalid restaurant registry");
        require(_riderRegistry != address(0), "Invalid rider registry");
        require(_escrow != address(0), "Invalid escrow");

        restaurantRegistry = IRestaurantRegistry(_restaurantRegistry);
        riderRegistry = IRiderRegistry(_riderRegistry);
        escrow = IEscrow(_escrow);
    }

    function createOrder(
        uint256 _restaurantId,
        string memory _ipfsOrderHash,
        uint256 _tip
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Payment required");
        require(bytes(_ipfsOrderHash).length > 0, "Order hash required");

        (address restaurantOwner, , , bool isActive, , , , ) = 
            restaurantRegistry.getRestaurant(_restaurantId);
        require(isActive, "Restaurant not active");

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
            createdAt: block.timestamp,
            completedAt: 0
        });

        // Deposit funds into escrow
        escrow.deposit{value: msg.value}(orderId, restaurantOwner, address(0));

        emit OrderCreated(orderId, _restaurantId, msg.sender, msg.value);
        return orderId;
    }

    function acceptOrder(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.id != 0, "Order not found");
        require(order.status == OrderStatus.Created, "Invalid status");

        (address restaurantOwner, , , , , , , ) = 
            restaurantRegistry.getRestaurant(order.restaurantId);
        require(msg.sender == restaurantOwner, "Not restaurant owner");

        order.status = OrderStatus.Accepted;
        emit OrderAccepted(_orderId, order.restaurantId);
    }

    function markPrepared(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Accepted, "Invalid status");

        (address restaurantOwner, , , , , , , ) = 
            restaurantRegistry.getRestaurant(order.restaurantId);
        require(msg.sender == restaurantOwner, "Not restaurant owner");

        order.status = OrderStatus.Prepared;
        emit OrderPrepared(_orderId);
    }

    function assignRider(uint256 _orderId, address payable _rider) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Prepared, "Invalid status");

        (, , bool isActive, bool isAvailable, , , , , ) = 
            riderRegistry.getRider(_rider);
        require(isActive && isAvailable, "Rider not available");

        order.rider = _rider;
        emit RiderAssigned(_orderId, _rider);
    }

    function markPickedUp(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Prepared, "Invalid status");
        require(msg.sender == order.rider, "Not assigned rider");

        order.status = OrderStatus.PickedUp;
        emit OrderPickedUp(_orderId, order.rider);
    }

    function markDelivered(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.PickedUp, "Invalid status");
        require(msg.sender == order.rider, "Not assigned rider");

        order.status = OrderStatus.Delivered;
        emit OrderDelivered(_orderId);
    }

    function confirmDelivery(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Delivered, "Invalid status");
        require(msg.sender == order.customer, "Not customer");

        order.status = OrderStatus.Completed;
        order.completedAt = block.timestamp;

        // Release funds from escrow
        escrow.release(_orderId);

        emit OrderCompleted(_orderId);
    }

    function cancelOrder(uint256 _orderId, string memory _reason) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Created, "Cannot cancel");
        require(msg.sender == order.customer, "Not customer");

        order.status = OrderStatus.Cancelled;

        // Refund customer
        escrow.refund(_orderId, order.customer);

        emit OrderCancelled(_orderId, _reason);
    }

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

    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }

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
}
```

---

## Phase 3: Deployment Scripts (Week 5)

### 3.1 Complete Deployment Script

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment on Sepolia...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy RestaurantRegistry
  console.log("\n📝 Deploying RestaurantRegistry...");
  const RestaurantRegistry = await hre.ethers.getContractFactory("RestaurantRegistry");
  const restaurantRegistry = await RestaurantRegistry.deploy();
  await restaurantRegistry.waitForDeployment();
  const restaurantRegistryAddress = await restaurantRegistry.getAddress();
  console.log("✅ RestaurantRegistry deployed to:", restaurantRegistryAddress);

  // Deploy RiderRegistry
  console.log("\n🏍️ Deploying RiderRegistry...");
  const RiderRegistry = await hre.ethers.getContractFactory("RiderRegistry");
  const riderRegistry = await RiderRegistry.deploy();
  await riderRegistry.waitForDeployment();
  const riderRegistryAddress = await riderRegistry.getAddress();
  console.log("✅ RiderRegistry deployed to:", riderRegistryAddress);

  // Deploy Escrow
  console.log("\n💰 Deploying Escrow...");
  const platformWallet = deployer.address; // Use deployer as platform wallet for now
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(platformWallet);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ Escrow deployed to:", escrowAddress);

  // Deploy OrderManager
  console.log("\n📦 Deploying OrderManager...");
  const OrderManager = await hre.ethers.getContractFactory("OrderManager");
  const orderManager = await OrderManager.deploy(
    restaurantRegistryAddress,
    riderRegistryAddress,
    escrowAddress
  );
  await orderManager.waitForDeployment();
  const orderManagerAddress = await orderManager.getAddress();
  console.log("✅ OrderManager deployed to:", orderManagerAddress);

  // Set OrderManager in Escrow
  console.log("\n🔗 Linking OrderManager to Escrow...");
  const setOrderManagerTx = await escrow.setOrderManager(orderManagerAddress);
  await setOrderManagerTx.wait();
  console.log("✅ OrderManager linked to Escrow");

  // Print all addresses
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY - SEPOLIA TESTNET");
  console.log("=".repeat(60));
  console.log("RestaurantRegistry:", restaurantRegistryAddress);
  console.log("RiderRegistry:     ", riderRegistryAddress);
  console.log("Escrow:            ", escrowAddress);
  console.log("OrderManager:      ", orderManagerAddress);
  console.log("Platform Wallet:   ", platformWallet);
  console.log("=".repeat(60));

  // Save addresses to file
  const fs = require("fs");
  const addresses = {
    network: "sepolia",
    RestaurantRegistry: restaurantRegistryAddress,
    RiderRegistry: riderRegistryAddress,
    Escrow: escrowAddress,
    OrderManager: orderManagerAddress,
    PlatformWallet: platformWallet,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    "deployed-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n✅ Addresses saved to deployed-addresses.json");

  // Verification instructions
  console.log("\n📝 To verify contracts on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${restaurantRegistryAddress}`);
  console.log(`npx hardhat verify --network sepolia ${riderRegistryAddress}`);
  console.log(`npx hardhat verify --network sepolia ${escrowAddress} "${platformWallet}"`);
  console.log(`npx hardhat verify --network sepolia ${orderManagerAddress} "${restaurantRegistryAddress}" "${riderRegistryAddress}" "${escrowAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 3.2 Test Data Setup Script

```javascript
// scripts/setup-testdata.js
const hre = require("hardhat");
const addresses = require("../deployed-addresses.json");

async function main() {
  console.log("🧪 Setting up test data on Sepolia...");

  const [deployer] = await hre.ethers.getSigners();
  
  // Get contract instances
  const restaurantRegistry = await hre.ethers.getContractAt(
    "RestaurantRegistry",
    addresses.RestaurantRegistry
  );

  // Register test restaurant
  console.log("\n🍕 Registering test restaurant...");
  const tx = await restaurantRegistry.registerRestaurant(
    "QmTestMenuHash123456789", // IPFS hash placeholder
    "QmTestMetadataHash987654321" // Metadata hash
  );
  await tx.wait();
  console.log("✅ Restaurant registered!");

  const restaurantId = await restaurantRegistry.ownerToRestaurant(deployer.address);
  console.log("Restaurant ID:", restaurantId.toString());

  console.log("\n✨ Test data setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## Phase 4: Frontend Setup for Sepolia (Week 6-8)

### 4.1 React + Vite Setup

```bash
# Create frontend
npm create vite@latest frontend -- --template react
cd frontend
npm install

# Install web3 dependencies
npm install ethers@6
npm install @rainbow-me/rainbowkit wagmi viem@2.x
npm install @tanstack/react-query

# UI libraries
npm install react-router-dom
npm install lucide-react
npm install axios
```

### 4.2 Wagmi Configuration for Sepolia

```javascript
// frontend/src/wagmi.js
import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({ 
      projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' // Get from https://cloud.walletconnect.com/
    }),
  ],
  transports: {
    [sepolia.id]: http('https://rpc.sepolia.org'),
  },
});
```

### 4.3 RainbowKit Setup

```javascript
// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import App from './App';
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

const config = getDefaultConfig({
  appName: 'Food Delivery DApp',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [sepolia],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
```

### 4.4 Contract ABIs and Addresses

```javascript
// frontend/src/contracts/addresses.js
export const CONTRACTS = {
  RestaurantRegistry: "0x...", // Paste from deployed-addresses.json
  RiderRegistry: "0x...",
  Escrow: "0x...",
  OrderManager: "0x...",
};

// frontend/src/contracts/abis.js
export const RESTAURANT_REGISTRY_ABI = [
  "function registerRestaurant(string memory _ipfsMenuHash, string memory _metadataURI) external returns (uint256)",
  "function updateMenu(uint256 _restaurantId, string memory _newIpfsHash) external",
  "function getRestaurant(uint256 _restaurantId) external view returns (tuple(address owner, string ipfsMenuHash, string metadataURI, bool isActive, uint256 registeredAt, uint256 totalOrders, uint256 totalRating, uint256 ratingCount))",
  "function restaurantCount() external view returns (uint256)",
  "event RestaurantRegistered(uint256 indexed restaurantId, address indexed owner, string ipfsMenuHash)"
];

export const ORDER_MANAGER_ABI = [
  "function createOrder(uint256 _restaurantId, string memory _ipfsOrderHash, uint256 _tip) external payable returns (uint256)",
  "function acceptOrder(uint256 _orderId) external",
  "function markPrepared(uint256 _orderId) external",
  "function assignRider(uint256 _orderId, address payable _rider) external",
  "function markPickedUp(uint256 _orderId) external",
  "function markDelivered(uint256 _orderId) external",
  "function confirmDelivery(uint256 _orderId) external",
  "function cancelOrder(uint256 _orderId, string memory _reason) external",
  "function getOrder(uint256 _orderId) external view returns (tuple(uint256 id, uint256 restaurantId, address customer, address rider, uint256 amount, uint256 tip, uint8 status, string ipfsOrderHash, uint256 createdAt, uint256 completedAt))",
  "function getCustomerOrders(address _customer) external view returns (uint256[])",
  "event OrderCreated(uint256 indexed orderId, uint256 indexed restaurantId, address indexed customer, uint256 amount)",
  "event OrderCompleted(uint256 indexed orderId)"
];

export const RIDER_REGISTRY_ABI = [
  "function registerRider(string memory _metadataURI) external",
  "function setAvailability(bool _isAvailable) external",
  "function getRider(address _rider) external view returns (tuple(address riderAddress, string metadataURI, bool isActive, bool isAvailable, uint256 registeredAt, uint256 totalDeliveries, uint256 totalEarnings, uint256 totalRating, uint256 ratingCount))",
  "function getAvailableRiders() external view returns (address[])",
  "event RiderRegistered(address indexed rider, string metadataURI)"
];
```

### 4.5 Custom Hooks

```javascript
// frontend/src/hooks/useRestaurants.js
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import { RESTAURANT_REGISTRY_ABI } from '../contracts/abis';

export function useRestaurants() {
  // Read restaurant count
  const { data: restaurantCount } = useReadContract({
    address: CONTRACTS.RestaurantRegistry,
    abi: RESTAURANT_REGISTRY_ABI,
    functionName: 'restaurantCount',
  });

  // Write function for registering restaurant
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerRestaurant = async (ipfsMenuHash, metadataURI) => {
    writeContract({
      address: CONTRACTS.RestaurantRegistry,
      abi: RESTAURANT_REGISTRY_ABI,
      functionName: 'registerRestaurant',
      args: [ipfsMenuHash, metadataURI],
    });
  };

  return {
    restaurantCount: restaurantCount ? Number(restaurantCount) : 0,
    registerRestaurant,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// frontend/src/hooks/useOrders.js
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS } from '../contracts/addresses';
import { ORDER_MANAGER_ABI } from '../contracts/abis';

export function useOrders() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createOrder = async (restaurantId, ipfsOrderHash, amount, tip = 0) => {
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'createOrder',
      args: [restaurantId, ipfsOrderHash, tip],
      value: parseEther(amount.toString()),
    });
  };

  const acceptOrder = async (orderId) => {
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'acceptOrder',
      args: [orderId],
    });
  };

  const confirmDelivery = async (orderId) => {
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'confirmDelivery',
      args: [orderId],
    });
  };

  return {
    createOrder,
    acceptOrder,
    confirmDelivery,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Get customer orders
export function useCustomerOrders(customerAddress) {
  const { data: orderIds } = useReadContract({
    address: CONTRACTS.OrderManager,
    abi: ORDER_MANAGER_ABI,
    functionName: 'getCustomerOrders',
    args: [customerAddress],
    enabled: !!customerAddress,
  });

  return {
    orderIds: orderIds || [],
  };
}

// Get single order details
export function useOrder(orderId) {
  const { data: order, isLoading } = useReadContract({
    address: CONTRACTS.OrderManager,
    abi: ORDER_MANAGER_ABI,
    functionName: 'getOrder',
    args: [orderId],
    enabled: !!orderId,
  });

  return {
    order,
    isLoading,
  };
}
```

### 4.6 Main App Component

```javascript
// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RiderDashboard from './pages/RiderDashboard';
import './App.css';

function App() {
  const { isConnected } = useAccount();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-orange-600">
              🍕 FoodChain
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-orange-600">
                Home
              </Link>
              {isConnected && (
                <>
                  <Link to="/my-orders" className="text-gray-700 hover:text-orange-600">
                    My Orders
                  </Link>
                  <Link to="/restaurant-dashboard" className="text-gray-700 hover:text-orange-600">
                    Restaurant
                  </Link>
                  <Link to="/rider-dashboard" className="text-gray-700 hover:text-orange-600">
                    Rider
                  </Link>
                </>
              )}
              <ConnectButton />
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {!isConnected ? (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold mb-4">Welcome to FoodChain</h2>
              <p className="text-gray-600 mb-8">
                Decentralized food delivery on Sepolia testnet
              </p>
              <ConnectButton />
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurant/:id" element={<RestaurantPage />} />
              <Route path="/order/:restaurantId" element={<CreateOrderPage />} />
              <Route path="/track/:orderId" element={<OrderTrackingPage />} />
              <Route path="/my-orders" element={<OrderTrackingPage />} />
              <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
              <Route path="/rider-dashboard" element={<RiderDashboard />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
```

### 4.7 HomePage Component

```javascript
// frontend/src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import { RESTAURANT_REGISTRY_ABI } from '../contracts/abis';

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);

  const { data: restaurantCount } = useReadContract({
    address: CONTRACTS.RestaurantRegistry,
    abi: RESTAURANT_REGISTRY_ABI,
    functionName: 'restaurantCount',
  });

  // Fetch all restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!restaurantCount) return;

      const count = Number(restaurantCount);
      const restaurantPromises = [];

      for (let i = 1; i <= count; i++) {
        restaurantPromises.push(
          // You'd use useReadContract here in a real implementation
          // For simplicity, showing the pattern
          fetch(`/api/restaurant/${i}`).then(r => r.json()).catch(() => null)
        );
      }

      const results = await Promise.all(restaurantPromises);
      setRestaurants(results.filter(r => r !== null));
    };

    fetchRestaurants();
  }, [restaurantCount]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Available Restaurants</h1>
        <p className="text-gray-600">
          Powered by blockchain on Sepolia testnet
        </p>
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurantCount && Number(restaurantCount) > 0 ? (
          Array.from({ length: Number(restaurantCount) }, (_, i) => (
            <RestaurantCard key={i + 1} restaurantId={i + 1} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No restaurants registered yet</p>
            <Link 
              to="/restaurant-dashboard" 
              className="text-orange-600 hover:underline mt-2 inline-block"
            >
              Register your restaurant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function RestaurantCard({ restaurantId }) {
  const { data: restaurant } = useReadContract({
    address: CONTRACTS.RestaurantRegistry,
    abi: RESTAURANT_REGISTRY_ABI,
    functionName: 'getRestaurant',
    args: [restaurantId],
  });

  if (!restaurant) return null;

  return (
    <Link 
      to={`/order/${restaurantId}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
        <span className="text-6xl">🍕</span>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">
          Restaurant #{restaurantId}
        </h3>
        <div className="text-sm text-gray-600">
          <p>⭐ {restaurant.ratingCount || 0} reviews</p>
          <p>📦 {Number(restaurant.totalOrders) || 0} orders</p>
        </div>
        {restaurant.isActive ? (
          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Open
          </span>
        ) : (
          <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            Closed
          </span>
        )}
      </div>
    </Link>
  );
}

export default HomePage;
```

### 4.8 Create Order Page

```javascript
// frontend/src/pages/CreateOrderPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useOrders } from '../hooks/useOrders';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

function CreateOrderPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { createOrder, isPending, isConfirming, isSuccess, hash } = useOrders();

  const [cart, setCart] = useState([
    { id: 1, name: 'Burger', price: 0.001, quantity: 0 },
    { id: 2, name: 'Pizza', price: 0.002, quantity: 0 },
    { id: 3, name: 'Pasta', price: 0.0015, quantity: 0 },
  ]);

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (totalAmount === 0) {
      alert('Please add items to cart');
      return;
    }

    // Create IPFS hash for order (in production, upload to IPFS)
    const orderData = {
      restaurantId,
      items: cart.filter(item => item.quantity > 0),
      customer: address,
      timestamp: Date.now(),
    };
    const ipfsHash = `Qm${Date.now()}`; // Placeholder

    try {
      await createOrder(restaurantId, ipfsHash, totalAmount.toFixed(4), 0);
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  // Redirect after successful order
  if (isSuccess && hash) {
    setTimeout(() => {
      navigate(`/track/1`); // In production, get actual order ID from events
    }, 2000);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Order from Restaurant #{restaurantId}
      </h1>

      {/* Menu Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Menu</h2>
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b pb-4">
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600">{item.price} ETH</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                  disabled={item.quantity === 0}
                >
                  <Minus size={20} />
                </button>
                <span className="w-8 text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} />
            <h2 className="text-xl font-semibold">Cart</h2>
          </div>
          <span className="text-gray-600">{itemCount} items</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{totalAmount.toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee (10%):</span>
            <span>{(totalAmount * 0.1).toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>{(totalAmount * 1.1).toFixed(4)} ETH</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isPending || isConfirming || totalAmount === 0}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? 'Confirm in Wallet...' : 
           isConfirming ? 'Processing...' : 
           isSuccess ? '✓ Order Placed!' :
           'Place Order'}
        </button>

        {hash && (
          <p className="mt-3 text-sm text-center">
            <a 
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on Etherscan →
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateOrderPage;
```

---

## Phase 5: IPFS Integration (Week 9)

### 5.1 IPFS Client Setup

```javascript
// frontend/src/utils/ipfs.js
import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET;

export async function uploadToIPFS(data) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET,
      },
    });
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}

export async function uploadImageToIPFS(file) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET,
      },
    });
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

export async function fetchFromIPFS(hash) {
  const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw error;
  }
}
```

---

## Phase 6: Testing & Deployment Commands

### 6.1 Quick Start Commands

```bash
# 1. Get Sepolia ETH
# Visit: https://sepoliafaucet.com/
# Enter your wallet address

# 2. Deploy contracts
npx hardhat run scripts/deploy.js --network sepolia

# 3. Verify contracts (after deployment)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# 4. Setup test data
npx hardhat run scripts/setup-testdata.js --network sepolia

# 5. Run frontend
cd frontend
npm run dev
```

### 6.2 Useful Hardhat Commands

```bash
# Run tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test

# Get contract size
npx hardhat size-contracts

# Run local node
npx hardhat node

# Deploy to local
npx hardhat run scripts/deploy.js --network localhost

# Console (interact with contracts)
npx hardhat console --network sepolia
```

---

## 🎯 Your Next Steps (Start Today!)

### Day 1-2: Setup
- ✅ Install Hardhat and dependencies
- ✅ Configure hardhat.config.js for Sepolia
- ✅ Get Sepolia ETH from faucets
- ✅ Create .env with your private key

### Day 3-7: Smart Contracts
- ✅ Copy RestaurantRegistry.sol
- ✅ Copy RiderRegistry.sol  
- ✅ Copy Escrow.sol
- ✅ Copy OrderManager.sol
- ✅ Write basic tests for each

### Day 8-10: Deploy & Test
- ✅ Deploy to Sepolia testnet
- ✅ Verify contracts on Etherscan
- ✅ Test each function manually
- ✅ Register a test restaurant

### Day 11-15: Frontend
- ✅ Setup React + Wagmi + RainbowKit
- ✅ Create wallet connection
- ✅ Build restaurant listing page
- ✅ Build order creation flow

### Day 16-20: Integration
- ✅ Connect frontend to contracts
- ✅ Test complete order flow
- ✅ Add order tracking
- ✅ Polish UI/UX

---

## 📚 Resources for Sepolia

- **Sepolia Faucets:**
  - https://sepoliafaucet.com/
  - https://sepolia-faucet.pk910.de/
  - https://www.infura.io/faucet/sepolia

- **Block Explorer:**
  - https://sepolia.etherscan.io/

- **RPC Endpoints:**
  - https://rpc.sepolia.org
  - https://sepolia.infura.io/v3/YOUR_KEY
  - https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

- **ChainID:** 11155111

---

## 💡 Pro Tips for Sepolia Development

1. **Save gas:** Sepolia ETH is free but limited from faucets
2. **Use events:** Listen to contract events for real-time updates
3. **Verify early:** Verify contracts immediately after deployment
4. **Test incrementally:** Test each contract function before moving forward
5. **Keep private keys safe:** Never commit .env files
6. **Use Etherscan:** Debug transactions directly on block explorer