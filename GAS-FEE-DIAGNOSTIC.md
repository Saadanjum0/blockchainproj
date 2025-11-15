# 🚨 GAS FEE TOO HIGH - Emergency Diagnostic

## Your Issue: 0.03 ETH gas fee

This is **60-300x too expensive**! Let's diagnose:

---

## ⚠️ IMMEDIATE CHECKS

### Check 1: Are you REALLY on Sepolia?

1. Open MetaMask
2. Look at the **very top** of MetaMask window
3. It should say: **"Sepolia Test Network"**

**If it says anything else (Ethereum Mainnet, Polygon, BSC, etc.):**
- **STOP IMMEDIATELY! DO NOT SEND TRANSACTION!**
- You're on the wrong network
- Switch to Sepolia Test Network NOW

### Check 2: What transaction are you trying?

**Restaurant Registration?**
- Normal: 0.0003 - 0.001 ETH
- Your quote: 0.03 ETH ❌

**Adding Menu Items?**
- Normal: 0.0001 - 0.0005 ETH
- Your quote: 0.03 ETH ❌

---

## 🔍 Possible Causes & Fixes

### Cause 1: Wrong Network (MOST LIKELY)

**Symptoms:**
- Gas fee is 0.03 ETH or higher
- MetaMask doesn't say "Sepolia" at the top

**Fix:**
```
1. Click network dropdown in MetaMask
2. Select "Sepolia Test Network"
3. Refresh the webpage
4. Try transaction again
```

### Cause 2: RoleManager Ownership Issue

**Symptoms:**
- Transaction fails when you try to send it
- Error message about "Not owner" or similar

**Why:** RestaurantRegistry needs to call RoleManager, but doesn't have permission

**Fix:**
```
Option A: Transfer RoleManager ownership to RestaurantRegistry
  1. Open Remix
  2. Load RoleManager contract at: 0x6A812ABBA8D9Cf99394F7986cc72D8Bdf2C828cB
  3. Call: transferOwnership(0x5d5beecBC1BfF46eF8E28D12c2AE4700E9e96B7c)
  4. Confirm transaction
  5. Wait 1-2 minutes
  6. Try restaurant registration again

Option B: Skip RoleManager (Temporary)
  - This might cause the high gas estimation
  - Better to fix Option A
```

### Cause 3: MetaMask Gas Estimation Error

**Symptoms:**
- On correct network (Sepolia)
- Still showing 0.03 ETH

**Fix:**
```
1. In MetaMask transaction window
2. Click "Edit" next to Gas Fee
3. Look at "Gas Limit"
4. If it's > 1,000,000 → Something's wrong
5. Try setting it manually to: 500,000
6. Estimated fee should drop to ~0.0005 ETH
```

### Cause 4: Contract Revert Simulation

**Symptoms:**
- MetaMask estimates high because transaction would fail
- Transaction will revert if you send it

**Common reasons:**
- RoleManager not configured properly
- Address already registered
- Missing permissions

**Fix:**
```
1. DON'T send the transaction
2. Check browser console (F12 → Console tab)
3. Look for error messages
4. Share error message for specific help
```

---

## 🧪 Quick Diagnostic Test

### Test 1: Check Network
```
1. Open MetaMask
2. Current network: _______________
3. Expected: Sepolia Test Network
4. Match? YES / NO
```

### Test 2: Check Gas Details
```
In MetaMask transaction preview:
1. Gas Limit: _______________
2. Max Priority Fee: _______________
3. Max Fee: _______________
4. Total Gas Fee: _______________
```

**Normal values for Sepolia:**
- Gas Limit: 200,000 - 500,000
- Max Priority Fee: 0.00000001 - 0.000001 ETH
- Max Fee: 0.00000001 - 0.00001 ETH
- Total: 0.0001 - 0.001 ETH

### Test 3: Check Transaction Type
```
What are you trying to do?
[ ] Register Restaurant
[ ] Add Menu Items
[ ] Create Order
[ ] Other: _______________
```

---

## 📊 Your Contract Addresses (for reference)

```
RoleManager:         0x6A812ABBA8D9Cf99394F7986cc72D8Bdf2C828cB
RestaurantRegistry:  0x5d5beecBC1BfF46eF8E28D12c2AE4700E9e96B7c
RiderRegistry:       0xab0705fC6056D6B44a34dc3970e2a5C79a1b3477
Escrow:              0xE86c5c8fC853BE4Dc2Af87bed06B21be35D52EBa
OrderManager:        0xb788da37eE2aC592CD9a53272B861a40b5cBcF2e
```

All should be on **Sepolia Testnet** (Chain ID: 11155111)

---

## ✅ Action Steps RIGHT NOW:

1. **STOP** - Don't send the transaction yet!

2. **Check MetaMask network** (top of MetaMask window)
   - Should say: "Sepolia Test Network"
   - If not → Switch to Sepolia

3. **Take a screenshot** of the MetaMask transaction window
   - Show the gas fee breakdown
   - This will help diagnose the issue

4. **Check browser console** (Press F12)
   - Go to Console tab
   - Look for red errors
   - Share any error messages

5. **Report back with:**
   - Current network name: _______________
   - Gas Limit shown: _______________
   - Total gas fee: _______________
   - What transaction: _______________
   - Any errors in console: _______________

---

## 🆘 Most Likely Issue:

Based on 0.03 ETH gas fee, you're probably either:

1. **On Ethereum Mainnet** instead of Sepolia (99% likely)
   - Fix: Switch to Sepolia immediately
   
2. **RoleManager permission issue** causing transaction to fail
   - Fix: Transfer RoleManager ownership to RestaurantRegistry
   
3. **MetaMask bug** showing wrong gas estimation
   - Fix: Manually set gas limit to 500,000

---

## 💡 Expected Gas Fees on Sepolia

| Operation | Normal Gas Fee |
|-----------|---------------|
| Restaurant Registration | 0.0003 - 0.001 ETH |
| Update Menu | 0.0001 - 0.0005 ETH |
| Create Order | 0.0002 - 0.0008 ETH |
| Rider Registration | 0.0002 - 0.0006 ETH |

**Anything above 0.002 ETH is suspicious!**

---

Please provide the diagnostic info above so we can fix this! 🚨

