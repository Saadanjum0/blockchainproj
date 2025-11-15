# ⚡ Quick Reference - Role Isolation System

## 🔐 One Wallet = One Role ONLY

```
Restaurant Wallet ← Can ONLY manage restaurant
Rider Wallet      ← Can ONLY deliver orders
Customer Wallet   ← Can ONLY place orders
Admin Wallet      ← Can ONLY oversee (no participation)
```

---

## 📋 Deployment Order (CRITICAL!)

```
1. RoleManager          (no args)
2. RestaurantRegistry   (roleManagerAddress)
3. RiderRegistry        (roleManagerAddress)
4. Escrow              (platformWalletAddress)
5. OrderManager        (restaurantRegistry, riderRegistry, escrow, roleManager)

Then: escrow.setOrderManager(orderManagerAddress)
```

---

## 🎯 Key Functions Added

### RoleManager.sol (NEW!)
```solidity
getUserRole(address) → "Restaurant"|"Rider"|"Customer"|"Admin"|"None"
hasNoRole(address) → bool
canRegisterAsRestaurant(address) → bool
canRegisterAsRider(address) → bool
canPlaceOrder(address) → bool
```

### OrderManager.sol (UPDATED!)
```solidity
// NOW REQUIRES delivery address!
createOrder(..., string deliveryAddress, string customerPhone, ...)

// What riders see (orders ready for pickup)
getOrdersReadyForPickup() → uint256[]

// Privacy-protected (only authorized can view)
getOrderDeliveryAddress(uint256 orderId) → string

// Customer can rate
confirmDelivery(orderId, restaurantRating, riderRating)
```

### RiderRegistry.sol (UPDATED!)
```solidity
// Tracks current delivery
riders[address].currentOrderId → uint256

// Auto-manages availability
assignToOrder(rider, orderId)    // Sets unavailable
completeDelivery(rider, amount)  // Sets available
```

---

## 🔄 Complete Order Flow

```
1. Customer → createOrder(restaurantId, "123 Main St", "555-1234", ...)
   Status: Created ✅
   Role: Auto-assigned "Customer" if first order

2. Restaurant → acceptOrder(orderId)
   Status: Accepted ✅

3. Restaurant → markPrepared(orderId)
   Status: Prepared ✅
   🚨 NOW VISIBLE TO RIDERS!

4. Rider → assignRider(orderId, riderAddress)
   Status: Still Prepared
   Rider: Assigned + Unavailable

5. Rider → markPickedUp(orderId)
   Status: PickedUp ✅

6. Rider → markDelivered(orderId)
   Status: Delivered ✅

7. Customer → confirmDelivery(orderId, 5, 5)
   Status: Completed ✅
   💰 Payment Released!
   Rider: Available again
```

---

## 🎨 Frontend Changes

### Role Detection
```javascript
import { useUserRole } from './hooks/useUserRole';

const { role } = useUserRole(address);
// Returns: "Restaurant", "Rider", "Customer", "Admin", or "None"
```

### Navigation Logic
```javascript
{role === 'Restaurant' && <Link to="/restaurant-dashboard" />}
{role === 'Rider' && <Link to="/rider-dashboard" />}
{role === 'Customer' && <Link to="/my-orders" />}
{role === 'None' && <>Choose your role</>}
```

### Route Protection
```javascript
<Route 
  path="/restaurant-dashboard"
  element={
    role === 'Restaurant' ? 
    <RestaurantDashboard /> : 
    <RoleRestricted />
  }
/>
```

---

## ✅ Testing Scenarios

### Scenario 1: Role Isolation
```
✓ Wallet A → Register Restaurant → Success
✗ Wallet A → Register Rider → BLOCKED ✅
✗ Wallet A → Place Order → BLOCKED ✅
✓ Wallet B → Register Rider → Success
✗ Wallet B → Register Restaurant → BLOCKED ✅
```

### Scenario 2: Customer Auto-Registration
```
✓ Wallet C → Browse restaurants → Success
✓ Wallet C → Place order → Success (becomes Customer)
✗ Wallet C → Register Restaurant → BLOCKED ✅
```

### Scenario 3: Rider Order Visibility
```
✓ Restaurant marks order "Prepared"
✓ Rider dashboard → Order appears
✓ Rider accepts → Can see delivery address
✓ Rider completes → Auto-available again
```

