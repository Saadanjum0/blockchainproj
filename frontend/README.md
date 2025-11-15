# 🎨 FoodChain Frontend

React frontend for the decentralized food delivery platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```env
# Required for WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional - for IPFS uploads
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET=your_pinata_secret_key
```

**Get WalletConnect Project ID:**
1. Go to https://cloud.walletconnect.com/
2. Create a free account
3. Create a new project
4. Copy the Project ID

### 3. Configure Contract Addresses

Edit `src/contracts/addresses.js` with your deployed contract addresses:

```javascript
export const CONTRACTS = {
  RestaurantRegistry: "0xYOUR_RESTAURANT_REGISTRY_ADDRESS",
  RiderRegistry: "0xYOUR_RIDER_REGISTRY_ADDRESS",
  Escrow: "0xYOUR_ESCROW_ADDRESS",
  OrderManager: "0xYOUR_ORDER_MANAGER_ADDRESS",
};
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📦 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🛠️ Built With

### Core
- **React 18.2** - UI library
- **Vite 5.0** - Build tool and dev server
- **React Router 6** - Client-side routing

### Blockchain
- **Wagmi 2.5** - React hooks for Ethereum
- **Viem 2.7** - Ethereum library
- **RainbowKit 2.0** - Wallet connection UI
- **@tanstack/react-query 5** - Data fetching and caching

### Styling
- **TailwindCSS 3.4** - Utility-first CSS
- **Lucide React** - Icon library

### Other
- **Axios** - HTTP client for IPFS
- **IPFS/Pinata** - Decentralized storage

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── contracts/       # Smart contract ABIs and addresses
│   │   ├── abis.js
│   │   └── addresses.js
│   │
│   ├── hooks/           # Custom React hooks
│   │   ├── useRestaurants.js
│   │   ├── useRiders.js
│   │   └── useOrders.js
│   │
│   ├── pages/           # Page components
│   │   ├── HomePage.jsx
│   │   ├── CreateOrderPage.jsx
│   │   ├── MyOrders.jsx
│   │   ├── OrderTrackingPage.jsx
│   │   ├── RestaurantDashboard.jsx
│   │   └── RiderDashboard.jsx
│   │
│   ├── utils/           # Utility functions
│   │   └── ipfs.js
│   │
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎣 Custom Hooks

### useRestaurants
```javascript
import { useRestaurantCount, useRestaurant, useRegisterRestaurant } from './hooks/useRestaurants';

// Get total restaurant count
const { restaurantCount } = useRestaurantCount();

// Get specific restaurant
const { restaurant, isLoading } = useRestaurant(restaurantId);

// Register new restaurant
const { registerRestaurant, isPending, isSuccess } = useRegisterRestaurant();
await registerRestaurant(ipfsMenuHash, metadataURI);
```

### useOrders
```javascript
import { useCreateOrder, useOrder, useConfirmDelivery } from './hooks/useOrders';

// Create new order
const { createOrder, isPending, isSuccess, hash } = useCreateOrder();
await createOrder(restaurantId, ipfsOrderHash, amountInEth, tip);

// Get order details
const { order, isLoading } = useOrder(orderId);

// Confirm delivery (customer)
const { confirmDelivery } = useConfirmDelivery();
await confirmDelivery(orderId);
```

### useRiders
```javascript
import { useRegisterRider, useSetRiderAvailability } from './hooks/useRiders';

// Register as rider
const { registerRider, isPending } = useRegisterRider();
await registerRider(metadataURI);

// Toggle availability
const { setAvailability } = useSetRiderAvailability();
await setAvailability(true); // Set to available
```

## 🎨 Styling

This project uses TailwindCSS with custom utility classes:

```jsx
// Primary button
<button className="btn-primary">
  Click Me
</button>

// Secondary button
<button className="btn-secondary">
  Cancel
</button>

// Card container
<div className="card">
  Content here
</div>

// Input field
<input className="input-field" />
```

Custom colors defined in `tailwind.config.js`:
- Primary: Orange shades (orange-50 to orange-900)

## 🔌 IPFS Integration

### Upload Data to IPFS

```javascript
import { uploadToIPFS, createOrderData } from './utils/ipfs';

// Upload order data
const orderData = {
  items: cart,
  restaurantId,
  customer: address,
  deliveryAddress: '123 Main St',
};

const ipfsHash = await createOrderData(orderData);
// Returns: "QmXxx..."
```

### Fetch from IPFS

```javascript
import { fetchFromIPFS } from './utils/ipfs';

const data = await fetchFromIPFS('QmXxx...');
console.log(data); // Order data object
```

## 🌐 Network Configuration

App is configured for **Sepolia Testnet**:

- Chain ID: 11155111
- RPC: https://rpc.sepolia.org
- Explorer: https://sepolia.etherscan.io

To change networks, edit `src/main.jsx`:

```javascript
import { sepolia, mainnet } from 'wagmi/chains';

const config = getDefaultConfig({
  chains: [sepolia], // Change to [mainnet] for production
  // ...
});
```

## 🐛 Common Issues

### "Cannot read properties of undefined"
- Make sure contract addresses are set in `addresses.js`
- Verify you're connected to Sepolia network

### "User rejected the request"
- User cancelled transaction in MetaMask
- This is normal behavior

### "Insufficient funds"
- Get more Sepolia ETH from faucet
- Check gas price settings

### "Invalid address"
- Contract address format is incorrect
- Should be 42 characters starting with "0x"

## 🔧 Development Tips

### Hot Module Replacement
Vite provides instant HMR. Your changes appear immediately without full page reload.

### React DevTools
Install React DevTools browser extension for debugging:
- Component tree inspection
- Props and state viewing
- Performance profiling

### MetaMask Testing
Use MetaMask's test networks:
1. Click MetaMask extension
2. Switch network to "Sepolia"
3. Import test accounts if needed

### Transaction Debugging
View all transactions on Sepolia Etherscan:
```
https://sepolia.etherscan.io/address/YOUR_WALLET_ADDRESS
```

## 📱 Responsive Design

App is fully responsive:
- Mobile: Single column layout
- Tablet: 2 column grid
- Desktop: 3 column grid

Breakpoints (TailwindCSS):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🚀 Production Build

### Build the App

```bash
npm run build
```

Output in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Deploy

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### GitHub Pages
```bash
# Build with base path
npm run build -- --base=/your-repo-name/

# Deploy to gh-pages branch
```

## 🔐 Environment Variables

Never commit `.env` file! It's already in `.gitignore`.

Required variables:
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID

Optional variables:
- `VITE_PINATA_API_KEY` - Pinata API key for IPFS
- `VITE_PINATA_SECRET` - Pinata secret key
- `VITE_SEPOLIA_RPC_URL` - Custom RPC endpoint

## 📚 Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://rainbowkit.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly on Sepolia
4. Submit a pull request

## 📄 License

MIT

---

Happy coding! 🚀🍕

