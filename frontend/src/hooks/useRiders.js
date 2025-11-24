import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import { RIDER_REGISTRY_ABI } from '../contracts/abis';

// Hook to get rider information
export function useRider(riderAddress) {
  const { data: riderData, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.RiderRegistry,
    abi: RIDER_REGISTRY_ABI,
    functionName: 'getRider',
    args: [riderAddress],
    enabled: !!riderAddress,
    query: {
      staleTime: 5000, // Cache for 5 seconds (shorter for earnings updates)
      gcTime: 30000, // Keep in cache for 30 seconds
      refetchOnReconnect: true,
      refetchOnWindowFocus: false, // Don't refetch on window focus (prevents constant refreshing)
    },
  });

  // Convert tuple to struct-like object for frontend compatibility
  const rider = riderData ? {
    riderAddress: riderData[0],
    name: riderData[1],
    phoneNumber: riderData[2],
    vehicleType: riderData[3],
    metadataURI: riderData[4],
    isActive: riderData[5],
    isAvailable: riderData[6],
    registeredAt: riderData[7],
    totalDeliveries: riderData[8],
    totalEarnings: riderData[9],
    totalRating: riderData[10],
    ratingCount: riderData[11],
    currentOrderId: riderData[12],
  } : null;

  return {
    rider,
    isLoading,
    error,
    refetch,
  };
}

// Hook to get available riders
export function useAvailableRiders() {
  const { data: riders, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.RiderRegistry,
    abi: RIDER_REGISTRY_ABI,
    functionName: 'getAvailableRiders',
  });

  return {
    riders: riders || [],
    isLoading,
    error,
    refetch,
  };
}

// Hook to register as a rider
export function useRegisterRider() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerRider = async (name, phoneNumber, vehicleType, metadataURI) => {
    try {
      await writeContract({
        address: CONTRACTS.RiderRegistry,
        abi: RIDER_REGISTRY_ABI,
        functionName: 'registerRider',
        args: [name, phoneNumber, vehicleType, metadataURI],
      });
    } catch (err) {
      console.error('Rider registration error:', err);
      throw err;
    }
  };

  return {
    registerRider,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to set rider availability
export function useSetRiderAvailability() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const setAvailability = async (isAvailable) => {
    await writeContract({
      address: CONTRACTS.RiderRegistry,
      abi: RIDER_REGISTRY_ABI,
      functionName: 'setAvailability',
      args: [isAvailable],
    });
  };

  return {
    setAvailability,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

