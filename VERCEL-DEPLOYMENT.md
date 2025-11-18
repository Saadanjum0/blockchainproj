# Vercel Deployment Guide

This guide walks you through deploying the FoodChain decentralized food delivery dapp to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your repository pushed to GitHub
- All smart contracts deployed to Sepolia testnet
- Contract addresses configured in `frontend/src/contracts/addresses.js`

## Quick Deploy

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

3. **Import your repository**
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

4. **Configure project settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (~2-3 minutes)
   - Your site will be live at `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from the frontend directory**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Follow the prompts**
   - Set up and deploy? `Y`
   - Scope: Select your account
   - Link to existing project? `N` (first time) or `Y` (subsequent deploys)
   - Project name: `foodchain-dapp` (or your choice)
   - Directory: `./` (already in frontend folder)

## Important Configuration

### 1. Contract Addresses (Already Done ✅)

Your contract addresses are configured in:
```
frontend/src/contracts/addresses.js
```

Current deployment addresses (Sepolia):
- **RoleManager**: `0x2f208c050Ed931c31DeDAA80CD4329224B2c748E`
- **RestaurantRegistry**: `0x13f14FbE548742f1544BB44A9ad3714F93A02DF3`
- **RiderRegistry**: `0x2a8F6e0E27E1160F603E90B267a2De7dAc9432F7`
- **Escrow**: `0xe1A88562C2AF4913cFEaD16105eD51996f11cE6d`
- **OrderManager**: `0xdd938211EFbfe6374DDD475C76C0fd10Acde7EB3`

### 2. Routing Configuration (Already Done ✅)

The `vercel.json` file is configured to handle React Router client-side routing:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Environment Variables

This dapp doesn't require environment variables since all contract addresses are hardcoded. However, if you add any API keys or secrets in the future:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add variables as `KEY=VALUE`
4. Redeploy for changes to take effect

## Post-Deployment Checklist

After your site is deployed, verify the following:

### ✅ Wallet Connection
- [ ] Connect MetaMask wallet
- [ ] Switch to Sepolia testnet
- [ ] Verify wallet address shows correctly

### ✅ Role Selection
- [ ] New users see role selection screen (Customer/Restaurant/Rider)
- [ ] Selecting a role navigates to the correct page
- [ ] Can disconnect and reconnect wallet

### ✅ Restaurant Features
- [ ] Restaurant owners can register
- [ ] Can update restaurant status (Open/Closed)
- [ ] Can manage menu items
- [ ] Orders appear in dashboard
- [ ] Can accept orders
- [ ] Can mark orders as prepared

### ✅ Customer Features
- [ ] Can browse restaurants
- [ ] Can view restaurant menus
- [ ] Can place orders
- [ ] Can track orders in real-time
- [ ] Can confirm delivery and rate

### ✅ Rider Features
- [ ] Riders can register
- [ ] Can see available deliveries
- [ ] Can pick up orders
- [ ] Can mark as delivered

### ✅ Smart Contract Interactions
- [ ] All transactions prompt MetaMask
- [ ] Gas fees are reasonable (~$0.10-$1.00 on Sepolia)
- [ ] Transactions complete successfully
- [ ] Order statuses update correctly
- [ ] Payments are processed

## Custom Domain (Optional)

To add a custom domain to your Vercel deployment:

1. **Go to your Vercel project**
2. **Click "Settings" → "Domains"**
3. **Add your domain**
   - Enter your domain (e.g., `foodchain.example.com`)
   - Click "Add"
4. **Configure DNS**
   - Add the provided DNS records to your domain registrar
   - Type: `A` or `CNAME`
   - Value: Provided by Vercel
5. **Wait for DNS propagation** (5-60 minutes)

## Troubleshooting

### Build Fails

**Issue**: Build fails with `npm ERR!` or module not found errors

**Solution**:
```bash
# Locally test the build
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build

