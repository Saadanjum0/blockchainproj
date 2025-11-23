import { useState } from 'react';
import { Store, Bike, ShoppingBag, ArrowRight, Check } from 'lucide-react';

/**
 * WelcomeScreen - Shown to new users to select their role
 */
function WelcomeScreen({ onSelectRole }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      description: 'Browse restaurants and order food with crypto',
      features: [
        'Order from verified restaurants',
        'Track delivery in real-time',
        'Pay with cryptocurrency',
        'Rate restaurants & riders',
      ],
    },
    {
      id: 'restaurant',
      title: 'Restaurant Owner',
      icon: Store,
      color: 'from-orange-500 to-red-600',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      description: 'Register your restaurant and start accepting orders',
      features: [
        'List your menu on blockchain',
        'Receive orders instantly',
        'Get paid in ETH automatically',
        'Build your reputation',
      ],
    },
    {
      id: 'rider',
      title: 'Delivery Rider',
      icon: Bike,
      color: 'from-green-500 to-emerald-600',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      description: 'Deliver food and earn cryptocurrency',
      features: [
        'Work on your own schedule',
        'Earn 10% per delivery',
        'Get paid automatically',
        'Build delivery reputation',
      ],
    },
  ];

  const handleContinue = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedRole) {
      console.log('Role selected:', selectedRole);
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative z-10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/20 blur-3xl animate-pulse-slow" />
            <div className="relative inline-block p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-2xl animate-glow">
              <span className="text-6xl">🍕</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Welcome to <span className="gradient-text">FoodChain</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            The first <span className="font-bold text-orange-600">decentralized</span> food delivery platform. 
            <br />Choose your role to get started!
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`
                  relative cursor-pointer rounded-2xl p-6 transition-all duration-500 transform
                  ${isSelected 
                    ? `scale-105 shadow-2xl border-2 ${role.borderColor} animate-glow` 
                    : 'scale-100 hover:scale-102 shadow-lg border-2 border-transparent hover:border-gray-200'
                  }
                  glass-card hover:shadow-xl
                `}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className={`absolute top-4 right-4 w-8 h-8 ${role.bgColor} rounded-full flex items-center justify-center`}>
                    <Check className={`w-5 h-5 ${role.iconColor}`} />
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${role.color} mb-4 shadow-lg transform transition-all duration-300 ${isSelected ? 'scale-110 rotate-12' : 'group-hover:scale-105'}`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {role.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className={`mt-1 ${role.iconColor}`}>•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleContinue();
            }}
            disabled={!selectedRole}
            className={`
              relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg
              transition-all duration-300 transform overflow-hidden
              ${selectedRole
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 animate-glow'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {selectedRole && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
            <span className="relative z-10">
              Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : '...'}
            </span>
            <ArrowRight className={`w-5 h-5 transition-transform ${selectedRole ? 'translate-x-0 group-hover:translate-x-1' : ''}`} />
          </button>

          {!selectedRole && (
            <p className="text-sm text-gray-500 mt-3">
              Please select a role to continue
            </p>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-12 glass-card bg-gradient-to-r from-orange-50/50 to-red-50/50 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">💡</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 gradient-text">New to Web3?</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                This platform runs on the <span className="font-semibold text-orange-600">Ethereum blockchain</span> (Sepolia testnet). 
                All transactions are secure, transparent, and immutable. Your wallet is your identity!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;

