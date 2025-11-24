import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Bike, Package, DollarSign, MapPin, Clock, User, Star, TrendingUp, ExternalLink, CheckCircle } from 'lucide-react';
import { 
  useRider, 
  useRegisterRider
} from '../hooks/useRiders';
import { useOrderCount, useOrder, useRiderOrders, useProcessPendingStats } from '../hooks/useOrders';
import { useMarkPickedUp, useMarkDelivered, useAssignRider } from '../hooks/useOrders';
import { useRestaurant } from '../hooks/useRestaurants';
import { createRiderMetadata, fetchFromIPFS, isPinataConfigured } from '../utils/ipfs';
import { getOrderStatusName } from '../contracts/abis';
import { NETWORK_CONFIG, CONTRACTS } from '../contracts/addresses';
import { formatEther } from 'viem';
import { getTimeAgo } from '../utils/formatDate';

function RiderDashboard({ onBack }) {
  const { address } = useAccount();
  const { rider, isLoading, refetch: refetchRider } = useRider(address);

  if (!address) {
    return (
      <div className="text-center py-12 card max-w-md mx-auto">
        <p className="text-gray-600">Please connect your wallet</p>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading rider profile...</p>
      </div>
    );
  }

  // If not registered as rider, show registration form
  if (!rider || rider.riderAddress === '0x0000000000000000000000000000000000000000') {
    return <RegisterRiderForm onSuccess={() => refetchRider()} onBack={onBack} />;
  }

  // Note: Riders are automatically available when registered
  // If you're not on an active delivery, you can accept new orders

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
        🏍️ Rider Dashboard
      </h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <RiderInfo rider={rider} riderAddress={address} />
        <RiderStats rider={rider} refetchRider={refetchRider} />
        <RiderEarnings 
          rider={rider} 
          riderAddress={address} 
          refetchRider={refetchRider}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AvailableOrders riderAddress={address} />
        <MyActiveDeliveries riderAddress={address} />
      </div>
    </div>
  );
}

