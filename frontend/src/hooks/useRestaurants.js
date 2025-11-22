import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import { RESTAURANT_REGISTRY_ABI } from '../contracts/abis';

// Hook to read restaurant count
export function useRestaurantCount() {
  const {
    data,
    isLoading,
    isFetching,
    isFetched,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACTS.RestaurantRegistry,
    abi: RESTAURANT_REGISTRY_ABI,
    functionName: 'restaurantCount',
    query: {
      staleTime: 30000, // Cache for 30 seconds
      gcTime: 1000 * 60, // keep cache 60s
      refetchOnMount: true,
      refetchOnReconnect: false, // Don't refetch on reconnect
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      // Removed refetchInterval - no automatic polling
    },
  });

  return {
    restaurantCount: data ? Number(data) : 0,
    isLoading: isLoading || isFetching,
    isFetched,
    error,
    refetch,
  };
}

// Hook to get restaurant ID by owner address
export function useRestaurantIdByOwner(ownerAddress) {
  const {
    data,
    isLoading,
    isFetching,
    isFetched,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACTS.RestaurantRegistry,
    abi: RESTAURANT_REGISTRY_ABI,
    functionName: 'ownerToRestaurant',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress,
      staleTime: 30000, // Cache for 30 seconds
      gcTime: 1000 * 60,
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      // Removed refetchInterval
    },
  });

  return {
    restaurantId: data ? Number(data) : 0,
    isLoading: isLoading || isFetching,
    isFetched,
    error,
    refetch,
  };
}

// Hook to get a single restaurant
export function useRestaurant(restaurantId) {
  const {
    data: restaurant,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACTS.RestaurantRegistry,
    abi: RESTAURANT_REGISTRY_ABI,
    functionName: 'getRestaurant',
    args: restaurantId ? [restaurantId] : undefined,
    query: {
      enabled: !!restaurantId && restaurantId > 0,
      staleTime: 30000, // Cache for 30 seconds
      gcTime: 1000 * 60,
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      // Removed refetchInterval
    },
  });

  return {
    restaurant,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

// Hook to register a restaurant
export function useRegisterRestaurant() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerRestaurant = async (name, description, ipfsMenuHash, metadataURI, physicalAddress) => {
    try {
      await writeContract({
        address: CONTRACTS.RestaurantRegistry,
        abi: RESTAURANT_REGISTRY_ABI,
        functionName: 'registerRestaurant',
        args: [name, description, ipfsMenuHash, metadataURI, physicalAddress],
        gas: 500000n, // Set reasonable gas limit
      });
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  return {
    registerRestaurant,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to update restaurant menu
export function useUpdateMenu() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const updateMenu = async (restaurantId, newIpfsHash) => {
    await writeContract({
      address: CONTRACTS.RestaurantRegistry,
      abi: RESTAURANT_REGISTRY_ABI,
      functionName: 'updateMenu',
      args: [restaurantId, newIpfsHash],
      gas: 200000n, // Set reasonable gas limit
    });
  };

  return {
    updateMenu,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to set restaurant status (open/closed)
export function useSetRestaurantStatus() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const setStatus = async (restaurantId, isActive) => {
    await writeContract({
      address: CONTRACTS.RestaurantRegistry,
      abi: RESTAURANT_REGISTRY_ABI,
      functionName: 'setRestaurantStatus',
      args: [restaurantId, isActive],
    });
  };

  return {
    setStatus,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

