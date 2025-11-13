// src/pages/Settings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Key, CreditCard, BarChart3, Bell, Lock, Globe, Trash2, Plus, Edit, Eye, EyeOff,
  CheckCircle, X, AlertCircle, Clock, Zap, Users, Calendar, Download, RotateCcw, ExternalLink,
  Loader, Settings as SettingsIcon
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
    default: "px-4 py-2.5",
    sm: "px-3 py-2 text-sm"
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
          {children}
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
// 🔐 User Profile Section
// ===============================
const UserProfileSection = ({ user, setUser }) => {
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({ firstName: user.firstName, lastName: user.lastName, email: user.email });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Simulate API call to update user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(prev => ({ ...prev, ...profile }));
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-400" />
        Profile Information
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEditing ? (
          <>
            <Input
              label="First Name"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              required
            />
            <div className="flex gap-3">
              <Button type="submit" loading={loading}>Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">First Name</p>
                <p className="text-white">{profile.firstName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Last Name</p>
                <p className="text-white">{profile.lastName}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white">{profile.email}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
    </Card>
  );
};

// ===============================
// 💎 Subscription Management Section
// ===============================
const SubscriptionSection = ({ user }) => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  // Fetch current subscription and available plans
  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) {
        setLoading(false);
        return; // Only admins can manage subscriptions
      }
      try {
        setLoading(true);
        setError('');

        // Fetch current subscription
        const apiKey = localStorage.getItem("apiKey") || import.meta.env.VITE_API_KEY;
        const token = localStorage.getItem("token");

        const subResponse = await fetch('http://localhost:3000/api/v1/subscriptions/current', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': apiKey,
          },
        });
        
        if (subResponse.ok) {
          const data = await subResponse.json();
          console.log('Subscription fetch response:', data);
          // Fixed: Access the subscription property directly from the response object
          if (data.subscription) {
            setSubscription(data.subscription);
          }
        } else if (subResponse.status === 404) {
          // No subscription found - this is normal for new users
          console.log('No subscription found');
          setSubscription(null);
        } else {
          throw new Error(`Failed to fetch subscription: ${subResponse.status}`);
        }

        // Fetch available plans
        const planResponse = await fetch('http://localhost:3000/api/v1/plans', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': apiKey,
          },
        });

        if (!planResponse.ok) throw new Error(`Failed to fetch plans: ${planResponse.status}`);
        const plansData = await planResponse.json();
        setPlans(plansData);

      } catch (err) {
        console.error('Settings - Subscription fetch error:', err);
        setError(err.message || 'Failed to load subscription data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    if (!window.confirm('Are you sure you want to cancel your subscription? This will revoke all API keys and stop service access.')) {
      return;
    }

    setActionLoading('cancel');
    try {
      const apiKey = localStorage.getItem("apiKey") || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:3000/api/v1/subscriptions/${subscription.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to cancel subscription (${response.status})`);
      }

      alert('Subscription cancelled successfully.');
      setSubscription(null);
    } catch (err) {
      console.error('Settings - Cancel subscription error:', err);
      setError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleUpdatePlan = async (newPlanName) => {
    if (!subscription) return;
    if (!window.confirm(`Are you sure you want to update your plan to ${newPlanName}?`)) {
      return;
    }

    setActionLoading(`update-${newPlanName}`);
    try {
      const apiKey = localStorage.getItem("apiKey") || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:3000/api/v1/subscriptions/${subscription.id}/tier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ planName: newPlanName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to update plan (${response.status})`);
      }

      const result = await response.json();
      setSubscription(result.subscription);
      alert(`Subscription updated to ${newPlanName} successfully.`);
    } catch (err) {
      console.error('Settings - Update plan error:', err);
      setError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-400" />
          Subscription
        </h2>
        <p className="text-gray-400">Only administrators can manage subscriptions.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-400" />
          Subscription
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-blue-400" />
        Subscription Management
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      {subscription ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">{subscription.plan?.name || 'Active Plan'}</h3>
              <p className="text-gray-400 text-sm">
                Tier: <span className="text-blue-400">{subscription.plan?.tier}</span>
              </p>
              <p className="text-gray-400 text-sm">
                Started: {new Date(subscription.startedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelSubscription()}
                loading={actionLoading === 'cancel'}
              >
                <RotateCcw className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-700">
            <h4 className="font-medium text-white mb-2">Change Plan</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plans
                .filter(plan => plan.name !== subscription.plan?.name)
                .map(plan => (
                  <div key={plan.id} className="border border-gray-600 rounded-lg p-3">
                    <h5 className="font-medium text-white">{plan.name}</h5>
                    <p className="text-gray-400 text-sm">{plan.tier}</p>
                    <p className="text-white text-sm mt-1">${(plan.priceCents / 100).toFixed(2)} / {plan.billingCycle?.toLowerCase() || 'month'}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleUpdatePlan(plan.name)}
                      loading={actionLoading === `update-${plan.name}`}
                    >
                      Select
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400 mb-4">No active subscription found.</p>
          <Button onClick={() => window.location.href = '/subscription'}>
            <Zap className="w-4 h-4" /> Go to Subscription Plans
          </Button>
        </div>
      )}
    </Card>
  );
};

