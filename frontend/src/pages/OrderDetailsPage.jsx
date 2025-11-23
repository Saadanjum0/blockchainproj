import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ArrowLeft, Package, User, MapPin, Phone, Clock, CheckCircle, DollarSign, ExternalLink } from 'lucide-react';
import { useOrder, useConfirmDelivery, useProcessPendingStats } from '../hooks/useOrders';
import { useRestaurant } from '../hooks/useRestaurants';
import { getOrderStatusName } from '../contracts/abis';
import { formatEther } from 'viem';
import { formatDateTime, getTimeAgo } from '../utils/formatDate';
import { fetchFromIPFS } from '../utils/ipfs';
import { NETWORK_CONFIG, CONTRACTS } from '../contracts/addresses';

function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { order, isLoading, refetch } = useOrder(orderId);
  const { restaurant } = useRestaurant(order?.restaurantId);
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [riderRating, setRiderRating] = useState(0);

  const { confirmDelivery, isPending, isConfirming, isSuccess, hash } = useConfirmDelivery();
  const { processPendingStats, isPending: isProcessingStats, isSuccess: statsProcessed } = useProcessPendingStats();

  // Fetch order details from IPFS
  useEffect(() => {
    const fetchDetails = async () => {
      if (order?.ipfsOrderHash) {
        try {
          setLoadingDetails(true);
          const details = await fetchFromIPFS(order.ipfsOrderHash);
          setOrderDetails(details);
        } catch (error) {
          console.error('Failed to fetch order details:', error);
        } finally {
          setLoadingDetails(false);
        }
      } else {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [order]);

  // FIXED BUG 2: Automatically process pending stats after delivery confirmation
  // Removed processPendingStats from dependency array - only isSuccess and orderId should trigger
  // The function reference changes on every render, causing the effect to reset
  useEffect(() => {
    if (isSuccess && orderId) {
      // Wait a moment for the transaction to be fully confirmed, then process stats
      const timer = setTimeout(() => {
        console.log('Processing pending stats for order:', orderId);
        processPendingStats([orderId]);
      }, 3000); // Wait 3 seconds for blockchain state to update
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, orderId]); // Only depend on isSuccess and orderId

  // FIXED: Only refetch after stats are processed, not on delivery confirmation
  // This prevents race condition where data is refetched before stats processing completes
  useEffect(() => {
    if (statsProcessed) {
      // Wait a moment for stats processing to fully complete on-chain
      const timer = setTimeout(() => {
        console.log('Stats processed, refetching order data...');
        refetch();
      }, 2000); // Wait 2 seconds after stats processing to ensure on-chain state is updated
      
      return () => clearTimeout(timer);
    }
  }, [statsProcessed, refetch]);

  if (isLoading || !order) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  const amount = formatEther(order.amount);
  const statusName = getOrderStatusName(order.status);
  const isCustomer = address?.toLowerCase() === order.customer.toLowerCase();
  const isRider = address?.toLowerCase() === order.rider?.toLowerCase();

  // Payment breakdown
  const restaurantAmount = (parseFloat(amount) * 0.8).toFixed(4);
  const riderAmount = (parseFloat(amount) * 0.1).toFixed(4);
  const platformFee = (parseFloat(amount) * 0.1).toFixed(4);

  const handleConfirm = () => {
    confirmDelivery(orderId, restaurantRating, riderRating);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 0: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-purple-100 text-purple-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-green-100 text-green-800';
      case 5: return 'bg-green-600 text-white';
      case 6: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{orderId}</h1>
            <p className="text-gray-600 mt-1">{getTimeAgo(order.createdAt)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-bold ${getStatusColor(order.status)}`}>
            {statusName}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </h2>
            
            {loadingDetails ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-3 text-gray-600 text-sm">Loading items...</p>
              </div>
            ) : orderDetails?.items && orderDetails.items.length > 0 ? (
              <div className="space-y-3">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍔</span>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{item.price} ETH</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Order details not available
              </p>
            )}
          </div>

          {/* Payment Breakdown */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Breakdown
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-600">Order Total</span>
                <span className="font-semibold">{parseFloat(amount).toFixed(4)} ETH</span>
              </div>
              
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>→ Restaurant (80%)</span>
                  <span className="font-medium">{restaurantAmount} ETH</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>→ Rider (10%)</span>
                  <span className="font-medium">{riderAmount} ETH</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>→ Platform Fee (10%)</span>
                  <span className="font-medium">{platformFee} ETH</span>
                </div>
              </div>

              {order.status === 5 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-green-800 font-medium">
                    ✅ Payment Released & Distributed
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Restaurant received {restaurantAmount} ETH
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800 font-medium">
                    🔒 Payment Held in Escrow
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Will be released when customer confirms delivery
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Order Timeline
            </h2>
            
            <div className="space-y-4">
              {/* Created */}
              <TimelineItem 
                completed={true}
                title="Order Placed"
                time={formatDateTime(order.createdAt)}
                icon="🛒"
              />

              {/* Accepted */}
              <TimelineItem 
                completed={order.status >= 1}
                title="Restaurant Accepted"
                time={order.acceptedAt > 0 ? formatDateTime(order.acceptedAt) : null}
                icon="✅"
              />

              {/* Prepared */}
              <TimelineItem 
                completed={order.status >= 2}
                title="Food Prepared"
                time={order.preparedAt > 0 ? formatDateTime(order.preparedAt) : null}
                icon="🍳"
                subtitle={order.status === 2 ? "Ready for rider pickup" : ""}
              />

              {/* Picked Up */}
              <TimelineItem 
                completed={order.status >= 3}
                title="Rider Picked Up"
                time={order.pickedUpAt > 0 ? formatDateTime(order.pickedUpAt) : null}
                icon="🏍️"
              />

              {/* Delivered */}
              <TimelineItem 
                completed={order.status >= 4}
                title="Delivered"
                time={order.deliveredAt > 0 ? formatDateTime(order.deliveredAt) : null}
                icon="📦"
                subtitle={order.status === 4 ? "Waiting for customer confirmation" : ""}
              />

              {/* Completed */}
              <TimelineItem 
                completed={order.status >= 5}
                title="Order Completed"
                time={order.completedAt > 0 ? formatDateTime(order.completedAt) : null}
                icon="🎉"
                subtitle={order.status === 5 ? "Payment released" : ""}
              />
            </div>
          </div>

          {/* Blockchain Transactions - Professional View */}
          <BlockchainTransactionsView orderId={orderId} order={order} amount={amount} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Restaurant Info */}
          <div className="card">
            <h3 className="font-bold mb-3">Restaurant</h3>
            <p className="font-medium text-lg">{restaurant?.name || `Restaurant #${order.restaurantId}`}</p>
            {restaurant?.physicalAddress && (
              <p className="text-sm text-gray-600 mt-2">
                📍 {restaurant.physicalAddress}
              </p>
            )}
          </div>

          {/* Delivery Info */}
          <div className="card">
            <h3 className="font-bold mb-3">Delivery Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
                <span>{order.deliveryAddress || 'Not provided'}</span>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="card">
            <h3 className="font-bold mb-3">Customer</h3>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-mono">
                {order.customer.slice(0, 10)}...{order.customer.slice(-8)}
              </span>
            </div>
          </div>

          {/* Rider Info */}
          {order.rider && order.rider !== '0x0000000000000000000000000000000000000000' && (
            <div className="card">
              <h3 className="font-bold mb-3">Rider</h3>
              <div className="flex items-center gap-2">
                <span>🏍️</span>
                <span className="text-xs font-mono">
                  {order.rider.slice(0, 10)}...{order.rider.slice(-8)}
                </span>
              </div>
            </div>
          )}

          {/* Customer Actions */}
          {isCustomer && order.status === 4 && (
            <div className="card bg-green-50 border-2 border-green-200">
              <h3 className="font-bold mb-3">Confirm Delivery</h3>
              <p className="text-sm text-gray-700 mb-4">
                Have you received your order? Confirm to release payment to restaurant and rider.
              </p>

              {/* Rating */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-medium block mb-1">Rate Restaurant (Optional)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRestaurantRating(star)}
                        className={`text-2xl ${star <= restaurantRating ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1">Rate Rider (Optional)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRiderRating(star)}
                        className={`text-2xl ${star <= riderRating ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={isPending || isConfirming}
                className="w-full btn-primary"
              >
                {isPending ? '⏳ Confirm in Wallet...' :
                 isConfirming ? '⏳ Processing...' :
                 '✅ Confirm Delivery'}
              </button>

              {hash && (
                <a 
                  href={`${NETWORK_CONFIG.blockExplorer}/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 block text-center"
                >
                  View Transaction →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BlockchainTransactionsView({ orderId, order, amount }) {
  const restaurantShare = (parseFloat(amount) * 0.8).toFixed(4);
  const riderShare = (parseFloat(amount) * 0.1).toFixed(4);
  const platformShare = (parseFloat(amount) * 0.1).toFixed(4);

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
          🔗 Blockchain Transactions
        </h2>
        <a
          href={`${NETWORK_CONFIG.blockExplorer}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Etherscan
        </a>
      </div>

      <div className="space-y-4">
        {/* Smart Contract Addresses */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-xs font-bold text-gray-700 mb-3">📄 Smart Contracts</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">OrderManager:</span>
              <a
                href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACTS.OrderManager}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono flex items-center gap-1"
              >
                {CONTRACTS.OrderManager.slice(0, 6)}...{CONTRACTS.OrderManager.slice(-4)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Escrow Contract:</span>
              <a
                href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACTS.Escrow}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono flex items-center gap-1"
              >
                {CONTRACTS.Escrow.slice(0, 6)}...{CONTRACTS.Escrow.slice(-4)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Payment Flow */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-xs font-bold text-gray-700 mb-3">💰 Payment Flow</p>
          
          {/* Step 1: Customer Payment */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Order Created</p>
                <p className="text-xs text-gray-600 mt-1">Customer paid {amount} ETH</p>
                <div className="mt-2 bg-blue-50 rounded p-2 text-xs">
                  <p className="text-gray-700">
                    <span className="font-mono text-blue-600">{order.customer.slice(0, 10)}...</span>
                    {' → '}
                    <span className="font-semibold">createOrder()</span>
                    {' → '}
                    <span className="font-mono text-green-600">Escrow</span>
                  </p>
                  <p className="text-gray-500 mt-1">
                    Funds locked in escrow contract until delivery confirmed
                  </p>
                </div>
              </div>
            </div>
            <a
              href={`${NETWORK_CONFIG.blockExplorer}/address/${order.customer}?fromaddress=${CONTRACTS.OrderManager}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 ml-8"
            >
              <ExternalLink className="w-3 h-3" />
              View customer's transactions on Etherscan
            </a>
          </div>

          {/* Step 2: Order Processing */}
          {order.status >= 1 && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Order Processing</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {order.status >= 1 && '✅ Restaurant accepted'}
                    {order.status >= 2 && ' → ✅ Food prepared'}
                    {order.status >= 3 && ' → ✅ Rider picked up'}
                    {order.status >= 4 && ' → ✅ Delivered'}
                  </p>
                  <div className="mt-2 bg-yellow-50 rounded p-2 text-xs">
                    <p className="text-gray-600">
                      Each status change is recorded on-chain
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Release */}
          {order.status === 5 ? (
            <div className="mb-2">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">Payment Released ✅</p>
                  <p className="text-xs text-green-700 mt-1">Escrow distributed funds to all parties</p>
                  <div className="mt-2 space-y-2">
                    <div className="bg-green-50 rounded p-2 text-xs">
                      <p className="text-gray-700 font-semibold mb-1">Distribution:</p>
                      <p className="text-gray-600">
                        🏪 Restaurant: <span className="font-mono text-green-600">{restaurantShare} ETH</span>
                      </p>
                      <p className="text-gray-600">
                        🏍️ Rider: <span className="font-mono text-green-600">{riderShare} ETH</span>
                      </p>
                      <p className="text-gray-600">
                        ⚡ Platform: <span className="font-mono text-green-600">{platformShare} ETH</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <a
                href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACTS.Escrow}#internaltx`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline flex items-center gap-1 ml-8"
              >
                <ExternalLink className="w-3 h-3" />
                View escrow internal transactions (payment distribution)
              </a>
            </div>
          ) : (
            <div className="mb-2">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">Payment Release</p>
                  <p className="text-xs text-gray-600 mt-1">Waiting for order completion</p>
                  <div className="mt-2 bg-gray-50 rounded p-2 text-xs">
                    <p className="text-gray-600">
                      🔒 {amount} ETH held securely in escrow
                    </p>
                    <p className="text-gray-500 mt-1">
                      Will be released when customer confirms delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-xs font-bold text-gray-700 mb-3">🔍 Track on Etherscan</p>
          <div className="space-y-2">
            <a
              href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACTS.Escrow}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 p-2 bg-blue-50 rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <div className="flex-1">
                <p className="font-semibold">View Escrow Contract</p>
                <p className="text-gray-600">See all escrow transactions and balance</p>
              </div>
            </a>
            <a
              href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACTS.Escrow}#internaltx`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 p-2 bg-blue-50 rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <div className="flex-1">
                <p className="font-semibold">View Internal Transactions</p>
                <p className="text-gray-600">See payments from escrow to restaurants & riders</p>
              </div>
            </a>
            <a
              href={`${NETWORK_CONFIG.blockExplorer}/address/${order.customer}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 p-2 bg-blue-50 rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <div className="flex-1">
                <p className="font-semibold">View Customer Wallet</p>
                <p className="text-gray-600">See all customer transactions</p>
              </div>
            </a>
          </div>
        </div>

        {/* Educational Note */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs font-semibold text-purple-900 mb-1">💡 How It Works</p>
          <p className="text-xs text-purple-700">
            All payments are held in a secure escrow smart contract. When you confirm delivery, 
            the contract automatically distributes funds: 80% to restaurant, 10% to rider, 10% platform fee. 
            Every transaction is recorded permanently on the Ethereum blockchain and can be verified on Etherscan.
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ completed, title, time, icon, subtitle }) {
  return (
    <div className="flex gap-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg
        ${completed ? 'bg-green-100' : 'bg-gray-100'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`font-medium ${completed ? 'text-gray-900' : 'text-gray-400'}`}>
          {title}
        </p>
        {time && (
          <p className="text-xs text-gray-600">{time}</p>
        )}
        {subtitle && (
          <p className="text-xs text-blue-600 font-medium mt-1">{subtitle}</p>
        )}
      </div>
      {completed && (
        <CheckCircle className="w-5 h-5 text-green-600" />
      )}
    </div>
  );
}

export default OrderDetailsPage;

