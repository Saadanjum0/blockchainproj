# Smart Contracts for Remix IDE

## 📁 Files in this folder:

1. **RoleManager.sol** - 🔐 Central role isolation system (DEPLOY FIRST!)
2. **RestaurantRegistry.sol** - Manages restaurant registrations and profiles
3. **RiderRegistry.sol** - Manages delivery rider registrations
4. **Escrow.sol** - Handles payment escrow and fund distribution
5. **OrderManager.sol** - Main contract for order management

## 🚀 Complete Fresh Deployment Guide

**⚠️ IMPORTANT: One wallet = One role only!**

This guide assumes you're deploying everything from scratch. If you have existing contracts, see the "Upgrading Existing Contracts" section below.

---

## 📋 Pre-Deployment Checklist

Before you start:
- [ ] Remix IDE open: https://remix.ethereum.org/
- [ ] MetaMask installed and connected
- [ ] Sepolia Testnet selected in MetaMask
- [ ] At least 0.5 ETH in your wallet for gas fees
- [ ] All contract files uploaded to Remix
- [ ] Compiler set to Solidity 0.8.20
- [ ] Optimizer enabled (200 runs)
- [ ] viaIR enabled (if needed for RiderRegistry)

---

## 🚀 Step-by-Step Deployment

### Step 1: Deploy RoleManager

**Purpose**: Central role management system (one wallet = one role)

1. **In Remix IDE:**
   - Go to "Solidity Compiler" tab (3rd icon on left)
   - Set compiler version to **0.8.20**
   - Enable optimization: ✅ (200 runs)
   - Click "Compile RoleManager.sol"
   - Wait for compilation to complete (green checkmark)

2. **Deploy:**
   - Go to "Deploy & Run Transactions" tab (4th icon on left)
   - Select environment: **"Injected Provider - MetaMask"**
   - Make sure Sepolia Testnet is selected in MetaMask
   - Select contract: **"RoleManager"**
   - Constructor parameters: **Leave empty** `()`
   - Click **"Deploy"**
   - Confirm transaction in MetaMask
   - Wait for deployment confirmation

3. **Save the Address:**
   - In "Deployed Contracts" section, find your RoleManager
   - Click the copy icon next to the address
   - **SAVE THIS ADDRESS!** You'll need it for all other contracts
   - Example format: `0x2f208c050Ed931c31DeDAA80CD4329224B2c748E`

4. **Important Notes:**
   - ⚠️ Your deployer wallet is now ADMIN - cannot register as any role!
   - This contract manages role isolation (one wallet = one role)
   - You'll authorize other contracts to assign roles later

### Step 2: Deploy RestaurantRegistry

**Purpose**: Manages restaurant registrations and profiles

1. **Compile:**
   - In "Solidity Compiler" tab
   - Click "Compile RestaurantRegistry.sol"
   - ⚠️ If you get "Stack too deep" error:
     - Click "Advanced Config" or "Compiler Configuration"
     - Add JSON: `{"viaIR": true, "optimizer": {"enabled": true, "runs": 200}}`
     - Compile again

2. **Deploy:**
   - Go to "Deploy & Run Transactions" tab
   - Select contract: **"RestaurantRegistry"**
   - Constructor parameters:
     - `_roleManager`: **Paste your RoleManager address from Step 1**
     - Example: `0x2f208c050Ed931c31DeDAA80CD4329224B2c748E`
   - Click **"Deploy"**
   - Confirm transaction in MetaMask
   - Wait for deployment confirmation

3. **Save the Address:**
   - Copy the RestaurantRegistry address
   - **SAVE THIS ADDRESS!** Example: `0x13f14FbE548742f1544BB44A9ad3714F93A02DF3`

### Step 3: Deploy RiderRegistry

**Purpose**: Manages delivery rider registrations

