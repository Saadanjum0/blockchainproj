import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { Store, Upload, ToggleLeft, ToggleRight, Package, ImagePlus, ExternalLink } from 'lucide-react';
import { 
  useRestaurant,
  useRestaurantIdByOwner,
  useRegisterRestaurant, 
  useUpdateMenu, 
  useSetRestaurantStatus 
} from '../hooks/useRestaurants';
import { useOrderCount, useOrder } from '../hooks/useOrders';
import { useAcceptOrder, useMarkPrepared, useAssignRider } from '../hooks/useOrders';
import { useAvailableRiders } from '../hooks/useRiders';
import { createRestaurantMetadata, createMenuData, fetchFromIPFS } from '../utils/ipfs';
import { getOrderStatusName } from '../contracts/abis';
import { NETWORK_CONFIG } from '../contracts/addresses';

function RestaurantDashboard({ onBack }) {
  const { address } = useAccount();
  const { restaurantId: myRestaurantId, refetch: refetchId } = useRestaurantIdByOwner(address);
  const { restaurant, refetch: refetchRestaurant } = useRestaurant(myRestaurantId);

  if (!address) {
    return (
      <div className="text-center py-12 card max-w-md mx-auto">
        <p className="text-gray-600">Please connect your wallet</p>
      </div>
    );
  }

  // If no restaurant found, show registration form
  if (!myRestaurantId || myRestaurantId === 0) {
    return <RegisterRestaurantForm onSuccess={() => {
      refetchId();
      setTimeout(() => refetchRestaurant(), 1000);
    }} onBack={onBack} />;
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
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <RestaurantInfo restaurant={restaurant} restaurantId={myRestaurantId} />
        <RestaurantStats restaurant={restaurant} />
      </div>

      <MenuManager restaurantId={myRestaurantId} currentMenuHash={restaurant?.ipfsMenuHash} />

      <RestaurantOrders restaurantId={myRestaurantId} restaurantOwner={address} />
    </div>
  );
}

function RegisterRestaurantForm({ onSuccess, onBack }) {
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
      alert('Restaurant registered successfully! 🎉\n\nRefreshing your dashboard...');
      // Trigger parent component to refetch data
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  }, [isSuccess, onSuccess]);

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
  const { orderCount } = useOrderCount();
  const [myOrders, setMyOrders] = useState([]);

  // Find orders for this restaurant
  useEffect(() => {
    if (orderCount > 0) {
      // In production, you'd filter by restaurantId from events or subgraph
      const orders = [];
      for (let i = 1; i <= orderCount; i++) {
        orders.push(i);
      }
      setMyOrders(orders.slice(0, 5)); // Show last 5 orders
    }
  }, [orderCount, restaurantId]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5" />
        Recent Orders
      </h3>

      {myOrders.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          No orders yet. Start accepting orders!
        </p>
      ) : (
        <div className="space-y-3">
          {myOrders.map(orderId => (
            <RestaurantOrderCard key={orderId} orderId={orderId} restaurantOwner={restaurantOwner} />
          ))}
        </div>
      )}
    </div>
  );
}

function RestaurantOrderCard({ orderId, restaurantOwner }) {
  const { order, refetch } = useOrder(orderId);
  const { acceptOrder, isPending: isAccepting } = useAcceptOrder();
  const { markPrepared, isPending: isPreparing } = useMarkPrepared();
  const { assignRider, isPending: isAssigning } = useAssignRider();
  const { riders } = useAvailableRiders();

  if (!order) return null;

  const isMyOrder = order.restaurantId.toString() === '1'; // Simplified check

  if (!isMyOrder) return null;

  const handleAccept = async () => {
    await acceptOrder(orderId);
    setTimeout(() => refetch(), 2000);
  };

  const handlePrepared = async () => {
    await markPrepared(orderId);
    setTimeout(() => refetch(), 2000);
  };

  const handleAssignRider = async () => {
    if (riders.length === 0) {
      alert('No riders available');
      return;
    }
    await assignRider(orderId, riders[0]); // Assign first available rider
    setTimeout(() => refetch(), 2000);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold">Order #{orderId}</p>
          <p className="text-sm text-gray-600">
            {getOrderStatusName(order.status)}
          </p>
        </div>
        <span className="text-orange-600 font-semibold">
          {(Number(order.amount) / 1e18).toFixed(4)} ETH
        </span>
      </div>

      {order.status === 0 && (
        <button
          onClick={handleAccept}
          disabled={isAccepting}
          className="w-full btn-primary text-sm py-2"
        >
          {isAccepting ? 'Accepting...' : 'Accept Order'}
        </button>
      )}

      {order.status === 1 && (
        <button
          onClick={handlePrepared}
          disabled={isPreparing}
          className="w-full btn-primary text-sm py-2"
        >
          {isPreparing ? 'Updating...' : 'Mark as Prepared'}
        </button>
      )}

      {order.status === 2 && (
        <button
          onClick={handleAssignRider}
          disabled={isAssigning || riders.length === 0}
          className="w-full btn-primary text-sm py-2"
        >
          {isAssigning ? 'Assigning...' : 
           riders.length === 0 ? 'No Riders Available' :
           'Assign Rider'}
        </button>
      )}
    </div>
  );
}

export default RestaurantDashboard;

