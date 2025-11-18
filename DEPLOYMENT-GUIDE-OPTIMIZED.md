# 🚀 DEPLOYMENT GUIDE - Optimized Contracts

## 📋 Pre-Deployment Checklist

- [ ] Have access to Remix IDE
- [ ] Connected to Sepolia testnet
- [ ] Have sufficient test ETH (at least 0.5 ETH)
- [ ] Have 3 different wallets ready for testing
- [ ] Backup current contract addresses

## 🔧 Compiler Settings in Remix

### Step 1: Configure Compiler
1. Open Remix IDE: https://remix.ethereum.org
2. Go to "Solidity Compiler" tab (3rd icon)
3. Select compiler version: **0.8.20**
4. Enable Optimization: ✅
5. Set Runs to: **200**
6. Click "Advanced Configuration"
7. Add this JSON configuration:

```json
{
  "viaIR": true,
  "optimizer": {
    "enabled": true,
    "runs": 200,
    "details": {
      "yul": true,
      "yulDetails": {
        "stackAllocation": true,
        "optimizerSteps": "dhfoDgvulfnTUtnIf"
      }
    }
  }
}
```

## 📦 Deployment Order

### Phase 1: Deploy Optimized Contracts

#### 1. Deploy EscrowOptimized
```
Contract: EscrowOptimized
Constructor Args: 
  - _platformWallet: [YOUR_ADMIN_WALLET_ADDRESS]
  
Example: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7
```

#### 2. Deploy OrderManagerOptimized
```
Contract: OrderManagerOptimized
Constructor Args:
  - _restaurantRegistry: 0xc2C57712c648553d28d58e73Edb7E5cBa6b7db3B [existing]
  - _riderRegistry: 0xDCe2E4dBD7978A46945fEf7055BbE9f3bD04a739 [existing]
  - _escrow: [ESCROW_OPTIMIZED_ADDRESS from step 1]
  - _roleManager: 0x06Dd0bbbC84605cec8ffDEa97168e393510430c2 [existing]
```

### Phase 2: Link Contracts

#### 3. Link EscrowOptimized to OrderManagerOptimized
```solidity
// On EscrowOptimized contract:
setOrderManager([ORDER_MANAGER_OPTIMIZED_ADDRESS])
```

#### 4. Link RiderRegistry to OrderManagerOptimized
```solidity
// On RiderRegistry (0xDCe2E4dBD7978A46945fEf7055BbE9f3bD04a739):
setOrderManager([ORDER_MANAGER_OPTIMIZED_ADDRESS])
```

#### 5. Authorize OrderManagerOptimized in RoleManager
```solidity
// On RoleManager (0x06Dd0bbbC84605cec8ffDEa97168e393510430c2):
authorizeContract([ORDER_MANAGER_OPTIMIZED_ADDRESS])
```

## 🧪 Testing Script

### Test 1: Gas Comparison Test
```javascript
// test-gas.js
// Run this in browser console or Node.js

async function testGasUsage() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Old OrderManager ABI and address
    const oldContract = new ethers.Contract(
        "0xb5108e097a10055527466B06793f6E0D85528C75", // old address
        OLD_ABI,
        signer
    );
    
    // New OrderManager ABI and address
    const newContract = new ethers.Contract(
        "[NEW_ORDER_MANAGER_ADDRESS]",
        NEW_ABI,
        signer
    );
    
    // Test createOrder gas
    const orderData = {
        restaurantId: 1,
        ipfsHash: "QmTest123",
        address: "123 Test St",
        phone: "+1234567890",
        tip: 0
    };
    
    // Estimate gas for old contract
    const oldGas = await oldContract.estimateGas.createOrder(
        orderData.restaurantId,
        orderData.ipfsHash,
        orderData.address,
        orderData.phone,
        orderData.tip,
        { value: ethers.utils.parseEther("0.01") }
    );
    
    // Estimate gas for new contract
    const newGas = await newContract.estimateGas.createOrder(
        orderData.restaurantId,
        orderData.ipfsHash,
        orderData.address,
        orderData.phone,
        orderData.tip,
        { value: ethers.utils.parseEther("0.01") }
    );
    
    console.log("=== GAS COMPARISON ===");
    console.log("Old Contract Gas:", oldGas.toString());
    console.log("New Contract Gas:", newGas.toString());
    console.log("Savings:", oldGas.sub(newGas).toString());
    console.log("Percentage Saved:", 
        ((oldGas.sub(newGas).mul(100)).div(oldGas)).toString() + "%"
    );
}

testGasUsage();
```

