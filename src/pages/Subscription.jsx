// src/pages/Subscription.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle, X, CreditCard, Zap, Shield, Users, Clock, Star,
  ArrowRight, Lock, BarChart3, Activity, Download, Settings, Eye,
  Loader, AlertCircle
} from 'lucide-react';

// ===============================
// 🎨 Reusable Components
// ===============================
const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'default', loading = false, ...props }) => {
  const baseClasses = "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeClasses = {
    default: "px-6 py-3.5",
    sm: "px-4 py-2.5 text-sm"
  };
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100",
    outline: "border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white"
  };
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : children}
    </button>
  );
};

// ===============================
// 💎 Plan Card Component
// ===============================
const PlanCard = ({ plan, isSelected, onSelect, isRecommended = false }) => {
  const features = {
    FREE: [
      { text: '100 API calls/month', available: true },
      { text: '5 documents signed', available: true },
      { text: 'Basic templates', available: true },
      { text: 'Email support', available: true },
      { text: 'Audit logs', available: false },
      { text: 'Custom branding', available: false },
      { text: 'API access', available: false },
      { text: 'Webhooks', available: false }
    ],
    PRO: [
      { text: '10,000 API calls/month', available: true },
      { text: 'Unlimited documents', available: true },
      { text: 'All templates', available: true },
      { text: 'Priority support', available: true },
      { text: 'Detailed audit logs', available: true },
      { text: 'Custom branding', available: true },
      { text: 'Full API access', available: true },
      { text: 'Webhooks', available: true }
    ],
    ENTERPRISE: [
      { text: 'Unlimited API calls', available: true },
      { text: 'Unlimited documents', available: true },
      { text: 'All templates', available: true },
      { text: '24/7 dedicated support', available: true },
      { text: 'Advanced audit logs', available: true },
      { text: 'Custom branding', available: true },
      { text: 'Full API access', available: true },
      { text: 'Advanced webhooks', available: true }
    ]
  };

  const iconMap = {
    FREE: BarChart3,
    PRO: Zap,
    ENTERPRISE: Shield
  };

  const Icon = iconMap[plan.tier] || Star;

  return (
    <div
      className={`relative border-2 rounded-xl p-6 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/20'
          : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
      }`}
      onClick={() => onSelect(plan)}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            plan.tier === 'FREE' ? 'bg-blue-900/30 text-blue-400' :
            plan.tier === 'PRO' ? 'bg-purple-900/30 text-purple-400' :
            'bg-emerald-900/30 text-emerald-400'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{plan.name}</h3>
            <p className="text-gray-400 text-sm">{plan.tier}</p>
          </div>
        </div>
        {isSelected && <CheckCircle className="w-6 h-6 text-blue-400" />}
      </div>
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">
            ${plan.priceCents ? (plan.priceCents / 100).toFixed(2) : '0'}
          </span>
          <span className="text-gray-400 text-sm">
            {plan.billingCycle === 'MONTHLY' ? '/mo' : '/yr'}
          </span>
        </div>
        {plan.billingCycle === 'YEARLY' && (
          <p className="text-green-400 text-xs mt-1">Save 20% with annual billing</p>
        )}
      </div>
      <ul className="space-y-3 mb-6">
        {features[plan.tier]?.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            {feature.available ? (
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            )}
            <span className={feature.available ? 'text-gray-300' : 'text-gray-500'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      <Button
        variant={isSelected ? 'success' : 'outline'}
        size="sm"
        className="w-full"
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the card click
          onSelect(plan);
        }}
      >
        {isSelected ? 'Selected' : 'Choose Plan'}
      </Button>
    </div>
  );
};

