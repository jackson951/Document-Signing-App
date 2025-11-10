import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Users,
  Shield,
  Zap,
  Key,
  Lock,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  AlertTriangle,
  Mail,
  Calendar,
  Download,
} from 'lucide-react';

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showKey, setShowKey] = useState({});

  // ===============================
  // 🔑 REAL: Load user & org from localStorage
  // ===============================
  useEffect(() => {
    try {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      const orgFromStorage = JSON.parse(localStorage.getItem('organization'));
      
      if (!userFromStorage) {
        navigate('/login');
        return;
      }

      setUser(userFromStorage);
      setOrganization(orgFromStorage || { name: "Personal Workspace", id: "org_1" });
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to parse auth data', err);
      navigate('/login');
    }
  }, [navigate]);

  // ===============================
  // 🧪 DUMMY DATA — Replace with API calls later
  // ===============================

  // Dummy API Keys
  const dummyApiKeys = [
    {
      id: 'key_1',
      key: 'sk_live_a1b2c3d4e5f6g7h8i9j0',
      description: 'Production Frontend',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'key_2',
      key: 'sk_test_z9y8x7w6v5u4t3s2r1q0',
      description: 'Development & Testing',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: null,
    },
    {
      id: 'key_3',
      key: 'sk_webhook_12345abcde',
      description: 'Webhook Integrations',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Dummy Documents
  const dummyDocuments = [
    {
      id: 'doc_1',
      title: 'Q4 Financial Report - Acme Corp',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      signingRequests: [{
        id: 'req_1',
        status: 'COMPLETED',
        signers: [
          { id: 's1', name: 'Alice Chen', email: 'alice@acme.com', status: 'SIGNED' },
          { id: 's2', name: 'Bob Smith', email: 'bob@acme.com', status: 'SIGNED' },
        ],
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      }]
    },
    {
      id: 'doc_2',
      title: 'Contract Renewal - SaaS Platform',
      status: 'IN_PROGRESS',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      signingRequests: [{
        id: 'req_2',
        status: 'IN_PROGRESS',
        signers: [
          { id: 's3', name: 'Jackson Khuto', email: 'jackson@forensics.dev', status: 'SIGNED' },
          { id: 's4', name: 'Legal Team', email: 'legal@client.com', status: 'PENDING' },
        ]
      }]
    },
    {
      id: 'doc_3',
      title: 'NDA - Project Phoenix',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      signingRequests: [{
        id: 'req_3',
        status: 'PENDING',
        signers: [
          { id: 's5', name: 'Vendor Rep', email: 'contact@vendor.com', status: 'PENDING' },
        ]
      }]
    },
    {
      id: 'doc_4',
      title: 'Employment Offer - Senior Developer',
      status: 'DECLINED',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      signingRequests: [{
        id: 'req_4',
        status: 'DECLINED',
        signers: [
          { id: 's6', name: 'Candidate', email: 'candidate@email.com', status: 'DECLINED' },
        ]
      }]
    },
    {
      id: 'doc_5',
      title: 'API Integration Agreement',
      status: 'DRAFT',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      signingRequests: []
    }
  ];

  // Dummy Audit Logs (last 10)
  const dummyAuditLogs = [
    { id: 'log1', action: 'DOCUMENT_SIGNED', performedBy: 'Alice Chen', ipAddress: '192.168.1.105', createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString() },
    { id: 'log2', action: 'API_KEY_CREATED', performedBy: user?.email || 'admin@example.com', ipAddress: '203.0.113.25', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'log3', action: 'DOCUMENT_CREATED', performedBy: user?.firstName || 'Jackson', ipAddress: '203.0.113.25', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: 'log4', action: 'SIGNING_REQUEST_SENT', performedBy: user?.email || 'jackson@forensics.dev', ipAddress: '203.0.113.25', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
    { id: 'log5', action: 'USER_LOGIN', performedBy: user?.email || 'admin@example.com', ipAddress: '198.51.100.42', createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
    { id: 'log6', action: 'DOCUMENT_DOWNLOADED', performedBy: 'Bob Smith', ipAddress: '192.168.1.88', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log7', action: 'API_KEY_REVOKED', performedBy: user?.email || 'jackson@forensics.dev', ipAddress: '203.0.113.25', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log8', action: 'WEBHOOK_CONFIGURED', performedBy: user?.email || 'admin@example.com', ipAddress: '203.0.113.25', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log9', action: 'DOCUMENT_SIGNED', performedBy: 'Legal Team', ipAddress: '198.51.100.15', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'log10', action: 'USER_LOGIN', performedBy: user?.email || 'jackson@forensics.dev', ipAddress: '203.0.113.25', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  // Dummy Usage Metrics
  const dummyUsageMetrics = {
    apiCalls: 12_487,
    documentsSigned: 1_243,
    signingRequests: 87,
    activeKeys: dummyApiKeys.length,
  };

  // ===============================
  // End Dummy Data
  // ===============================

  const isAdmin = user?.role === 'ADMIN';

  const handleCopyKey = (keyId, keyValue) => {
    navigator.clipboard.writeText(keyValue);
    setShowKey(prev => ({ ...prev, [keyId]: true }));
    setTimeout(() => setShowKey(prev => ({ ...prev, [keyId]: false })), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading your secure dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-900/30 to-cyan-900/20 rounded-xl p-6 border border-blue-800/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName} 👋</h2>
              <p className="text-gray-400 max-w-2xl">
                {isAdmin 
                  ? "You're managing " + organization?.name + ". Monitor security, usage, and team activity."
                  : "Developing with " + organization?.name + ". Track API usage and document workflows."}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => navigate('/documents/create')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                New Document
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-lg font-medium transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Admin Console
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "API Calls (30d)",
              value: dummyUsageMetrics.apiCalls.toLocaleString(),
              icon: Zap,
              change: "+12.4%",
              color: "text-green-400",
              iconBg: "bg-blue-900/30"
            },
            {
              title: "Documents Signed",
              value: dummyUsageMetrics.documentsSigned.toLocaleString(),
              icon: FileText,
              change: "+8.2%",
              color: "text-green-400",
              iconBg: "bg-green-900/30"
            },
            {
              title: "Active Signing Requests",
              value: dummyUsageMetrics.signingRequests.toLocaleString(),
              icon: Users,
              change: "+3",
              color: "text-yellow-400",
              iconBg: "bg-yellow-900/30"
            },
            {
              title: "API Keys",
              value: dummyUsageMetrics.activeKeys,
              icon: Key,
              change: null,
              color: "text-blue-400",
              iconBg: "bg-indigo-900/30"
            }
          ].map((stat, i) => (
            <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-sm mt-1 flex items-center ${stat.color}`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className="w-6 h-6 text-gray-300" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Documents & Signing */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Documents */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Documents
                </h3>
                <Link to="/documents" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  View All <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-700/50">
                {dummyDocuments.length > 0 ? (
                  dummyDocuments.map((doc) => {
                    const request = doc.signingRequests?.[0];
                    const statusColor = {
                      COMPLETED: 'text-green-400',
                      IN_PROGRESS: 'text-yellow-400',
                      PENDING: 'text-blue-400',
                      DECLINED: 'text-red-400',
                      EXPIRED: 'text-gray-500',
                      DRAFT: 'text-gray-400',
                    }[request?.status || 'DRAFT'] || 'text-gray-400';

                    const getStatusText = (status) => {
                      if (!request) return 'Draft';
                      return status
                        .replace('_', ' ')
                        .toLowerCase()
                        .replace(/\b\w/g, l => l.toUpperCase());
                    };

                    return (
                      <div key={doc.id} className="px-6 py-4 hover:bg-gray-700/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{doc.title}</h4>
                            <p className="text-sm text-gray-400 mt-1">
                              Created {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full bg-gray-900 ${statusColor}`}>
                            {getStatusText(request?.status)}
                          </span>
                        </div>
                        {request && (
                          <div className="mt-3 flex items-center text-sm text-gray-400">
                            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>
                              {request.signers?.length || 0} signers •{' '}
                              {request.signers?.filter(s => s.status === 'SIGNED').length || 0} signed
                            </span>
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          {request?.status === 'COMPLETED' && (
                            <button className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1">
                              <Download className="w-3 h-3" /> Download PDF
                            </button>
                          )}
                          {(request?.status === 'PENDING' || request?.status === 'IN_PROGRESS') && (
                            <button className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1">
                              <Mail className="w-3 h-3" /> Resend Invite
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No documents yet</p>
                    <button
                      onClick={() => navigate('/documents/create')}
                      className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Create your first document
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Audit Log (Forensics Focus) */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Audit Trail (Latest 10 Events)
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Immutable log of critical actions — GDPR/ISO 27001 compliant
                </p>
              </div>
              <div className="divide-y divide-gray-700/50 max-h-96 overflow-y-auto">
                {dummyAuditLogs.map((log, i) => (
                  <div key={i} className="px-6 py-3 text-sm">
                    <div className="flex items-start">
                      <div className="mt-1 mr-3">
                        {log.action.includes('SIGN') ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : log.action.includes('KEY_CREATED') ? (
                          <Key className="w-4 h-4 text-blue-400" />
                        ) : log.action.includes('LOGIN') ? (
                          <Lock className="w-4 h-4 text-blue-400" />
                        ) : log.action.includes('DOCUMENT') ? (
                          <FileText className="w-4 h-4 text-gray-400" />
                        ) : log.action.includes('WEBHOOK') ? (
                          <Zap className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Activity className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p>
                          <span className="font-medium">{log.action.replace(/_/g, ' ')}</span>
                          {log.performedBy && (
                            <>
                              {' by '}
                              <span className="text-blue-400">{log.performedBy}</span>
                            </>
                          )}
                          {log.ipAddress && (
                            <>
                              {' from '}
                              <span className="text-gray-400">{log.ipAddress}</span>
                            </>
                          )}
                        </p>
                        <p className="text-gray-500 mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: API Keys & Insights */}
          <div className="space-y-8">
            {/* API Keys */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Keys ({dummyApiKeys.length})
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/settings/api-keys')}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-700/50">
                {dummyApiKeys.map((key) => (
                  <div key={key.id} className="px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{key.description || 'Untitled Key'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created {new Date(key.createdAt).toLocaleDateString()}
                        </p>
                        {key.expiresAt && (
                          <p className={`text-xs mt-1 ${
                            new Date(key.expiresAt) < new Date() 
                              ? 'text-red-400' 
                              : 'text-yellow-400'
                          }`}>
                            Expires {new Date(key.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyKey(key.id, key.key)}
                        className="p-1 text-gray-400 hover:text-blue-400"
                        title="Copy key"
                      >
                        {showKey[key.id] ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-3 bg-gray-900 rounded p-3 text-xs font-mono break-all">
                      <code className="text-gray-300">
                        {key.key.substring(0, 8)}••••••••••••••••••••
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Security & Compliance */}
            <section className="bg-gradient-to-br from-gray-800/50 to-blue-900/20 rounded-xl border border-blue-800/50 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Security Posture
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">2FA Enforcement</span>
                  <span className="text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Not enabled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">IP Allowlisting</span>
                  <span className="text-gray-500">Not configured</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Key Rotation Policy</span>
                  <span className="text-green-400">90 days (default)</span>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => navigate('/settings/security')}
                    className="w-full bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Enhance Security
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            {isAdmin && (
              <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h3 className="font-bold text-lg mb-4">Admin Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-left transition-colors"
                  >
                    <Users className="w-5 h-5 text-gray-300" />
                    <span>Manage Team</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/webhooks')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-left transition-colors"
                  >
                    <Zap className="w-5 h-5 text-gray-300" />
                    <span>Configure Webhooks</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/billing')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-left transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-gray-300" />
                    <span>Billing & Usage</span>
                  </button>
                </div>
              </section>
            )}

            {/* Usage Summary Card */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Usage Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate Limit</span>
                  <span>100 req/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Period</span>
                  <span>Nov 1 – Nov 30, 2025</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="font-medium">API Calls</span>
                  <span className="font-mono">{dummyUsageMetrics.apiCalls.toLocaleString()} / 30,000</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (dummyUsageMetrics.apiCalls / 30000) * 100)}%` }}
                  ></div>
                </div>
                <button className="mt-3 w-full text-center text-blue-400 hover:text-blue-300 text-sm">
                  View Full Analytics →
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;