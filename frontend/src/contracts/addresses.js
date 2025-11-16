// PASTE YOUR DEPLOYED CONTRACT ADDRESSES HERE AFTER DEPLOYING ON REMIX

export const CONTRACTS = {
  RoleManager: "0x06Dd0bbbC84605cec8ffDEa97168e393510430c2",
  RestaurantRegistry: "0xc2C57712c648553d28d58e73Edb7E5cBa6b7db3B",
  RiderRegistry: "0xDCe2E4dBD7978A46945fEf7055BbE9f3bD04a739",
  Escrow: "0x635dA77a7d0d5031dbDAd6C5918d801be451eA54",
  OrderManager: "0xb5108e097a10055527466B06793f6E0D85528C75",
  PlatformManager: "0xf71695d303354e934038e16580393f5a14e5c8dc",
};

// Open Campus Codex Network Configuration
export const NETWORK_CONFIG = {
  chainId: 656476,
  name: "Open Campus Codex",
  rpcUrl: "https://open-campus-codex-sepolia.drpc.org",
  blockExplorer: "https://opencampus-codex.blockscout.com"
};

// ⚠️ ROLE ISOLATION: One wallet = One role only!
// After deploying on Remix, update like this:
// RoleManager: "0xROLE123...",
// RestaurantRegistry: "0xREST456...",
// RiderRegistry: "0xRIDER789...",
// Escrow: "0xESCROW012...",
// OrderManager: "0xORDER345...",

