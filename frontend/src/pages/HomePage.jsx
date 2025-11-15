import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Store, Star, Clock, Award } from 'lucide-react';
import { useRestaurantCount, useRestaurant, useRestaurantIdByOwner } from '../hooks/useRestaurants';
import { formatEther } from 'viem';

function HomePage() {
  const { address } = useAccount();
  const { restaurantCount, isLoading } = useRestaurantCount();
  const { restaurantId: myRestaurantId } = useRestaurantIdByOwner(address);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Available Restaurants
        </h1>
        <p className="text-gray-600 text-lg">
          Order food with cryptocurrency • Powered by blockchain on Sepolia testnet
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      ) : restaurantCount > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: restaurantCount }, (_, i) => (
            <RestaurantCard 
              key={i + 1} 
              restaurantId={i + 1}
              isMyRestaurant={myRestaurantId === (i + 1)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <Store className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No restaurants yet</h3>
          <p className="text-gray-600 mb-4">
            Be the first to register your restaurant on the blockchain!
          </p>
          <Link 
            to="/restaurant-dashboard" 
            className="btn-primary inline-block"
          >
            Register Your Restaurant
          </Link>
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ restaurantId, isMyRestaurant }) {
  const { restaurant, isLoading, error } = useRestaurant(restaurantId);

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    console.error(`Error loading restaurant ${restaurantId}:`, error);
    return null;
  }

  if (!restaurant) {
    console.warn(`No restaurant data for ID ${restaurantId}`);
    return null;
  }

  const averageRating = restaurant.ratingCount > 0 
    ? (Number(restaurant.totalRating) / Number(restaurant.ratingCount)).toFixed(1)
    : '0.0';

  return (
    <Link 
      to={isMyRestaurant ? '/restaurant-dashboard' : `/order/${restaurantId}`}
      className="card group overflow-hidden hover:shadow-lg transition-all duration-300 relative"
    >
      {/* "My Restaurant" Banner */}
      {isMyRestaurant && (
        <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          MY RESTAURANT
        </div>
      )}
      
      {/* Restaurant Image/Icon */}
      <div className="h-40 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg mb-4 flex items-center justify-center transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
        <span className="text-6xl relative z-10">🍕</span>
      </div>

      {/* Restaurant Info */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 mr-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
              {restaurant.name || `Restaurant #${restaurantId}`}
            </h3>
            {restaurant.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{restaurant.description}</p>
            )}
          </div>
          {restaurant.isActive ? (
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Open
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium flex-shrink-0">
              Closed
            </span>
          )}
        </div>

        <div className="space-y-2.5 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">
              {averageRating} <span className="text-gray-500">({Number(restaurant.ratingCount)} reviews)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-orange-600" />
            <span>{Number(restaurant.totalOrders)} orders completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>
              Joined {new Date(Number(restaurant.registeredAt) * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>

        {restaurant.physicalAddress && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-600">
              📍 {restaurant.physicalAddress}
            </p>
          </div>
        )}

        {restaurant.isActive && (
          <button className="w-full mt-4 btn-primary text-sm">
            Order Now →
          </button>
        )}
        {!restaurant.isActive && (
          <button className="w-full mt-4 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed text-sm" disabled>
            Currently Closed
          </button>
        )}
      </div>
    </Link>
  );
}

export default HomePage;

