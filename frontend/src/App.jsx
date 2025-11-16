import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { Store, Bike, ShoppingBag, Menu, X, Sparkles, AlertTriangle } from 'lucide-react';
import HomePage from './pages/HomePage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RiderDashboard from './pages/RiderDashboard';
import MyOrders from './pages/MyOrders';
import WelcomeScreen from './components/WelcomeScreen';
import AnimatedBackground from './components/AnimatedBackground';
import FloatingShapes from './components/FloatingShapes';
import { useRoleDetection } from './hooks/useRoleDetection';

function AppContent() {
  const navigate = useNavigate();
  const { isConnected, address, status } = useAccount();
  const chainId = useChainId();
  const { role, isLoading, refetch } = useRoleDetection();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previousAddress, setPreviousAddress] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Check if on correct network (Sepolia = 11155111)
  const isCorrectNetwork = chainId === 11155111;

  // Detect address changes and handle clean disconnection without UI glitches
  useEffect(() => {
    // Handle address changes (new connection or account switch)
    if (address && address !== previousAddress) {
      console.log('Address changed:', address);
      setPreviousAddress(address);
      refetch();
    }
    
    // Handle wallet disconnection - but add a small delay to avoid flicker during connection
    if (!isConnected && previousAddress && status === 'disconnected') {
      // Small delay to prevent flicker if wallet is just connecting
      const timeoutId = setTimeout(() => {
        // Double-check we're still disconnected before navigating
        if (!isConnected) {
      console.log('Wallet disconnected');
      navigate('/');
      setPreviousAddress(null);
      setSelectedRole(null);
      setShowRoleSelection(false);
    }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [address, previousAddress, refetch, isConnected, navigate, status]);

  // Check for pending role and sync with state
  useEffect(() => {
    if (address) {
      const pendingRole = localStorage.getItem(`pendingRole_${address}`);
      if (pendingRole) {
        setSelectedRole(pendingRole);
      } else {
        setSelectedRole(null);
      }
    } else {
      setSelectedRole(null);
    }
  }, [address]);

  // Show role selection for new users (but not if they have a pending role)
  useEffect(() => {
    // Check localStorage directly to avoid race conditions
    const hasPendingRole = address && localStorage.getItem(`pendingRole_${address}`);
    
    if (isConnected && !isLoading && role === 'none' && !hasPendingRole) {
      setShowRoleSelection(true);
    } else {
      setShowRoleSelection(false);
    }
  }, [isConnected, isLoading, role, address]);

  const handleRoleSelection = (newRole) => {
    // Store selection temporarily
    localStorage.setItem(`pendingRole_${address}`, newRole);
    setSelectedRole(newRole);
    setShowRoleSelection(false);
    
    // Navigate to appropriate registration page using React Router
    if (newRole === 'restaurant') {
      navigate('/restaurant-dashboard');
    } else if (newRole === 'rider') {
      navigate('/rider-dashboard');
    } else {
      navigate('/');
    }
  };

  const handleBackToSelection = () => {
    // Clear pending role
    if (address) {
      localStorage.removeItem(`pendingRole_${address}`);
    }
    setSelectedRole(null);
    setShowRoleSelection(true);
    navigate('/');
  };

  return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Layers */}
        <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-red-50/30 to-yellow-50/50 -z-10" />
        <FloatingShapes />
        <AnimatedBackground />
        
        {/* Gradient Mesh Overlay */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(220,38,38,0.1),transparent_50%)] -z-10" />
        
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg group-hover:shadow-orange-500/50">
                    <span className="text-2xl animate-bounce-slow">🍕</span>
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                    FoodChain
                  </h1>
                  <span className="text-xs text-gray-600 font-medium">Decentralized Delivery</span>
                </div>
            </Link>
            
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                {isConnected && !isLoading && (
                <>
                    {/* Show navigation based on role */}
                    <Link 
                      to="/" 
                      className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Browse
                    </Link>

                    {(role === 'customer' || role === 'none') && (
                      <Link 
                        to="/my-orders" 
                        className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
                      >
                        My Orders
                      </Link>
                    )}

                    {role === 'restaurant' && (
                      <Link 
                        to="/restaurant-dashboard" 
                        className="flex items-center gap-2 text-orange-600 font-semibold"
                      >
                        <Store className="w-4 h-4" />
                        Dashboard
                      </Link>
                    )}

                    {role === 'rider' && (
                        <Link 
                        to="/rider-dashboard" 
                        className="flex items-center gap-2 text-green-600 font-semibold"
                        >
                        <Bike className="w-4 h-4" />
                        Dashboard
                        </Link>
                      )}
                    </>
                  )}

                <ConnectButton />
              </nav>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 space-y-3 border-t pt-4">
                {isConnected && !isLoading && (
                  <>
                    <Link 
                      to="/" 
                      className="block text-gray-700 hover:text-orange-600 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Browse Restaurants
                    </Link>

                    {(role === 'customer' || role === 'none') && (
                    <Link 
                        to="/my-orders" 
                        className="block text-gray-700 hover:text-orange-600 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        My Orders
                      </Link>
                  )}

                    {role === 'restaurant' && (
                      <Link 
                        to="/restaurant-dashboard" 
                        className="block text-orange-600 font-semibold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Restaurant Dashboard
                      </Link>
                    )}

                    {role === 'rider' && (
                      <Link 
                        to="/rider-dashboard" 
                        className="block text-green-600 font-semibold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Rider Dashboard
                      </Link>
                  )}
                </>
              )}
              </div>
              )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Network Warning Banner */}
          {isConnected && !isCorrectNetwork && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg flex items-start gap-3 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">Wrong Network!</h3>
                <p className="text-sm text-red-800">
                  Please switch to <strong>Sepolia Testnet</strong> in MetaMask to use this app.
                  <br />
                  Current Chain ID: {chainId} | Expected: 11155111 (Sepolia)
                </p>
                <p className="text-xs text-red-700 mt-2">
                  💡 In MetaMask: Click network dropdown → Select "Sepolia Test Network"
                </p>
              </div>
            </div>
          )}
          
          {!isConnected ? (
            <div className="text-center py-20 relative z-10">
              {/* Hero Section with Animation */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/20 blur-3xl animate-pulse-slow" />
                <div className="relative inline-block p-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl transform hover:scale-105 hover:rotate-6 transition-all duration-500 animate-glow">
                  <span className="text-8xl drop-shadow-2xl">🍕</span>
                </div>
              </div>
              
              <h2 className="text-6xl md:text-7xl font-black mb-6 animate-fadeIn">
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome to FoodChain
                </span>
              </h2>
              
              <p className="text-gray-700 text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                The first <span className="font-bold text-transparent bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text">decentralized</span> food delivery platform
                <br />
                <span className="text-lg text-gray-600">Powered by blockchain technology 🚀</span>
              </p>
              
              <div className="flex justify-center mb-16 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 blur-lg opacity-50 animate-pulse" />
                  <ConnectButton />
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[
                  {
                    icon: ShoppingBag,
                    gradient: 'from-blue-500 to-blue-600',
                    title: 'Order Food',
                    description: 'Browse restaurants, place orders with crypto, track delivery in real-time',
                    emoji: '🛒',
                    delay: '0.6s'
                  },
                  {
                    icon: Store,
                    gradient: 'from-orange-500 to-red-600',
                    title: 'Own a Restaurant',
                    description: 'Register your restaurant, manage menu, accept orders on blockchain',
                    emoji: '🏪',
                    delay: '0.8s'
                  },
                  {
                    icon: Bike,
                    gradient: 'from-green-500 to-emerald-600',
                    title: 'Become a Rider',
                    description: 'Deliver food, earn crypto, work on your schedule',
                    emoji: '🏍️',
                    delay: '1s'
                  }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="glass-card group hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden animate-fadeIn"
                    style={{ animationDelay: item.delay }}
                  >
                    {/* Hover gradient effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    {/* Icon with animation */}
                    <div className="relative">
                      <div className={`w-20 h-20 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl`}>
                        <item.icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 text-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 animate-bounce-slow">
                        {item.emoji}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-red-600 group-hover:bg-clip-text transition-all duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                    
                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                ))}
              </div>
            </div>
          ) : showRoleSelection ? (
            <WelcomeScreen onSelectRole={handleRoleSelection} />
          ) : isLoading ? (
            <div className="text-center py-20 relative z-10">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 blur-2xl opacity-50 animate-pulse" />
                <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-t-orange-600 border-r-red-600 border-b-orange-600 border-l-transparent mx-auto mb-6"></div>
              </div>
              <p className="text-gray-700 text-xl font-semibold mb-2 animate-pulse">Loading your profile...</p>
              <p className="text-gray-500 text-sm">Please wait while we fetch your data from the blockchain</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/order/:restaurantId" element={<CreateOrderPage />} />
              <Route path="/track/:orderId" element={<OrderTrackingPage />} />
              <Route path="/order-details/:orderId" element={<OrderDetailsPage />} />
              <Route path="/my-orders" element={<MyOrders />} />
              
              {/* Role-based access */}
              <Route 
                path="/restaurant-dashboard" 
                element={<RestaurantDashboard onBack={handleBackToSelection} />} 
              />
              <Route 
                path="/rider-dashboard" 
                element={<RiderDashboard onBack={handleBackToSelection} />} 
              />
            </Routes>
          )}
        </main>

        {/* Footer */}
        <footer className="relative bg-white/60 backdrop-blur-xl border-t border-white/20 mt-20">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-50/50 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 py-10">
            <div className="text-center">
              {/* Animated decorative line */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-orange-500" />
                <span className="text-3xl animate-pulse">🍕</span>
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-red-500" />
              </div>
              
              <p className="mb-4 flex items-center justify-center gap-2 text-gray-700 font-medium">
                <span className="text-2xl animate-spin-slow">🔗</span>
                <span>Powered by Ethereum • Built with ❤️ on Sepolia Testnet</span>
              </p>
              
              <div className="flex justify-center gap-8 text-sm mb-4">
              <a 
                href="https://sepolia.etherscan.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-orange-600 hover:text-red-600 font-semibold transition-all duration-300"
              >
                  <span className="group-hover:scale-110 inline-block transition-transform">📊</span>
                  Block Explorer
                </a>
                <a 
                  href="https://sepoliafaucet.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-orange-600 hover:text-red-600 font-semibold transition-all duration-300"
                >
                  <span className="group-hover:scale-110 inline-block transition-transform">💧</span>
                  Get Test ETH
              </a>
              </div>
              
              <p className="text-xs text-gray-500">
                Decentralized • Transparent • Trustless
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
