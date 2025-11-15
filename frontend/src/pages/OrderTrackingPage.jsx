import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  Store,
  ArrowLeft,
  AlertCircle 
} from 'lucide-react';
import { useOrder } from '../hooks/useOrders';
import { useConfirmDelivery, useCancelOrder } from '../hooks/useOrders';
import { getOrderStatusName } from '../contracts/abis';
import { formatEther } from 'viem';
import { NETWORK_CONFIG } from '../contracts/addresses';

function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { order, isLoading, refetch } = useOrder(orderId);
  const { confirmDelivery, isPending: isConfirming, isSuccess: isConfirmed, hash: confirmHash } = useConfirmDelivery();
  const { cancelOrder, isPending: isCancelling, isSuccess: isCancelled, hash: cancelHash } = useCancelOrder();

  // Auto-refetch order status every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleConfirmDelivery = async () => {
    try {
      await confirmDelivery(orderId);
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      alert('Failed to confirm delivery. Please try again.');
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await cancelOrder(orderId, reason);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 card max-w-md mx-auto">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order not found</h2>
        <p className="text-gray-600 mb-6">
          The order you're looking for doesn't exist.
        </p>
        <button onClick={() => navigate('/my-orders')} className="btn-primary">
          View My Orders
        </button>
      </div>
    );
  }

  const isCustomer = order.customer.toLowerCase() === address?.toLowerCase();
  const statusName = getOrderStatusName(order.status);
  const amount = formatEther(order.amount);

  const orderSteps = [
    { status: 0, label: 'Order Placed', icon: CheckCircle },
    { status: 1, label: 'Accepted', icon: Store },
    { status: 2, label: 'Preparing', icon: Clock },
    { status: 3, label: 'Out for Delivery', icon: Truck },
    { status: 4, label: 'Delivered', icon: Package },
    { status: 5, label: 'Completed', icon: CheckCircle },
  ];

  const currentStep = order.status;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/my-orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to My Orders
      </button>

      <h1 className="text-3xl font-bold mb-6">Order #{orderId}</h1>

      {/* Order Status Timeline */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-6">Order Status: {statusName}</h2>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-orange-600 transition-all duration-500"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {orderSteps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep >= step.status;
              const isCurrent = currentStep === step.status;

              return (
                <div key={step.status} className="flex flex-col items-center">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-orange-200' : ''}`}
                  >
                    <Icon size={24} />
                  </div>
                  <p className={`text-xs text-center max-w-[80px] ${
                    isCompleted ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Order Details */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Restaurant</span>
              <span className="font-medium">#{order.restaurantId.toString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">{parseFloat(amount).toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created</span>
              <span className="font-medium">
                {new Date(Number(order.createdAt) * 1000).toLocaleString()}
              </span>
            </div>
            {order.completedAt > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium">
                  {new Date(Number(order.completedAt) * 1000).toLocaleString()}
                </span>
              </div>
            )}
            <div className="pt-3 border-t">
              <p className="text-gray-600 mb-1">IPFS Hash</p>
              <p className="font-mono text-xs break-all">{order.ipfsOrderHash}</p>
            </div>
          </div>
        </div>

        {/* Customer & Rider Info */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Participants</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Customer</p>
              <p className="font-mono text-xs break-all">{order.customer}</p>
            </div>
            {order.rider && order.rider !== '0x0000000000000000000000000000000000000000' ? (
              <div>
                <p className="text-gray-600 mb-1">Rider</p>
                <p className="font-mono text-xs break-all">{order.rider}</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-1">Rider</p>
                <p className="text-gray-400 italic">Not assigned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {isCustomer && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          
          {order.status === 4 && !isConfirmed && (
            <div className="space-y-3">
              <p className="text-gray-600">
                Your order has been delivered! Please confirm to release payment to the restaurant and rider.
              </p>
              <button
                onClick={handleConfirmDelivery}
                disabled={isConfirming}
                className="w-full btn-primary"
              >
                {isConfirming ? 'Confirming...' : '✅ Confirm Delivery'}
              </button>
            </div>
          )}

          {order.status === 0 && !isCancelled && (
            <div className="space-y-3">
              <p className="text-gray-600">
                You can cancel this order before it's accepted by the restaurant.
              </p>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400"
              >
                {isCancelling ? 'Cancelling...' : '❌ Cancel Order'}
              </button>
            </div>
          )}

          {order.status === 5 && (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-green-600">
                Order Completed Successfully!
              </p>
              <p className="text-gray-600 mt-2">
                Thank you for your order. Payment has been released.
              </p>
            </div>
          )}

          {(confirmHash || cancelHash) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                Transaction submitted!
              </p>
              <a 
                href={`${NETWORK_CONFIG.blockExplorer}/tx/${confirmHash || cancelHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                View on Etherscan →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderTrackingPage;

