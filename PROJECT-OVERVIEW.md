# 🍔 Blockchain Food Delivery System - Complete Project Overview

> **Last Updated:** November 16, 2025  
> **Status:** Deployed on Sepolia Testnet  
> **Network:** Sepolia (Chain ID: 11155111)

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Deployed Contracts](#deployed-contracts)
3. [Contract Relationships](#contract-relationships)
4. [Recent Fixes & Updates](#recent-fixes--updates)
5. [How to Use the System](#how-to-use-the-system)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ System Architecture

### **Overview**
A decentralized food delivery platform where:
- **Customers** place orders and pay in ETH
- **Restaurants** receive orders, prepare food, and earn revenue
- **Riders** deliver orders and earn delivery fees
- **Smart contracts** handle payments, escrow, and role management

### **Key Features**
✅ Role-based access control (one wallet = one role)  
✅ Escrow system for secure payments  
✅ IPFS integration for menu & order data  
✅ Automated payment distribution (Restaurant 80%, Rider 10%, Platform 10%)  
✅ Rating system for restaurants and riders  

---

## 📝 Deployed Contracts

### **1. RoleManager** 🔐
**Address:** `0x06Dd0bbbC84605cec8ffDEa97168e393510430c2`

**Purpose:** Central role management and access control

**Key Functions:**
- `getUserRole(address)` - Check wallet's role (Admin/Restaurant/Rider/Customer/None)
- `canPlaceOrder(address)` - Verify if wallet can place orders
- `authorizeContract(address)` - Give permission to contracts to assign roles
- `assignCustomerRole(address)` - Assign customer role (only authorized contracts)
- `assignRestaurantRole(address)` - Assign restaurant role (only authorized contracts)
- `assignRiderRole(address)` - Assign rider role (only authorized contracts)

**Important Rules:**
- ⚠️ **One wallet = One role only** (strict isolation)
- Admin wallet (deployer) cannot register as any role
- Once a role is assigned, it cannot be changed (permanent)
- Contracts must be authorized to assign roles

**Authorized Contracts:**
- ✅ RestaurantRegistry (can assign restaurant roles)
- ✅ OrderManager (can assign customer roles) - **⚠️ NEEDS AUTHORIZATION!**

---

### **2. RestaurantRegistry** 🍕
**Address:** `0xc2C57712c648553d28d58e73Edb7E5cBa6b7db3B`

**Purpose:** Manage restaurant registrations and profiles

**Key Functions:**
- `registerRestaurant(name, description, ipfsMenuHash, metadataURI, physicalAddress)` - Register new restaurant
- `updateMenu(restaurantId, newIpfsHash)` - Update menu on IPFS
- `toggleStatus(restaurantId)` - Activate/deactivate restaurant
- `getRestaurant(restaurantId)` - Get restaurant details
- `incrementOrders(restaurantId)` - Track total orders (called by OrderManager)
- `addRating(restaurantId, rating)` - Add rating (called by OrderManager)

**Data Structure:**
```solidity
struct Restaurant {
    address owner;
    string name;
    string description;
    string ipfsMenuHash;      // Menu stored on IPFS
    string metadataURI;       // Additional metadata
    string physicalAddress;
    bool isActive;
    uint256 registeredAt;
    uint256 totalOrders;
    uint256 totalRating;
    uint256 ratingCount;
}
```

---

### **3. RiderRegistry** 🏍️
**Address:** `0xDCe2E4dBD7978A46945fEf7055BbE9f3bD04a739`

**Purpose:** Manage delivery rider registrations and assignments

**Key Functions:**
- `registerRider(name, phoneNumber, vehicleType, metadataURI)` - Register as rider
- `toggleAvailability()` - Go online/offline
- `isRiderAvailable(address)` - Check if rider is available for orders
- `assignToOrder(address, orderId)` - Assign rider to order (called by OrderManager)
- `completeDelivery(address, amount)` - Update stats after delivery (called by OrderManager)
- `addRating(address, rating)` - Add rating (called by OrderManager)
- `getRider(address)` - Get rider details

**Data Structure:**
```solidity
struct Rider {
    address riderAddress;
    string name;
    string phoneNumber;
    string vehicleType;        // "bike", "motorcycle", "car"
    string metadataURI;
    bool isActive;
    bool isAvailable;          // Online/offline status
    uint256 registeredAt;
    uint256 totalDeliveries;
    uint256 totalEarnings;
    uint256 totalRating;
    uint256 ratingCount;
    uint256 currentOrderId;    // Currently assigned order
}
```

---

### **4. Escrow** 💰
**Address:** `0x635dA77a7d0d5031dbDAd6C5918d801be451eA54`

**Purpose:** Hold and distribute payments securely

**Key Functions:**
- `deposit(orderId, restaurant, rider)` - Lock payment (called by OrderManager)
- `release(orderId)` - Distribute payment after successful delivery (called by OrderManager)
- `refund(orderId, customer)` - Refund customer if order cancelled (called by OrderManager)
- `getBalance(orderId)` - Check escrowed amount

**Payment Distribution:**
- **Restaurant:** 80% of order amount
- **Rider:** 10% of order amount
- **Platform:** 10% of order amount

**Important Notes:**
- Only OrderManager can call deposit/release/refund
- Funds are locked until order is completed or cancelled
- Platform fees go to `platformWallet` address

---

### **5. OrderManager** 📦
**Address:** `0xb5108e097a10055527466B06793f6E0D85528C75`

**Purpose:** Central hub for order lifecycle management

**Key Functions:**
- `createOrder(restaurantId, ipfsOrderHash, deliveryAddress, customerPhone, tip)` - Place order (payable)
- `acceptOrder(orderId)` - Restaurant accepts order
- `markPrepared(orderId)` - Restaurant marks food ready
- `assignRider(orderId, riderAddress)` - Assign rider to order
- `markPickedUp(orderId)` - Rider confirms pickup
- `markDelivered(orderId)` - Rider confirms delivery
- `confirmDelivery(orderId, restaurantRating, riderRating)` - Customer confirms & rates
- `cancelOrder(orderId, reason)` - Cancel order (only before accepted)
- `getOrder(orderId)` - Get order details
- `getCustomerOrders(address)` - Get all orders for customer
- `getRestaurantOrders(restaurantId)` - Get all orders for restaurant
- `getOrdersReadyForPickup()` - Get orders ready for riders (status = Prepared)

**Order Status Flow:**
```
Created (0)
   ↓
Accepted (1) ← Restaurant accepts
   ↓
Prepared (2) ← Restaurant marks ready (RIDERS CAN SEE THIS)
   ↓
PickedUp (3) ← Rider picks up food
   ↓
Delivered (4) ← Rider delivers to customer
   ↓
Completed (5) ← Customer confirms (PAYMENT RELEASED)
```

**Alternative Paths:**
- `Created → Cancelled` (customer cancels before acceptance)
- `Any Status → Disputed` (dispute raised)
- `Disputed → Refunded` (admin resolves dispute)

**Data Structure:**
```solidity
struct Order {
    uint256 id;
    uint256 restaurantId;
    address customer;
    address payable rider;
    uint256 amount;            // Total payment in wei
    uint256 tip;               // Tip amount
    OrderStatus status;
    string ipfsOrderHash;      // Order details on IPFS
    string deliveryAddress;    // Customer address
    string customerPhone;      // Customer contact
    uint256 createdAt;
    uint256 acceptedAt;
    uint256 preparedAt;
    uint256 pickedUpAt;
    uint256 deliveredAt;
    uint256 completedAt;
    uint256 restaurantRating;  // 1-5 stars
    uint256 riderRating;       // 1-5 stars
}
```

---

## 🔗 Contract Relationships

### **Dependency Graph**

```
┌─────────────────┐
│  RoleManager    │◄─────────────┐
│  (Central Auth) │              │
└────────┬────────┘              │
         │                       │
         │ checks roles          │ assigns roles
         │                       │
    ┌────▼──────────────────┐    │
    │                       │    │
    │   OrderManager        │────┘
    │   (Main Contract)     │
    │                       │
    └┬──────┬──────┬────────┘
     │      │      │
     │      │      └──────────┐
     │      │                 │
┌────▼───┐  │           ┌────▼──────┐
│ Escrow │  │           │Restaurant │
│(Payments)│ │           │ Registry  │
└────────┘  │           └───────────┘
            │
      ┌─────▼──────┐
      │   Rider    │
      │  Registry  │
      └────────────┘
```

### **How They Interact**

1. **Customer Places Order:**
   - Customer → OrderManager.createOrder() [sends ETH]
   - OrderManager → RoleManager.canPlaceOrder() [checks permission]
   - OrderManager → RoleManager.assignCustomerRole() [auto-assigns if new]
   - OrderManager → RestaurantRegistry.getRestaurant() [verifies active]
   - OrderManager → Escrow.deposit() [locks payment]

2. **Restaurant Accepts:**
   - Restaurant → OrderManager.acceptOrder()
   - OrderManager → RestaurantRegistry.getRestaurantOwner() [verifies ownership]

3. **Restaurant Prepares:**
   - Restaurant → OrderManager.markPrepared()
   - Status changes to "Prepared" → **Riders can now see this order**

4. **Rider Picks Up:**
   - Rider → OrderManager.assignRider()
   - OrderManager → RiderRegistry.isRiderAvailable() [checks availability]
   - OrderManager → RiderRegistry.assignToOrder() [marks rider busy]
   - Rider → OrderManager.markPickedUp()

5. **Rider Delivers:**
   - Rider → OrderManager.markDelivered()

6. **Customer Confirms:**
   - Customer → OrderManager.confirmDelivery()
   - OrderManager → RestaurantRegistry.addRating()
   - OrderManager → RiderRegistry.addRating()
   - OrderManager → RestaurantRegistry.incrementOrders()
   - OrderManager → RiderRegistry.completeDelivery()
   - OrderManager → Escrow.release() [**PAYMENT DISTRIBUTED**]

---

## 🔧 Recent Fixes & Updates

### **Issue #1: Order Creation Gas Fee (0.0315 ETH)** ❌→✅
**Problem:** High gas fee and transaction failing when customers place orders

**Root Cause:** 
1. ABI mismatch - Frontend was sending 3 parameters, contract expected 5
2. OrderManager not authorized to assign customer roles

**Fix:**
1. ✅ Updated `ORDER_MANAGER_ABI` in `frontend/src/contracts/abis.js`
   - Added missing parameters: `_deliveryAddress`, `_customerPhone`
2. ✅ Updated `useCreateOrder` hook to pass all 5 parameters
3. ✅ Added phone number input field to CreateOrderPage
4. ⚠️ **STILL NEEDS:** Authorize OrderManager in RoleManager (see below)

**Files Changed:**
- `frontend/src/contracts/abis.js` (line 273-285)
- `frontend/src/hooks/useOrders.js` (line 64-86)
- `frontend/src/pages/CreateOrderPage.jsx` (added phone field)
- `frontend/src/utils/ipfs.js` (added customerPhone to order data)

---

### **Issue #2: OrderManager Not Authorized** ⚠️ CRITICAL
**Problem:** OrderManager can't assign customer roles automatically

**Solution:** Run this ONE TIME in Remix:

```solidity
// Go to RoleManager contract at:
// 0x06Dd0bbbC84605cec8ffDEa97168e393510430c2

// Call this function:
authorizeContract("0xb5108e097a10055527466B06793f6E0D85528C75")
```

**What this does:**
- Gives OrderManager permission to call `assignCustomerRole()`
- Allows automatic customer registration on first order
- **This is a permanent fix** - only needs to be done once
- All future customers will work without issues

**Status:** ⚠️ **NEEDS TO BE DONE**

---

### **Issue #3: IPFS Menu Loading** ✅
**Problem:** Menus not loading from IPFS

**Fix:** 
- Added localStorage fallback for development
- Uses Pinata API keys if available
- Graceful error handling with user-friendly messages

**Files Changed:**
- `frontend/src/utils/ipfs.js`

---

### **Issue #4: Role Isolation** ℹ️
**Design Decision:** One wallet = one role (by design)

**How it works:**
- Wallet A registers restaurant → Permanently "Restaurant" role
- Wallet B places order → Automatically gets "Customer" role
- Wallet C registers as rider → Permanently "Rider" role

**For Testing:**
Use different MetaMask accounts:
- Account 1: Restaurant operations
- Account 2: Customer operations  
- Account 3: Rider operations

**Check your role:** Open `frontend/check-role.html` in browser

---

## 🎯 How to Use the System

### **For Customers**

1. **Browse Restaurants**
   - Navigate to homepage
   - View active restaurants

2. **Place Order**
   - Click on restaurant
   - Add items to cart
   - Enter delivery address
   - Enter phone number
   - Confirm order (MetaMask will ask for payment)

3. **Track Order**
   - Go to "My Orders"
   - See real-time status updates

4. **Confirm Delivery**
   - When rider delivers, click "Confirm Delivery"
   - Rate restaurant and rider (optional)
   - Payment automatically distributed

---

### **For Restaurants**

1. **Register**
   - Click "Register Restaurant"
   - Fill in details (name, description, address)
   - Upload menu to IPFS
   - Confirm transaction

2. **Manage Orders**
   - View incoming orders
   - Accept orders
   - Mark as "Prepared" when food is ready
   - Assign riders (optional - riders can self-assign)

3. **Update Menu**
   - Go to dashboard
   - Update menu items
   - Save to IPFS
   - Update on blockchain

---

### **For Riders**

1. **Register**
   - Click "Register as Rider"
   - Fill in details (name, phone, vehicle type)
   - Confirm transaction

2. **Accept Deliveries**
   - Toggle "Available" status
   - View orders ready for pickup (status = Prepared)
   - Accept order
   - Mark as "Picked Up" when you get the food

3. **Complete Delivery**
   - Deliver to customer
   - Mark as "Delivered"
   - Wait for customer confirmation
   - Receive payment automatically

---

## 🐛 Troubleshooting

### **"This transaction is likely to fail" + High Gas Fee**

**Cause:** Contract function will revert

**Solutions:**
1. Check you're using correct wallet (customer wallet for orders)
2. Ensure OrderManager is authorized (see Issue #2 above)
3. Verify restaurant is active
4. Check you have enough ETH for order + gas

---

### **"Cannot place order: Address has incompatible role"**

**Cause:** Wallet has Restaurant/Rider role, not Customer

**Solution:** Use a different MetaMask account for customer operations

**Check your role:** Open `frontend/check-role.html`

---

### **"Restaurant not active"**

**Cause:** Restaurant has been deactivated

**Solution:** Restaurant owner must call `toggleStatus()` to reactivate

---

### **MetaMask Not Opening When Placing Order**

**Causes:**
1. Wallet not connected
2. Wrong network (must be Sepolia)
3. ABI mismatch (should be fixed now)

**Solutions:**
1. Connect wallet
2. Switch to Sepolia testnet
3. Refresh page

---

### **Menu Not Loading**

**Cause:** IPFS hash invalid or IPFS gateway slow

**Solution:** 
- System automatically falls back to localStorage
- Restaurant can re-upload menu using Menu Management
- Wait a few seconds for IPFS gateway to respond

---

## 📊 System Statistics

**Blockchain:** Ethereum Sepolia Testnet  
**Total Contracts:** 5  
**Total Functions:** 50+  
**Gas Optimized:** Yes (with optimizer + viaIR)  
**Security:** ReentrancyGuard, Role-Based Access Control  
**Storage:** IPFS for off-chain data  

---

## 🔐 Security Features

✅ **Role-Based Access Control** - RoleManager enforces strict permissions  
✅ **Reentrancy Protection** - All critical functions use ReentrancyGuard  
✅ **Escrow System** - Funds locked until delivery confirmed  
✅ **Owner Controls** - Only authorized wallets can perform admin actions  
✅ **Input Validation** - All functions validate parameters  

---

## 📞 Quick Reference

### **Contract Addresses (Sepolia)**
```
RoleManager:         0x06Dd0bbbC84605cec8ffDEa97168e393510430c2
RestaurantRegistry:  0xc2C57712c648553d28d58e73Edb7E5cBa6b7db3B
RiderRegistry:       0xDCe2E4dBD7978A46945fEf7055BbE9f3bD04a739
Escrow:              0x635dA77a7d0d5031dbDAd6C5918d801be451eA54
OrderManager:        0xb5108e097a10055527466B06793f6E0D85528C75
```

### **Network Info**
```
Chain ID:    11155111
RPC URL:     https://rpc.sepolia.org
Explorer:    https://sepolia.etherscan.io
Faucet:      https://www.alchemy.com/faucets/ethereum-sepolia
```

### **Frontend Configuration**
File: `frontend/src/contracts/addresses.js`

---

## 🚀 Next Steps

### **Immediate Actions Required:**

1. ⚠️ **Authorize OrderManager** (CRITICAL)
   ```solidity
   // In Remix, on RoleManager:
   authorizeContract("0xb5108e097a10055527466B06793f6E0D85528C75")
   ```

2. ✅ **Test Full Order Flow**
   - Use 3 different wallets
   - Test: Register → Order → Accept → Prepare → Pickup → Deliver → Confirm

3. ✅ **Verify Payment Distribution**
   - Check restaurant receives 80%
   - Check rider receives 10%
   - Check platform receives 10%

### **Future Enhancements:**

- [ ] Add dispute resolution UI
- [ ] Implement order history filtering
- [ ] Add real-time notifications
- [ ] Integrate more IPFS gateways
- [ ] Add order cancellation reasons
- [ ] Implement rider location tracking
- [ ] Add multi-restaurant cart
- [ ] Implement promotional codes

---

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated:** November 16, 2025  
**Maintainer:** Project Team  
**Documentation:** This file + contracts/README.md  
**Support:** Check troubleshooting section or review contract comments

