// src/pages/Payment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard, CheckCircle, AlertCircle, Shield, Lock, Eye, EyeOff, Calendar,
  Loader, ArrowLeft, Zap, Users, BarChart3, Activity, Star, AlertTriangle
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

const Input = ({ label, error, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
    <input
      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      {...props}
    />
    {error && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
  </div>
);

// ===============================
// 🧠 MAIN PAYMENT COMPONENT
// ===============================
export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    email: '' // Could be pre-filled from user context
  });
  const [showCvv, setShowCvv] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [apiKey, setApiKey] = useState(null);

  const selectedPlan = location.state?.selectedPlan;

  // Validate plan data from state
  useEffect(() => {
    if (!selectedPlan) {
      setError('No plan selected. Please go back and choose a plan.');
      // Optionally redirect to subscription page
      // setTimeout(() => navigate('/subscription'), 3000);
    } else {
      setError('');
    }
  }, [selectedPlan, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedPlan) {
      setError('No plan selected. Cannot proceed.');
      return;
    }

    // Basic validation
    if (!paymentData.cardNumber || !paymentData.expiry || !paymentData.cvv || !paymentData.name) {
      setError('Please fill in all payment details.');
      return;
    }

    // Simulate payment processing delay
    setIsProcessing(true);
    try {
      // In a real app, you'd integrate with a payment gateway here (e.g., Stripe, PayPal)
      // This is a simulation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // After payment simulation, call the backend API to create the subscription
      const response = await fetch('http://localhost:3000/api/v1/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT auth
          'x-api-key': localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify({
          planName: selectedPlan.name // Send the plan name to the backend
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || `Failed to create subscription (${response.status})`);
      }

      console.log('Subscription created successfully:', result);
      setApiKey(result.apiKey); // Store the new API key received from the backend
      setSuccess(true);

      // Optionally, update local storage with the new API key if needed elsewhere
      if (result.apiKey) {
        localStorage.setItem('apiKey', result.apiKey.key);
      }

    } catch (err) {
      console.error('Payment or subscription creation error:', err);
      setError(err.message || 'An error occurred during payment processing or subscription creation.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Plan Icon Map
  const iconMap = {
    FREE: BarChart3,
    PRO: Zap,
    ENTERPRISE: Shield
  };
  const Icon = iconMap[selectedPlan?.tier] || Star;

  // ===============================
  // 🧾 Render
  // ===============================
  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-green-900/20">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-400 mb-4">
            Your subscription to <span className="text-blue-400 font-medium">{selectedPlan?.name}</span> has been activated.
          </p>
          {apiKey && (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700 text-left">
              <p className="text-gray-300 text-sm font-medium mb-1">Your New API Key:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-gray-800 px-2 py-1 rounded break-all flex-1">
                  {apiKey.key}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(apiKey.key)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Copy
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Store this key securely. It will not be shown again.
              </p>
            </div>
          )}
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="mt-6 w-full"
          >
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)} // Go back to subscription page
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Complete Your Payment</h1>
            <p className="text-gray-400">Securely process your subscription payment</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Form */}
          <Card>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Payment Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Card Number"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber}
                onChange={handleChange}
                required
                pattern="\d{4}\s?\d{4}\s?\d{4}\s?\d{4}"
                maxLength="19"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Date"
                  name="expiry"
                  placeholder="MM/YY"
                  value={paymentData.expiry}
                  onChange={handleChange}
                  required
                  pattern="(0[1-9]|1[0-2])\/\d{2}"
                  maxLength="5"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CVV</label>
                  <div className="relative">
                    <input
                      type={showCvv ? "text" : "password"} // Mask/unmask CVV
                      name="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={handleChange}
                      required
                      pattern="\d{3,4}"
                      maxLength="4"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvv(!showCvv)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    >
                      {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Input
                label="Name on Card"
                name="name"
                placeholder="John Doe"
                value={paymentData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Billing Email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={paymentData.email}
                onChange={handleChange}
                required
              />
              <Button
                type="submit"
                variant="primary"
                loading={isProcessing}
                disabled={!selectedPlan}
                className="w-full mt-4"
              >
                {isProcessing ? 'Processing Payment...' : `Pay $${selectedPlan ? (selectedPlan.priceCents / 100).toFixed(2) : '0.00'}`}
              </Button>
            </form>
          </Card>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              {selectedPlan ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedPlan.tier === 'FREE' ? 'bg-blue-900/30 text-blue-400' :
                        selectedPlan.tier === 'PRO' ? 'bg-purple-900/30 text-purple-400' :
                        'bg-emerald-900/30 text-emerald-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{selectedPlan.name}</h3>
                        <p className="text-gray-400 text-sm">{selectedPlan.tier}</p>
                      </div>
                    </div>
                    <span className="font-medium text-white">
                      ${selectedPlan.priceCents ? (selectedPlan.priceCents / 100).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-700 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">${selectedPlan.priceCents ? (selectedPlan.priceCents / 100).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tax</span>
                      <span className="text-white">$0.00</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-700">
                      <span>Total</span>
                      <span>${selectedPlan.priceCents ? (selectedPlan.priceCents / 100).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No plan selected.</p>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Secure Payment
              </h3>
              <div className="space-y-3 text-sm text-gray-400">
                <p className="flex items-start gap-2">
                  <Lock className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                  Your payment information is securely encrypted.
                </p>
                <p className="flex items-start gap-2">
                  <Activity className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  All transactions are monitored for fraud.
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                  You will receive a receipt via email.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
