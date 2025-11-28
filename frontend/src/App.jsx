import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { Store, Bike, ShoppingBag, Menu, X, AlertTriangle, Wallet } from 'lucide-react';
import HomePage from './pages/HomePage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RiderDashboard from './pages/RiderDashboard';
import MyOrders from './pages/MyOrders';
import WelcomeScreen from './components/WelcomeScreen';
import { useRoleDetection } from './hooks/useRoleDetection';
import { CONTRACTS } from './contracts/addresses';

function AppContent() {
  const navigate = useNavigate();
  const { isConnected, address, status } = useAccount();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({
    address,
    chainId: chainId ?? 11155111,
    enabled: Boolean(address),
    watch: true,
  });
  const { role, isLoading, refetch } = useRoleDetection();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previousAddress, setPreviousAddress] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [storedRole, setStoredRole] = useState(null);
  const formatAddress = (addr) => {
    if (!addr) return '--';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  const formattedBalance = balanceData?.formatted
    ? `${parseFloat(balanceData.formatted).toFixed(4)}`
    : '--';
  
  // Check if on correct network (Sepolia = 11155111)
  const isCorrectNetwork = chainId === 11155111;

  // CRITICAL FIX: Clear localStorage if contract addresses changed (redeployment)
  useEffect(() => {
    const CONTRACT_VERSION_KEY = 'contractVersion';
    const CURRENT_VERSION = JSON.stringify({
      RoleManager: CONTRACTS.RoleManager,
      RestaurantRegistry: CONTRACTS.RestaurantRegistry,
      RiderRegistry: CONTRACTS.RiderRegistry,
      Escrow: CONTRACTS.Escrow,
      OrderManager: CONTRACTS.OrderManager,
    });

    const storedVersion = localStorage.getItem(CONTRACT_VERSION_KEY);
    
    if (storedVersion !== CURRENT_VERSION) {
      // Contracts were redeployed - clear all role data
      console.log('Contract addresses changed - clearing all cached role data');
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('userRole_') || key.startsWith('pendingRole_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Save new contract version
      localStorage.setItem(CONTRACT_VERSION_KEY, CURRENT_VERSION);
      
      // Clear state
      setStoredRole(null);
      setSelectedRole(null);
    }
  }, []); // Run once on mount

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
          // Clear any pending role from localStorage
          localStorage.removeItem(`pendingRole_${previousAddress}`);
          navigate('/');
          setPreviousAddress(null);
          setSelectedRole(null);
          setShowRoleSelection(false);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [address, previousAddress, refetch, isConnected, navigate, status]);

  // Sync stored role from localStorage when address changes
  useEffect(() => {
    if (address) {
      const savedRole = localStorage.getItem(`userRole_${address}`);
      setStoredRole(savedRole);
      setSelectedRole(savedRole);
    } else {
      setStoredRole(null);
      setSelectedRole(null);
    }
  }, [address]);

  // Persist actual blockchain role once detected
  // CRITICAL FIX: Clear localStorage if blockchain says 'none' but we have stored role
  // This handles the case when contracts are redeployed and old roles are cached
  // BUT: Don't clear if user has pendingRole (they're in the process of registering)
  // SPECIAL CASE: Customer role is always valid (customers don't register on-chain)
  useEffect(() => {
    if (!address) {
      return; // Early return if no address
    }
    
    const pendingRole = localStorage.getItem(`pendingRole_${address}`);
    const savedRole = localStorage.getItem(`userRole_${address}`);
    
    // PRIORITY 1: Check blockchain role FIRST (most authoritative)
    if (role !== 'none') {
      // Blockchain confirms a role - save it and clear pending
      // This OVERRIDES any saved customer role (user upgraded to restaurant/rider)
      localStorage.setItem(`userRole_${address}`, role);
      localStorage.removeItem(`pendingRole_${address}`); // Clear pending since they're now registered
      setStoredRole(role);
      setSelectedRole(role);
      return;
    }
    
    // PRIORITY 2: If blockchain says 'none', check if customer role is saved
    // Customer role is valid even when blockchain says 'none' (no on-chain registration)
    if (savedRole === 'customer' && role === 'none') {
      // Keep customer role only if blockchain hasn't assigned another role
      setStoredRole('customer');
      setSelectedRole('customer');
      return;
    }
    
    // PRIORITY 3: Clear stale roles if blockchain says 'none' and no pending registration
    // CRITICAL: Only clear if we're CERTAIN the blockchain has no role (not just a timeout/slow RPC)
    // Don't clear immediately - wait for multiple confirmations to avoid false positives
    if (role === 'none' && !isLoading && storedRole && !pendingRole && storedRole !== 'customer') {
      // Give the blockchain more time before clearing (avoid clearing due to temporary RPC issues)
      // Only clear if role has been 'none' for a sustained period
      console.log('Blockchain role is none but stored role exists:', storedRole);
      // For now, keep the stored role - user can manually clear if needed
      // This prevents accidentally clearing valid registrations due to RPC timeouts
      // To manually clear: disconnect wallet and reconnect, or clear browser cache
    }
    // If pendingRole exists, keep storedRole even if blockchain says 'none' (user is registering)
  }, [address, role, isLoading, storedRole]);

  // Show role selection only if wallet truly has no role and nothing stored
  // CRITICAL FIX: Don't show role selection if user just selected a role (pending registration)
  useEffect(() => {
    // Early return if no address
    if (!address) {
      setShowRoleSelection(false);
      return;
    }
    
    // If user just selected a role but hasn't registered yet, don't show selection again
    const pendingRole = localStorage.getItem(`pendingRole_${address}`);
    const savedRole = localStorage.getItem(`userRole_${address}`);
    
    // Use savedRole from localStorage if storedRole is not set yet (happens on mount)
    const effectiveStoredRole = storedRole || savedRole;
    
    console.log('Role selection check:', { 
      isConnected, 
      isLoading, 
      role, 
      storedRole,
      savedRole,
      effectiveStoredRole,
      pendingRole,
      address 
    });
    
    // Don't show role selection if:
    // 1. User has a blockchain role (already registered)
    // 2. User has a stored role (selected but not registered yet)
    // 3. User has a pending role (in process of registering)
    // 4. User has saved role in localStorage (including customer)
    if (role !== 'none' || effectiveStoredRole || pendingRole) {
      setShowRoleSelection(false);
      return;
    }
    
    // Only show role selection if user truly has no role anywhere
    if (isConnected && !isLoading && role === 'none' && !effectiveStoredRole && !pendingRole) {
      console.log('Showing role selection screen');
      setShowRoleSelection(true);
    } else {
      setShowRoleSelection(false);
    }
  }, [isConnected, isLoading, role, storedRole, address]);

  const effectiveRole = role !== 'none' ? role : storedRole || 'none';

  const handleRoleSelection = (newRole) => {
    console.log('handleRoleSelection called:', newRole, 'for address:', address);
    
    if (!address) {
      console.error('No address available for role selection');
      return;
    }
    
    // Update state immediately BEFORE navigation
    setStoredRole(newRole);
    setSelectedRole(newRole);
    setShowRoleSelection(false);
    
    if (newRole === 'customer') {
      // Customer doesn't need registration - just save role and navigate
      localStorage.setItem(`userRole_${address}`, newRole);
      localStorage.removeItem(`pendingRole_${address}`); // Clear any pending
      console.log('Customer role saved, navigating to /');
      navigate('/', { replace: true });
    } else {
      // Restaurant and Rider need registration - mark as pending
      localStorage.setItem(`pendingRole_${address}`, newRole);
      localStorage.setItem(`userRole_${address}`, newRole);
      console.log('Saved to localStorage:', { pendingRole: newRole, userRole: newRole });
      
      // Navigate to appropriate registration page
      if (newRole === 'restaurant') {
        console.log('Navigating to /restaurant-dashboard');
        navigate('/restaurant-dashboard', { replace: true });
      } else if (newRole === 'rider') {
        console.log('Navigating to /rider-dashboard');
        navigate('/rider-dashboard', { replace: true });
      }
    }
  };

  const handleBackToSelection = () => {
    if (address) {
      localStorage.removeItem(`userRole_${address}`);
    }
    setStoredRole(null);
    setSelectedRole(null);
    setShowRoleSelection(true);
    navigate('/');
  };

  return (
      <div className="min-h-screen text-[#1A1A1A] bg-gradient-to-br from-[#FFF7ED] via-[#FFE4C7] to-[#E2E7F0]">
        <header className="sticky top-0 z-50 border-b border-orange-200 bg-gradient-to-r from-[#FFEAD5] via-white to-[#FFF7ED]/90 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF4EC] text-2xl flex items-center justify-center">
                  🍕
                </div>
                <div>
                  <p className="text-xl font-semibold">FoodChain</p>
                  <p className="text-xs text-gray-500">Decentralized Delivery</p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
                {isConnected && !isLoading && (
                  <>
                    <Link
                      to="/"
                      className="flex items-center gap-2 text-gray-600 hover:text-[#FF6600] transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Browse
                    </Link>

                    {(effectiveRole === 'customer' || effectiveRole === 'none') && (
                      <Link
                        to="/my-orders"
                        className="text-gray-600 hover:text-[#FF6600] transition-colors"
                      >
                        My Orders
                      </Link>
                    )}

                    {effectiveRole === 'restaurant' && (
                      <Link
                        to="/restaurant-dashboard"
                        className="flex items-center gap-2 text-[#FF6600]"
                      >
                        <Store className="w-4 h-4" />
                        Dashboard
                      </Link>
                    )}

                    {effectiveRole === 'rider' && (
                      <Link
                        to="/rider-dashboard"
                        className="flex items-center gap-2 text-[#38A169]"
                      >
                        <Bike className="w-4 h-4" />
                        Dashboard
                      </Link>
                    )}
                  </>
                )}
              </nav>

              <div className="flex items-center gap-3">
                {isConnected && !isLoading && (
                  <ConnectButton.Custom>
                    {({ account, chain, mounted, openAccountModal }) => {
                      if (!mounted || !account || !chain) {
                        return null;
                      }

                      return (
                        <button
                          type="button"
                          onClick={openAccountModal}
                          className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-left shadow-sm hover:border-[#FF6600] transition-all"
                        >
                          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#FF6600] shadow-inner">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <div className="leading-tight">
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                              {formattedBalance} ETH
                            </p>
                            <p className="text-xs text-gray-500">{formatAddress(account.address)}</p>
                          </div>
                        </button>
                      );
                    }}
                  </ConnectButton.Custom>
                )}

                <button
                  className="md:hidden p-2 rounded-lg border border-gray-200"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>

            {mobileMenuOpen && isConnected && !isLoading && (
              <div className="md:hidden mt-4 pb-4 space-y-3 border-t pt-4">
                <Link
                  to="/"
                  className="block text-gray-600 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Restaurants
                </Link>

                {(effectiveRole === 'customer' || effectiveRole === 'none') && (
                  <Link
                    to="/my-orders"
                    className="block text-gray-600 font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                )}

                {effectiveRole === 'restaurant' && (
                  <Link
                    to="/restaurant-dashboard"
                    className="block text-[#FF6600] font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Restaurant Dashboard
                  </Link>
                )}

                {effectiveRole === 'rider' && (
                  <Link
                    to="/rider-dashboard"
                    className="block text-[#38A169] font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Rider Dashboard
                  </Link>
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
            <section className="py-24">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600">
                  Live on Sepolia • Trustless payments
                </span>
                <h2 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                  A cleaner way to run food delivery on-chain.
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  FoodChain lets customers, restaurants, and riders collaborate through escrow-backed smart
                  contracts. Simple, transparent, and ready for the next block.
                </p>

                <ConnectButton.Custom>
                  {({ mounted, openConnectModal }) => {
                    if (!mounted) return null;

                    return (
                      <button
                        type="button"
                        onClick={openConnectModal}
                        className="btn-primary text-lg px-10 py-5 rounded-2xl"
                      >
                        Connect Wallet
                      </button>
                    );
                  }}
                </ConnectButton.Custom>

                <p className="text-sm text-gray-500">MetaMask, Rainbow, Ledger — any wallet that works with RainbowKit.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-16">
                {[
                  {
                    icon: ShoppingBag,
                    title: 'Order Food',
                    description: 'Browse curated restaurants, pay in ETH, and follow order status on-chain in real time.',
                    iconBg: 'bg-blue-50',
                    iconColor: 'text-blue-600',
                    badgeClass: 'bg-blue-100 text-blue-600',
                    badgeLabel: 'Customers',
                  },
                  {
                    icon: Store,
                    title: 'Own a Restaurant',
                    description: 'List your kitchen, publish menus, and settle disputes with escrow-backed protection.',
                    iconBg: 'bg-orange-50',
                    iconColor: 'text-[#FF6600]',
                    badgeClass: 'bg-orange-100 text-[#FF6600]',
                    badgeLabel: 'Restaurants',
                  },
                  {
                    icon: Bike,
                    title: 'Become a Rider',
                    description: 'Accept deliveries, earn crypto instantly, and track payouts with block-by-block clarity.',
                    iconBg: 'bg-emerald-50',
                    iconColor: 'text-[#38A169]',
                    badgeClass: 'bg-emerald-100 text-[#1F7A4E]',
                    badgeLabel: 'Riders',
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="card h-full shadow-[0_18px_40px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(15,23,42,0.12)] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.iconBg}`}>
                        <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.badgeClass}`}>
                        {item.badgeLabel}
                      </span>
                    </div>

                    <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
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
