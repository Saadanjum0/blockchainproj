import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import { RESTAURANT_REGISTRY_ABI, RIDER_REGISTRY_ABI } from '../contracts/abis';

/**
 * Hook to detect user's role in the system
 * Returns: role ('none', 'restaurant', 'rider', 'customer'), isLoading, refetch
 */
export function useRoleDetection() {
  const { address, isConnected } = useAccount();
  const [role, setRole] = useState('none');
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);

  // Check if user is registered as a rider (use isRegistered to avoid errors)
  const { data: isRiderRegistered, refetch: refetchRider } = useReadContract({
    address: CONTRACTS.RiderRegistry,
    abi: RIDER_REGISTRY_ABI,
    functionName: 'isRegistered',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Check restaurant ownership
  const { data: restaurantCount } = useReadContract({
    address: CONTRACTS.RestaurantRegistry,
    abi: RESTAURANT_REGISTRY_ABI,
    functionName: 'restaurantCount',
    enabled: !!address && isConnected,
  });

  // Function to check if user owns any restaurant
  const checkRestaurantOwnership = async () => {
    if (!restaurantCount || !address) return null;

    // Check each restaurant to see if current address is the owner
    for (let i = 1; i <= Number(restaurantCount); i++) {
      try {
        // This would need to be implemented with proper event listening
        // For now, we'll use a simplified approach
        // In production, use The Graph or event logs
        
        // You can add restaurant ownership check here
        // For demo purposes, we'll check localStorage
        const storedRestaurantId = localStorage.getItem(`restaurant_${address}`);
        if (storedRestaurantId) {
          return parseInt(storedRestaurantId);
        }
      } catch (error) {
        console.error('Error checking restaurant:', error);
      }
    }
    return null;
  };

  useEffect(() => {
    const detectRole = async () => {
      if (!address || !isConnected) {
        setRole('none');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Check if rider is registered
      if (isRiderRegistered === true) {
        setRole('rider');
        setIsLoading(false);
        return;
      }

      // Check if restaurant owner
      const ownedRestaurantId = await checkRestaurantOwnership();
      if (ownedRestaurantId) {
        setRole('restaurant');
        setRestaurantId(ownedRestaurantId);
        setIsLoading(false);
        return;
      }

      // Check if user has placed orders (customer)
      const hasOrders = localStorage.getItem(`customer_${address}`);
      if (hasOrders) {
        setRole('customer');
        setIsLoading(false);
        return;
      }

      // No role detected - new user
      setRole('none');
      setIsLoading(false);
    };

    detectRole();
  }, [address, isConnected, isRiderRegistered, restaurantCount]);

  const refetch = async () => {
    await refetchRider();
    // Trigger re-detection
    setIsLoading(true);
  };

  return {
    role,
    isLoading,
    restaurantId,
    refetch,
    isRegistered: role !== 'none',
  };
}