### Test 2: Full Order Flow Test
```javascript
// full-flow-test.js

async function testFullOrderFlow() {
    console.log("🚀 Starting Full Order Flow Test...");
    
    // 1. Customer creates order
    console.log("1. Creating order...");
    const tx1 = await orderManager.createOrder(
        1, // restaurantId
        "QmTestOrder123",
        "123 Main St, City",
        "+1234567890",
        0, // tip
        { value: ethers.utils.parseEther("0.05") }
    );
    const receipt1 = await tx1.wait();
    const orderId = receipt1.events[0].args.orderId;
    console.log("✅ Order created. ID:", orderId.toString());
    console.log("   Gas used:", receipt1.gasUsed.toString());
    
    // 2. Restaurant accepts
    console.log("2. Restaurant accepting order...");
    const tx2 = await orderManager.acceptOrder(orderId);
    const receipt2 = await tx2.wait();
    console.log("✅ Order accepted");
    console.log("   Gas used:", receipt2.gasUsed.toString());
    
    // 3. Restaurant marks prepared
    console.log("3. Marking as prepared...");
    const tx3 = await orderManager.markPrepared(orderId);
    const receipt3 = await tx3.wait();
    console.log("✅ Order prepared");
    console.log("   Gas used:", receipt3.gasUsed.toString());
    
    // 4. Rider assigns self
    console.log("4. Rider assigning...");
    const tx4 = await orderManager.assignRider(orderId, riderAddress);
    const receipt4 = await tx4.wait();
    console.log("✅ Rider assigned");
    console.log("   Gas used:", receipt4.gasUsed.toString());
    
    // 5. Rider picks up
    console.log("5. Marking picked up...");
    const tx5 = await orderManager.markPickedUp(orderId);
    const receipt5 = await tx5.wait();
    console.log("✅ Order picked up");
    console.log("   Gas used:", receipt5.gasUsed.toString());
    
    // 6. Rider delivers
    console.log("6. Marking delivered...");
    const tx6 = await orderManager.markDelivered(orderId);
    const receipt6 = await tx6.wait();
    console.log("✅ Order delivered");
    console.log("   Gas used:", receipt6.gasUsed.toString());
    
    // 7. Customer confirms (CRITICAL TEST)
    console.log("7. Customer confirming delivery...");
    const tx7 = await orderManager.confirmDelivery(orderId, 5, 5);
    const receipt7 = await tx7.wait();
    console.log("✅ Order completed!");
    console.log("   Gas used:", receipt7.gasUsed.toString());
    
    // Calculate total gas
    const totalGas = receipt1.gasUsed
        .add(receipt2.gasUsed)
        .add(receipt3.gasUsed)
        .add(receipt4.gasUsed)
        .add(receipt5.gasUsed)
        .add(receipt6.gasUsed)
        .add(receipt7.gasUsed);
    
    console.log("\n=== TOTAL GAS SUMMARY ===");
    console.log("Total gas used:", totalGas.toString());
    console.log("At 30 Gwei:", ethers.utils.formatEther(
        totalGas.mul(30).mul(1e9)
    ), "ETH");
}

testFullOrderFlow();
```

### Test 3: View Functions Performance
```javascript
// view-functions-test.js

async function testViewFunctions() {
    console.log("Testing view functions gas efficiency...");
    
    const customerAddress = "0x..."; // Your test customer
    
    // Test getCustomerOrders (should be instant)
    console.time("getCustomerOrders");
    const customerOrders = await orderManager.getCustomerOrders(customerAddress);
    console.timeEnd("getCustomerOrders");
    console.log("Customer orders:", customerOrders.length);
    
    // Test getOrdersReadyForPickup (should be instant)
    console.time("getOrdersReadyForPickup");
    const readyOrders = await orderManager.getOrdersReadyForPickup();
    console.timeEnd("getOrdersReadyForPickup");
    console.log("Ready orders:", readyOrders.length);
    
    // Test getRestaurantOrders (should be instant)
    console.time("getRestaurantOrders");
    const restaurantOrders = await orderManager.getRestaurantOrders(1);
    console.timeEnd("getRestaurantOrders");
    console.log("Restaurant orders:", restaurantOrders.length);
}

testViewFunctions();
```

## 🔍 Verification Steps

