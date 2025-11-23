# 📍 Deployed Contract Addresses

**Network**: Sepolia Testnet  
**Chain ID**: 11155111  
**Deployed**: January 2025

## ✅ Current Deployed Contracts

```
RoleManager: 0x870dC762278744DB705333Be2B107b91AfB1B0a3
RestaurantRegistry: 0xAf811C269813701E973DbE9F5a8d8FCAbF031A9c
RiderRegistry: 0x382a67Acb71094ba711EeC95D2b5F0652cafc677
Escrow: 0xf1F64976B7076274aB6C1fdA74458Cc8baE98b56
OrderManager: 0xbFaA4B0F03a8A9c82a3c50554a801Bbe8b32186a
```

## 🔗 Etherscan Links

- **RoleManager**: https://sepolia.etherscan.io/address/0x870dC762278744DB705333Be2B107b91AfB1B0a3
- **RestaurantRegistry**: https://sepolia.etherscan.io/address/0xAf811C269813701E973DbE9F5a8d8FCAbF031A9c
- **RiderRegistry**: https://sepolia.etherscan.io/address/0x382a67Acb71094ba711EeC95D2b5F0652cafc677
- **Escrow**: https://sepolia.etherscan.io/address/0xf1F64976B7076274aB6C1fdA74458Cc8baE98b56
- **OrderManager**: https://sepolia.etherscan.io/address/0xbFaA4B0F03a8A9c82a3c50554a801Bbe8b32186a

## 📝 Frontend Configuration

Update `frontend/src/contracts/addresses.js` with these addresses.

## ✅ Verification Checklist

After deployment, verify:
- [ ] All contracts deployed successfully
- [ ] Escrow.setOrderManager(OrderManager) called
- [ ] RiderRegistry.setOrderManager(OrderManager) called
- [ ] RestaurantRegistry authorized in RoleManager
- [ ] RiderRegistry authorized in RoleManager
- [ ] OrderManager authorized in RoleManager
- [ ] Frontend addresses.js updated

## 🔄 Contract Relationships

```
RoleManager (0x870dC...)
  ├── Authorizes: RestaurantRegistry
  ├── Authorizes: RiderRegistry
  └── Authorizes: OrderManager

RestaurantRegistry (0xAf811C...)
  └── Uses: RoleManager

RiderRegistry (0x382a67...)
  ├── Uses: RoleManager
  └── Linked to: OrderManager

Escrow (0xf1F649...)
  └── Linked to: OrderManager

OrderManager (0xbFaA4B...)
  ├── Uses: RestaurantRegistry
  ├── Uses: RiderRegistry
  ├── Uses: Escrow
  └── Uses: RoleManager
```