# If successful, commit and push
git add .
git commit -m "Fix build dependencies"
git push origin main
```

### Blank Page After Deployment

**Issue**: Site loads but shows blank page or "Cannot GET /"

**Solution**: Ensure `vercel.json` exists in the `frontend/` directory with the routing configuration.

### Wallet Connection Issues

**Issue**: Wallet doesn't connect or shows wrong network

**Solution**:
- Ensure you're on Sepolia testnet (Chain ID: 11155111)
- Check MetaMask → Settings → Networks → Add Sepolia if not present
- Try disconnecting and reconnecting wallet

### Contract Interaction Fails

**Issue**: Transactions fail or show "execution reverted"

**Solution**:
- Verify all contracts are deployed to Sepolia
- Check `frontend/src/contracts/addresses.js` has correct addresses
- Ensure all linking transactions were completed (`setOrderManager`, `authorizeContract`)
- Check you have enough Sepolia ETH ([Get testnet ETH](https://sepoliafaucet.com))

### High Gas Fees

**Issue**: Transactions show very high gas fees

**Solution**:
- Ensure you're using the optimized contracts (already deployed)
- Gas should be ~$0.10-$1.00 on Sepolia testnet
- If fees are higher, redeploy contracts following `FINAL-DEPLOYMENT-GUIDE.md`

### Role Detection Stuck

**Issue**: App stuck on "Loading your profile..."

**Solution**:
```javascript
// Open browser DevTools → Console
// Check for errors like:
// - "Role detection timed out"
// - Contract call errors
// - CORS errors (shouldn't happen on Vercel)

// Clear localStorage and try again:
localStorage.clear();
// Refresh page
```

## Redeployment

To redeploy after making changes:

### Automatic (via Git)
```bash
# Make changes to your code
git add .
git commit -m "Update feature X"
git push origin main
# Vercel will automatically redeploy
```

### Manual (via CLI)
```bash
cd frontend
vercel --prod
```

## Production Best Practices

### 1. Enable Preview Deployments
- Every pull request gets a unique preview URL
- Test changes before merging to main
- Enabled by default on Vercel

### 2. Monitor Performance
- Visit Vercel Dashboard → Analytics
- Check page load times
- Monitor function invocations (if any)

### 3. Set Up Monitoring
- Enable Vercel Analytics (optional paid feature)
- Use browser DevTools → Console for error tracking
- Monitor blockchain events for contract issues

### 4. Regular Updates
- Keep dependencies updated: `npm update`
- Check for security vulnerabilities: `npm audit`
- Test thoroughly before deploying

## Maintenance

### Update Contract Addresses

If you redeploy smart contracts:

1. **Update addresses**
   ```javascript
   // frontend/src/contracts/addresses.js
   export const CONTRACTS = {
     RoleManager: '0xNEW_ADDRESS',
     RestaurantRegistry: '0xNEW_ADDRESS',
     // ... etc
   };
   ```

2. **Commit and push**
   ```bash
   git add frontend/src/contracts/addresses.js
   git commit -m "Update contract addresses"
   git push origin main
   ```

3. **Vercel auto-deploys** (or trigger manual deployment)

### Update ABIs

If you modify smart contract functions:

1. **Copy new ABIs from compiled contracts**
2. **Update `frontend/src/contracts/abis.js`**
3. **Test locally**: `npm run dev`
4. **Deploy**: `git push origin main`

## Support

For issues or questions:
- Check the [Vercel Documentation](https://vercel.com/docs)
- Check the [FINAL-DEPLOYMENT-GUIDE.md](./FINAL-DEPLOYMENT-GUIDE.md) for contract deployment
- Review browser DevTools → Console for frontend errors
- Check MetaMask for transaction issues

---

## Summary

**Your dapp is now ready for Vercel deployment!** 🎉

1. ✅ Contracts deployed to Sepolia
2. ✅ Addresses configured in frontend
3. ✅ Build tested and working
4. ✅ Routing configured for React Router
5. ✅ Role selection fixed (always shows for new users)

Simply push to GitHub and import to Vercel, or use `vercel --prod` from the `frontend/` directory.

Your users will be able to:
- Connect MetaMask
- Choose their role (Customer/Restaurant/Rider)
- Interact with the blockchain
- Place orders, deliver food, and earn crypto! 🍕🚀

