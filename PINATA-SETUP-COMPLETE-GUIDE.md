# Complete Pinata Setup Guide - Step by Step

## 🎯 What You Need

You need **API Keys** from Pinata (NOT file uploads). The "upload file" option is for their web interface - we need API keys for your code to work.

---

## 📋 Step 1: Create Pinata Account (2 minutes)

1. **Go to**: https://pinata.cloud
2. **Click**: "Sign Up" (top right)
3. **Enter**:
   - Email address
   - Password (at least 8 characters)
4. **Click**: "Create Account"
5. **Check your email** and click the verification link
6. **You're in!** ✅

---

## 🔑 Step 2: Create API Keys (3 minutes)

### Option A: Using Pinata Dashboard (Easiest)

1. **After logging in**, you'll see the Pinata dashboard
2. **Look at the left sidebar** - find "API Keys" or "Keys"
3. **Click**: "API Keys" or "Keys"
4. **Click**: "New Key" button (usually top right, green button)
5. **Fill in the form**:
   - **Key Name**: `FoodChain-Production` (or any name you like)
   - **Admin Key**: Leave this **UNCHECKED** (we don't need admin access)
   - **Permissions**: Check these two boxes:
     - ✅ **PinFileToIPFS** (for uploading files/images)
     - ✅ **PinJSONToIPFS** (for uploading JSON data - menus, orders, etc.)
6. **Click**: "Create Key" or "Generate Key"
7. **IMPORTANT**: You'll see a popup with:
   - **API Key**: `a1b2c3d4e5f6g7h8...` (long string)
   - **API Secret**: `xyz123abc456def789...` (long string)
8. **COPY BOTH IMMEDIATELY** - You won't see the secret again!
   - Copy API Key → Paste somewhere safe (Notes app, text file)
   - Copy API Secret → Paste somewhere safe

### Option B: If You Don't See "API Keys" Option

1. **Look for**: "Settings" or "Account Settings" in the sidebar
2. **Click**: "Settings"
3. **Find**: "API Keys" tab
4. **Follow steps 4-8 above**

---

## 🌐 Step 3: Add Keys to Vercel (5 minutes)

### For Production (Vercel - Your Live Site)

1. **Go to**: https://vercel.com
2. **Login** to your account
3. **Click**: Your project name (the one with your food delivery app)
4. **Click**: "Settings" (top menu)
5. **Click**: "Environment Variables" (left sidebar)
6. **Add First Variable**:
   - **Name**: `VITE_PINATA_API_KEY`
   - **Value**: (Paste your API Key from Step 2)
   - **Environment**: Check all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - **Click**: "Save"
7. **Add Second Variable**:
   - **Name**: `VITE_PINATA_SECRET`
   - **Value**: (Paste your API Secret from Step 2)
   - **Environment**: Check all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - **Click**: "Save"
8. **IMPORTANT**: After adding both variables, you MUST redeploy:
   - Go to "Deployments" tab (top menu)
   - Find your latest deployment
   - Click the "..." (three dots) menu
   - Click "Redeploy"
   - Wait for deployment to complete (2-3 minutes)

---

## 💻 Step 4: Test Locally (Optional - For Development)

If you want to test on your computer before deploying:

1. **Go to**: Your project folder
2. **Create file**: `frontend/.env` (in the `frontend` folder)
3. **Add these lines**:
   ```
   VITE_PINATA_API_KEY=your_actual_api_key_here
   VITE_PINATA_SECRET=your_actual_secret_here
   ```
   Replace `your_actual_api_key_here` and `your_actual_secret_here` with your real keys from Step 2
4. **Save the file**
5. **Restart your dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## ✅ Step 5: Verify It Works

### Test on Your Live Site (Vercel)

1. **Open your deployed app** (your Vercel URL)
2. **Open browser console** (F12 or Right-click → Inspect → Console tab)
3. **Try to register a restaurant**:
   - Fill in restaurant details
   - Add menu items
   - Click "Register"
4. **Check console**:
   - ✅ **Good**: You see `✅ Successfully uploaded to IPFS: QmX...`
   - ❌ **Bad**: You see `❌ IPFS NOT CONFIGURED` → Keys not set correctly

### Test Cross-Device

1. **Device A** (laptop):
   - Register restaurant
   - Add menu
   - Save
2. **Device B** (phone):
   - Open app
   - Browse restaurants
   - **Menu should be visible** ✅

---

## 🐛 Troubleshooting

### Problem: "IPFS NOT CONFIGURED" Error

**Causes**:
- Keys not added to Vercel
- Keys added but app not redeployed
- Typo in key names (must be exactly `VITE_PINATA_API_KEY` and `VITE_PINATA_SECRET`)

**Fix**:
1. Check Vercel Environment Variables are set
2. Make sure you checked all 3 environments (Production, Preview, Development)
3. Redeploy your app
4. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Problem: "Failed to upload to IPFS"

**Causes**:
- Wrong API key or secret
- Keys expired (rare)
- Internet connection issue

**Fix**:
1. Verify keys are correct (no extra spaces)
2. Create new API keys in Pinata
3. Update Vercel environment variables
4. Redeploy

### Problem: Can't Find "API Keys" in Pinata

**Solution**:
- Look for "Keys" or "API" in the sidebar
- Or go to: https://app.pinata.cloud/keys
- Or check "Settings" → "API Keys"

### Problem: "Upload File" Confusion

**Clarification**:
- "Upload File" in Pinata dashboard = Manual file upload (we don't need this)
- **API Keys** = What we need (for code to upload automatically)
- You're looking for "API Keys" or "Keys" section, NOT "Upload"

---

## 📸 Visual Guide (What to Look For)

### In Pinata Dashboard:

```
Left Sidebar:
├── Dashboard
├── Files          ← (This is for manual uploads - skip this)
├── API Keys       ← ✅ CLICK THIS ONE!
├── Settings
└── ...
```

### When Creating API Key:

```
Key Name: [FoodChain-Production]

Permissions:
☑ PinFileToIPFS      ← Check this
☑ PinJSONToIPFS      ← Check this
☐ Admin Key          ← Leave unchecked

[Create Key Button]
```

### In Vercel Environment Variables:

```
Name: VITE_PINATA_API_KEY
Value: [paste your API key here]
Environments:
☑ Production
☑ Preview
☑ Development

[Save Button]
```

---

## 🎯 Quick Checklist

- [ ] Pinata account created
- [ ] Email verified
- [ ] API Key created (with PinFileToIPFS and PinJSONToIPFS permissions)
- [ ] API Key copied
- [ ] API Secret copied
- [ ] Both keys added to Vercel environment variables
- [ ] All 3 environments checked (Production, Preview, Development)
- [ ] App redeployed on Vercel
- [ ] Tested restaurant registration
- [ ] Console shows "✅ Successfully uploaded to IPFS"
- [ ] Tested cross-device (menu visible on different device)

---

## 💡 Important Notes

1. **Never share your API Secret** publicly
2. **Never commit `.env` file** to git (it's already in `.gitignore`)
3. **API Secret is shown only once** - if you lose it, create a new key
4. **Free tier is enough** for your project (1 GB storage)
5. **Keys work immediately** after adding to Vercel and redeploying

---

## 🆘 Still Stuck?

**Common Questions**:

**Q: Do I need to upload files manually?**
A: No! API keys let your code upload automatically. You don't need to upload anything manually.

**Q: What if I lose my API Secret?**
A: Create a new API key in Pinata, then update Vercel environment variables.

**Q: How do I know if it's working?**
A: Check browser console when registering restaurant - you should see "✅ Successfully uploaded to IPFS"

**Q: Can I use the same keys for development and production?**
A: Yes! That's why we check all 3 environments in Vercel.

---

## ✅ You're Done!

Once you complete these steps:
- ✅ Your app can upload menus to IPFS
- ✅ Your app can create orders with IPFS data
- ✅ Everything works cross-device
- ✅ No more localStorage issues

**Next**: Test by registering a restaurant and checking if menu is visible on another device!

