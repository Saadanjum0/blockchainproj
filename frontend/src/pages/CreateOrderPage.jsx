import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useRestaurant } from '../hooks/useRestaurants';
import { useCreateOrder } from '../hooks/useOrders';
import { createOrderData, fetchFromIPFS } from '../utils/ipfs';
import { NETWORK_CONFIG } from '../contracts/addresses';

function CreateOrderPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { restaurant, isLoading: loadingRestaurant } = useRestaurant(restaurantId);
  const { createOrder, isPending, isConfirming, isSuccess, hash } = useCreateOrder();

  const [cart, setCart] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Fetch menu from IPFS when restaurant loads
  useEffect(() => {
    const fetchMenu = async () => {
      if (!restaurant || !restaurant.ipfsMenuHash) {
        setMenuLoading(false);
        return;
      }
      
      console.log('Fetching menu from IPFS hash:', restaurant.ipfsMenuHash);
      
      try {
        setMenuLoading(true);
        setMenuError(null);
        
        // Try to fetch from IPFS
        const menuData = await fetchFromIPFS(restaurant.ipfsMenuHash);
        
        console.log('Menu data fetched:', menuData);
        
        if (menuData && menuData.items && Array.isArray(menuData.items)) {
          // Convert menu items to cart format
          const cartItems = menuData.items.map((item, index) => ({
            id: index + 1,
            name: item.name,
            price: parseFloat(item.price),
            quantity: 0,
          }));
          
          console.log('Cart items created:', cartItems);
          setCart(cartItems);
        } else {
          // Fallback to default menu if IPFS fails
          console.warn('Invalid menu data from IPFS:', menuData);
          setMenuError('Unable to load restaurant menu from IPFS');
        }
      } catch (error) {
        console.error('Error fetching menu from IPFS:', error);
        setMenuError(`Unable to load restaurant menu: ${error.message}`);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenu();
  }, [restaurant]);

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (totalAmount === 0) {
      alert('Please add items to cart');
      return;
    }

    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return;
    }

    if (!customerPhone.trim()) {
      alert('Please enter your phone number');
      return;
    }

    try {
      console.log('Starting order creation...');
      
      // Create order data and upload to IPFS
      const orderDetails = {
        items: cart.filter(item => item.quantity > 0),
        restaurantId,
        customer: address,
        deliveryAddress,
        customerPhone,
        specialInstructions,
      };

      console.log('Uploading order data to IPFS...', orderDetails);
      const ipfsHash = await createOrderData(orderDetails);
      console.log('IPFS hash received:', ipfsHash);
      
      // Create order on blockchain with correct parameters
      console.log('Creating order on blockchain...', {
        restaurantId,
        ipfsHash,
        amount: totalAmount.toFixed(4),
        deliveryAddress,
        customerPhone,
      });
      
      createOrder(restaurantId, ipfsHash, totalAmount.toFixed(4), deliveryAddress, customerPhone, 0);
      console.log('Order creation transaction initiated');
    } catch (error) {
      console.error('Order creation failed:', error);
      alert(`Failed to create order: ${error.message || 'Please try again.'}`);
    }
  };

  // Redirect after successful order
  useEffect(() => {
    if (isSuccess && hash) {
      const timer = setTimeout(() => {
        navigate('/my-orders');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, hash, navigate]);

  if (loadingRestaurant || menuLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12 card max-w-md mx-auto">
        <p className="text-red-600 mb-4">Restaurant not found</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          ← Back to Restaurants
        </button>
      </div>
    );
  }

  if (!restaurant.isActive) {
    return (
      <div className="text-center py-12 card max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Restaurant Closed</h2>
        <p className="text-gray-600 mb-6">
          This restaurant is currently not accepting orders.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Browse Other Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Restaurants
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Order from {restaurant?.name || `Restaurant #${restaurantId}`}
        </h1>
        {restaurant?.description && (
          <p className="text-gray-600 mt-2">{restaurant.description}</p>
        )}
      </div>

      {/* Menu Items */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          📋 Menu
        </h2>
        
        {menuLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading menu...</p>
          </div>
        ) : menuError ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-red-600 mb-2">{menuError}</p>
            {restaurant?.ipfsMenuHash?.includes('DevelopmentHash') ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Development Placeholder Detected</p>
                <p className="text-sm text-yellow-700 mb-3">
                  This restaurant's menu was created with a placeholder hash during testing.
                </p>
                <p className="text-xs text-yellow-600">
                  <strong>Restaurant Owner:</strong> Please use the "Menu Management" section in your dashboard to re-upload your menu items. This will create a proper menu that customers can view.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">The restaurant hasn't uploaded their menu yet</p>
            )}
            <details className="mt-3">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded text-left">
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Hash:</strong> <code className="bg-gray-100 px-1 rounded">{restaurant?.ipfsMenuHash || 'N/A'}</code>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {restaurant?.ipfsMenuHash?.includes('DevelopmentHash') 
                    ? 'This is a temporary placeholder. Restaurant needs to update menu.'
                    : restaurant?.ipfsMenuHash?.startsWith('local_')
                    ? 'Using localStorage (development mode without IPFS)'
                    : 'IPFS data might not be available yet.'}
                </p>
              </div>
            </details>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No menu items available</p>
            <p className="text-xs text-gray-500 mt-2">IPFS Hash: {restaurant?.ipfsMenuHash || 'N/A'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 hover:bg-orange-50/30 px-3 -mx-3 rounded-lg transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{item.name}</h3>
                  <p className="text-orange-600 font-semibold">{item.price} ETH</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-2 rounded-full hover:bg-orange-100 transition-colors disabled:opacity-50"
                    disabled={item.quantity === 0}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-8 text-center font-semibold text-lg">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-2 rounded-full hover:bg-orange-100 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Details */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">🏠 Delivery Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Delivery Address *
            </label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your delivery address"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests?"
              rows="3"
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Cart Summary */}
      <div className="card sticky bottom-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} className="text-orange-600" />
            <h2 className="text-xl font-semibold">Order Summary</h2>
          </div>
          <span className="text-gray-600">{itemCount} items</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>{totalAmount.toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Platform Fee (10%):</span>
            <span>{(totalAmount * 0.1).toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Rider Fee (10%):</span>
            <span>{(totalAmount * 0.1).toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span className="text-orange-600">{totalAmount.toFixed(4)} ETH</span>
          </div>
          <p className="text-xs text-gray-500">
            ≈ ${(totalAmount * 3000).toFixed(2)} USD (estimated)
          </p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isPending || isConfirming || totalAmount === 0 || !deliveryAddress.trim() || !customerPhone.trim()}
          className="w-full btn-primary"
        >
          {isPending ? '⏳ Confirm in Wallet...' : 
           isConfirming ? '⏳ Processing Transaction...' : 
           isSuccess ? '✅ Order Placed Successfully!' :
           totalAmount === 0 ? 'Add Items to Cart' :
           !deliveryAddress.trim() ? 'Enter Delivery Address' :
           !customerPhone.trim() ? 'Enter Phone Number' :
           `Place Order • ${totalAmount.toFixed(4)} ETH`}
        </button>

        {hash && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800 mb-2">
              ✅ Order created successfully!
            </p>
            <a 
              href={`${NETWORK_CONFIG.blockExplorer}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline break-all"
            >
              View on Etherscan →
            </a>
            <p className="text-xs text-gray-600 mt-2">
              Redirecting to your orders...
            </p>
          </div>
        )}

        {isPending && (
          <p className="mt-3 text-sm text-center text-gray-600">
            Please confirm the transaction in your wallet
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateOrderPage;

