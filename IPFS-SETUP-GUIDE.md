# IPFS Setup Guide (Pinata)

## ⚠️ CRITICAL: IPFS Configuration Required

This application **REQUIRES** IPFS (Pinata) configuration to work across multiple devices. Without it:
- ❌ Restaurant menus cannot be viewed on other devices
- ❌ Orders cannot be created
- ❌ Rider data is not accessible cross-device
- ❌ All IPFS operations will fail with clear error messages

## Why IPFS?

IPFS (InterPlanetary File System) provides:
- ✅ **Cross-device accessibility**: Register on laptop, view on phone
- ✅ **Decentralized storage**: No single point of failure
- ✅ **Immutable data**: Content-addressed storage
- ✅ **Blockchain integration**: IPFS hashes stored on-chain

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Pinata API Keys (Free)

1. Go to https://pinata.cloud
2. Click "Sign Up" (it's FREE - no credit card required)
3. Verify your email
4. Go to **API Keys** section (left sidebar)
5. Click **"New Key"** button
6. **Name**: `FoodChain-Production`
7. **Permissions**: Check "PinFileToIPFS" and "PinJSONToIPFS"
8. Click **"Generate Key"**
9. **IMPORTANT**: Copy both:
   - API Key
   - API Secret
   (You won't see these again!)

### Step 2: Configure for Development (Local)

Create a file named `.env` in the `frontend/` directory:

```bash
cd frontend
touch .env
```

Add these lines to `.env`:

```env
VITE_PINATA_API_KEY=your_actual_api_key_here
VITE_PINATA_SECRET=your_actual_secret_key_here
```

**Example:**
```env
VITE_PINATA_API_KEY=a1b2c3d4e5f6g7h8
VITE_PINATA_SECRET=xyz123abc456def789
```

### Step 3: Configure for Production (Vercel)

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add **TWO** variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_PINATA_API_KEY` | (paste your API key) | Production, Preview, Development |
| `VITE_PINATA_SECRET` | (paste your secret) | Production, Preview, Development |

4. Click **"Save"**
5. **Redeploy** your application (Vercel → Deployments → click "..." → Redeploy)

### Step 4: Test Configuration

After deployment, test by:
1. Registering a new restaurant
2. Adding menu items
3. Open the same app on a different device/browser
4. You should see the restaurant and menu

## 🔧 Troubleshooting

### Error: "IPFS NOT CONFIGURED"

**Cause**: Pinata API keys not set or incorrect

**Fix**:
1. Check your `.env` file exists in `frontend/` directory
2. Verify the keys are correct (no extra spaces, quotes, or newlines)
3. Restart your development server: `npm run dev`
4. For Vercel: Check Environment Variables are set correctly
5. Redeploy on Vercel

### Error: "This menu is not accessible across devices"

**Cause**: Menu was created with old `localStorage` fallback (before Pinata was configured)

**Fix**:
1. Go to Restaurant Dashboard
2. Click **Menu Management** → **Edit Menu**
3. Re-save the menu (this uploads to IPFS properly)
4. Now it will work on all devices

### Error: "Failed to upload to IPFS"

**Cause**: Network issue or Pinata service down

**Fix**:
1. Check your internet connection
2. Try again in a few seconds
3. Check Pinata status: https://status.pinata.cloud
4. Verify your API keys haven't expired

### Error: "FAILED TO FETCH FROM IPFS"

**Cause**: IPFS gateways are slow or temporarily unavailable

**Fix**:
1. Wait 10-20 seconds and refresh
2. IPFS data can take a few seconds to propagate across gateways
3. Check your internet connection
4. Try again later (data is permanently stored, just temporarily unreachable)

## 🧹 Clean Up Old Data

If you created restaurants/menus BEFORE configuring Pinata, they used `localStorage` (device-specific storage). To fix:

### Option 1: Re-upload Menu (Recommended)
1. Open app on the ORIGINAL device where restaurant was created
2. Go to Restaurant Dashboard → Menu Management
3. Edit and re-save the menu
4. This uploads to IPFS and updates the on-chain hash

### Option 2: Re-register Restaurant
1. Use a different wallet address
2. Register restaurant again (with Pinata configured)
3. This creates a fresh restaurant with proper IPFS storage

## 📊 Verify IPFS is Working

### Check in Browser Console:

**Good** ✅:
```
Uploading to IPFS via Pinata...
✅ Successfully uploaded to IPFS: QmX1234...
```

**Bad** ❌:
```
❌ IPFS NOT CONFIGURED
Pinata API credentials are required...
```

### Check IPFS Hashes:

On Etherscan:
1. Go to your RestaurantRegistry contract
2. Read `getRestaurant(restaurantId)`
3. Look at `ipfsMenuHash`:
   - ✅ Good: `QmX1234abcd...` (46 characters starting with Qm)
   - ❌ Bad: `local_1234...` (localStorage hash)

## 🔒 Security Notes

- ✅ **DO**: Keep your `.env` file private (it's in `.gitignore`)
- ✅ **DO**: Use different API keys for development and production
- ✅ **DO**: Rotate API keys periodically
- ❌ **DON'T**: Commit `.env` to git
- ❌ **DON'T**: Share your API keys publicly
- ❌ **DON'T**: Use the same keys across multiple projects

## 💰 Pinata Pricing

- **Free Tier**: 1 GB storage, 100 GB bandwidth/month
- **More than enough** for this project
- Upgrade only if you have 1000+ restaurants

## 📝 What Gets Stored on IPFS?

1. **Restaurant Metadata** (`metadataURI`):
   - Name, description, address, cuisine
   - ~1 KB per restaurant

2. **Restaurant Menu** (`ipfsMenuHash`):
   - All menu items with prices
   - ~5-10 KB per menu

3. **Order Details** (`ipfsOrderHash`):
   - Items ordered, delivery address, customer info
   - ~2-5 KB per order

4. **Rider Metadata** (`metadataURI`):
   - Name, vehicle type, phone
   - ~0.5 KB per rider

**Total**: For 100 restaurants with menus, you'll use ~1-2 MB

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Pinata API keys obtained
- [ ] `.env` file created locally with keys
- [ ] Vercel environment variables configured
- [ ] Application redeployed on Vercel
- [ ] Tested creating restaurant on one device
- [ ] Tested viewing restaurant on different device
- [ ] Tested menu visibility across devices
- [ ] Tested order creation with IPFS upload

## 🆘 Still Having Issues?

1. Check browser console for detailed error messages
2. Verify Pinata dashboard shows uploaded files
3. Try creating a test restaurant with Pinata configured
4. Check network tab to see IPFS API calls
5. Ensure you're on the latest deployment (hard refresh: Cmd/Ctrl + Shift + R)

---

**Remember**: Once Pinata is configured, ALL new data will work seamlessly across devices! 🎉