### Scenario 4: Admin Cannot Participate
```
✗ Deployer → Register Restaurant → BLOCKED ✅
✗ Deployer → Register Rider → BLOCKED ✅
✗ Deployer → Place Order → BLOCKED ✅
✓ Deployer → View platform → Success
```

---

## 🚨 Common Errors & Solutions

### "Cannot register: Address already has another role"
**Cause:** Trying to register for second role
**Solution:** Use different wallet OR intended behavior (working as designed!)

### "Order hash required" + delivery address missing
**Cause:** Using old createOrder signature
**Solution:** Update to new signature with deliveryAddress parameter

### "Not authorized" when viewing delivery address
**Cause:** Trying to view address you're not authorized for
**Solution:** Intended - privacy protection working!

### "Rider already on delivery"
**Cause:** Rider trying to accept second order
**Solution:** Complete current delivery first

### "Only OrderManager"
**Cause:** Escrow not linked to OrderManager
**Solution:** Call escrow.setOrderManager(orderManagerAddress)

---

## 📊 Contract Constructor Summary

| Contract | Constructor Parameters |
|----------|----------------------|
| RoleManager | *none* |
| RestaurantRegistry | roleManagerAddress |
| RiderRegistry | roleManagerAddress |
| Escrow | platformWalletAddress |
| OrderManager | restaurantRegistry, riderRegistry, escrow, roleManager |

---

## 🔗 File Locations

### Smart Contracts
- `/contracts/RoleManager.sol` (NEW!)
- `/contracts/RestaurantRegistry.sol` (UPDATED)
- `/contracts/RiderRegistry.sol` (UPDATED)
- `/contracts/OrderManager.sol` (MAJOR UPDATE)
- `/contracts/Escrow.sol` (MINOR UPDATE)

### Frontend
- `/frontend/src/hooks/useUserRole.js` (NEW!)
- `/frontend/src/contracts/addresses.js` (UPDATED)
- `/frontend/src/App.jsx` (MAJOR UPDATE)

### Documentation
- `ROLE_ISOLATION_GUIDE.md` (Complete guide)
- `CHANGES_SUMMARY.md` (What changed)
- `QUICK_REFERENCE.md` (This file)

---

## 💡 Key Concepts

### Role Isolation
One wallet can only be ONE role. This prevents conflicts of interest and ensures clean business logic.

### Customer Delivery Address
Now stored on-chain. Required for order creation. Privacy-protected (not public).

### Orders Ready for Pickup
Restaurants mark orders as "Prepared" → Riders see them → Riders accept → Delivery begins.

### Auto-Role Assignment
First order automatically assigns "Customer" role. Cannot register as business after placing order.

### Admin is Admin
Deployer wallet is admin-only. Cannot participate in operations. Oversight role.

---

## 🎯 Success Indicators

You've successfully implemented role isolation when:

✅ One wallet cannot register for multiple roles
✅ Orders require delivery address
✅ Riders see only prepared orders
✅ Delivery address protected by authorization
✅ Ratings stored on-chain
✅ Admin cannot register as any role
✅ Frontend shows role-specific UI
✅ Routes protected by role
✅ Rider can only have one active delivery
✅ Customer auto-assigned on first order

---

## 📞 Quick Help

**Issue:** Role not showing
**Fix:** Check RoleManager contract address in addresses.js

**Issue:** Cannot deploy OrderManager
**Fix:** Deploy RoleManager first, then pass its address

**Issue:** Orders not appearing for riders
**Fix:** Restaurant must mark as "Prepared" status

**Issue:** Cannot see delivery address
**Fix:** Only authorized parties (customer, rider, restaurant, admin) can view

**Issue:** Frontend shows all navigation
**Fix:** Make sure useUserRole hook is properly imported and used

---

## 🚀 Start Here

1. Read `CHANGES_SUMMARY.md` - Understand what changed
2. Read `ROLE_ISOLATION_GUIDE.md` - Complete implementation details
3. Follow `/contracts/README.md` - Deploy contracts
4. Update `/frontend/src/contracts/addresses.js` - Add addresses
5. Run `npm run dev` - Test frontend
6. Verify role isolation - Test with multiple wallets

---

**You're all set! Deploy with confidence!** 🎉🔐

