import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS } from '../contracts/addresses';
import { ORDER_MANAGER_ABI } from '../contracts/abis';

// Hook to get order count
export function useOrderCount() {
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.OrderManager,
    abi: ORDER_MANAGER_ABI,
    functionName: 'orderCount',
  });

  return {
    orderCount: data ? Number(data) : 0,
    isLoading,
  };
}

// Hook to get single order details
export function useOrder(orderId) {
  const { data: order, isLoading, error, refetch, isFetched } = useReadContract({
    address: CONTRACTS.OrderManager,
    abi: ORDER_MANAGER_ABI,
    functionName: 'getOrder',
    args: [orderId],
    enabled: !!orderId && orderId > 0,
    query: {
      staleTime: 15000, // Cache for 15 seconds
      gcTime: 1000 * 60, // Keep in cache for 60 seconds
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      // Manual refetch only when needed
    },
  });

  return {
    order,
    isLoading,
    error,
    refetch,
    isFetched,
  };
}

// Hook to get customer orders
export function useCustomerOrders(customerAddress) {
  const { data: orderIds, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.OrderManager,
    abi: ORDER_MANAGER_ABI,
    functionName: 'getCustomerOrders',
    args: [customerAddress],
    enabled: !!customerAddress,
  });

  return {
    orderIds: orderIds || [],
    isLoading,
    error,
    refetch,
  };
}

// Hook to get restaurant orders
export function useRestaurantOrders(restaurantId) {
  const { data: orderIds, isLoading, error, refetch, isFetched } = useReadContract({
    address: CONTRACTS.OrderManager,
    abi: ORDER_MANAGER_ABI,
    functionName: 'getRestaurantOrders',
    args: [restaurantId],
    enabled: !!restaurantId && restaurantId > 0,
    query: {
      staleTime: 20000, // Cache for 20 seconds
      gcTime: 1000 * 60, // Keep in cache for 60 seconds
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      // Removed automatic polling - use manual refresh button instead
    },
  });

  return {
    orderIds: orderIds || [],
    isLoading,
    error,
    refetch,
    isFetched,
  };
}

// Hook to get rider orders
export function useRiderOrders(riderAddress) {
  const { data: orderIds, isLoading, error, refetch, isFetched } = useReadContract({
    address: CONTRACTS.OrderManager,
    abi: ORDER_MANAGER_ABI,
    functionName: 'getRiderOrders',
    args: [riderAddress],
    enabled: !!riderAddress,
    query: {
      staleTime: 20000, // Cache for 20 seconds
      gcTime: 1000 * 60, // Keep in cache for 60 seconds
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      // Removed automatic polling - use manual refresh button instead
    },
  });

  return {
    orderIds: orderIds || [],
    isLoading,
    error,
    refetch,
    isFetched,
  };
}

// Hook to create an order
export function useCreateOrder() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createOrder = async (restaurantId, ipfsOrderHash, amountInEth, deliveryAddress, customerPhone = '', tip = 0) => {
    console.log('createOrder called with:', {
      restaurantId,
      ipfsOrderHash,
      amountInEth,
      deliveryAddress,
      customerPhone,
      tip,
    });
    
    if (!writeContract) {
      throw new Error('writeContract is not available. Make sure your wallet is connected.');
    }
    
    // Validate inputs
    if (!restaurantId || restaurantId <= 0) {
      throw new Error('Invalid restaurant ID');
    }
    if (!ipfsOrderHash || ipfsOrderHash.trim() === '') {
      throw new Error('IPFS hash is required');
    }
    if (!deliveryAddress || deliveryAddress.trim() === '') {
      throw new Error('Delivery address is required');
    }
    if (!amountInEth || parseFloat(amountInEth) <= 0) {
      throw new Error('Order amount must be greater than 0');
    }
    
    try {
      const value = parseEther(amountInEth.toString());
      console.log('Calling writeContract with:', {
        address: CONTRACTS.OrderManager,
        functionName: 'createOrder',
        args: [restaurantId, ipfsOrderHash, deliveryAddress, customerPhone, tip],
        value: value.toString(),
        gas: '900000',
      });
      
      await writeContract({
        address: CONTRACTS.OrderManager,
        abi: ORDER_MANAGER_ABI,
        functionName: 'createOrder',
        args: [restaurantId, ipfsOrderHash, deliveryAddress, customerPhone, tip],
        value: value,
        gas: 900000n, // prevent MetaMask from defaulting to 21M gas (Sepolia cap 16.7M)
      });
      console.log('writeContract called successfully (transaction initiated)');
    } catch (err) {
      console.error('Order creation error:', err);
      console.error('Error details:', {
        message: err?.message,
        shortMessage: err?.shortMessage,
        details: err?.details,
        cause: err?.cause,
      });
      throw err;
    }
  };

  return {
    createOrder,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to accept an order (restaurant)
export function useAcceptOrder() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const acceptOrder = (orderId) => {
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'acceptOrder',
      args: [orderId],
    });
  };

  return {
    acceptOrder,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to mark order as prepared (restaurant)
export function useMarkPrepared() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const markPrepared = (orderId) => {
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'markPrepared',
      args: [orderId],
    });
  };

  return {
    markPrepared,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to assign rider to order
export function useAssignRider() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const assignRider = (orderId, riderAddress) => {
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'assignRider',
      args: [orderId, riderAddress],
    });
  };

  return {
    assignRider,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to mark order as picked up (rider)
export function useMarkPickedUp() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const markPickedUp = (orderId) => {
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'markPickedUp',
      args: [orderId],
    });
  };

  return {
    markPickedUp,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to mark order as delivered (rider)
export function useMarkDelivered() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const markDelivered = (orderId) => {
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'markDelivered',
      args: [orderId],
    });
  };

  return {
    markDelivered,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to confirm delivery (customer)
export function useConfirmDelivery() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const confirmDelivery = (orderId, restaurantRating = 0, riderRating = 0) => {
    // Convert orderId to BigInt if it's a string
    const orderIdBigInt = typeof orderId === 'string' ? BigInt(orderId) : orderId;
    
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'confirmDelivery',
      args: [orderIdBigInt, restaurantRating, riderRating],
    });
  };

  return {
    confirmDelivery,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to process pending stats (updates rider/restaurant earnings)
export function useProcessPendingStats() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const processPendingStats = (orderIds) => {
    // Ensure orderIds is an array of BigInt
    const orderIdsBigInt = orderIds.map(id => 
      typeof id === 'string' ? BigInt(id) : id
    );
    
    // Provide an explicit gas limit to prevent MetaMask massively over-estimating
    // (similar to createOrder). This does NOT increase cost, it just caps the estimate.
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'processPendingStats',
      args: [orderIdsBigInt],
      gas: 800000n,
    });
  };

  return {
    processPendingStats,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to cancel order (customer)
export function useCancelOrder() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const cancelOrder = (orderId, reason) => {
    writeContract({
      address: CONTRACTS.OrderManager,
      abi: ORDER_MANAGER_ABI,
      functionName: 'cancelOrder',
      args: [orderId, reason],
    });
  };

  return {
    cancelOrder,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

