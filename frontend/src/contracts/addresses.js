// ✅ UPDATED: Latest deployed contract addresses (January 2025)

export const CONTRACTS = {
  RoleManager: "0x870dC762278744DB705333Be2B107b91AfB1B0a3",
  RestaurantRegistry: "0xAf811C269813701E973DbE9F5a8d8FCAbF031A9c",
  RiderRegistry: "0x382a67Acb71094ba711EeC95D2b5F0652cafc677",
  Escrow: "0xf1F64976B7076274aB6C1fdA74458Cc8baE98b56",
  OrderManager: "0xbFaA4B0F03a8A9c82a3c50554a801Bbe8b32186a",
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

