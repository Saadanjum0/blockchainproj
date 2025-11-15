# 🔐 Role Isolation System - Implementation Guide

## ✨ What Was Implemented

Your food delivery DApp now has **STRICT ROLE ISOLATION** - each MetaMask wallet can only be ONE role!

---

## 🎯 Key Features

### ✅ Role Isolation
- **One Wallet = One Role ONLY**
- No wallet can be Restaurant + Rider + Customer simultaneously
- Admin wallet (deployer) cannot register for any operational role

### ✅ Smart Contract Enforcement
- Role checks at contract level
- Cannot bypass through UI manipulation
- Blockchain-enforced security

### ✅ Complete Order Flow
- Customer delivery address stored on-chain
- Riders see only "Prepared" orders (ready for pickup)
- Location information available to authorized parties only
- Ratings system for restaurants and riders
- Dispute resolution by admin

---

## 📋 Contracts Updated

### 1. **RoleManager.sol** (NEW!)
**Central role management system**

**Functions:**
```solidity
- assignRestaurantRole(address) // Called by RestaurantRegistry
- assignRiderRole(address)      // Called by RiderRegistry
- assignCustomerRole(address)   // Called by OrderManager
- getUserRole(address) → string // Returns: "Restaurant", "Rider", "Customer", "Admin", or "None"
- hasNoRole(address) → bool     // Check if address can register
- canRegisterAsRestaurant(address) → bool
- canRegisterAsRider(address) → bool
- canPlaceOrder(address) → bool
```

**Role Mappings:**
```solidity
mapping(address => bool) public isRestaurant;
mapping(address => bool) public isRider;
mapping(address => bool) public isCustomer;
mapping(address => bool) public isAdmin;
```

---

### 2. **RestaurantRegistry.sol** (UPDATED)
**Added:**
- ✅ Role Manager integration
- ✅ Role check before registration
- ✅ Restaurant name, description, physical address
- ✅ Update restaurant info function
- ✅ Rating system integration
- ✅ Active restaurants count

**Constructor Changed:**
```solidity
// OLD:
constructor() Ownable(msg.sender) {}

// NEW:
constructor(address _roleManager) Ownable(msg.sender) {
    roleManager = IRoleManager(_roleManager);
}
```

**Registration Check:**
```solidity
function registerRestaurant(...) {
    require(roleManager.canRegisterAsRestaurant(msg.sender), 
        "Cannot register: Address already has another role");
    // ... rest of registration
    roleManager.assignRestaurantRole(msg.sender);
}
```

---

### 3. **RiderRegistry.sol** (UPDATED)
**Added:**
- ✅ Role Manager integration
- ✅ Role check before registration
- ✅ Rider name, phone, vehicle type
- ✅ Current order tracking (one delivery at a time)
- ✅ Cannot go available while on delivery
- ✅ Rating system integration
- ✅ Automatic availability management

**Key Changes:**
```solidity
struct Rider {
    // ... existing fields
    string name;              // NEW
    string phoneNumber;       // NEW
    string vehicleType;       // NEW
    uint256 currentOrderId;   // NEW - tracks active delivery
}
```

**Smart Availability:**
```solidity
function setAvailability(bool _isAvailable) {
    // Cannot go available if currently on delivery
    if (_isAvailable && riders[msg.sender].currentOrderId != 0) {
        revert("Complete current delivery first");
    }
    // ...
}
```

---

### 4. **OrderManager.sol** (MAJOR UPDATE)
**Added:**
- ✅ Role Manager integration
- ✅ Customer delivery address (STORED ON-CHAIN)
- ✅ Customer phone number
- ✅ Auto-assign customer role on first order
- ✅ Timestamp for each order status change
- ✅ Rating system (restaurant + rider)
- ✅ getOrdersReadyForPickup() - WHAT RIDERS SEE!
- ✅ getOrderDeliveryAddress() - with authorization check
- ✅ Dispute resolution by admin

**Critical New Fields:**
```solidity
struct Order {
    // ... existing fields
    string deliveryAddress;     // NEW - Customer address
    string customerPhone;        // NEW - Contact info
    uint256 acceptedAt;         // NEW - Timestamps
    uint256 preparedAt;         // NEW
    uint256 pickedUpAt;         // NEW
    uint256 deliveredAt;        // NEW
    uint256 restaurantRating;   // NEW - 1-5 stars
    uint256 riderRating;        // NEW - 1-5 stars
}
```

**Role-Based Order Creation:**
```solidity
function createOrder(..., string memory _deliveryAddress, ...) {
    // Check if can place order
    require(roleManager.canPlaceOrder(msg.sender), 
        "Cannot place order: Address has incompatible role");
    
    // Auto-assign customer role if first order
    if (!roleManager.isCustomer(msg.sender)) {
        roleManager.assignCustomerRole(msg.sender);
    }
    // ...
}
```

