import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { useCustomerOrders, useOrder } from '../hooks/useOrders';
import { getOrderStatusName } from '../contracts/abis';
import { NETWORK_CONFIG } from '../contracts/addresses';
import { formatEther } from 'viem';
import { formatDate, formatTime } from '../utils/formatDate';

function MyOrders() {
  const { address } = useAccount();
  const { orderIds, isLoading } = useCustomerOrders(address);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (orderIds.length === 0) {
    return (
      <div className="text-center py-12 card max-w-md mx-auto">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-gray-600 mb-6">
          Start ordering delicious food from our restaurants!
        </p>
        <Link to="/" className="btn-primary inline-block">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      <div className="space-y-4">
        {orderIds.map((orderId) => (
          <OrderCard key={orderId.toString()} orderId={Number(orderId)} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ orderId }) {
  const { order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!order) return null;

  const statusName = getOrderStatusName(order.status);
  const amount = formatEther(order.amount);

  const getStatusColor = (status) => {
    switch(status) {
      case 0: return 'bg-blue-100 text-blue-800';  // Created
      case 1: return 'bg-yellow-100 text-yellow-800';  // Accepted
      case 2: return 'bg-orange-100 text-orange-800';  // Prepared
      case 3: return 'bg-purple-100 text-purple-800';  // PickedUp
      case 4: return 'bg-green-100 text-green-800';  // Delivered
      case 5: return 'bg-green-600 text-white';  // Completed
      case 6: return 'bg-red-100 text-red-800';  // Cancelled
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    if (status === 5) return <CheckCircle className="w-5 h-5" />;
    if (status >= 3) return <Package className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  return (
    <Link to={`/order-details/${orderId}`} className="card hover:shadow-lg transition-shadow block">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">Order #{orderId}</h3>
          <p className="text-sm text-gray-600">
            Restaurant #{order.restaurantId.toString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          {statusName}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
        <div>
          <p className="text-gray-600">Amount</p>
          <p className="font-semibold">{parseFloat(amount).toFixed(4)} ETH</p>
        </div>
        <div>
          <p className="text-gray-600">Date</p>
          <p className="font-semibold">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Time</p>
          <p className="font-semibold">
            {formatTime(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors">
        <ExternalLink className="w-3 h-3" />
        <span>View order details for Etherscan transaction links</span>
      </div>

      {order.status === 4 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-orange-600 font-medium">
            👉 Click to confirm delivery and release payment
          </p>
        </div>
      )}
    </Link>
  );
}

export default MyOrders;

