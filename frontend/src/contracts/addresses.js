// PASTE YOUR DEPLOYED CONTRACT ADDRESSES HERE AFTER DEPLOYING ON REMIX

export const CONTRACTS = {
  RoleManager: "0x2f208c050Ed931c31DeDAA80CD4329224B2c748E",
  RestaurantRegistry: "0x13f14FbE548742f1544BB44A9ad3714F93A02DF3",
  RiderRegistry: "0x2a8F6e0E27E1160F603E90B267a2De7dAc9432F7",
  Escrow: "0xe1A88562C2AF4913cFEaD16105eD51996f11cE6d",
  OrderManager: "0xdd938211EFbfe6374DDD475C76C0fd10Acde7EB3",
};

// Sepolia Network Configuration
export const NETWORK_CONFIG = {
  chainId: 11155111,
  name: "Sepolia Testnet",
  rpcUrl: "https://rpc.sepolia.org",
  blockExplorer: "https://sepolia.etherscan.io"
};

// ⚠️ ROLE ISOLATION: One wallet = One role only!
// After deploying on Remix, update like this:
// RoleManager: "0xROLE123...",
// RestaurantRegistry: "0xREST456...",
// RiderRegistry: "0xRIDER789...",
// Escrow: "0xESCROW012...",
// OrderManager: "0xORDER345...",

