# 🚀 RiderRegistry Deployment Instructions

## ⚠️ "Stack Too Deep" Error Fix

If you're getting "Stack too deep" errors when compiling, follow these steps:

---

## ✅ Solution 1: Enable viaIR + Optimizer (RECOMMENDED)

### In Remix IDE:

1. **Open Remix IDE**
   - Go to https://remix.ethereum.org
   - Open your `RiderRegistry.sol` file

2. **Go to Compiler Tab** (3rd icon on left sidebar)
   - Click "Solidity Compiler" tab

3. **Enable Optimizer**
   - ✅ Check "Enable optimization"
   - Set "Runs" to **200**

4. **Enable viaIR (Intermediate Representation)**
   - Click "Advanced Config" dropdown (below the compiler version)
   - Or click "Compiler Configuration" button
   - You'll see a JSON input field

5. **Add viaIR Configuration**
   ```json
   {
     "viaIR": true,
     "optimizer": {
       "enabled": true,
       "runs": 200
     }
   }
   ```

6. **Compile**
   - Click "Compile RiderRegistry.sol"
   - Should compile without "Stack too deep" errors!

---

## 📋 Step-by-Step Visual Guide:

### Method A: Using Advanced Config

```
Remix → Compiler Tab → Enable optimization ✓ → Runs: 200
                     → Advanced Config ▼
                     → Paste JSON:
```

```json
{
  "viaIR": true,
  "optimizer": {
    "enabled": true,
    "runs": 200
  }
}
```

### Method B: Using Compiler Configuration Button

1. Click "Compiler Configuration" button (gear icon)
2. A modal will open
3. Find or add `viaIR` field
4. Set to `true`
5. Ensure optimizer is enabled

---

## ✅ Solution 2: Manual Compiler Settings (Alternative)

If the JSON method doesn't work:

1. **Go to File Explorer** (1st icon on left)
2. Create new file: `.remix_config.json` in root
3. Add this content:
   ```json
   {
     "viaIR": true,
     "optimizer": {
       "enabled": true,
       "runs": 200
     }
   }
   ```
4. Remix should pick this up automatically

---

## 🎯 What is viaIR?

**viaIR (via Intermediate Representation)** is a Solidity compiler feature that:
- Uses an intermediate language before generating bytecode
- Allows the compiler to better optimize complex code
- Helps handle "stack too deep" errors
- Produces more efficient bytecode

**Trade-off:** Compilation takes longer, but code is optimized.

---

## 🔍 If viaIR Still Doesn't Work:

The code has already been optimized with:
- ✅ Internal helper functions (`_isRiderAvailable`, `_countAvailableRiders`)
- ✅ Storage pointers instead of memory copies
- ✅ `getRider()` returns individual values (not struct)
- ✅ Minimal local variables in functions

If you STILL get errors after enabling viaIR, try:

### Option A: Increase Optimizer Runs
```json
{
  "viaIR": true,
  "optimizer": {
    "enabled": true,
    "runs": 500
  }
}
```

### Option B: Use Older Solidity Version
- Try Solidity 0.8.19 or 0.8.18
- Some versions handle stack better

---

## 📝 Deployment Steps (After Compilation Success):

1. **Compile** with viaIR enabled
2. **Go to Deploy Tab** (4th icon on left)
3. **Select Environment**: "Injected Provider - MetaMask"
4. **Connect Wallet** → Select Sepolia testnet
5. **Deploy**
   - Contract: `RiderRegistry`
   - Constructor: Leave empty `()`
   - Click "Deploy"
6. **Confirm Transaction** in MetaMask
7. **Copy Contract Address** from deployed contracts section

---

## 🔗 After Deployment:

1. **Set OrderManager** (if needed):
   ```solidity
   riderRegistry.setOrderManager(0xOrderManagerAddress)
   ```

2. **Update Frontend**:
   Edit `frontend/src/contracts/addresses.js`:
   ```javascript
   export const CONTRACTS = {
     RiderRegistry: "0xYOUR_DEPLOYED_ADDRESS",
     // ... other contracts
   };
   ```

---

## ⚡ Quick Checklist:

- [ ] Opened Remix IDE
- [ ] Opened RiderRegistry.sol
- [ ] Went to Compiler tab
- [ ] Enabled optimization (Runs: 200)
- [ ] Added viaIR: true in JSON config
- [ ] Compiled successfully
- [ ] No "Stack too deep" errors
- [ ] Ready to deploy!

---

## 🆘 Troubleshooting:

### "viaIR not found in JSON"
- Make sure you're using Solidity 0.8.20
- viaIR requires Solidity >= 0.8.13

### "Still getting stack too deep"
- Increase optimizer runs to 500
- Try Solidity 0.8.19
- Check for other compilation errors first

### "Compilation is slow"
- This is normal with viaIR enabled
- First compilation takes 30-60 seconds
- Subsequent compilations are cached (faster)

### "Contract deployed but functions fail"
- Check you deployed with correct constructor
- Verify contract address in frontend
- Make sure you're on Sepolia testnet

---

## 📚 Additional Resources:

- [Solidity viaIR Documentation](https://docs.soliditylang.org/en/latest/ir-breaking-changes.html)
- [Stack Too Deep Solutions](https://ethereum.stackexchange.com/questions/107032/compiler-error-stack-too-deep)
- [Remix IDE Guide](https://remix-ide.readthedocs.io/)

---

**Need Help?** Check the error message carefully - it usually tells you which function is causing the issue!

---

**Last Updated:** November 15, 2025  
**Solidity Version:** 0.8.20  
**Status:** ✅ Ready for Deployment (with viaIR)