1. **Compile:**
   - In "Solidity Compiler" tab
   - Click "Compile RiderRegistry.sol"
   - ⚠️ If you get "Stack too deep" error:
     - Click "Advanced Config" or "Compiler Configuration"
     - Add JSON: `{"viaIR": true, "optimizer": {"enabled": true, "runs": 200}}`
     - Compile again

2. **Deploy:**
   - Go to "Deploy & Run Transactions" tab
   - Select contract: **"RiderRegistry"**
   - Constructor parameters:
     - `_roleManager`: **Paste your RoleManager address from Step 1**
     - Example: `0x2f208c050Ed931c31DeDAA80CD4329224B2c748E`
   - Click **"Deploy"**
   - Confirm transaction in MetaMask
   - Wait for deployment confirmation

3. **Save the Address:**
   - Copy the RiderRegistry address
   - **SAVE THIS ADDRESS!** Example: `0xRIDER789...`

4. **⚠️ CRITICAL: Authorize RiderRegistry in RoleManager:**
   - In "Deployed Contracts" section, find your **RoleManager** contract
   - Expand it to see functions
   - Find `authorizeContract` function
   - Enter your **RiderRegistry address** (from Step 3)
   - Click **"transact"**
   - Confirm transaction in MetaMask
   - ⚠️ **If you skip this, rider registration will FAIL!**
   - Why? RiderRegistry calls `roleManager.assignRiderRole()` during registration

### Step 4: Deploy Escrow

**Purpose**: Handles payment escrow and fund distribution (80% restaurant, 10% rider, 10% platform)

1. **Compile:**
   - In "Solidity Compiler" tab
   - Click "Compile Escrow.sol"
   - Wait for compilation to complete

