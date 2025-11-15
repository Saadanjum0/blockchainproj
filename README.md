# 🍕 FoodChain - Decentralized Food Delivery DApp

A complete blockchain-based food delivery platform built on Ethereum Sepolia testnet. Order food, manage restaurants, and deliver orders - all powered by smart contracts!

## 🌟 Features

### For Customers
- 🛒 Browse restaurants and order food with cryptocurrency
- 📦 Track orders in real-time on the blockchain
- 💰 Escrow protection - payment only released after delivery confirmation
- 🔍 Transparent order history stored on blockchain

### For Restaurants
- 🏪 Register your restaurant on the blockchain
- 📋 Manage menu and order status
- 💸 Receive 80% of order value automatically
- 📊 View order statistics and history

### For Riders
- 🏍️ Register as a delivery rider
- 🚚 Accept and complete deliveries
- 💵 Earn 10% of each order value in crypto
- ⏰ Work on your own schedule

## 📁 Project Structure

```
Blockchainfinalproject/
├── contracts/                 # Smart contracts for Remix IDE
│   ├── RestaurantRegistry.sol
│   ├── RiderRegistry.sol
│   ├── Escrow.sol
│   ├── OrderManager.sol
│   └── README.md             # Deployment instructions
│
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── contracts/        # ABIs and contract addresses
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── utils/            # Utility functions (IPFS, etc.)
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── README.md             # Frontend setup instructions
│
├── beginner-guide-pdf.md     # Complete beginner's guide
├── food-delivery-roadmap.md  # Development roadmap
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- MetaMask wallet installed
- Sepolia testnet ETH (get from [faucet](https://sepoliafaucet.com/))
- Node.js v18+ installed
- Basic understanding of blockchain

### Step 1: Deploy Smart Contracts

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Upload all files from `/contracts/` folder
3. Follow deployment instructions in `/contracts/README.md`
4. Deploy in this order:
   - RestaurantRegistry
   - RiderRegistry
   - Escrow
   - OrderManager
5. Save all contract addresses!

### Step 2: Setup Frontend

```bash
cd frontend
npm install
```

### Step 3: Configure Contract Addresses

Edit `frontend/src/contracts/addresses.js`:
```javascript
export const CONTRACTS = {
  RestaurantRegistry: "0xYOUR_ADDRESS_HERE",
  RiderRegistry: "0xYOUR_ADDRESS_HERE",
  Escrow: "0xYOUR_ADDRESS_HERE",
  OrderManager: "0xYOUR_ADDRESS_HERE",
};
```

### Step 4: Run Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3000

## 🔧 Technology Stack

### Blockchain
- **Solidity ^0.8.20** - Smart contract language
- **OpenZeppelin** - Secure contract libraries
- **Ethereum Sepolia** - Test network
- **Remix IDE** - Contract deployment

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Wagmi 2.0** - React hooks for Ethereum
- **RainbowKit** - Wallet connection
- **TailwindCSS** - Styling
- **React Router** - Navigation

### Storage
- **IPFS/Pinata** - Decentralized file storage for menus and metadata

## 📝 Smart Contract Overview

### RestaurantRegistry
Manages restaurant registrations and profiles.

**Key Functions:**
- `registerRestaurant()` - Register a new restaurant
- `updateMenu()` - Update restaurant menu
- `getRestaurant()` - Get restaurant details

### RiderRegistry
Manages delivery rider registrations.

**Key Functions:**
- `registerRider()` - Register as a rider
- `setAvailability()` - Toggle availability status
- `getAvailableRiders()` - Get list of available riders

### Escrow
Handles payment escrow and distribution.

**Key Functions:**
- `deposit()` - Deposit payment for order
- `release()` - Release payment after delivery
- `refund()` - Refund customer if order cancelled

**Fee Structure:**
- Restaurant: 80%
- Rider: 10%
- Platform: 10%

### OrderManager
Main contract managing the order lifecycle.

**Order Status Flow:**
```
Created → Accepted → Prepared → PickedUp → Delivered → Completed
```

**Key Functions:**
- `createOrder()` - Customer places order
- `acceptOrder()` - Restaurant accepts order
- `markPrepared()` - Food ready for pickup
- `assignRider()` - Assign rider to delivery
- `markPickedUp()` - Rider picked up food
- `markDelivered()` - Rider delivered food
- `confirmDelivery()` - Customer confirms (releases payment!)

## 💰 How Payment Works

1. **Customer places order** → Sends ETH to Escrow contract
2. **Escrow holds funds** → Money is safe and locked
3. **Order fulfilled** → Restaurant prepares, rider delivers
4. **Customer confirms** → Triggers automatic payment release:
   - 80% → Restaurant wallet
   - 10% → Rider wallet
   - 10% → Platform wallet

## 🎓 Learning Resources

- **Beginner's Guide**: Read `beginner-guide-pdf.md` for detailed explanations
- **Development Roadmap**: Check `food-delivery-roadmap.md` for implementation guide
- **Solidity Documentation**: https://docs.soliditylang.org/
- **Wagmi Documentation**: https://wagmi.sh/
- **Sepolia Explorer**: https://sepolia.etherscan.io/

## 🧪 Testing on Sepolia

### Get Test ETH
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Receive free test ETH (usually 0.5 ETH)

### Test the Complete Flow

1. **Register Restaurant**
   - Go to Restaurant Dashboard
   - Fill in restaurant details
   - Confirm transaction in MetaMask

2. **Register Rider**
   - Go to Rider Dashboard
   - Fill in rider details
   - Set availability to "Available"

3. **Create Order**
   - Browse restaurants on homepage
   - Select items and add to cart
   - Place order with test ETH

4. **Restaurant Actions**
   - Accept the order
   - Mark as prepared
   - Assign available rider

5. **Rider Actions**
   - Mark order as picked up
   - Mark as delivered

6. **Customer Confirmation**
   - Confirm delivery received
   - ✅ Payment automatically released!

## 🔐 Security Features

- ✅ ReentrancyGuard on all state-changing functions
- ✅ Ownable pattern for admin functions
- ✅ Input validation on all parameters
- ✅ Escrow pattern for secure payments
- ✅ Role-based access control
- ✅ Event emission for transparency

## 📊 Gas Costs (Approximate on Sepolia)

| Action | Gas Cost |
|--------|----------|
| Register Restaurant | ~0.001 ETH |
| Register Rider | ~0.0008 ETH |
| Create Order | ~0.001 ETH |
| Accept Order | ~0.0003 ETH |
| Confirm Delivery | ~0.0005 ETH |

## 🐛 Troubleshooting

### "Transaction Failed"
- Check you have enough Sepolia ETH
- Ensure you're on Sepolia network in MetaMask
- Verify contract addresses are correct

### "Already Registered"
- Each wallet can only register once as restaurant/rider
- Use a different wallet address

### "Only OrderManager"
- Make sure you called `setOrderManager()` on Escrow contract
- This is done after deploying OrderManager

### "Restaurant Not Active"
- Restaurant owner needs to set status to "Open"
- Check restaurant dashboard

## 🤝 Contributing

This is an educational project for learning blockchain development!

## 📄 License

MIT License - Feel free to use for learning and education

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract templates
- Ethereum Foundation for Sepolia testnet
- RainbowKit team for excellent wallet integration
- All the amazing blockchain educators and content creators

## 📞 Support

- Read the beginner's guide for detailed explanations
- Check Remix IDE console for deployment errors
- Use Sepolia Etherscan to debug transactions
- Refer to Wagmi docs for frontend issues

## 🎯 Next Steps

1. ✅ Deploy contracts on Sepolia
2. ✅ Test complete order flow
3. 🔄 Add rating system
4. 🔄 Implement dispute resolution
5. 🔄 Add IPFS integration for real menu data
6. 🔄 Build mobile app
7. 🔄 Deploy on mainnet (after audit!)

---

Built with ❤️ for learning blockchain development

**⚠️ Important**: This is deployed on Sepolia TESTNET. Never send real money! Always use test ETH for development.

