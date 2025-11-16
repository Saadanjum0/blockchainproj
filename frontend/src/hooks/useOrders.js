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
  const { data: order, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.OrderManager,
    abi: ORDER_MANAGER_ABI,
    functionName: 'getOrder',
    args: [orderId],
    enabled: !!orderId && orderId > 0,
  });

  return {
    order,
    isLoading,
    error,
    refetch,
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

// Hook to create an order
export function useCreateOrder() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createOrder = (restaurantId, ipfsOrderHash, amountInEth, deliveryAddress, customerPhone = '', tip = 0) => {
    console.log('writeContract function:', writeContract);
    console.log('Contract address:', CONTRACTS.OrderManager);
    
    if (!writeContract) {
      throw new Error('writeContract is not available. Make sure your wallet is connected.');
    }
    
    try {
      writeContract({
        address: CONTRACTS.OrderManager,
        abi: ORDER_MANAGER_ABI,
        functionName: 'createOrder',
        args: [restaurantId, ipfsOrderHash, deliveryAddress, customerPhone, tip],
        value: parseEther(amountInEth.toString()),
      });
      console.log('writeContract called (transaction initiated)');
    } catch (err) {
      console.error('Order creation error:', err);
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
    try {
      // Convert orderId to BigInt if it's a string
      const orderIdBigInt = typeof orderId === 'string' ? BigInt(orderId) : orderId;
      
      writeContract({
        address: CONTRACTS.OrderManager,
        abi: ORDER_MANAGER_ABI,
        functionName: 'confirmDelivery',
        args: [orderIdBigInt, restaurantRating, riderRating],
      });
    } catch (err) {
      console.error('Error in confirmDelivery:', err);
      throw err;
    }
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

