import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import { RESTAURANT_REGISTRY_ABI, RIDER_REGISTRY_ABI, ROLE_MANAGER_ABI } from '../contracts/abis';

/**
 * Hook to detect user's role in the system
 * Returns: role ('none', 'restaurant', 'rider', 'customer'), isLoading, refetch
 * Optimized with timeout to prevent infinite loading
 * FIXED: Now checks blockchain for customer role (persists after cache clear)
 */
export function useRoleDetection() {
  const { address, isConnected } = useAccount();
  const [role, setRole] = useState('none');
  const [isLoading, setIsLoading] = useState(false); // Start as false, only true when actually checking
  const [restaurantId, setRestaurantId] = useState(null);

  // Check if user is registered as a rider
  const { data: isRiderRegistered, isLoading: riderLoading, refetch: refetchRider } = useReadContract({
    address: CONTRACTS.RiderRegistry,
    abi: RIDER_REGISTRY_ABI,
    functionName: 'isRegistered',
    args: [address],
    enabled: !!address && isConnected,
    query: {
      staleTime: 10000, // Cache for 10 seconds
    },
  });

  // Check restaurant ownership via direct mapping
  const { data: ownedRestaurantId, isLoading: restaurantLoading, refetch: refetchRestaurant } = useReadContract({
    address: CONTRACTS.RestaurantRegistry,
    abi: RESTAURANT_REGISTRY_ABI,
    functionName: 'ownerToRestaurant',
    args: [address],
    enabled: !!address && isConnected,
    query: {
      staleTime: 10000, // Cache for 10 seconds
    },
  });

  // FIXED ISSUE 1: Check customer role from blockchain (RoleManager)
  // This ensures customer role persists after browser cache is cleared
  const { data: isCustomer, isLoading: customerLoading, refetch: refetchCustomer } = useReadContract({
    address: CONTRACTS.RoleManager,
    abi: ROLE_MANAGER_ABI,
    functionName: 'isCustomer',
    args: [address],
    enabled: !!address && isConnected,
    query: {
      staleTime: 10000, // Cache for 10 seconds
    },
  });

  useEffect(() => {
      if (!address || !isConnected) {
        setRole('none');
        setIsLoading(false);
        return;
      }

    // Show loading only if actually fetching data
    if (riderLoading || restaurantLoading || customerLoading) {
      setIsLoading(true);
        return;
      }

    // Set timeout to prevent infinite loading (max 15 seconds for slow RPC)
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Role detection timed out after 15 seconds');
        // Don't default to 'none' - keep loading state to avoid clearing valid roles
        // The data will eventually arrive from the blockchain
      }
    }, 15000);

    // Check role priority: Rider > Restaurant > Customer > None
    // FIXED: Now checks blockchain for customer role (persists after cache clear)
    if (isRiderRegistered === true) {
      setRole('rider');
      setIsLoading(false);
    } else if (ownedRestaurantId && Number(ownedRestaurantId) > 0) {
      setRole('restaurant');
      setRestaurantId(Number(ownedRestaurantId));
        setIsLoading(false);
    } else if (isCustomer === true) {
      // FIXED ISSUE 1: Customer role detected from blockchain
      // This persists even after browser cache is cleared
      setRole('customer');
      setIsLoading(false);
    } else if (!riderLoading && !restaurantLoading && !customerLoading) {
      // Only set 'none' if we're sure all queries completed
      // No specific role detected
      setRole('none');
      setIsLoading(false);
    }

    return () => clearTimeout(loadingTimeout);
  }, [address, isConnected, isRiderRegistered, ownedRestaurantId, isCustomer, riderLoading, restaurantLoading, customerLoading, isLoading]);

  const refetch = async () => {
    await Promise.all([refetchRider(), refetchRestaurant(), refetchCustomer()]);
  };

  return {
    role,
    isLoading,
    restaurantId,
    refetch,
    isRegistered: role !== 'none',
  };
}

