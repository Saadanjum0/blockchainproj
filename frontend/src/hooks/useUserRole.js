import { useReadContract } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';

// RoleManager ABI
const ROLE_MANAGER_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserRole",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isRestaurant",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isRider",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isCustomer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isAdmin",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "hasNoRole",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "canRegisterAsRestaurant",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "canRegisterAsRider",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "canPlaceOrder",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * Hook to get user's role from blockchain
 * Returns: "Admin", "Restaurant", "Rider", "Customer", or "None"
 */
export function useUserRole(address) {
  const { data: role, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.RoleManager,
    abi: ROLE_MANAGER_ABI,
    functionName: 'getUserRole',
    args: [address],
    enabled: !!address,
  });

  return {
    role: role || 'None',
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if user is restaurant
 */
export function useIsRestaurant(address) {
  const { data } = useReadContract({
    address: CONTRACTS.RoleManager,
    abi: ROLE_MANAGER_ABI,
    functionName: 'isRestaurant',
    args: [address],
    enabled: !!address,
  });

  return data === true;
}

/**
 * Hook to check if user is rider
 */
export function useIsRider(address) {
  const { data } = useReadContract({
    address: CONTRACTS.RoleManager,
    abi: ROLE_MANAGER_ABI,
    functionName: 'isRider',
    args: [address],
    enabled: !!address,
  });

  return data === true;
}

/**
 * Hook to check if user is customer
 */
export function useIsCustomer(address) {
  const { data } = useReadContract({
    address: CONTRACTS.RoleManager,
    abi: ROLE_MANAGER_ABI,
    functionName: 'isCustomer',
    args: [address],
    enabled: !!address,
  });

  return data === true;
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(address) {
  const { data } = useReadContract({
    address: CONTRACTS.RoleManager,
    abi: ROLE_MANAGER_ABI,
    functionName: 'isAdmin',
    args: [address],
    enabled: !!address,
  });

  return data === true;
}

/**
 * Hook to check if user has no role (can register)
 */
export function useHasNoRole(address) {
  const { data } = useReadContract({
    address: CONTRACTS.RoleManager,
    abi: ROLE_MANAGER_ABI,
    functionName: 'hasNoRole',
    args: [address],
    enabled: !!address,
  });

  return data === true;
}

/**
 * Hook to check if user can register as restaurant
 */
export function useCanRegisterAsRestaurant(address) {
  const { data } = useReadContract({
    address: CONTRACTS.RoleManager,
    abi: ROLE_MANAGER_ABI,
    functionName: 'canRegisterAsRestaurant',
    args: [address],
    enabled: !!address,
  });

  return data === true;
}

/**
 * Hook to check if user can register as rider
 */
export function useCanRegisterAsRider(address) {
  const { data } = useReadContract({
    address: CONTRACTS.RoleManager,
    abi: ROLE_MANAGER_ABI,
    functionName: 'canRegisterAsRider',
    args: [address],
    enabled: !!address,
  });

  return data === true;
}

/**
 * Hook to check if user can place orders
 */
export function useCanPlaceOrder(address) {
  const { data } = useReadContract({
    address: CONTRACTS.RoleManager,
    abi: ROLE_MANAGER_ABI,
    functionName: 'canPlaceOrder',
    args: [address],
    enabled: !!address,
  });

  return data === true;
}

/**
 * Hook to get all role checks at once
 */
export function useRoleChecks(address) {
  const { role } = useUserRole(address);
  const isRestaurant = useIsRestaurant(address);
  const isRider = useIsRider(address);
  const isCustomer = useIsCustomer(address);
  const isAdmin = useIsAdmin(address);
  const hasNoRole = useHasNoRole(address);
  const canRegisterAsRestaurant = useCanRegisterAsRestaurant(address);
  const canRegisterAsRider = useCanRegisterAsRider(address);
  const canPlaceOrder = useCanPlaceOrder(address);

  return {
    role,
    isRestaurant,
    isRider,
    isCustomer,
    isAdmin,
    hasNoRole,
    canRegisterAsRestaurant,
    canRegisterAsRider,
    canPlaceOrder,
  };
}