function RegisterRiderForm({ onSuccess, onBack }) {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    name: '',
    vehicleType: 'bike',
    phoneNumber: '',
  });

  const { registerRider, isPending, isConfirming, isSuccess, hash } = useRegisterRider();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if IPFS is configured
    if (!isPinataConfigured()) {
      alert(
        '❌ IPFS NOT CONFIGURED\n\n' +
        'This application requires IPFS (Pinata) to be configured.\n' +
        'Please contact the site administrator to set up Pinata API credentials.\n\n' +
        'Without IPFS, rider data cannot be stored and shared across devices.'
      );
      return;
    }

    try {
      console.log('Creating rider metadata for IPFS...');
      
      // Create metadata hash
      const metadataHash = await createRiderMetadata(formData);
      console.log('✅ Metadata uploaded to IPFS:', metadataHash);

      // Register rider - pass all required parameters
      console.log('Registering rider on blockchain...');
      await registerRider(
        formData.name,
        formData.phoneNumber || '',
        formData.vehicleType,
        metadataHash
      );
      console.log('✅ Rider registration transaction submitted');
    } catch (error) {
      console.error('❌ Registration failed:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('IPFS NOT CONFIGURED') || error.message.includes('Pinata API')) {
        alert(
          '❌ IPFS Configuration Error\n\n' +
          'Pinata API credentials are not configured.\n' +
          'Please contact the administrator to set up IPFS properly.'
        );
      } else if (error.message.includes('Failed to upload')) {
        alert(
          '❌ Upload Failed\n\n' +
          'Could not upload rider data to IPFS.\n' +
          'Please check your internet connection and try again.'
        );
      } else {
        alert(`❌ Registration failed:\n\n${error.message || 'Please try again.'}`);
      }
    }
  };

  useEffect(() => {
    if (isSuccess) {
      // Clear pending role since registration is complete
      if (address) {
        localStorage.removeItem(`pendingRole_${address}`);
      }
      
      alert('Rider registration successful! 🎉');
      setTimeout(() => onSuccess(), 2000);
    }
  }, [isSuccess, onSuccess, address]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Bike className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold">Become a Delivery Rider</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input-field"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Vehicle Type *</label>
            <select
              required
              value={formData.vehicleType}
              onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
              className="input-field"
            >
              <option value="bike">🚲 Bike</option>
              <option value="scooter">🛵 Scooter</option>
              <option value="motorcycle">🏍️ Motorcycle</option>
              <option value="car">🚗 Car</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="input-field"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">💰 Earnings</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Earn 10% of each order value</li>
              <li>• Get paid in ETH automatically</li>
              <li>• Payment released when customer confirms delivery</li>
              <li>• Work on your own schedule</li>
            </ul>
          </div>

          <div className="flex gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex-1 btn-secondary"
                disabled={isPending || isConfirming}
              >
                ← Back to Selection
              </button>
            )}
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="flex-1 btn-primary"
            >
              {isPending ? 'Confirm in Wallet...' : 
               isConfirming ? 'Registering...' :
               'Register as Rider'}
            </button>
          </div>

          {hash && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 mb-2">Registration submitted!</p>
              <a 
                href={`${NETWORK_CONFIG.blockExplorer}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                View on Etherscan →
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function RiderInfo({ rider, riderAddress }) {
  const rating = rider.ratingCount > 0 
    ? (Number(rider.totalRating) / Number(rider.ratingCount)).toFixed(1)
    : '0.0';

  return (
    <div className="card border-2 border-green-100">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bike className="w-5 h-5 text-green-600" />
        Rider Profile
      </h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-600">Name</p>
          <p className="font-semibold">{rider.name || 'Unknown'}</p>
        </div>
        <div>
          <p className="text-gray-600">Vehicle</p>
          <p className="font-medium">
            {rider.vehicleType === 'bike' && '🚲 Bike'}
            {rider.vehicleType === 'scooter' && '🛵 Scooter'}
            {rider.vehicleType === 'motorcycle' && '🏍️ Motorcycle'}
            {rider.vehicleType === 'car' && '🚗 Car'}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Rating</p>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{rating}</span>
            <span className="text-gray-500">({Number(rider.ratingCount)} reviews)</span>
          </div>
        </div>
        <div>
          <p className="text-gray-600">Phone</p>
          <p className="font-medium">{rider.phoneNumber || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
}

function RiderStats({ rider, refetchRider }) {
  // FIXED ISSUE 2: Ensure component updates when rider data changes
  // Add a small delay refetch to ensure data is fresh
  useEffect(() => {
    // Refetch on mount to ensure latest data
    if (refetchRider) {
      const timer = setTimeout(() => {
        refetchRider();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [refetchRider]);

  return (
    <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-green-600" />
        Deliveries
      </h3>
      <div className="space-y-3">
        <div>
          <p className="text-gray-600 text-sm">Total Completed</p>
          <p className="text-3xl font-bold text-green-600">
            {Number(rider?.totalDeliveries || 0)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>Keep delivering to earn more!</span>
        </div>
      </div>
    </div>
  );
}

function RiderEarnings({ rider, riderAddress, refetchRider }) {
  // OPTIMIZED: Use blockchain data directly - ZERO additional RPC calls!
  // The rider registry already tracks totalEarnings and totalDeliveries on-chain
  // No need to fetch individual orders - blockchain data is the source of truth
  
  const { orderIds, refetch: refetchRiderOrders } = useRiderOrders(riderAddress);
  const { processPendingStats, isPending: isProcessingStats, isSuccess: statsProcessed } = useProcessPendingStats();

  // Use blockchain totalEarnings directly (most reliable and efficient)
  // FIXED: Increased precision to 10-11 decimal places
  const blockchainEarnings = (Number(rider.totalEarnings) / 1e18).toFixed(11);
  const completedDeliveries = Number(rider.totalDeliveries);
  const usdValue = (parseFloat(blockchainEarnings) * 3000).toFixed(2);
  
  // Get all rider orders - processPendingStats will only process pending ones
  const allOrderIds = orderIds || [];

  const handleProcessStats = () => {
    if (allOrderIds.length > 0) {
      console.log('Processing pending stats for orders:', allOrderIds);
      processPendingStats(allOrderIds);
    } else {
      alert('No orders found. Earnings should update automatically after delivery confirmation.');
    }
  };

  // FIXED ISSUE 2: Improved refetch logic to ensure earnings and deliveries update
  // This preserves component state and provides better UX
  // FIXED: Only depend on statsProcessed - refetch functions are stable from wagmi
  useEffect(() => {
    if (statsProcessed && refetchRider) {
      console.log('Stats processed, refetching rider data to update earnings...');
      // Wait a moment for blockchain state to fully update, then refetch
      const timer = setTimeout(async () => {
        try {
          // Refetch rider data to update earnings and deliveries display
          await refetchRider();
          await refetchRiderOrders();
          console.log('✅ Rider data refetched - earnings and deliveries should be updated');
        } catch (error) {
          console.error('Error refetching rider data:', error);
        }
      }, 2000); // Wait 2 seconds after stats processing to ensure on-chain state is updated
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsProcessed]); // Only depend on the actual trigger, not function references

  
  // Note: Pending earnings are visible in "My Active Deliveries" section
  // No need to calculate here - avoids excessive RPC calls

  return (
    <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-900">Earnings</h3>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-green-700 mb-1">Total Earned</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-green-900">
              {blockchainEarnings} ETH
            </p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-green-600 mt-1">
            ≈ ${usdValue} USD
          </p>
        </div>
        <div className="pt-3 border-t border-green-200">
          <p className="text-xs text-green-700 mb-1">Completed Deliveries</p>
          <p className="text-lg font-semibold text-green-900">
            {completedDeliveries}
          </p>
        </div>
        <div className="pt-2 border-t border-green-200">
          <p className="text-xs text-green-700 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Active Deliveries
          </p>
          <p className="text-xs text-green-600">
            Check "My Active Deliveries" below for pending orders
          </p>
        </div>
        <div className="bg-green-100 rounded-lg p-2 mt-3">
          <p className="text-xs text-green-800 font-medium">
            💰 You earn 10% of each order value
          </p>
          <p className="text-xs text-green-700 mt-1">
            Payments released when customer confirms delivery
          </p>
        </div>
        
        {/* CRITICAL FIX: Button to process pending stats if earnings don't update */}
        {allOrderIds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
              <p className="text-xs text-yellow-800 font-medium mb-1">
                ⚠️ Important: Earnings Update
              </p>
              <p className="text-xs text-yellow-700">
                After delivery confirmation, click below to update your earnings display. 
                Your ETH is already in your wallet (check Etherscan), but stats need processing.
              </p>
            </div>
            <button
              onClick={handleProcessStats}
              disabled={isProcessingStats}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingStats ? '⏳ Processing Stats...' : 
               statsProcessed ? '✅ Stats Updated! Refreshing...' :
               '🔄 Update Earnings Display'}
            </button>
            <p className="text-xs text-gray-600 mt-1 text-center">
              This updates the earnings counter. Your wallet balance is already updated.
            </p>
          </div>
        )}
      </div>
      <a
        href={`${NETWORK_CONFIG.blockExplorer}/address/${riderAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 text-xs text-green-700 hover:text-green-900 hover:underline transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        View Wallet on Etherscan
      </a>
    </div>
  );
}

function AvailableOrders({ riderAddress }) {
  const { orderCount } = useOrderCount();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableOrders = async () => {
      if (orderCount > 0) {
        setLoading(true);
        const orders = [];
        for (let i = 1; i <= Number(orderCount); i++) {
          orders.push(i);
        }
        setAvailableOrders(orders);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchAvailableOrders();
  }, [orderCount]);

  return (
    <div className="card border-2 border-green-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-green-600" />
        📦 Available Orders
      </h3>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading available orders...</p>
        </div>
      ) : availableOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No orders available right now</p>
          <p className="text-sm text-gray-500 mt-1">Check back soon for new deliveries!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {availableOrders.map(orderId => (
            <AvailableOrderCard 
              key={orderId} 
              orderId={orderId} 
              riderAddress={riderAddress}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MyActiveDeliveries({ riderAddress }) {
  const { orderCount } = useOrderCount();
  const [myOrders, setMyOrders] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (orderCount > 0) {
      const orders = [];
      for (let i = 1; i <= Number(orderCount); i++) {
        orders.push(i);
      }
      setMyOrders(orders);
    }
  }, [orderCount, refreshKey]);

  // Removed aggressive polling - users can manually refresh if needed

  return (
    <div className="card border-2 border-green-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bike className="w-5 h-5 text-green-600" />
        🏍️ My Active Deliveries
      </h3>

      {myOrders.length === 0 ? (
        <div className="text-center py-12">
          <Bike className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No active deliveries</p>
          <p className="text-sm text-gray-500 mt-1">Accept an order from "Available Orders" to start!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {myOrders.map(orderId => (
            <MyDeliveryCard 
              key={`${orderId}-${refreshKey}`}
              orderId={orderId} 
              riderAddress={riderAddress}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AvailableOrderCard({ orderId, riderAddress }) {
  const { order, refetch } = useOrder(orderId);
  const { restaurant } = useRestaurant(order?.restaurantId);
  const { assignRider, isPending, isConfirming: isAssigningConfirming, isSuccess: isAssignedSuccess, hash: assignHash } = useAssignRider();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (order?.ipfsOrderHash) {
        try {
          console.log('Fetching order details from IPFS:', order.ipfsOrderHash);
          const details = await fetchFromIPFS(order.ipfsOrderHash);
          setOrderDetails(details);
          console.log('✅ Order details loaded successfully');
        } catch (error) {
          console.error('❌ Failed to fetch order details:', error);
          
          // Provide user-friendly error messages
          if (error.message.includes('INVALID IPFS HASH') || error.message.includes('local_')) {
            console.error('Order data not accessible across devices - needs re-upload');
          } else if (error.message.includes('FAILED TO FETCH')) {
            console.error('Unable to load order details from IPFS - check internet connection');
          }
        }
      }
    };
    fetchDetails();
  }, [order]);

  // Auto-refetch when assignment succeeds
  useEffect(() => {
    if (isAssignedSuccess) {
      // Wait a moment for blockchain state to update, then refetch
      const timeoutId = setTimeout(() => {
        refetch();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [isAssignedSuccess, refetch]);

  // Removed aggressive polling - manual refresh only

  if (!order) return null;

  // Only show if: status = Prepared AND no rider assigned yet
  const hasNoRider = !order.rider || order.rider === '0x0000000000000000000000000000000000000000';
  if (order.status !== 2 || !hasNoRider) return null;

  const handleAccept = () => {
    try {
      assignRider(orderId, riderAddress);
      // Refetch will happen automatically when isAssignedSuccess becomes true
    } catch (error) {
      console.error('Failed to accept order:', error);
      alert('Failed to accept order. Please try again.');
    }
  };

  const amount = formatEther(order.amount);
  const riderEarnings = (parseFloat(amount) * 0.1).toFixed(4);

  return (
    <div className="border-2 border-green-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-lg">Order #{orderId}</h4>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
              🍳 Ready for Pickup
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{getTimeAgo(order.createdAt)}</span>
            </div>
            {restaurant && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="font-medium">{restaurant.name}</span>
              </div>
            )}
            {order.deliveryAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{order.deliveryAddress}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            +{riderEarnings} ETH
          </p>
          <p className="text-xs text-gray-600">Your earnings</p>
          <p className="text-xs text-gray-500">
            ≈ ${(parseFloat(riderEarnings) * 3000).toFixed(2)}
          </p>
        </div>
      </div>

      {orderDetails?.items && (
        <div className="bg-gray-50 rounded-lg p-2 mb-3">
          <p className="text-xs text-gray-600 font-medium mb-1">Items:</p>
          <div className="space-y-1">
            {orderDetails.items.slice(0, 2).map((item, idx) => (
              <p key={idx} className="text-xs text-gray-700">
                • {item.name} (x{item.quantity})
              </p>
            ))}
            {orderDetails.items.length > 2 && (
              <p className="text-xs text-gray-500">
                +{orderDetails.items.length - 2} more items
              </p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleAccept}
        disabled={isPending || isAssigningConfirming}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? '⏳ Confirm in Wallet...' : 
         isAssigningConfirming ? '⏳ Processing Transaction...' :
         '✅ Accept Delivery'}
      </button>

      {isAssignedSuccess && assignHash && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
          <p className="text-xs text-green-800 mb-1">
            ✅ Transaction confirmed! Order assigned to you.
          </p>
          <a 
            href={`${NETWORK_CONFIG.blockExplorer}/tx/${assignHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
}

function MyDeliveryCard({ orderId, riderAddress }) {
  const { order, refetch } = useOrder(orderId);
  const { restaurant } = useRestaurant(order?.restaurantId);
  const { markPickedUp, isPending: isPickingUp, isConfirming: isPickingUpConfirming, isSuccess: isPickedUpSuccess, hash: pickedUpHash } = useMarkPickedUp();
  const { markDelivered, isPending: isDelivering, isConfirming: isDeliveringConfirming, isSuccess: isDeliveredSuccess, hash: deliveredHash } = useMarkDelivered();

  // Auto-refetch when transaction succeeds
  useEffect(() => {
    if (isPickedUpSuccess || isDeliveredSuccess) {
      // Wait a moment for blockchain state to update, then refetch
      const timeoutId = setTimeout(() => {
        refetch();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [isPickedUpSuccess, isDeliveredSuccess, refetch]);

  // Removed aggressive polling - manual refresh only

  if (!order) return null;

  // Show orders assigned to THIS rider with status 2, 3, 4, or 5
  const isMyOrder = order.rider?.toLowerCase() === riderAddress?.toLowerCase();
  if (!isMyOrder || order.status < 2 || order.status > 5) return null;

  const handlePickup = () => {
    // Double check conditions before calling
    if (order.status !== 2) {
      alert(`Order status is ${order.status}, must be 2 (Prepared) to mark as picked up.`);
      return;
    }
    if (order.rider?.toLowerCase() !== riderAddress?.toLowerCase()) {
      alert('You are not the assigned rider for this order.');
      return;
    }
    
    try {
      console.log('Marking order as picked up:', {
        orderId,
        currentStatus: order.status,
        riderAddress: order.rider,
        yourAddress: riderAddress
      });
      markPickedUp(orderId);
      // Refetch will happen automatically when isPickedUpSuccess becomes true
    } catch (error) {
      console.error('Failed to mark picked up:', error);
      alert(`Failed to update status: ${error.message || 'Please try again.'}`);
    }
  };

  const handleDeliver = () => {
    // Double check conditions before calling
    if (order.status !== 3) {
      alert(`Order status is ${order.status}, must be 3 (PickedUp) to mark as delivered.`);
      return;
    }
    if (order.rider?.toLowerCase() !== riderAddress?.toLowerCase()) {
      alert('You are not the assigned rider for this order.');
      return;
    }
    
    try {
      console.log('Marking order as delivered:', {
        orderId,
        currentStatus: order.status,
        riderAddress: order.rider,
        yourAddress: riderAddress
      });
      markDelivered(orderId);
      // Refetch will happen automatically when isDeliveredSuccess becomes true
    } catch (error) {
      console.error('Failed to mark delivered:', error);
      alert(`Failed to update status: ${error.message || 'Please try again.'}`);
    }
  };

  const amount = formatEther(order.amount);
  const riderEarnings = (parseFloat(amount) * 0.1).toFixed(4);

  const getStatusInfo = () => {
    switch(order.status) {
      case 2:
        return { label: '📦 Assigned', color: 'bg-blue-100 text-blue-800' };
      case 3:
        return { label: '🏍️ In Transit', color: 'bg-orange-100 text-orange-800' };
      case 4:
        return { label: '📍 Delivered', color: 'bg-purple-100 text-purple-800' };
      case 5:
        return { label: '✅ Completed', color: 'bg-green-100 text-green-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-lg">Order #{orderId}</h4>
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="space-y-1 text-sm">
            {restaurant && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{restaurant.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span>{order.deliveryAddress || 'Address not provided'}</span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                <span>{order.customerPhone}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-600">
            +{riderEarnings} ETH
          </p>
          <p className="text-xs text-gray-600">Earnings</p>
        </div>
      </div>

      {order.status === 2 && (
        <>
        <button
          onClick={handlePickup}
          disabled={isPickingUp || isPickingUpConfirming}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
        >
          {isPickingUp ? '⏳ Confirm in Wallet...' : 
           isPickingUpConfirming ? '⏳ Processing Transaction...' :
           '📦 Mark as Picked Up'}
        </button>
          {isPickedUpSuccess && pickedUpHash && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-xs text-green-800 mb-1">
                ✅ Transaction confirmed! Order marked as picked up.
              </p>
              <a 
                href={`${NETWORK_CONFIG.blockExplorer}/tx/${pickedUpHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View on Etherscan
              </a>
            </div>
          )}
        </>
      )}

      {order.status === 3 && (
        <>
        <button
          onClick={handleDeliver}
          disabled={isDelivering || isDeliveringConfirming}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
        >
          {isDelivering ? '⏳ Confirm in Wallet...' : 
           isDeliveringConfirming ? '⏳ Processing Transaction...' :
           '📍 Mark as Delivered'}
        </button>
          {isDeliveredSuccess && deliveredHash && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-xs text-green-800 mb-1">
                ✅ Transaction confirmed! Order marked as delivered.
              </p>
              <a 
                href={`${NETWORK_CONFIG.blockExplorer}/tx/${deliveredHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View on Etherscan
              </a>
            </div>
          )}
        </>
      )}

      {order.status === 4 && (
        <div className="bg-purple-100 border border-purple-200 text-purple-800 py-2 px-4 rounded-lg text-center font-medium">
          ⏳ Waiting for customer confirmation...
          <p className="text-xs mt-1">Payment will be released when customer confirms delivery</p>
        </div>
      )}

      {order.status === 5 && (
        <div className="bg-green-200 border border-green-300 text-green-800 py-2 px-4 rounded-lg">
          <p className="font-medium text-center mb-2">✅ Completed - Payment Released!</p>
          <div className="text-xs space-y-1">
            <p className="text-green-700">💰 You received {riderEarnings} ETH</p>
            <a
              href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACTS.Escrow}#internaltx`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View payment on Etherscan
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiderDashboard;