**Riders See Only Ready Orders:**
```solidity
function getOrdersReadyForPickup() returns (uint256[] memory) {
    // Returns only orders with status = Prepared
    // These are orders that restaurants marked as ready
    // Riders can see delivery address only after assignment
}
```

**Privacy Protection:**
```solidity
function getOrderDeliveryAddress(uint256 _orderId) returns (string memory) {
    // Only customer, rider, restaurant owner, or admin can see address
    require(
        msg.sender == order.customer || 
        msg.sender == order.rider || 
        msg.sender == restaurantOwner ||
        msg.sender == owner(),
        "Not authorized"
    );
    return order.deliveryAddress;
}
```

**Rating System:**
```solidity
function confirmDelivery(
    uint256 _orderId,
    uint256 _restaurantRating,  // 1-5 stars
    uint256 _riderRating         // 1-5 stars
) {
    // Customer confirms delivery and rates
    // Ratings stored on-chain and updated in registries
}
```

---

### 5. **Escrow.sol** (MINOR UPDATE)
**Added:**
- ✅ Better error handling
- ✅ Payment status getter
- ✅ Emergency withdraw function
- ✅ Handles case when no rider assigned

---

## 🚀 Deployment Order (UPDATED)

### Step 1: Deploy RoleManager
```
No constructor arguments
Save address: 0xROLE123...
⚠️ Your deployer wallet is now ADMIN only!
```

### Step 2: Deploy RestaurantRegistry
```
Constructor: roleManagerAddress
Save address: 0xREST456...
```

### Step 3: Deploy RiderRegistry
```
Constructor: roleManagerAddress
Save address: 0xRIDER789...
```

### Step 4: Deploy Escrow
```
Constructor: platformWalletAddress
Save address: 0xESCROW012...
```

### Step 5: Deploy OrderManager
```
Constructor: 
  - restaurantRegistryAddress
  - riderRegistryAddress
  - escrowAddress
  - roleManagerAddress
Save address: 0xORDER345...
```

### Step 6: Link Contracts
```solidity
// 1. Link Escrow to OrderManager
escrow.setOrderManager(orderManagerAddress);

// 2. Transfer ownership of RoleManager to OrderManager
// OR keep RoleManager ownership and grant permissions
roleManager.transferOwnership(orderManagerAddress);
```

---

## 🎨 Frontend Changes

### New Hook: useUserRole
```javascript
import { useUserRole } from './hooks/useUserRole';

function MyComponent() {
  const { role, isLoading } = useUserRole(address);
  // role: "Restaurant", "Rider", "Customer", "Admin", or "None"
}
```

### Role-Based Navigation
**Navigation shows only relevant links based on user role:**
- **Restaurant:** See only "My Restaurant" dashboard
- **Rider:** See only "My Deliveries" dashboard
- **Customer:** See "Browse Restaurants" and "My Orders"
- **Admin:** See everything (view-only)
- **None:** Can choose to register as Restaurant OR Rider (or place order to become customer)

### Route Protection
```javascript
// Restaurant trying to access customer page
<Route 
  path="/order/:restaurantId" 
  element={
    (role === 'Customer' || role === 'None') ? 
    <CreateOrderPage /> : 
    <RoleRestricted userRole={role} requiredRole="Customer" />
  } 
/>
```

### Role Badge
User sees their role in the header:
- 🍕 Restaurant
- 🏍️ Rider
- 👤 Customer
- ⚙️ Admin
- 🆕 New User

---

## 🔄 Complete Order Flow (UPDATED)

### 1. Customer Places Order
```
✅ Customer connects wallet
✅ Role check: Can place order? (None or Customer)
✅ Auto-assigned "Customer" role on first order
✅ Enters delivery address + phone
✅ Creates order with payment
✅ Money goes to Escrow
✅ Order status: Created
```

### 2. Restaurant Sees Order
```
✅ Restaurant dashboard shows new order
✅ Can see customer delivery address
✅ Restaurant accepts order
✅ Order status: Accepted
```

### 3. Restaurant Prepares Food
```
✅ Restaurant preparing...
✅ Clicks "Mark as Prepared"
✅ Order status: Prepared
✅ NOW VISIBLE TO ALL RIDERS! 🏍️
```

### 4. Rider Picks Up Order
```
✅ Riders see list of "Ready for Pickup" orders
✅ Rider accepts delivery
✅ Rider can now see delivery address
✅ Rider goes to restaurant
✅ Clicks "Picked Up"
✅ Order status: PickedUp
✅ Rider marked as unavailable automatically
```

