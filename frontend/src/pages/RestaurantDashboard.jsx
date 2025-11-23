import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Link } from 'react-router-dom';
import { Store, Upload, ToggleLeft, ToggleRight, Package, ImagePlus, ExternalLink, Clock, User, MapPin, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { 
  useRestaurant,
  useRestaurantIdByOwner,
  useRegisterRestaurant, 
  useUpdateMenu, 
  useSetRestaurantStatus 
} from '../hooks/useRestaurants';
import { useOrderCount, useOrder, useRestaurantOrders } from '../hooks/useOrders';
import { useAcceptOrder, useMarkPrepared, useAssignRider } from '../hooks/useOrders';
import { useAvailableRiders } from '../hooks/useRiders';
import { createRestaurantMetadata, createMenuData, fetchFromIPFS } from '../utils/ipfs';
import { getOrderStatusName, ESCROW_ABI } from '../contracts/abis';
import { NETWORK_CONFIG, CONTRACTS } from '../contracts/addresses';
import { formatDateTime, getTimeAgo } from '../utils/formatDate';
import { formatEther } from 'viem';

function RestaurantDashboard({ onBack }) {
  const { address } = useAccount();
  const { 
    restaurantId: myRestaurantId, 
    isLoading: loadingId, 
    isFetched: restaurantIdFetched,
    refetch: refetchId 
  } = useRestaurantIdByOwner(address);
  const { restaurant, isLoading: loadingRestaurant, refetch: refetchRestaurant } = useRestaurant(myRestaurantId);

  useEffect(() => {
    if (address) {
      refetchId();
    }
  }, [address, refetchId]);

  if (!address) {
    return (
      <div className="text-center py-12 card max-w-md mx-auto">
        <p className="text-gray-600">Please connect your wallet</p>
      </div>
    );
  }

  const isCheckingOwnership = !restaurantIdFetched || loadingId;

  // Show loading state while checking if restaurant exists
  if (isCheckingOwnership || (myRestaurantId && loadingRestaurant)) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your restaurant...</p>
      </div>
    );
  }

  // If no restaurant found, show registration form
  if (restaurantIdFetched && (!myRestaurantId || myRestaurantId === 0)) {
    return <RegisterRestaurantForm onSuccess={() => {
      refetchId();
      setTimeout(() => refetchRestaurant(), 1000);
    }} onBack={onBack} />;
  }

  // Wait for restaurant data to load before showing dashboard
  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading restaurant details...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          My Restaurant Dashboard
        </h1>
        <Link 
          to="/"
          className="btn-secondary flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View All Restaurants
        </Link>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <RestaurantInfo restaurant={restaurant} restaurantId={myRestaurantId} />
        <RestaurantStats restaurant={restaurant} />
        <RestaurantEarnings restaurantId={myRestaurantId} restaurantAddress={address} />
      </div>

      <MenuManager restaurantId={myRestaurantId} currentMenuHash={restaurant?.ipfsMenuHash} />

      <RestaurantOrders restaurantId={myRestaurantId} restaurantOwner={address} />
    </div>
  );
}

