import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Store, Star, Clock, Award } from 'lucide-react';
import { useRestaurantCount, useRestaurant, useRestaurantIdByOwner } from '../hooks/useRestaurants';
import { useRoleDetection } from '../hooks/useRoleDetection';
import { formatDate } from '../utils/formatDate';

function HomePage() {
  const { address } = useAccount();
  const { restaurantCount, isLoading, isFetched } = useRestaurantCount();
  const { restaurantId: myRestaurantId } = useRestaurantIdByOwner(address);
  const { role } = useRoleDetection();
  const isStillLoading = isLoading || !isFetched;

  return (
    <div className="animate-fadeIn">
      <div className="mb-10 space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Live listings
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A]">
          Available Restaurants
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-gray-600 text-base">
          <p>Order with crypto on Sepolia — transparent fees, instant settlement.</p>
          {typeof restaurantCount === 'number' && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
              {restaurantCount} listing{restaurantCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      {isStillLoading ? (
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
            {role === 'restaurant'
              ? 'Be the first to register your restaurant on the blockchain!'
              : 'Restaurants are registering now. Please check back soon.'}
          </p>
          {role === 'restaurant' && (
            <Link 
              to="/restaurant-dashboard" 
              className="btn-primary inline-block"
            >
              Register Your Restaurant
            </Link>
          )}
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
      className="card group flex h-full flex-col gap-5 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(15,23,42,0.12)] transition-all duration-300 relative"
    >
      {isMyRestaurant && (
        <div className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow">
          <Award className="w-3.5 h-3.5" />
          My Restaurant
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl font-semibold text-[#1A1A1A]">
              {restaurant.name || `Restaurant #${restaurantId}`}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-[#B45309]">
              <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
              {averageRating}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {Number(restaurant.ratingCount)} review{Number(restaurant.ratingCount) === 1 ? '' : 's'}
            </span>
          </div>
          {restaurant.description && (
            <p className="text-sm text-gray-600">{restaurant.description}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            restaurant.isActive
              ? 'bg-[#38A169] text-white shadow-sm'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {restaurant.isActive ? 'Open' : 'Closed'}
        </span>
      </div>

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center gap-2 text-gray-500">
          <Store className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">
            <span className="font-semibold text-gray-700">{Number(restaurant.totalOrders)}</span>{' '}
            orders completed
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>Joined {formatDate(restaurant.registeredAt)}</span>
        </div>
      </div>

      {restaurant.physicalAddress && (
        <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-1">
            Location
          </p>
          <p>{restaurant.physicalAddress}</p>
        </div>
      )}

      <div className="mt-auto">
        {restaurant.isActive ? (
          <span className="btn-primary w-full justify-center">Order Now</span>
        ) : (
          <span className="inline-flex w-full items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-400">
            Currently Closed
          </span>
        )}
      </div>
    </Link>
  );
}

export default HomePage;

