import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Bike, ToggleLeft, ToggleRight, Package, DollarSign } from 'lucide-react';
import { 
  useRider, 
  useRegisterRider, 
  useSetRiderAvailability 
} from '../hooks/useRiders';
import { useOrderCount, useOrder } from '../hooks/useOrders';
import { useMarkPickedUp, useMarkDelivered } from '../hooks/useOrders';
import { createRiderMetadata } from '../utils/ipfs';
import { getOrderStatusName } from '../contracts/abis';
import { NETWORK_CONFIG } from '../contracts/addresses';

function RiderDashboard({ onBack }) {
  const { address } = useAccount();
  const { rider, refetch: refetchRider } = useRider(address);

  if (!address) {
    return (
      <div className="text-center py-12 card max-w-md mx-auto">
        <p className="text-gray-600">Please connect your wallet</p>
      </div>
    );
  }

  // If not registered as rider, show registration form
  if (!rider || rider.riderAddress === '0x0000000000000000000000000000000000000000') {
    return <RegisterRiderForm onSuccess={() => refetchRider()} onBack={onBack} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Rider Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <RiderInfo rider={rider} riderAddress={address} />
        <RiderStats rider={rider} />
      </div>

      <AvailableDeliveries riderAddress={address} />
    </div>
  );
}

function RegisterRiderForm({ onSuccess, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    vehicleType: 'bike',
    phoneNumber: '',
  });

  const { registerRider, isPending, isConfirming, isSuccess, hash } = useRegisterRider();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create metadata hash
      const metadataHash = await createRiderMetadata(formData);

      // Register rider - pass all required parameters
      await registerRider(
        formData.name,
        formData.phoneNumber || '',
        formData.vehicleType,
        metadataHash
      );
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register as rider. Please try again.');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      // Mark this address as a rider
      localStorage.setItem(`rider_${window.ethereum?.selectedAddress}`, 'true');
      alert('Rider registration successful! 🎉');
      setTimeout(() => onSuccess(), 2000);
    }
  }, [isSuccess, onSuccess]);

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
  const { setAvailability, isPending } = useSetRiderAvailability();

  const toggleAvailability = async () => {
    await setAvailability(!rider.isAvailable);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Rider Info</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-600">Address</p>
          <p className="font-mono text-xs break-all">{riderAddress}</p>
        </div>
        <div>
          <p className="text-gray-600">Availability</p>
          <button
            onClick={toggleAvailability}
            disabled={isPending}
            className="flex items-center gap-2 mt-1"
          >
            {rider.isAvailable ? (
              <>
                <ToggleRight className="w-6 h-6 text-green-600" />
                <span className="text-green-600 font-medium">Available</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600 font-medium">Offline</span>
              </>
            )}
          </button>
        </div>
        <div>
          <p className="text-gray-600">Status</p>
          <p className={`font-medium ${rider.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {rider.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>
    </div>
  );
}

function RiderStats({ rider }) {
  const totalEarnings = (Number(rider.totalEarnings) / 1e18).toFixed(4);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 text-sm">Total Deliveries</p>
          <p className="text-2xl font-bold flex items-center gap-1">
            <Package className="w-5 h-5" />
            {Number(rider.totalDeliveries)}
          </p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Total Earnings</p>
          <p className="text-2xl font-bold flex items-center gap-1">
            <DollarSign className="w-5 h-5" />
            {totalEarnings} ETH
          </p>
        </div>
      </div>
    </div>
  );
}

function AvailableDeliveries({ riderAddress }) {
  const { orderCount } = useOrderCount();
  const [availableOrders, setAvailableOrders] = useState([]);

  // Find orders assigned to this rider
  useEffect(() => {
    if (orderCount > 0) {
      // In production, filter by rider address from events
      const orders = [];
      for (let i = 1; i <= Math.min(orderCount, 5); i++) {
        orders.push(i);
      }
      setAvailableOrders(orders);
    }
  }, [orderCount, riderAddress]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Your Deliveries</h3>

      {availableOrders.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          No active deliveries. Make sure you're available to receive orders!
        </p>
      ) : (
        <div className="space-y-3">
          {availableOrders.map(orderId => (
            <RiderOrderCard key={orderId} orderId={orderId} riderAddress={riderAddress} />
          ))}
        </div>
      )}
    </div>
  );
}

function RiderOrderCard({ orderId, riderAddress }) {
  const { order, refetch } = useOrder(orderId);
  const { markPickedUp, isPending: isPickingUp } = useMarkPickedUp();
  const { markDelivered, isPending: isDelivering } = useMarkDelivered();

  if (!order) return null;

  // Only show if rider is assigned to this order
  const isMyOrder = order.rider?.toLowerCase() === riderAddress?.toLowerCase();

  if (!isMyOrder && order.rider !== '0x0000000000000000000000000000000000000000') {
    return null;
  }

  const handlePickup = async () => {
    await markPickedUp(orderId);
    setTimeout(() => refetch(), 2000);
  };

  const handleDeliver = async () => {
    await markDelivered(orderId);
    setTimeout(() => refetch(), 2000);
  };

  const riderEarnings = (Number(order.amount) * 0.1 / 1e18).toFixed(4);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold">Order #{orderId}</p>
          <p className="text-sm text-gray-600">
            {getOrderStatusName(order.status)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-green-600 font-semibold">
            +{riderEarnings} ETH
          </p>
          <p className="text-xs text-gray-600">Your earnings</p>
        </div>
      </div>

      {order.status === 2 && isMyOrder && (
        <button
          onClick={handlePickup}
          disabled={isPickingUp}
          className="w-full btn-primary text-sm py-2"
        >
          {isPickingUp ? 'Updating...' : 'Mark as Picked Up'}
        </button>
      )}

      {order.status === 3 && isMyOrder && (
        <button
          onClick={handleDeliver}
          disabled={isDelivering}
          className="w-full btn-primary text-sm py-2"
        >
          {isDelivering ? 'Updating...' : 'Mark as Delivered'}
        </button>
      )}
    </div>
  );
}

export default RiderDashboard;

