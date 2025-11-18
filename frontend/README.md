# FoodChain Frontend

Decentralized food delivery platform frontend built with React, Vite, and wagmi.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3001`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📦 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **wagmi** - React Hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **viem** - Ethereum library
- **Tanstack Query** - Data fetching and caching
- **Lucide React** - Icons

## 🔗 Smart Contract Configuration

Contract addresses are configured in:
```
src/contracts/addresses.js
```

ABIs are in:
```
src/contracts/abis.js
```

## 🌐 Deployment

### Deploy to Vercel

See [VERCEL-DEPLOYMENT.md](../VERCEL-DEPLOYMENT.md) for detailed instructions.

**Quick deploy:**
```bash
npm install -g vercel
vercel --prod
```

## 📁 Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── contracts/      # Contract addresses and ABIs
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── vercel.json         # Vercel configuration
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Dependencies and scripts
```

## 🎨 Features

- **Wallet Connection**: MetaMask integration via RainbowKit
- **Role-Based UI**: Different interfaces for customers, restaurants, and riders
- **Real-Time Updates**: Order tracking and status updates
- **Responsive Design**: Mobile-first, works on all devices
- **Blockchain Integration**: Direct smart contract interaction
- **IPFS Support**: Decentralized storage for menus and metadata

## 🔧 Development

### Environment

Runs on **Sepolia testnet** (Chain ID: 11155111)

### Scripts

```bash
npm run dev        # Start dev server on localhost:3001
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Adding New Features

1. **New Page**: Add component to `src/pages/` and route in `App.jsx`
2. **New Hook**: Add to `src/hooks/` for reusable logic
3. **New Contract Function**: Update ABIs in `src/contracts/abis.js`
4. **Styling**: Use Tailwind classes (see `tailwind.config.js`)

## 🐛 Troubleshooting

### Wallet won't connect
- Ensure MetaMask is installed
- Switch to Sepolia testnet
- Check browser console for errors

### Transactions fail
- Verify you have Sepolia ETH ([Get testnet ETH](https://sepoliafaucet.com))
- Check contract addresses in `src/contracts/addresses.js`
- Ensure contracts are linked (`setOrderManager`, `authorizeContract`)

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Role detection stuck
```javascript
// Open DevTools → Console, then:
localStorage.clear();
// Refresh page
```

## 📝 License

MIT License - See [LICENSE](../LICENSE) for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🔗 Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Built with ❤️ for the decentralized future 🚀