### 1. Check Contract Deployment
```javascript
// verify-deployment.js
async function verifyDeployment() {
    const code = await provider.getCode("[CONTRACT_ADDRESS]");
    console.log("Contract deployed:", code !== "0x");
    
    // Check links
    const escrow = await orderManager.escrow();
    console.log("Escrow linked:", escrow === "[ESCROW_ADDRESS]");
    
    const orderManagerInEscrow = await escrowContract.orderManager();
    console.log("OrderManager linked in Escrow:", 
        orderManagerInEscrow === "[ORDER_MANAGER_ADDRESS]");
}
```

### 2. Test Batch Processing
```javascript
// test-batch.js
async function testBatchProcessing() {
    // Get pending ratings
    const pendingOrders = [1, 2, 3]; // Order IDs with pending ratings
    
    console.log("Processing batch ratings...");
    const tx = await orderManager.processPendingRatings(pendingOrders);
    const receipt = await tx.wait();
    
    console.log("Batch processed!");
    console.log("Gas used for 3 ratings:", receipt.gasUsed.toString());
    console.log("Average per rating:", receipt.gasUsed.div(3).toString());
}
```

## 📊 Expected Results

### Gas Usage Comparison
| Function | Old Contract | New Contract | Savings |
|----------|-------------|--------------|---------|
| createOrder | ~180,000 | ~120,000 | 33% |
| confirmDelivery | ~231,000 | ~85,000 | 63% |
| getCustomerOrders | ~150,000 | ~3,000 | 98% |
| markPrepared | ~65,000 | ~45,000 | 31% |
| assignRider | ~95,000 | ~70,000 | 26% |

### Cost Savings (at 30 Gwei, $4000/ETH)
| Function | Old Cost | New Cost | Savings |
|----------|----------|----------|---------|
| confirmDelivery | $28 | $10 | $18 |
| Full Order Flow | $65 | $30 | $35 |
| View Functions | $18 | $0.36 | $17.64 |

## 🚨 Troubleshooting

### Issue: "Stack too deep" error
**Solution:**
```json
// Ensure viaIR is enabled in compiler config
{
  "viaIR": true,
  "optimizer": {
    "enabled": true,
    "runs": 200
  }
}
```

### Issue: "Only OrderManager" error
**Solution:**
```solidity
// Ensure OrderManager is set in Escrow
escrowOptimized.setOrderManager(orderManagerOptimizedAddress)
```

### Issue: "Not authorized" in RoleManager
**Solution:**
```solidity
// Authorize the new OrderManager
roleManager.authorizeContract(orderManagerOptimizedAddress)
```

### Issue: High gas estimate still showing
**Solution:**
1. Clear MetaMask activity data
2. Reset account in MetaMask settings
3. Ensure using optimized contract address
4. Check network congestion

## 📝 Migration Plan

### Option 1: Fresh Deployment (Recommended)
1. Deploy new contracts
2. Update frontend to use new addresses
3. Keep old contracts for historical data

### Option 2: Gradual Migration
1. Deploy new contracts
2. Run both systems in parallel
3. Gradually move users to new system
4. Deprecate old contracts after 30 days

### Option 3: Data Migration
1. Export all order data from old contract
2. Deploy new contracts
3. Import historical data using batchImportOrders()
4. Update frontend immediately

## ✅ Post-Deployment Checklist

- [ ] All contracts deployed successfully
- [ ] Links established between contracts
- [ ] Authorization granted in RoleManager
- [ ] Gas usage tested and verified
- [ ] Full order flow tested
- [ ] Frontend updated with new addresses
- [ ] Team notified of changes
- [ ] Documentation updated
- [ ] Monitor first 10 real transactions
- [ ] Backup plan ready if issues arise

## 📞 Support Contacts

- Technical Issues: Check contract events in Etherscan
- Gas Estimates: Use eth_estimateGas RPC call
- Frontend Issues: Check browser console for errors
- Contract Issues: Verify all links and authorizations

## 🎉 Success Metrics

After deployment, you should see:
- ✅ 60-70% reduction in gas fees
- ✅ Near-instant view function responses
- ✅ Smoother user experience
- ✅ Lower transaction failure rate
- ✅ Happy customers and restaurants!

---

**Deployment Date:** ___________
**Deployed By:** ___________
**New Contract Addresses:**
- OrderManagerOptimized: ___________
- EscrowOptimized: ___________

---

Good luck with the deployment! 🚀
