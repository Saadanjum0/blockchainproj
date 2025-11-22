# 🚀 Local Development Setup Guide

## Quick Start (3 Steps)

### 1. Install Dependencies (if not already done)
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
The app will automatically open at: **http://localhost:3000**

---

## What You Need Before Running

### ✅ Required Setup

1. **MetaMask Installed**
   - Download from: https://metamask.io/
   - Create or import a wallet

2. **Sepolia Testnet Configured**
   - In MetaMask: Settings → Networks → Add Network
   - Network Name: `Sepolia Test Network`
   - RPC URL: `https://rpc.sepolia.org`
   - Chain ID: `11155111`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.etherscan.io`

3. **Test ETH (Free)**
   - Get from: https://sepoliafaucet.com/
   - Or: https://faucet.quicknode.com/ethereum/sepolia

4. **Contract Addresses**
   - Already configured in `frontend/src/contracts/addresses.js`
   - Your deployed contracts are already set!

---

## Environment Variables (Optional)

The app works without these, but you can add them for WalletConnect:

Create `frontend/.env`:
```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**Note:** The app has a fallback, so this is optional.

---

## Running the App

### Start Development Server
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## Troubleshooting

### Port 3000 Already in Use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.js
server: {
  port: 3001  // Change to different port
}
```

### Dependencies Not Installing?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Module Not Found Errors?
```bash
# Make sure you're in the frontend directory
cd frontend
npm install
```

### Wallet Not Connecting?
1. Check MetaMask is unlocked
2. Verify you're on Sepolia testnet
3. Check browser console for errors (F12)
4. Try refreshing the page

### Contract Errors?
1. Verify contract addresses in `frontend/src/contracts/addresses.js`
2. Make sure contracts are deployed on Sepolia
3. Check you have test ETH in wallet

---

## Development Workflow

### 1. Start Server
```bash
cd frontend
npm run dev
```

### 2. Make Changes
- Edit files in `frontend/src/`
- Changes auto-reload in browser
- Check browser console for errors

### 3. Test Features
- Connect wallet
- Test all user roles (Customer, Restaurant, Rider)
- Verify transactions on Etherscan

### 4. Build for Production
```bash
npm run build
# Output in frontend/dist/
```

---

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   ├── pages/               # Page components
│   │   ├── HomePage.jsx
│   │   ├── RestaurantDashboard.jsx
│   │   ├── OrderDetailsPage.jsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useOrders.js
│   │   ├── useRestaurants.js
│   │   └── ...
│   ├── contracts/           # Contract ABIs & addresses
│   │   ├── abis.js
│   │   └── addresses.js
│   └── utils/               # Utility functions
│       ├── ipfs.js
│       └── formatDate.js
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## Key Features to Test

### ✅ All Fixed Issues
1. **No Constant Refreshing** - Page should be smooth
2. **Restaurant Earnings** - Check dashboard earnings tracker
3. **Etherscan Links** - Every transaction has Etherscan link
4. **Menu Display** - Menu items should load properly
5. **Accurate Calculations** - Earnings show correct amounts

### 🧪 Test Scenarios

**As Customer:**
1. Browse restaurants
2. Create order
3. View order details
4. Check Etherscan links
5. Confirm delivery

**As Restaurant:**
1. View dashboard
2. Check earnings tracker
3. Accept orders
4. Mark prepared
5. Assign rider
6. View all Etherscan links

**As Rider:**
1. View available deliveries
2. Pick up orders
3. Mark delivered

---

## Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Brave
- ⚠️ Safari (may have issues with MetaMask)

---

## Performance Tips

1. **Clear Browser Cache** if seeing old code
2. **Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Disable Extensions** if having issues
4. **Check Network Tab** for failed requests

---

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new package
npm install package-name

# Check for updates
npm outdated

# Clear build cache
rm -rf dist node_modules/.vite
```

---

## Next Steps After Running

1. ✅ Connect MetaMask wallet
2. ✅ Switch to Sepolia testnet
3. ✅ Test as Customer (browse & order)
4. ✅ Test as Restaurant (register & manage orders)
5. ✅ Test as Rider (register & deliver)
6. ✅ Verify all Etherscan links work
7. ✅ Check earnings tracker accuracy

---

## Need Help?

1. **Check Browser Console** (F12) for errors
2. **Verify MetaMask** is connected and on Sepolia
3. **Check Contract Addresses** in `addresses.js`
4. **Review Documentation** in `COMPLETE-AUDIT-AND-FIXES.md`

---

**Your app should now be running at http://localhost:3000!** 🎉

All 7 critical bugs have been fixed, so everything should work smoothly!