2. **Deploy:**
   - Go to "Deploy & Run Transactions" tab
   - Select contract: **"Escrow"**
   - Constructor parameters:
     - `_platformWallet`: **Your admin wallet address** (the one you're deploying from)
     - You can find it in MetaMask or copy from Remix (it shows "account" at top)
     - Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7`
   - Click **"Deploy"**
   - Confirm transaction in MetaMask
   - Wait for deployment confirmation

3. **Save the Address:**
   - Copy the Escrow address
   - **SAVE THIS ADDRESS!** Example: `0xESCROW012...`

### Step 5: Deploy OrderManager

**Purpose**: Main contract for order management (creates orders, assigns riders, processes payments)

1. **Compile:**
   - In "Solidity Compiler" tab
   - Click "Compile OrderManager.sol"
   - Wait for compilation to complete

2. **Deploy:**
   - Go to "Deploy & Run Transactions" tab
   - Select contract: **"OrderManager"**
   - Constructor parameters (in order):
     - `_restaurantRegistry`: **Paste RestaurantRegistry address from Step 2**
     - `_riderRegistry`: **Paste RiderRegistry address from Step 3**
     - `_escrow`: **Paste Escrow address from Step 4**
     - `_roleManager`: **Paste RoleManager address from Step 1**
   - Click **"Deploy"**
   - Confirm transaction in MetaMask
   - Wait for deployment confirmation

3. **Save the Address:**
   - Copy the OrderManager address
   - **SAVE THIS ADDRESS!** Example: `0xORDER345...`

### Step 6: Link Contracts Together

Now we need to link all contracts so they can communicate with each other.

#### 6.1: Link Escrow to OrderManager

**Why**: OrderManager needs to call Escrow functions (deposit, release, updateRider)

1. In "Deployed Contracts" section, find your **Escrow** contract
2. Expand it to see functions
3. Find `setOrderManager` function
4. Enter your **OrderManager address** (from Step 5)
5. Click **"transact"**
6. Confirm transaction in MetaMask
7. Wait for confirmation
8. ✅ Escrow is now linked to OrderManager

#### 6.2: Link RiderRegistry to OrderManager

**Why**: OrderManager needs to call RiderRegistry functions (assignToOrder, completeDelivery)

1. In "Deployed Contracts" section, find your **RiderRegistry** contract
2. Expand it to see functions
3. Find `setOrderManager` function
4. Enter your **OrderManager address** (from Step 5)
5. Click **"transact"**
6. Confirm transaction in MetaMask
7. Wait for confirmation
8. ✅ RiderRegistry is now linked to OrderManager

#### 6.3: Authorize Contracts in RoleManager

**⚠️ CRITICAL:** These contracts need permission to assign roles to users.

**Why this is needed:**
- RestaurantRegistry calls `roleManager.assignRestaurantRole()` when restaurants register
- RiderRegistry calls `roleManager.assignRiderRole()` when riders register
- OrderManager calls `roleManager.assignCustomerRole()` when customers place orders
- Without authorization, registration will FAIL!

**Authorize RestaurantRegistry:**
1. In "Deployed Contracts" section, find your **RoleManager** contract
2. Expand it to see functions
3. Find `authorizeContract` function
4. Enter your **RestaurantRegistry address** (from Step 2)
5. Click **"transact"**
6. Confirm transaction in MetaMask
7. Wait for confirmation
8. ✅ RestaurantRegistry can now assign restaurant roles

**Authorize RiderRegistry:**
1. On the same **RoleManager** contract
2. Find `authorizeContract` function again
3. Enter your **RiderRegistry address** (from Step 3)
4. Click **"transact"**
5. Confirm transaction in MetaMask
6. Wait for confirmation
7. ✅ RiderRegistry can now assign rider roles
8. ⚠️ **Note**: You may have already done this in Step 3 - if so, skip this

**Authorize OrderManager:**
1. On the same **RoleManager** contract
2. Find `authorizeContract` function again
3. Enter your **OrderManager address** (from Step 5)
4. Click **"transact"**
5. Confirm transaction in MetaMask
6. Wait for confirmation
7. ✅ OrderManager can now assign customer roles

## ✅ Complete Deployment Checklist:

### Contracts Deployed:
- [ ] Step 1: RoleManager deployed
- [ ] Step 2: RestaurantRegistry deployed with RoleManager address
- [ ] Step 3: RiderRegistry deployed with RoleManager address
- [ ] Step 4: Escrow deployed with platform wallet address
- [ ] Step 5: OrderManager deployed with all registry addresses

### Contracts Linked:
- [ ] Step 6.1: Escrow.setOrderManager() called successfully
- [ ] Step 6.2: RiderRegistry.setOrderManager() called successfully

### Contracts Authorized:
- [ ] Step 6.3: RestaurantRegistry authorized in RoleManager
- [ ] Step 6.3: RiderRegistry authorized in RoleManager
- [ ] Step 6.3: OrderManager authorized in RoleManager

### Frontend Configuration:
- [ ] Step 7: Frontend addresses.js updated (see below)

### Step 7: Update Frontend Configuration

**Purpose**: Connect your frontend to the deployed contracts

1. **Open** `frontend/src/contracts/addresses.js` in your code editor

2. **Replace** the CONTRACTS object with your deployed addresses:

```javascript
export const CONTRACTS = {
  RoleManager: "0x[YOUR_ROLEMANAGER_ADDRESS from Step 1]",
  RestaurantRegistry: "0x[YOUR_RESTAURANTREGISTRY_ADDRESS from Step 2]",
  RiderRegistry: "0x[YOUR_RIDERREGISTRY_ADDRESS from Step 3]",
  Escrow: "0x[YOUR_ESCROW_ADDRESS from Step 4]",
  OrderManager: "0x[YOUR_ORDERMANAGER_ADDRESS from Step 5]",
};

// Sepolia Network Configuration
export const NETWORK_CONFIG = {
  chainId: 11155111,
  name: "Sepolia Testnet",
  rpcUrl: "https://rpc.sepolia.org",
  blockExplorer: "https://sepolia.etherscan.io"
};
```

3. **Save** the file

4. **Restart** your frontend development server if it's running

---

## 📝 Save Your Addresses:

**Create a file called `deployed-addresses.txt` with:**

```
RoleManager: 0x[YOUR_ADDRESS]
RestaurantRegistry: 0x[YOUR_ADDRESS]
RiderRegistry: 0x[YOUR_ADDRESS]
Escrow: 0x[YOUR_ADDRESS]
OrderManager: 0x[YOUR_ADDRESS]
Platform Wallet: 0x[YOUR_WALLET_ADDRESS]
Network: Sepolia Testnet
Chain ID: 11155111
Deployed: [Date]
```

**Keep this file safe!** You'll need these addresses if you need to interact with contracts later.

## 🔑 Important Notes:

1. **Network**: Deploy on Sepolia Testnet
2. **Compiler Version**: 0.8.20
3. **Optimization**: Enable (200 runs) - **REQUIRED for RiderRegistry**
4. **viaIR**: Enable if you get "Stack too deep" errors:
   - Go to Compiler Configuration
   - Add JSON: `{"viaIR": true, "optimizer": {"enabled": true, "runs": 200}}`
5. **License**: MIT
6. **RiderRegistry**: 
   - ⚠️ **BREAKING CHANGE**: Now requires `_roleManager` constructor argument
   - Must be authorized in RoleManager after deployment
   - Then use `setOrderManager()` after OrderManager is deployed
7. **RoleManager Authorization**:
   - **CRITICAL**: You MUST authorize RestaurantRegistry, RiderRegistry, and OrderManager
   - Without authorization, registration functions will FAIL
   - Authorization is a one-time setup per contract
8. **RoleManager Ownership**: 
   - Each contract (RestaurantRegistry, RiderRegistry, OrderManager) manages its own ownership
   - You DON'T need to transfer ownership between contracts
   - RoleManager's `transferOwnership()` is only for transferring RoleManager's ownership (not other contracts')
   - Keep RoleManager ownership with deployer wallet or transfer to an admin wallet you control

## 🧪 Testing After Deployment:

### Test 1: Register a Restaurant

**Purpose**: Verify RestaurantRegistry and RoleManager integration

1. In Remix, find your **RestaurantRegistry** contract
2. Expand it and find `registerRestaurant` function
3. Fill in the parameters:
   - `_name`: "Test Restaurant"
   - `_description`: "A test restaurant"
   - `_ipfsMenuHash`: "QmTestMenu123" (or any test hash)
   - `_metadataURI`: "QmTestMetadata456" (or any test hash)
   - `_physicalAddress`: "123 Test Street"
4. Click **"transact"**
5. Confirm in MetaMask (use a DIFFERENT wallet than your deployer!)
6. ✅ Should succeed - restaurant registered and role assigned

**Expected Result**: 
- Transaction succeeds
- Restaurant gets ID 1
- Wallet gets restaurant role (cannot register as rider/customer)

### Test 2: Register a Rider

**Purpose**: Verify RiderRegistry and RoleManager integration

1. In Remix, find your **RiderRegistry** contract
2. Expand it and find `registerRider` function
3. Fill in the parameters:
   - `_name`: "John Rider"
   - `_phoneNumber`: "+1234567890"
   - `_vehicleType`: "bike"
   - `_metadataURI`: "QmTestRiderProfile789" (or any test hash)
4. Click **"transact"**
5. Confirm in MetaMask (use a DIFFERENT wallet than restaurant!)
6. ✅ Should succeed - rider registered and role assigned

**Expected Result**: 
- Transaction succeeds
- Rider registered
- Wallet gets rider role (cannot register as restaurant/customer)

### Test 3: Create an Order

**Purpose**: Verify OrderManager, Escrow, and customer role assignment

1. In Remix, find your **OrderManager** contract
2. Expand it and find `createOrder` function
3. Fill in the parameters:
   - `_restaurantId`: 1 (from Test 1)
   - `_ipfsOrderHash`: "QmTestOrder111" (or any test hash)
   - `_tip`: 0
4. **IMPORTANT**: Set value to **0.01 ETH** (or any test amount)
   - In Remix, there's a "Value" field above the function
   - Select "Ether" and enter 0.01
5. Click **"transact"**
6. Confirm in MetaMask (use a DIFFERENT wallet - this will be customer!)
7. ✅ Should succeed - order created, payment in escrow

**Expected Result**: 
- Transaction succeeds
- Order gets an ID
- Customer wallet gets customer role
- Payment is held in Escrow contract

### Test 4: Verify Everything Works

**Check on Etherscan:**
1. Go to https://sepolia.etherscan.io
2. Search for your contract addresses
3. Verify all transactions are there
4. Check Escrow contract - should show the 0.01 ETH deposit

**Check in Frontend:**
1. Start your frontend: `cd frontend && npm run dev`
2. Connect wallet (use customer wallet from Test 3)
3. You should see your order!
4. Try registering as restaurant/rider from frontend
5. Everything should work!

## 🐛 Common Errors:

- **"Already registered"**: You can only register once per wallet
- **"Cannot register: Address already has another role"**: 
  - This is CORRECT behavior! One wallet = one role only
  - If you're already a restaurant, you can't register as rider
  - Use a different wallet for each role
- **"Not authorized"** (when registering rider):
  - RiderRegistry is not authorized in RoleManager
  - Go to RoleManager and call `authorizeContract(RiderRegistryAddress)`
- **"Only OrderManager"**: Make sure you called setOrderManager on Escrow
- **"Restaurant not active"**: Restaurant must be active to receive orders
- **"Invalid status"**: Order must be in correct status for each action
- **"Rider already set"** (in Escrow): Order already has a rider assigned

## 🎉 Deployment Complete!

You've successfully deployed all contracts! Here's what you should have:

### ✅ What's Working Now:

1. **Role Isolation**: One wallet = one role (restaurant OR rider OR customer)
2. **Restaurant Registration**: Restaurants can register and get assigned role
3. **Rider Registration**: Riders can register and get assigned role
4. **Order Creation**: Customers can create orders (auto-assigned customer role)
5. **Payment Escrow**: Payments are held securely in Escrow
6. **Rider Payments**: Riders receive 10% when orders complete (via Escrow.updateRider fix)

### 🔍 Verify Everything:

**In Remix:**
- All 5 contracts deployed
- All contracts linked (Escrow → OrderManager, RiderRegistry → OrderManager)
- All contracts authorized in RoleManager

**On Etherscan:**
- All contracts visible on Sepolia
- All transactions confirmed
- Escrow contract shows correct balance

**In Frontend:**
- Addresses updated in `addresses.js`
- Frontend connects to contracts
- Can register, create orders, etc.

---

## 🔄 Upgrading Existing Contracts

If you already have contracts deployed and want to upgrade:

1. **Follow Steps 1-5** to deploy new contracts
2. **Skip Step 6.3** (authorization) if contracts are already authorized
3. **For RestaurantRegistry**: Use `updateOrderManager()` instead of `setOrderManager()` if you get "Already set" error
4. **Update frontend** with new addresses

See `ESCROW-FIX-DEPLOYMENT-GUIDE.md` for detailed upgrade instructions.

## ⚠️ BREAKING CHANGES (Latest Update):

- **RiderRegistry**: Constructor now requires `_roleManager` parameter (was empty before)
- **RiderRegistry**: Must be authorized in RoleManager after deployment
- **Escrow**: Added `updateRider()` function for proper payment routing
- **OrderManager**: Calls `escrow.updateRider()` when rider is assigned
- **RestaurantRegistry**: Added `updateOrderManager()` function (for updating existing deployments)

**Old deployments without these changes will NOT work correctly!**

