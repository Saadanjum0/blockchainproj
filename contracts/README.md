# Smart Contracts for Remix IDE

## 📁 Files in this folder:

1. **RoleManager.sol** - 🔐 Central role isolation system (DEPLOY FIRST!)
2. **RestaurantRegistry.sol** - Manages restaurant registrations and profiles
3. **RiderRegistry.sol** - Manages delivery rider registrations
4. **Escrow.sol** - Handles payment escrow and fund distribution
5. **OrderManager.sol** - Main contract for order management

## 🚀 Deployment Order on Remix IDE:

⚠️ **IMPORTANT: One wallet = One role only!**

### Step 1: Deploy RoleManager (USE FIXED VERSION!)
1. Open Remix IDE: https://remix.ethereum.org/
2. Upload all .sol files to Remix
3. Select Solidity Compiler (0.8.20)
4. **IMPORTANT: Compile RoleManager-FIXED.sol** (not RoleManager.sol)
   - Original RoleManager has ownership transfer issues
   - Fixed version uses whitelist instead - much simpler!
5. Deploy (no constructor arguments needed)
6. **SAVE THE ADDRESS!** Example: `0xROLE123...`
7. ⚠️ **Your deployer wallet is now ADMIN - cannot register as any role!**

### Step 2: Deploy RestaurantRegistry
1. Compile RestaurantRegistry.sol
   - ⚠️ If you get "Stack too deep" error:
     - Enable optimizer (200 runs)
     - Add viaIR: true in Compiler Configuration JSON
2. Deploy with ONE constructor argument:
   - `_roleManager`: Address from Step 1 (or `0x0000000000000000000000000000000000000000` if not using RoleManager)
3. **SAVE THE ADDRESS!** Example: `0xREST456...`

### Step 3: Deploy RiderRegistry
1. Compile RiderRegistry.sol
   - ⚠️ If you get "Stack too deep" error:
     - Enable optimizer (200 runs)
     - Add viaIR: true in Compiler Configuration JSON
2. Deploy with **NO constructor arguments** (leave empty: `()`)
3. **SAVE THE ADDRESS!** Example: `0xRIDER789...`
4. **Optional:** After deploying OrderManager (Step 5), link them:
   - Call `setOrderManager(OrderManagerAddress)` on RiderRegistry
   - This allows OrderManager to assign riders to orders

### Step 4: Deploy Escrow
1. Compile Escrow.sol
2. Deploy with constructor argument: `_platformWallet` (your admin wallet address)
3. **SAVE THE ADDRESS!** Example: `0xESCROW012...`

### Step 5: Deploy OrderManager
1. Compile OrderManager.sol
2. Deploy with FOUR constructor arguments:
   - `_restaurantRegistry`: Address from Step 2
   - `_riderRegistry`: Address from Step 3
   - `_escrow`: Address from Step 4
   - `_roleManager`: Address from Step 1
3. **SAVE THE ADDRESS!** Example: `0xORDER345...`

### Step 6: Link Contracts
1. **Link Escrow to OrderManager:**
   - Go to deployed Escrow contract
   - Call `setOrderManager` function
   - Pass OrderManager address from Step 5
   - Confirm transaction

2. **Link RiderRegistry to OrderManager:**
   - Go to deployed RiderRegistry contract
   - Call `setOrderManager` function
   - Pass OrderManager address from Step 5
   - Confirm transaction
   - ⚠️ This allows OrderManager to assign riders and complete deliveries

3. **Authorize Contracts in RoleManager-FIXED (IMPORTANT!):**
   
   **⚠️ CRITICAL:** After deploying contracts, authorize them to assign roles:
   
   1. **Authorize RestaurantRegistry:**
      - Go to RoleManager-FIXED contract
      - Call `authorizeContract` function
      - Enter RestaurantRegistry address (from Step 2)
      - Confirm transaction
      - ✅ RestaurantRegistry can now assign restaurant roles
   
   2. **Authorize OrderManager:**
      - On same RoleManager-FIXED contract
      - Call `authorizeContract` function
      - Enter OrderManager address (from Step 5)
      - Confirm transaction
      - ✅ OrderManager can now assign customer roles
   
   **Why this is needed:**
   - Fixed version uses whitelist instead of ownership transfer
   - Much simpler than two-step ownership transfer
   - Contracts just need to be authorized once
   - Works reliably with contract addresses
   
   **Note:** Only deployer wallet (owner) can authorize contracts

## ✅ Verification Checklist:

- [ ] RoleManager deployed (Step 1)
- [ ] RestaurantRegistry deployed with RoleManager address
- [ ] RiderRegistry deployed (no constructor args)
- [ ] Escrow deployed with platform wallet
- [ ] OrderManager deployed with all registry addresses
- [ ] Escrow.setOrderManager() called successfully
- [ ] RiderRegistry.setOrderManager() called successfully
- [ ] RoleManager ownership set (optional - transfer to RestaurantRegistry or keep with deployer)

## 📝 Save Your Addresses:

Create a file called `deployed-addresses.txt` with:

```
RestaurantRegistry: 0x...
RiderRegistry: 0x...
Escrow: 0x...
OrderManager: 0x...
Platform Wallet: 0x... (your wallet)
Network: Sepolia Testnet
Chain ID: 11155111
Deployed: [Date]
```

## 🔑 Important Notes:

1. **Network**: Deploy on Sepolia Testnet
2. **Compiler Version**: 0.8.20
3. **Optimization**: Enable (200 runs) - **REQUIRED for RiderRegistry**
4. **viaIR**: Enable if you get "Stack too deep" errors:
   - Go to Compiler Configuration
   - Add JSON: `{"viaIR": true, "optimizer": {"enabled": true, "runs": 200}}`
5. **License**: MIT
6. **RiderRegistry**: No constructor arguments needed - use `setOrderManager()` after deployment
7. **RoleManager Ownership**: 
   - Each contract (RestaurantRegistry, RiderRegistry, OrderManager) manages its own ownership
   - You DON'T need to transfer ownership between contracts
   - RoleManager's `transferOwnership()` is only for transferring RoleManager's ownership (not other contracts')
   - Keep RoleManager ownership with deployer wallet or transfer to an admin wallet you control

## 🧪 Testing After Deployment:

### Test 1: Register Restaurant
```
Contract: RestaurantRegistry
Function: registerRestaurant
Args: 
  - _ipfsMenuHash: "QmTestMenu123"
  - _metadataURI: "QmTestMetadata456"
```

### Test 2: Register Rider
```
Contract: RiderRegistry
Function: registerRider
Args:
  - _name: "John Rider"
  - _phoneNumber: "+1234567890"
  - _vehicleType: "bike"
  - _metadataURI: "QmTestRiderProfile789"
```

### Test 3: Create Order
```
Contract: OrderManager
Function: createOrder
Args:
  - _restaurantId: 1
  - _ipfsOrderHash: "QmTestOrder111"
  - _tip: 0
Value: 0.01 ETH (send with transaction)
```

## 🐛 Common Errors:

- **"Already registered"**: You can only register once per wallet
- **"Only OrderManager"**: Make sure you called setOrderManager on Escrow
- **"Restaurant not active"**: Restaurant must be active to receive orders
- **"Invalid status"**: Order must be in correct status for each action

## 🔗 Next Steps:

After deploying all contracts, copy the addresses to:
`frontend/src/contracts/addresses.js`

This will connect your frontend to the blockchain!