### 5. Rider Delivers
```
✅ Rider navigates to customer address
✅ Delivers food
✅ Clicks "Delivered"
✅ Order status: Delivered
```

### 6. Customer Confirms
```
✅ Customer receives food
✅ Clicks "Confirm Delivery"
✅ Optionally rates restaurant (1-5 stars)
✅ Optionally rates rider (1-5 stars)
✅ Order status: Completed
✅ 💰 ESCROW RELEASES PAYMENT:
    - 80% → Restaurant
    - 10% → Rider
    - 10% → Platform
✅ Rider automatically marked available again
✅ Statistics updated
```

---

## 🛡️ Security Features

### ✅ Contract-Level Protection
- Role checks in smart contracts (not just UI)
- Cannot bypass through direct contract interaction
- Immutable once deployed

### ✅ Privacy Protection
- Delivery address visible only to:
  - Customer (owner)
  - Assigned rider
  - Restaurant owner
  - Platform admin
- Not publicly readable by anyone else

### ✅ One Role Per Wallet
```
✅ Restaurant wallet → Cannot deliver orders
✅ Rider wallet → Cannot own restaurant
✅ Customer wallet → Cannot register as business
✅ Admin wallet → Cannot participate in operations
```

### ✅ Rider Safety
- Cannot be assigned multiple orders simultaneously
- Must complete current delivery before accepting new one
- Automatic availability management

### ✅ Dispute Resolution
- Admin can resolve disputes
- Can refund customer or release payment
- All actions logged on-chain

---

## 📊 What This Prevents

### ❌ No More:
- Restaurant owner delivering their own orders (conflict of interest)
- Rider registering as restaurant and manipulating orders
- Customer pretending to be rider
- Admin participating in orders (admin is oversight only)
- Address seeing someone else's delivery location
- Rider accepting multiple deliveries at once

### ✅ Now Have:
- Clean role separation
- Professional platform structure
- Privacy protection
- Secure order flow
- Complete audit trail
- Blockchain-enforced rules

---

## 🧪 Testing Scenarios

### Test 1: Role Isolation
```
1. Deploy contracts
2. Try to register as Restaurant → ✅ Success
3. Try to register as Rider with same wallet → ❌ Fails!
4. Switch to different wallet
5. Register as Rider → ✅ Success
6. Try to register as Restaurant → ❌ Fails!
```

### Test 2: Customer Auto-Registration
```
1. Connect fresh wallet (no role)
2. Browse restaurants → ✅ Can see
3. Place order → ✅ Auto-assigned "Customer" role
4. Try to register as Restaurant → ❌ Fails! (already Customer)
```

### Test 3: Rider Order Visibility
```
1. Restaurant marks order as "Prepared"
2. Check rider dashboard → ✅ Order appears!
3. Before pickup → ❌ Cannot see delivery address
4. After accepting → ✅ Can see delivery address
```

### Test 4: Admin Restriction
```
1. Deployer wallet (admin)
2. Try to register as Restaurant → ❌ Fails!
3. Try to place order → ❌ Fails!
4. Can view platform status → ✅ Success
```

---

## 📱 UI Behavior Examples

### New User (No Role)
```
Navigation Shows:
- Browse Restaurants ✅
- Register as Restaurant ✅
- Register as Rider ✅

If places order → Becomes Customer automatically
```

### Restaurant User
```
Navigation Shows:
- My Restaurant ✅

Cannot Access:
- Place orders ❌
- Rider dashboard ❌
- Customer orders ❌
```

### Rider User
```
Navigation Shows:
- My Deliveries ✅

Cannot Access:
- Browse restaurants ❌
- Restaurant dashboard ❌
```

### Customer User
```
Navigation Shows:
- Browse Restaurants ✅
- My Orders ✅

Cannot Access:
- Restaurant dashboard ❌
- Rider dashboard ❌
```

---

## 🎯 Summary

Your DApp now has:

1. ✅ **Strict Role Isolation** - One wallet = One role
2. ✅ **Customer Delivery Address** - Stored on-chain
3. ✅ **Rider-Specific Order List** - See only ready orders
4. ✅ **Privacy Protection** - Address access control
5. ✅ **Rating System** - Rate restaurants & riders
6. ✅ **Complete Order Tracking** - All timestamps recorded
7. ✅ **Admin Cannot Participate** - Oversight only
8. ✅ **Frontend Role Detection** - Shows only relevant UI
9. ✅ **Route Protection** - Cannot bypass through URL
10. ✅ **Professional Structure** - Like real-world platforms

---

## 🚀 Deploy Now!

Follow the updated deployment guide in `/contracts/README.md`

Remember: Deploy RoleManager FIRST! Then all other contracts reference it.

**Good luck with your secure, role-isolated food delivery platform!** 🎉