// ===============================
// 🔑 API Keys Management Section
// ===============================
const ApiKeysSection = ({ user }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  // Fetch API keys
  useEffect(() => {
    const fetchApiKeys = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const apiKey = localStorage.getItem("apiKey") || import.meta.env.VITE_API_KEY;
        const token = localStorage.getItem("token");

        if (!apiKey) throw new Error('API Key not found in localStorage.');

        const response = await fetch('http://localhost:3000/api/v1/auth/api-keys', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': apiKey,
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch API keys: ${response.status}`);
        const keys = await response.json();
        setApiKeys(keys);
      } catch (err) {
        console.error('Settings - API keys fetch error:', err);
        setError(err.message || 'Failed to load API keys.');
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
  }, [isAdmin]);

  const handleCreateApiKey = async () => {
    if (!newKeyDescription.trim()) {
      setError('Description is required.');
      return;
    }
    setActionLoading('create');
    try {
      const apiKey = localStorage.getItem("apiKey") || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:3000/api/v1/auth/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ description: newKeyDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to create API key (${response.status})`);
      }

      const newKey = await response.json();
      setApiKeys(prev => [newKey, ...prev]);
      setNewKeyDescription('');
      alert('API Key created successfully. Copy it now, it will not be shown again.');
    } catch (err) {
      console.error('Settings - Create API key error:', err);
      setError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    setActionLoading(`delete-${keyId}`);
    try {
      const apiKey = localStorage.getItem("apiKey") || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:3000/api/v1/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to delete API key (${response.status})`);
      }

      setApiKeys(prev => prev.filter(k => k.id !== keyId));
      alert('API Key deleted successfully.');
    } catch (err) {
      console.error('Settings - Delete API key error:', err);
      setError(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleCopyKey = (keyValue, keyId) => {
    navigator.clipboard.writeText(keyValue)
      .then(() => {
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 2000);
      })
      .catch(err => console.error('Copy failed:', err));
  };

  if (!isAdmin) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-400" />
          API Keys
        </h2>
        <p className="text-gray-400">Only administrators can manage API keys.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-400" />
          API Keys
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Key className="w-5 h-5 text-blue-400" />
        API Keys
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <Input
            label="New Key Description"
            value={newKeyDescription}
            onChange={(e) => setNewKeyDescription(e.target.value)}
            placeholder="e.g., Production Backend, CI/CD"
            className="flex-1"
          />
          <Button
            onClick={handleCreateApiKey}
            loading={actionLoading === 'create'}
            className="mt-6"
          >
            <Plus className="w-4 h-4" /> Create Key
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {apiKeys.length > 0 ? (
          apiKeys.map(key => (
            <div key={key.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{key.description || 'Untitled Key'}</p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(key.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-1 bg-gray-800 rounded p-2">
                  <code className="text-xs font-mono text-gray-300 break-all">
                    {key.key ? `${key.key.substring(0, 8)}••••••••••••••••••••` : '••••••••••••••••••••'}
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {key.key && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyKey(key.key, key.id)}
                  >
                    {copiedKey === key.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteApiKey(key.id)}
                  loading={actionLoading === `delete-${key.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No API keys found.</p>
        )}
      </div>
    </Card>
  );
};

// Placeholder for Copy Icon if not already imported
const CopyIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

// ===============================
// 🔒 Security Settings Section
// ===============================
const SecuritySection = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Simulate API call to change password
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Password changed successfully!');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-400" />
        Security Settings
      </h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700">
          <div>
            <h3 className="font-medium text-white">Two-Factor Authentication</h3>
            <p className="text-gray-400 text-sm">Add an extra layer of security to your account.</p>
          </div>
          <Button
            variant={twoFactorEnabled ? "success" : "outline"}
            size="sm"
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          >
            {twoFactorEnabled ? 'Enabled' : 'Enable'}
          </Button>
        </div>
        <div>
          <h3 className="font-medium text-white mb-3">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <Input
              label="Current Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} disabled={loading}>
              Update Password
            </Button>
          </form>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </Card>
  );
};

// ===============================
// 🧠 MAIN SETTINGS COMPONENT
// ===============================
export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Load user from localStorage on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard, adminOnly: true },
    { id: 'api-keys', label: 'API Keys', icon: Key, adminOnly: true },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const filteredTabs = user?.role === 'ADMIN' ? tabs : tabs.filter(tab => !tab.adminOnly);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-0">
              <nav className="space-y-1">
                {filteredTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-900/30 text-blue-400 border-r-2 border-blue-400'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && <UserProfileSection user={user} setUser={setUser} />}
            {activeTab === 'subscription' && <SubscriptionSection user={user} />}
            {activeTab === 'api-keys' && <ApiKeysSection user={user} />}
            {activeTab === 'security' && <SecuritySection />}
          </div>
        </div>
      </main>
    </div>
  );
}