// ===============================
// 🧠 MAIN SUBSCRIPTION COMPONENT
// ===============================
export default function SubscriptionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ===============================
  // 📥 Fetch Plans from API
  // ===============================
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Replace with your actual API endpoint
        const response = await fetch('http://localhost:3000/api/v1/plans', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT auth
            'x-api-key': localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch plans: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setPlans(data); // Assuming the API returns an array of plans

        // Try to select a default plan (e.g., Pro) or the first one
        const proPlan = data.find(p => p.tier === 'PRO');
        if (proPlan) {
          setSelectedPlan(proPlan);
        } else if (data.length > 0) {
          setSelectedPlan(data[0]);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError(err.message || 'Failed to load subscription plans. Please try again later.');
        // Fallback to dummy data if API fails
        setPlans([
          {
            id: 'plan_free_123',
            name: 'Free Plan',
            tier: 'FREE',
            priceCents: 0,
            billingCycle: 'MONTHLY'
          },
          {
            id: 'plan_pro_456',
            name: 'Pro Plan',
            tier: 'PRO',
            priceCents: 1999, // $19.99
            billingCycle: 'MONTHLY'
          },
          {
            id: 'plan_enterprise_789',
            name: 'Enterprise Plan',
            tier: 'ENTERPRISE',
            priceCents: 9999, // $99.99
            billingCycle: 'MONTHLY'
          }
        ]);
        setSelectedPlan({
          id: 'plan_pro_456',
          name: 'Pro Plan',
          tier: 'PRO',
          priceCents: 1999,
          billingCycle: 'MONTHLY'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // ===============================
  // 🚀 Handle Plan Selection & Navigation
  // ===============================
  const handleProceed = () => {
    if (!selectedPlan) {
      alert('Please select a plan before proceeding.');
      return;
    }

    // Navigate to payment page, passing the selected plan details
    // The token (e.g., for payment session) would typically be generated by the backend *after* plan selection,
    // but for this frontend flow, we can simulate or pass the plan ID which the payment page uses.
    // Here, we pass the plan details in location.state.
    navigate('/payment', {
      state: {
        selectedPlan: selectedPlan,
        // Optionally, include user/org info if needed by the payment page
        // user: JSON.parse(localStorage.getItem('user')),
        // organization: JSON.parse(localStorage.getItem('organization')),
      }
    });
  };

  // ===============================
  // ⏳ Loading State
  // ===============================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  // ===============================
  // 🧾 Render
  // ===============================
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Select a subscription plan that fits your needs. All plans include core features,
            with advanced options available for Pro and Enterprise users.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan.id}
              onSelect={setSelectedPlan}
              isRecommended={plan.tier === 'PRO'} // Mark Pro as recommended
            />
          ))}
        </div>

        {/* Summary & Action */}
        {selectedPlan && (
          <Card className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-semibold text-white text-lg">Your Selection</h3>
                <p className="text-gray-400 mt-1">
                  You have chosen the <span className="text-blue-400 font-medium">{selectedPlan.name}</span> plan.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Price: <span className="text-white font-medium">${(selectedPlan.priceCents / 100).toFixed(2)}</span> /
                  {selectedPlan.billingCycle === 'MONTHLY' ? 'month' : 'year'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  variant="primary"
                  onClick={handleProceed}
                  className="flex-1"
                >
                  Proceed to Payment <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Feature Comparison Table (Optional, Expandable) */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400 border-collapse">
              <thead className="text-xs text-gray-300 uppercase bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3">Feature</th>
                  {plans.map(plan => (
                    <th key={plan.id} scope="col" className="px-6 py-3 text-center">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-white">
                    API Calls / Month
                  </th>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.tier === 'FREE' ? '100' : plan.tier === 'PRO' ? '10,000' : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-white">
                    Documents Signed
                  </th>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.tier === 'FREE' ? '5' : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-white">
                    Support
                  </th>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.tier === 'FREE' ? 'Email' : plan.tier === 'PRO' ? 'Priority' : '24/7 Dedicated'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-white">
                    Audit Logs
                  </th>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.tier === 'FREE' ? 'Basic' : plan.tier === 'PRO' ? 'Detailed' : 'Advanced'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-white">
                    API Access
                  </th>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.tier === 'FREE' ? 'No' : 'Yes'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-white">
                    Webhooks
                  </th>
                  {plans.map(plan => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.tier === 'FREE' ? 'No' : plan.tier === 'PRO' ? 'Standard' : 'Advanced'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
