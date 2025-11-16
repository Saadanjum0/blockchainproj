import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import { RESTAURANT_REGISTRY_ABI, RIDER_REGISTRY_ABI } from '../contracts/abis';

/**
 * Hook to detect user's role in the system
 * Returns: role ('none', 'restaurant', 'rider', 'customer'), isLoading, refetch
 * Optimized with timeout to prevent infinite loading
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

  useEffect(() => {
      if (!address || !isConnected) {
        setRole('none');
        setIsLoading(false);
        return;
      }

    // Show loading only if actually fetching data
    if (riderLoading || restaurantLoading) {
      setIsLoading(true);
        return;
      }

    // Set timeout to prevent infinite loading (max 5 seconds)
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Role detection timed out, defaulting to none');
        setRole('none');
        setIsLoading(false);
      }
    }, 5000);

    // Check role priority: Rider > Restaurant > Customer > None
    if (isRiderRegistered === true) {
      setRole('rider');
      setIsLoading(false);
    } else if (ownedRestaurantId && Number(ownedRestaurantId) > 0) {
      setRole('restaurant');
      setRestaurantId(Number(ownedRestaurantId));
        setIsLoading(false);
    } else {
      // No specific role, user is a customer (or new user)
      setRole('none'); // Will auto-become customer on first order
      setIsLoading(false);
    }

    return () => clearTimeout(loadingTimeout);
  }, [address, isConnected, isRiderRegistered, ownedRestaurantId, riderLoading, restaurantLoading]);

  const refetch = async () => {
    await Promise.all([refetchRider(), refetchRestaurant()]);
  };

  return {
    role,
    isLoading,
    restaurantId,
    refetch,
    isRegistered: role !== 'none',
  };
}