function RegisterRestaurantForm({ onSuccess, onBack }) {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    address: '',
  });
  const [menuItems, setMenuItems] = useState([
    { name: '', price: '', image: null }
  ]);
  const [restaurantImage, setRestaurantImage] = useState(null);

  const { registerRestaurant, isPending, isConfirming, isSuccess, hash } = useRegisterRestaurant();

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: '', price: '', image: null }]);
  };

  const updateMenuItem = (index, field, value) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create menu hash
      const menuHash = await createMenuData(menuItems.filter(item => item.name && item.price));
      
      // Create metadata hash
      const metadataHash = await createRestaurantMetadata(formData);

      // Register restaurant with all required parameters
      await registerRestaurant(
        formData.name,
        formData.description || '',
        menuHash,
        metadataHash,
        formData.address || ''
      );
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register restaurant. Please try again.');
    }
  };

  useEffect(() => {
    if (isSuccess) {
      // Clear pending role since registration is complete
      if (address) {
        localStorage.removeItem(`pendingRole_${address}`);
      }
      
      alert('Restaurant registered successfully! 🎉\n\nRefreshing your dashboard...');
      // Trigger parent component to refetch data
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  }, [isSuccess, onSuccess, address]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Store className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold">Register Your Restaurant</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Restaurant Image Upload - Prepared for Supabase */}
          <div>
            <label className="block text-sm font-medium mb-2">Restaurant Logo/Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
              <ImagePlus className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Upload restaurant image
              </p>
              <p className="text-xs text-gray-500">
                (Supabase integration coming soon)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setRestaurantImage(e.target.files[0])}
                className="hidden"
                id="restaurant-image"
              />
              <label htmlFor="restaurant-image" className="btn-secondary text-sm py-2 px-4 mt-3 inline-block cursor-pointer">
                Choose Image
              </label>
              {restaurantImage && (
                <p className="text-sm text-green-600 mt-2">✓ {restaurantImage.name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Restaurant Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input-field"
              placeholder="e.g. Pizza Paradise"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input-field"
              rows="3"
              placeholder="Tell customers about your restaurant"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cuisine Type</label>
              <input
                type="text"
                value={formData.cuisine}
                onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
                className="input-field"
                placeholder="e.g. Italian, Chinese"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="input-field"
                placeholder="Restaurant location"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium">Menu Items *</label>
              <button
                type="button"
                onClick={addMenuItem}
                className="text-sm text-orange-600 hover:underline"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                    placeholder="Item name"
                    className="input-field"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={item.price}
                    onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                    placeholder="Price in ETH"
                    className="input-field"
                  />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Item Image (Supabase coming soon)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateMenuItem(index, 'image', e.target.files[0])}
                      className="text-sm"
                    />
                    {item.image && (
                      <p className="text-xs text-green-600 mt-1">✓ {item.image.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
               'Register Restaurant'}
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

function RestaurantInfo({ restaurant, restaurantId }) {
  const { setStatus, isPending, isSuccess } = useSetRestaurantStatus();

  const toggleStatus = async () => {
    await setStatus(restaurantId, !restaurant.isActive);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Restaurant Info</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-600">Restaurant ID</p>
          <p className="font-semibold">#{restaurantId}</p>
        </div>
        <div>
          <p className="text-gray-600">Status</p>
          <button
            onClick={toggleStatus}
            disabled={isPending}
            className="flex items-center gap-2 mt-1"
          >
            {restaurant.isActive ? (
              <>
                <ToggleRight className="w-6 h-6 text-green-600" />
                <span className="text-green-600 font-medium">Open</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600 font-medium">Closed</span>
              </>
            )}
          </button>
        </div>
        <div>
          <p className="text-gray-600">Menu Hash</p>
          <p className="font-mono text-xs break-all">{restaurant.ipfsMenuHash}</p>
        </div>
      </div>
    </div>
  );
}

function RestaurantStats({ restaurant }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-2xl font-bold">{Number(restaurant.totalOrders)}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Reviews</p>
          <p className="text-2xl font-bold">{Number(restaurant.ratingCount)}</p>
        </div>
      </div>
    </div>
  );
}

// Helper component to fetch individual order data and contribute to earnings calculation
function OrderEarningsCalculator({ orderId, onOrderProcessed }) {
  const { order } = useOrder(orderId);

  useEffect(() => {
    if (order && order.amount) {
      const amount = Number(formatEther(order.amount));
      const restaurantShare = amount * 0.8; // 80% to restaurant
      const status = order.status;
      
      onOrderProcessed({
        status,
        restaurantShare,
        orderId: Number(orderId)
      });
    }
  }, [order, orderId, onOrderProcessed]);

  return null; // This is a data-only component
}

function RestaurantEarnings({ restaurantId, restaurantAddress }) {
  const { orderIds, isFetched } = useRestaurantOrders(restaurantId);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [processedOrders, setProcessedOrders] = useState(new Map());

  // CRITICAL FIX #1: Reset all state when restaurantId changes (wallet switch or disconnect)
  useEffect(() => {
    console.log('Restaurant ID changed, resetting earnings state');
    setTotalEarnings(0);
    setCompletedOrders(0);
    setPendingEarnings(0);
    setProcessedOrders(new Map());
  }, [restaurantId]);

  // CRITICAL FIX #2: Clean up stale orders from Map when orderIds changes
  // If an order is cancelled/removed, its data must be purged from the Map
  useEffect(() => {
    if (!isFetched || !orderIds) return;

    setProcessedOrders(prev => {
      // Create Set of current order IDs for O(1) lookup
      const currentOrderIds = new Set(orderIds.map(id => Number(id)));
      
      // Filter out orders that no longer exist in orderIds
      const cleanedMap = new Map();
      prev.forEach((orderData, orderId) => {
        if (currentOrderIds.has(orderId)) {
          cleanedMap.set(orderId, orderData);
        } else {
          console.log(`Removing stale order ${orderId} from earnings calculation`);
        }
      });
      
      // Only update if something changed to avoid infinite loops
      if (cleanedMap.size !== prev.size) {
        return cleanedMap;
      }
      return prev;
    });
  }, [orderIds, isFetched]);

  // Callback to handle individual order data
  const handleOrderProcessed = useCallback((orderData) => {
    setProcessedOrders(prev => {
      const newMap = new Map(prev);
      newMap.set(orderData.orderId, orderData);
      return newMap;
    });
  }, []);

  // Calculate totals whenever processed orders change
  useEffect(() => {
    if (!isFetched || processedOrders.size === 0) return;

    let totalCompleted = 0;
    let countCompleted = 0;
    let totalPending = 0;

    processedOrders.forEach((orderData) => {
      if (orderData.status === 5) { // Completed
        totalCompleted += orderData.restaurantShare;
        countCompleted++;
      } else if (orderData.status >= 1 && orderData.status < 5) { // In progress
        totalPending += orderData.restaurantShare;
      }
    });

    setTotalEarnings(totalCompleted);
    setCompletedOrders(countCompleted);
    setPendingEarnings(totalPending);
  }, [processedOrders, isFetched]);

  return (
    <>
      {/* Hidden components that fetch and process order data */}
      {isFetched && orderIds.map(orderId => (
        <OrderEarningsCalculator
          key={orderId.toString()}
          orderId={orderId}
          onOrderProcessed={handleOrderProcessed}
        />
      ))}
      
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
                {totalEarnings.toFixed(4)} ETH
              </p>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1">
              ≈ ${(totalEarnings * 3000).toFixed(2)} USD
            </p>
          </div>
          <div className="pt-3 border-t border-green-200">
            <p className="text-xs text-green-700 mb-1">Completed Orders</p>
            <p className="text-lg font-semibold text-green-900">{completedOrders}</p>
          </div>
          {pendingEarnings > 0 && (
            <div className="pt-2 border-t border-green-200">
              <p className="text-xs text-green-700 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Pending Orders
              </p>
              <p className="text-sm font-semibold text-green-800">
                {pendingEarnings.toFixed(4)} ETH
              </p>
            </div>
          )}
        </div>
        <a
          href={`${NETWORK_CONFIG.blockExplorer}/address/${restaurantAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 text-xs text-green-700 hover:text-green-900 hover:underline transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View Wallet on Etherscan
        </a>
      </div>
    </>
  );
}

function MenuManager({ restaurantId, currentMenuHash }) {
  const [isEditing, setIsEditing] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { updateMenu, isPending, isConfirming, isSuccess } = useUpdateMenu();

  // Fetch current menu
  useEffect(() => {
    const fetchMenu = async () => {
      if (!currentMenuHash) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const menuData = await fetchFromIPFS(currentMenuHash);
        if (menuData && menuData.items) {
          setMenuItems(menuData.items);
        }
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [currentMenuHash, isSuccess]);

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: '', price: '' }]);
  };

  const updateMenuItem = (index, field, value) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const removeMenuItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleSaveMenu = async () => {
    try {
      // Filter out empty items
      const validItems = menuItems.filter(item => item.name && item.price);
      if (validItems.length === 0) {
        alert('Please add at least one menu item');
        return;
      }

      // Upload to IPFS
      const menuHash = await createMenuData(validItems);
      
      // Update on blockchain
      await updateMenu(restaurantId, menuHash);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update menu:', error);
      alert('Failed to update menu. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="card mb-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          📋 Menu Management
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary text-sm"
          >
            {menuItems.length === 0 ? 'Add Menu Items' : 'Edit Menu'}
          </button>
        )}
      </div>

      {!isEditing && menuItems.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p>No menu items yet. Click "Add Menu Items" to get started!</p>
        </div>
      )}

      {!isEditing && menuItems.length > 0 && (
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-3 last:border-b-0">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-orange-600 font-semibold">{item.price} ETH</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-700">Item #{index + 1}</p>
                <button
                  onClick={() => removeMenuItem(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                  placeholder="Item name (e.g., Burger)"
                  className="input-field"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={item.price}
                  onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                  placeholder="Price in ETH (e.g., 0.001)"
                  className="input-field"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addMenuItem}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
          >
            + Add Menu Item
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                // Reset to original menu if cancelled
                if (currentMenuHash) {
                  fetchFromIPFS(currentMenuHash).then(menuData => {
                    if (menuData && menuData.items) {
                      setMenuItems(menuData.items);
                    }
                  });
                }
              }}
              className="flex-1 btn-secondary"
              disabled={isPending || isConfirming}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveMenu}
              className="flex-1 btn-primary"
              disabled={isPending || isConfirming}
            >
              {isPending ? 'Confirm in Wallet...' : 
               isConfirming ? 'Updating...' :
               'Save Menu'}
            </button>
          </div>

          {isSuccess && (
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-green-800">✅ Menu updated successfully!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RestaurantOrders({ restaurantId, restaurantOwner }) {
  // Use the proper hook to get restaurant orders
  const { orderIds, isLoading, isFetched, refetch } = useRestaurantOrders(restaurantId);

  // Removed automatic polling - users can use the refresh button instead
  // This prevents constant page refreshing and improves performance

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package className="w-5 h-5" />
          My Restaurant Orders
      </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {orderIds.length} {orderIds.length === 1 ? 'order' : 'orders'}
          </span>
          <button
            onClick={() => refetch()}
            className="text-xs text-orange-600 hover:text-orange-700 hover:underline"
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading orders...</p>
        </div>
      ) : !isFetched ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Fetching orders...</p>
        </div>
      ) : orderIds.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No orders yet.</p>
          <p className="text-sm text-gray-500 mt-1">Orders will appear here when customers place them!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orderIds.map(orderId => (
            <RestaurantOrderCard 
              key={orderId} 
              orderId={Number(orderId)} 
              restaurantId={restaurantId}
              restaurantOwner={restaurantOwner}
              onUpdate={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RestaurantOrderCard({ orderId, restaurantId, restaurantOwner, onUpdate }) {
  const { order, refetch: refetchOrder } = useOrder(orderId);
  const { acceptOrder, isPending: isAccepting, isConfirming: isAcceptingConfirming, isSuccess: acceptSuccess, hash: acceptHash } = useAcceptOrder();
  const { markPrepared, isPending: isPreparing, isConfirming: isPreparingConfirming, isSuccess: preparedSuccess, hash: preparedHash } = useMarkPrepared();
  const { assignRider, isPending: isAssigning, isConfirming: isAssigningConfirming, isSuccess: assignSuccess, hash: assignHash } = useAssignRider();
  const { riders } = useAvailableRiders();

  // Refetch order when transaction is confirmed
  useEffect(() => {
    if (acceptSuccess && !isAcceptingConfirming && acceptHash) {
      console.log('Order accepted! Refetching order data...');
      // Transaction confirmed on-chain, refetch immediately
      refetchOrder();
      if (onUpdate) onUpdate();
      
      // Refetch again after 2 seconds to ensure blockchain state is updated
      const timeout1 = setTimeout(() => {
        console.log('Refetching order data (first retry)...');
        refetchOrder();
        if (onUpdate) onUpdate();
      }, 2000);
      
      // Final refetch after 5 seconds
      const timeout2 = setTimeout(() => {
        console.log('Refetching order data (final retry)...');
        refetchOrder();
        if (onUpdate) onUpdate();
      }, 5000);
      
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [acceptSuccess, isAcceptingConfirming, acceptHash, refetchOrder, onUpdate]);

  useEffect(() => {
    if (preparedSuccess && !isPreparingConfirming && preparedHash) {
      console.log('Order marked as prepared! Refetching order data...');
      refetchOrder();
      if (onUpdate) onUpdate();
      
      const timeout1 = setTimeout(() => {
        refetchOrder();
        if (onUpdate) onUpdate();
      }, 2000);
      
      const timeout2 = setTimeout(() => {
        refetchOrder();
        if (onUpdate) onUpdate();
      }, 5000);
      
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [preparedSuccess, isPreparingConfirming, preparedHash, refetchOrder, onUpdate]);

  useEffect(() => {
    if (assignSuccess && !isAssigningConfirming && assignHash) {
      console.log('Rider assigned! Refetching order data...');
      refetchOrder();
      if (onUpdate) onUpdate();
      
      const timeout1 = setTimeout(() => {
        refetchOrder();
        if (onUpdate) onUpdate();
      }, 2000);
      
      const timeout2 = setTimeout(() => {
        refetchOrder();
        if (onUpdate) onUpdate();
      }, 5000);
      
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [assignSuccess, isAssigningConfirming, assignHash, refetchOrder, onUpdate]);

  if (!order) {
    return (
      <div className="border-2 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Verify this order belongs to this restaurant (safety check)
  const isMyOrder = Number(order.restaurantId) === Number(restaurantId);
  if (!isMyOrder) return null;

  const handleAccept = () => {
    acceptOrder(orderId);
  };

  const handlePrepared = () => {
    markPrepared(orderId);
  };

  const handleAssignRider = () => {
    if (riders.length === 0) {
      alert('No riders available');
      return;
    }
    assignRider(orderId, riders[0]); // Assign first available rider
  };

  const amount = formatEther(order.amount);
  const statusName = getOrderStatusName(order.status);

  const getStatusColor = (status) => {
    switch(status) {
      case 0: return 'bg-yellow-100 text-yellow-800 border-yellow-300';  // Created
      case 1: return 'bg-blue-100 text-blue-800 border-blue-300';  // Accepted
      case 2: return 'bg-purple-100 text-purple-800 border-purple-300';  // Prepared
      case 3: return 'bg-orange-100 text-orange-800 border-orange-300';  // PickedUp
      case 4: return 'bg-green-100 text-green-800 border-green-300';  // Delivered
      case 5: return 'bg-green-600 text-white border-green-700';  // Completed
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="border-2 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-lg">Order #{orderId}</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(order.status)}`}>
              {statusName}
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{getTimeAgo(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-mono text-xs">{order.customer.slice(0,6)}...{order.customer.slice(-4)}</span>
            </div>
            {order.deliveryAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{order.deliveryAddress}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Amount</p>
          <p className="text-xl font-bold text-orange-600">
            {parseFloat(amount).toFixed(4)} ETH
          </p>
          <p className="text-xs text-gray-500">
            ≈ ${(parseFloat(amount) * 3000).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Action Buttons Based on Status */}
      <div className="space-y-2">
      {order.status === 0 && (
          <div className="space-y-2">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 font-medium">
                🔔 New order waiting for your confirmation
              </p>
            </div>
        <button
          onClick={handleAccept}
          disabled={isAccepting || isAcceptingConfirming}
              className="w-full btn-primary"
        >
              {isAccepting ? '⏳ Waiting for wallet...' : 
               isAcceptingConfirming ? '⏳ Confirming transaction...' :
               acceptSuccess ? '✅ Order Accepted!' :
               '✅ Accept Order'}
        </button>
            {acceptSuccess && acceptHash && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                <p className="text-xs text-green-800 mb-1">
                  ✅ Transaction confirmed! Updating order status...
                </p>
                <a 
                  href={`${NETWORK_CONFIG.blockExplorer}/tx/${acceptHash}`}
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
      )}

      {order.status === 1 && (
          <div className="space-y-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                👨‍🍳 Start preparing the food
              </p>
            </div>
        <button
          onClick={handlePrepared}
          disabled={isPreparing || isPreparingConfirming}
              className="w-full btn-primary"
        >
              {isPreparing ? '⏳ Waiting for wallet...' : 
               isPreparingConfirming ? '⏳ Confirming transaction...' :
               preparedSuccess ? '✅ Marked as Prepared!' :
               '🍳 Mark as Prepared'}
        </button>
            {preparedSuccess && preparedHash && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                <p className="text-xs text-green-800 mb-1">
                  ✅ Transaction confirmed! Updating order status...
                </p>
                <a 
                  href={`${NETWORK_CONFIG.blockExplorer}/tx/${preparedHash}`}
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
      )}

      {order.status === 2 && (
          <div className="space-y-2">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800 font-medium">
                🏍️ Ready for rider pickup
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {riders.length > 0 ? `${riders.length} riders available` : 'Waiting for rider...'}
              </p>
            </div>
            {riders.length > 0 && (
        <button
          onClick={handleAssignRider}
                disabled={isAssigning || isAssigningConfirming}
                className="w-full btn-primary"
        >
                {isAssigning ? '⏳ Waiting for wallet...' : 
                 isAssigningConfirming ? '⏳ Confirming transaction...' :
                 assignSuccess ? '✅ Rider Assigned!' :
                 '🏍️ Assign Rider'}
        </button>
      )}
            {assignSuccess && assignHash && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                <p className="text-xs text-green-800 mb-1">
                  ✅ Transaction confirmed! Updating order status...
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
        )}

        {order.status === 3 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800 font-medium">
              🚚 Out for delivery
            </p>
          </div>
        )}

        {order.status === 4 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium">
              ✅ Delivered - Waiting for customer confirmation
            </p>
          </div>
        )}

        {order.status === 5 && (
          <div className="bg-green-600 text-white rounded-lg p-3">
            <p className="text-sm font-medium">
              🎉 Order completed! Payment released
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantDashboard;

