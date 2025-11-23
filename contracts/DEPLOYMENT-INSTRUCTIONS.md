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

**⚠️ CRITICAL CHANGE**: RiderRegistry now requires RoleManager parameter in constructor!

1. **Compile** with viaIR enabled
2. **Go to Deploy Tab** (4th icon on left)
3. **Select Environment**: "Injected Provider - MetaMask"
4. **Connect Wallet** → Select Sepolia testnet
5. **Deploy**
   - Contract: `RiderRegistry`
   - Constructor: `_roleManager` - Enter your RoleManager address
     - Example: `0x2f208c050Ed931c31DeDAA80CD4329224B2c748E`
   - Click "Deploy"
6. **Confirm Transaction** in MetaMask
7. **Copy Contract Address** from deployed contracts section

**⚠️ IMPORTANT**: 
- Old RiderRegistry had no constructor parameters - this is a BREAKING CHANGE
- You MUST deploy a new RiderRegistry with RoleManager parameter
- After deployment, you MUST authorize RiderRegistry in RoleManager (see below)

---

## 🔗 After Deployment:

1. **Authorize RiderRegistry in RoleManager (CRITICAL!)**:
   - Go to your RoleManager contract
   - Call `authorizeContract` function
   - Enter your NEW RiderRegistry address
   - Confirm transaction
   - ⚠️ **If you skip this, rider registration will FAIL!**
   - Why? RiderRegistry calls `roleManager.assignRiderRole()` during registration

2. **Set OrderManager** (after OrderManager is deployed):
   ```solidity
   riderRegistry.setOrderManager(0xOrderManagerAddress)
   ```

3. **Update Frontend**:
   Edit `frontend/src/contracts/addresses.js`:
   ```javascript
   export const CONTRACTS = {
     RoleManager: "0x2f208c050Ed931c31DeDAA80CD4329224B2c748E",
     RestaurantRegistry: "0x13f14FbE548742f1544BB44A9ad3714F93A02DF3",
     RiderRegistry: "0xYOUR_NEW_DEPLOYED_ADDRESS",  // ⚠️ UPDATE THIS
     Escrow: "0xYOUR_ESCROW_ADDRESS",
     OrderManager: "0xYOUR_ORDERMANAGER_ADDRESS",
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
- Check you deployed with correct constructor (now requires RoleManager!)
- Verify contract address in frontend
- Make sure you're on Sepolia testnet
- **CRITICAL**: Did you authorize RiderRegistry in RoleManager? Registration will fail if not authorized!

### "Cannot register: Address already has another role"
- This is CORRECT behavior! One wallet = one role only
- If you're already a restaurant, you can't register as rider
- Use a different wallet for each role

---

## 📚 Additional Resources:

- [Solidity viaIR Documentation](https://docs.soliditylang.org/en/latest/ir-breaking-changes.html)
- [Stack Too Deep Solutions](https://ethereum.stackexchange.com/questions/107032/compiler-error-stack-too-deep)
- [Remix IDE Guide](https://remix-ide.readthedocs.io/)

---

**Need Help?** Check the error message carefully - it usually tells you which function is causing the issue!

---

**Last Updated:** January 2025  
**Solidity Version:** 0.8.20  
**Status:** ✅ Ready for Deployment (with viaIR + RoleManager integration)

## ⚠️ BREAKING CHANGES:

- **RiderRegistry constructor now requires `_roleManager` parameter**
- **Must authorize RiderRegistry in RoleManager after deployment**
- **Old RiderRegistry (without RoleManager) is deprecated - deploy new one**

