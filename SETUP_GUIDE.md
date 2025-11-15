# 🚀 Complete Setup Guide - FoodChain DApp

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Get Sepolia Test ETH](#get-sepolia-test-eth)
3. [Deploy Smart Contracts](#deploy-smart-contracts)
4. [Setup Frontend](#setup-frontend)
5. [Test the Application](#test-the-application)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Install MetaMask
- Go to https://metamask.io/
- Download browser extension
- Create new wallet (or import existing)
- **SAVE YOUR SEED PHRASE SECURELY!**

### 2. Add Sepolia Network to MetaMask

Click MetaMask → Networks → Add Network → Add Manually:

```
Network Name: Sepolia
RPC URL: https://rpc.sepolia.org
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

### 3. Install Node.js
- Download from https://nodejs.org/ (v18 or higher)
- Verify installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

---

## Get Sepolia Test ETH

You need test ETH to deploy contracts and test the app.

### Option 1: Alchemy Faucet (Recommended)
1. Go to https://sepoliafaucet.com/
2. Sign in with Alchemy account (free)
3. Enter your wallet address
4. Click "Send Me ETH"
5. Receive 0.5 ETH instantly

### Option 2: Infura Faucet
1. Go to https://www.infura.io/faucet/sepolia
2. Create free Infura account
3. Enter wallet address
4. Receive 0.5 ETH

### Option 3: PoW Faucet (No registration)
1. Go to https://sepolia-faucet.pk910.de/
2. Enter wallet address
3. Complete mining task (10-30 minutes)
4. Receive test ETH

**Note:** Get at least 0.5 ETH for deployment and testing!

---

## Deploy Smart Contracts

### Step 1: Open Remix IDE

1. Go to https://remix.ethereum.org/
2. You'll see the default workspace

### Step 2: Upload Contract Files

1. In Remix, click "File Explorer" icon (📁)
2. Right-click on "contracts" folder → "New Folder" → name it "food-delivery"
3. Upload all `.sol` files from your `/contracts/` folder:
   - RestaurantRegistry.sol
   - RiderRegistry.sol
   - Escrow.sol
   - OrderManager.sol

**Or:** Use GitHub import:
1. Click "Load from GitHub"
2. Paste your repository URL

### Step 3: Compile Contracts

1. Click "Solidity Compiler" icon (🔧)
2. Select compiler version: **0.8.20**
3. Check "Auto compile" option
4. Click "Compile RestaurantRegistry.sol"
5. Wait for green checkmark ✅
6. Repeat for all contracts

**Compilation Settings:**
- Compiler: 0.8.20
- Language: Solidity
- EVM Version: default
- Enable optimization: Yes (200 runs)

### Step 4: Connect MetaMask to Remix

1. Click "Deploy & Run Transactions" icon (🚀)
2. Environment: Select **"Injected Provider - MetaMask"**
3. MetaMask popup will appear
4. Click "Connect"
5. Verify: Account shows your wallet address
6. Network: Should show "Sepolia (11155111)"

### Step 5: Deploy Contracts (IN ORDER!)

#### A. Deploy RestaurantRegistry

1. Select "RestaurantRegistry.sol" from dropdown
2. Click **"Deploy"** orange button
3. MetaMask popup appears
4. Review gas fee
5. Click **"Confirm"**
6. Wait for confirmation (~15 seconds)
7. See green checkmark in Remix console
8. **COPY ADDRESS!** Example: `0x1234...abcd`
9. Paste in a text file

#### B. Deploy RiderRegistry

Same steps as RestaurantRegistry:
1. Select "RiderRegistry.sol"
2. Deploy
3. Confirm in MetaMask
4. **COPY ADDRESS!**

#### C. Deploy Escrow

**This one needs a parameter!**

1. Select "Escrow.sol"
2. In "Deploy" section, you'll see input field
3. Enter: Your wallet address as platform wallet
   - Example: `0xYourWalletAddress123...`
4. Click **"Deploy"**
5. Confirm in MetaMask
6. **COPY ADDRESS!**

#### D. Deploy OrderManager

**This one needs THREE parameters!**

1. Select "OrderManager.sol"
2. In "Deploy" section, enter THREE addresses separated by commas:
   ```
   0xRestaurantRegistry,0xRiderRegistry,0xEscrow
   ```
   Example:
   ```
   0x1234...RestaurantRegistry,0x5678...RiderRegistry,0x9abc...Escrow
   ```
3. Click **"Deploy"**
4. Confirm in MetaMask
5. **COPY ADDRESS!**

### Step 6: Link Contracts

**IMPORTANT:** Link OrderManager to Escrow

1. In "Deployed Contracts" section, find your Escrow contract
2. Click to expand it
3. Find `setOrderManager` function (orange button)
4. Paste OrderManager address
5. Click **"transact"**
6. Confirm in MetaMask
7. Wait for confirmation

**Verification:** Call `orderManager()` view function on Escrow
- Should return your OrderManager address
- If it returns `0x000...`, link wasn't successful - try again

### Step 7: Save All Addresses

Create a file `deployed-addresses.txt`:

```
=================================
DEPLOYED CONTRACT ADDRESSES
=================================
Date: [Today's Date]
Network: Sepolia Testnet
Deployer: [Your Wallet Address]

RestaurantRegistry: 0x...
RiderRegistry: 0x...
Escrow: 0x...
OrderManager: 0x...

Platform Wallet: 0x...
=================================
```

**✅ CONTRACTS DEPLOYED!**

---

## Setup Frontend

### Step 1: Navigate to Frontend Folder

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

Wait 2-3 minutes for installation to complete.

### Step 3: Create Environment File

```bash
# Copy example file
cp .env.example .env

# Or create manually
touch .env
```

Edit `.env`:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**Get WalletConnect Project ID:**
1. Go to https://cloud.walletconnect.com/
2. Sign up (free)
3. Click "Create New Project"
4. Copy "Project ID"
5. Paste in `.env` file

### Step 4: Configure Contract Addresses

Open `src/contracts/addresses.js`:

```javascript
export const CONTRACTS = {
  RestaurantRegistry: "0xYOUR_RESTAURANT_REGISTRY_ADDRESS",
  RiderRegistry: "0xYOUR_RIDER_REGISTRY_ADDRESS", 
  Escrow: "0xYOUR_ESCROW_ADDRESS",
  OrderManager: "0xYOUR_ORDER_MANAGER_ADDRESS",
};
```

**Replace** with your actual deployed addresses!

### Step 5: Start Development Server

```bash
npm run dev
```

You should see:

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 6: Open in Browser

1. Open http://localhost:3000
2. You should see the FoodChain homepage
3. Click "Connect Wallet"
4. Select MetaMask
5. Approve connection

**✅ FRONTEND RUNNING!**

---

## Test the Application

### Test 1: Register as Restaurant

1. Click "Restaurant" in navigation
2. Fill in restaurant details:
   - Name: "Test Pizza Place"
   - Description: "Best pizza in town"
   - Cuisine: "Italian"
   - Add menu items:
     - Pizza: 0.002 ETH
     - Pasta: 0.0015 ETH
3. Click "Register Restaurant"
4. Confirm in MetaMask
5. Wait for confirmation
6. You should see success message

### Test 2: Register as Rider

1. Open new browser profile or use different wallet
2. Click "Rider" in navigation
3. Fill in rider details:
   - Name: "Test Rider"
   - Vehicle: Bike
   - Phone: Optional
4. Click "Register as Rider"
5. Confirm in MetaMask
6. Set availability to "Available"

### Test 3: Create Order (as Customer)

1. Use third wallet/browser profile
2. Go to homepage
3. Click on Restaurant #1
4. Add items to cart:
   - 2x Pizza
   - 1x Pasta
5. Enter delivery address
6. Click "Place Order"
7. Confirm transaction (sends 0.0065 ETH)
8. Wait for confirmation
9. Order should appear in "My Orders"

### Test 4: Complete Order Flow

**As Restaurant:**
1. Go to Restaurant Dashboard
2. See new order
3. Click "Accept Order"
4. Click "Mark as Prepared"
5. Click "Assign Rider"

**As Rider:**
1. Go to Rider Dashboard
2. See assigned order
3. Click "Mark as Picked Up"
4. Click "Mark as Delivered"

**As Customer:**
1. Go to "My Orders"
2. Click on order
3. Click "Confirm Delivery"
4. **💰 PAYMENT RELEASED!**

### Verify Payments

Check wallet balances:
- Restaurant earned 80% (0.0052 ETH)
- Rider earned 10% (0.00065 ETH)
- Platform earned 10% (0.00065 ETH)

**✅ COMPLETE FLOW WORKING!**

---

## Troubleshooting

### Issue: "Transaction Failed"

**Causes:**
- Insufficient gas
- Wrong network
- Contract error

**Solutions:**
1. Check you're on Sepolia network
2. Get more test ETH
3. Increase gas limit in MetaMask
4. Check contract addresses are correct

### Issue: "Cannot read properties of undefined"

**Cause:** Contract addresses not set

**Solution:**
1. Open `frontend/src/contracts/addresses.js`
2. Verify all addresses are filled
3. Should be 42 characters (0x + 40 hex)
4. Restart dev server: `npm run dev`

### Issue: "Already Registered"

**Cause:** Wallet already registered

**Solution:**
- Each wallet can only register once
- Use different wallet address
- Or continue with existing registration

### Issue: "Only OrderManager can call"

**Cause:** Escrow not linked to OrderManager

**Solution:**
1. Go to Remix
2. Find deployed Escrow contract
3. Call `setOrderManager(orderManagerAddress)`
4. Confirm transaction

### Issue: "Restaurant Not Active"

**Cause:** Restaurant status is closed

**Solution:**
1. Go to Restaurant Dashboard
2. Toggle status to "Open"
3. Try ordering again

### Issue: MetaMask Not Connecting

**Solutions:**
1. Refresh page
2. Disconnect wallet in MetaMask settings
3. Clear browser cache
4. Try different browser
5. Update MetaMask extension

### Issue: Page Not Loading

**Solutions:**
```bash
# Stop server (Ctrl+C)
# Clear cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

### Issue: Transactions Taking Too Long

**Normal on Sepolia:**
- Transactions take 15-30 seconds
- Block time is ~12 seconds
- Be patient!

**Check status:**
1. Copy transaction hash
2. Go to https://sepolia.etherscan.io/
3. Paste hash
4. See transaction status

---

## 🎉 Success!

You now have:
- ✅ Smart contracts deployed on Sepolia
- ✅ Frontend running locally
- ✅ Complete order flow tested
- ✅ Payments working automatically

## 📚 Next Steps

1. **Add More Features:**
   - Ratings and reviews
   - Order history with filters
   - Real-time notifications

2. **Improve UI:**
   - Add restaurant images
   - Better order tracking visualization
   - Mobile responsive design

3. **IPFS Integration:**
   - Upload actual menus to IPFS
   - Store order details on IPFS
   - Add restaurant photos

4. **Production Deployment:**
   - Security audit (IMPORTANT!)
   - Deploy on mainnet
   - Set up backend API

---

## 🆘 Need Help?

- Read `beginner-guide-pdf.md` for explanations
- Check Remix console for errors
- Use Sepolia Etherscan for transaction debugging
- Review Wagmi documentation for frontend issues

---

**Happy Building! 🚀🍕**

