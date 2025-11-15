# ⚡ Quick Start - 5 Minutes to Deploy!

## 🎯 Goal
Get your Food Delivery DApp running on Sepolia testnet in 5 minutes.

## ✅ Checklist

### Before You Start
- [ ] MetaMask installed
- [ ] Sepolia network added to MetaMask
- [ ] 0.5 Sepolia ETH in wallet ([Get from faucet](https://sepoliafaucet.com/))
- [ ] Node.js installed (v18+)

---

## 📝 Step 1: Deploy Contracts (2 minutes)

### Open Remix
👉 https://remix.ethereum.org/

### Upload Contracts
1. Drag all files from `/contracts/` folder into Remix
2. Compiler: Select **0.8.20**
3. Click **Compile All**

### Deploy in Order
Connect MetaMask to Remix, then deploy:

```
1. RestaurantRegistry ✅
   └─ Copy address → _____________________

2. RiderRegistry ✅
   └─ Copy address → _____________________

3. Escrow (platformWallet = YOUR_WALLET) ✅
   └─ Copy address → _____________________

4. OrderManager (address1, address2, address3) ✅
   └─ Copy address → _____________________

5. Link: Escrow.setOrderManager(OrderManager_Address) ✅
```

---

## 🎨 Step 2: Setup Frontend (2 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Edit `.env`
Get Project ID from https://cloud.walletconnect.com/

```env
VITE_WALLETCONNECT_PROJECT_ID=paste_here
```

### Edit `src/contracts/addresses.js`
Paste your deployed contract addresses:

```javascript
export const CONTRACTS = {
  RestaurantRegistry: "0x...", // From Step 1.1
  RiderRegistry: "0x...",      // From Step 1.2
  Escrow: "0x...",             // From Step 1.3
  OrderManager: "0x...",       // From Step 1.4
};
```

---

## 🚀 Step 3: Run! (1 minute)

```bash
npm run dev
```

Open: http://localhost:3000

Connect MetaMask → Start Using! 🎉

---

## 🧪 Quick Test Flow

### 1. Register Restaurant
```
Restaurant Dashboard → Fill Form → Confirm Transaction
```

### 2. Register Rider  
```
Rider Dashboard → Fill Form → Set Available
```

### 3. Create Order
```
Home → Click Restaurant → Add Items → Place Order
```

### 4. Complete Order
```
Restaurant: Accept → Prepare → Assign Rider
Rider: Pick Up → Deliver
Customer: Confirm → 💰 Payment Released!
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Transaction fails | Get more Sepolia ETH |
| Contract error | Check addresses in `addresses.js` |
| Page not loading | Run `npm install` again |
| "Already registered" | Use different wallet |
| "Only OrderManager" | Did you run `setOrderManager()`? |

---

## 📚 Need More Details?

- **Detailed Setup:** Read `SETUP_GUIDE.md`
- **Beginner's Guide:** Read `beginner-guide-pdf.md`
- **Code Documentation:** Read `README.md`

---

## 🎓 Learning Path

1. ✅ Follow this quickstart
2. 📖 Read beginner's guide for concepts
3. 🔧 Experiment with the code
4. 🚀 Add your own features!

---

**Ready? Let's build! 🚀**

Need help? Check the full `SETUP_GUIDE.md` for detailed instructions.

