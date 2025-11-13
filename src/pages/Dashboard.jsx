// src/pages/DashboardPage.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  RotateCcw,
  Info,
  ChevronRight,
  Loader,
} from "lucide-react";

// ===============================
// 🔧 Helper: Format relative time (e.g. "2 hours ago")
// ===============================
const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMins / 24);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// ===============================
// 🎨 Reusable Stat Card
// ===============================
const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  trend = "up",
  color = "text-gray-300",
}) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1 text-white">{value}</p>
        {change && (
          <p
            className={`text-sm mt-1 flex items-center gap-1 ${
              trend === "up" ? "text-green-400" : "text-red-400"
            }`}
          >
            <TrendingUp
              className={`w-4 h-4 ${trend === "down" && "rotate-180"}`}
            />
            {change}
          </p>
        )}
      </div>
      <div className="p-3 rounded-xl bg-gray-900/50">
        <Icon className="w-6 h-6 text-gray-300" />
      </div>
    </div>
  </div>
);

// ===============================
// 📄 Document Card Component
// ===============================
const DocumentCard = ({ doc, onAction }) => {
  const request = doc.signingRequests?.[0] || {};
  const signers = request.signers || [];
  const signedCount = signers.filter((s) => s.status === "SIGNED").length;
  const totalSigners = signers.length;

  const statusConfig = useMemo(() => {
    const map = {
      COMPLETED: {
        text: "Completed",
        color: "text-green-400 bg-green-900/20",
        icon: CheckCircle,
      },
      IN_PROGRESS: {
        text: "In Progress",
        color: "text-yellow-400 bg-yellow-900/20",
        icon: Clock,
      },
      PENDING: {
        text: "Pending",
        color: "text-blue-400 bg-blue-900/20",
        icon: Mail,
      },
      DECLINED: {
        text: "Declined",
        color: "text-red-400 bg-red-900/20",
        icon: AlertCircle,
      },
      EXPIRED: {
        text: "Expired",
        color: "text-gray-500 bg-gray-900/20",
        icon: Clock,
      },
      DRAFT: {
        text: "Draft",
        color: "text-gray-400 bg-gray-900/20",
        icon: FileText,
      },
      REVOKED: {
        text: "Revoked",
        color: "text-orange-400 bg-orange-900/20",
        icon: RotateCcw,
      },
    };
    return map[request.status] || map.DRAFT;
  }, [request.status]);

  const Icon = statusConfig.icon;

  return (
    <div className="bg-gray-800/30 hover:bg-gray-800/50 rounded-lg border border-gray-700/50 p-5 transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-white line-clamp-1">{doc.title}</h4>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}
        >
          <Icon className="w-3 h-3" />
          {statusConfig.text}
        </span>
      </div>

      <p className="text-gray-500 text-sm mb-3">
        Created {formatRelativeTime(doc.createdAt)}
        {request.completedAt && request.status === "COMPLETED" && (
          <> • Completed {formatRelativeTime(request.completedAt)}</>
        )}
      </p>

      {totalSigners > 0 && (
        <div className="flex items-center text-gray-400 text-sm mb-4">
          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            {signedCount} of {totalSigners} signed
            {signers.some((s) => s.status === "PENDING") && (
              <span className="ml-2 text-yellow-400">• Action required</span>
            )}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onAction("view", doc.id)}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>

        {request.status === "COMPLETED" && (
          <button
            onClick={() => onAction("download", doc.id)}
            className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        )}

        {["PENDING", "IN_PROGRESS"].includes(request.status) && (
          <button
            onClick={() => onAction("resend", doc.id)}
            className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" /> Resend
          </button>
        )}

        {doc.status === "DRAFT" && (
          <button
            onClick={() => onAction("edit", doc.id)}
            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>
    </div>
  );
};

// ===============================
// 🔑 API Key Card
// ===============================
const ApiKeyCard = ({ apiKey, onCopy }) => {
  // Changed prop name from 'key' to 'apiKey'
  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();
  const expiresInDays = apiKey.expiresAt
    ? Math.ceil(
        (new Date(apiKey.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h5 className="font-medium text-white">
            {apiKey.description || "Untitled Key"}
          </h5>
          <p className="text-gray-500 text-xs mt-1">
            Created {new Date(apiKey.createdAt).toLocaleDateString()}
          </p>
          {apiKey.expiresAt && (
            <p
              className={`text-xs mt-1 flex items-center gap-1 ${
                isExpired
                  ? "text-red-400"
                  : expiresInDays < 15
                  ? "text-yellow-400"
                  : "text-gray-400"
              }`}
            >
              <Calendar className="w-3 h-3" />
              {isExpired
                ? "Expired"
                : expiresInDays < 0
                ? "Expires today"
                : `Expires in ${expiresInDays}d`}
            </p>
          )}
        </div>
        <button
          onClick={() => onCopy(apiKey.id, apiKey.key)}
          className="p-1.5 text-gray-400 hover:text-blue-400 rounded transition-colors"
          aria-label="Copy API key"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 bg-gray-900 rounded p-3">
        <code className="text-gray-300 text-xs font-mono break-all">
          {apiKey?.keyPrefix}••••••••••••••••••••
        </code>
      </div>
    </div>
  );
};

// ===============================
// 🕵️ Audit Log Entry
// ===============================
const AuditLogEntry = ({ log }) => {
  const getIconAndColor = useCallback((action) => {
    if (action.includes("SIGN"))
      return { icon: CheckCircle, color: "text-green-400" };
    if (action.includes("KEY")) return { icon: Key, color: "text-blue-400" };
    if (action.includes("LOGIN")) return { icon: Lock, color: "text-cyan-400" };
    if (action.includes("DOCUMENT"))
      return { icon: FileText, color: "text-gray-400" };
    if (action.includes("WEBHOOK"))
      return { icon: Zap, color: "text-purple-400" };
    return { icon: Activity, color: "text-gray-500" };
  }, []);

  const { icon: Icon, color } = getIconAndColor(log.action);

  return (
    <div className="px-4 py-3 border-l-2 border-gray-700 hover:bg-gray-700/20 transition-colors">
      <div className="flex">
        <div className={`mr-3 mt-0.5 ${color}`}>
          <Icon className="w-4 h-4 flex-shrink-0" />
        </div>
        <div>
          <p className="text-sm">
            <span className="font-medium">{log.action.replace(/_/g, " ")}</span>
            {log.performedBy && (
              <>
                {" by "}
                <span className="text-blue-400">{log.performedBy}</span>
              </>
            )}
            {log.ipAddress && (
              <>
                {" from "}
                <span className="text-gray-500">{log.ipAddress}</span>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// ===============================
// 🧠 MAIN DASHBOARD COMPONENT
// ===============================
export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [data, setData] = useState({
    documents: [],
    apiKeys: [],
    auditLogs: [],
    usage: {
      apiCalls: 0,
      documentsSigned: 0,
      activeRequests: 0,
      activeKeys: 0,
    },
  });
  const [error, setError] = useState(null);

  //useffect to debug
  useEffect(() => {
    console.log(
      data,
      "the current data that we have nowwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"
    );
  }, [data]);

  // ===============================
  // 🔐 Auth Check
  // ===============================
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const storedOrg = JSON.parse(localStorage.getItem("organization"));

      if (!storedUser) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(storedUser);
      setOrganization(storedOrg || { name: "Personal Workspace", id: "org_1" });
    } catch (err) {
      console.error("Auth parse error:", err);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ===============================
  // 📥 Fetch Real Data from API
  // ===============================
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Wait for user to be loaded from auth check

      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const apiKey =
          localStorage.getItem("apiKey") || import.meta.env.VITE_API_KEY;

        if (!token || !apiKey) {
          throw new Error("Authentication credentials missing.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "x-api-key": apiKey,
        };

        // Fetch documents
        const docsResponse = await fetch(
          "http://localhost:3000/api/v1/documents",
          { method: "GET", headers }
        );
        if (!docsResponse.ok) {
          const errorData = await docsResponse.json();
          throw new Error(
            `Failed to fetch documents: ${
              errorData.detail || docsResponse.status
            }`
          );
        }
        const documents = await docsResponse.json();
        console.log("Fetched documents:", documents);

        // Fetch API keys (assuming this endpoint exists)
        const keysResponse = await fetch(
          "http://localhost:3000/api/v1/auth/api-keys",
          { method: "GET", headers }
        );
        if (!keysResponse.ok) {
          const errorData = await keysResponse.json();
          console.warn(
            `Failed to fetch API keys: ${
              errorData.detail || keysResponse.status
            }`
          ); // Don't hard fail on keys
          // setData(prev => ({ ...prev, apiKeys: [] })); // Or set to empty array
        } else {
          const apiKeys = await keysResponse.json();
          setData((prev) => ({ ...prev, apiKeys }));
        }

        // Fetch audit logs (assuming this endpoint exists)
        const logsResponse = await fetch(
          "http://localhost:3000/api/v1/audit-logs",
          { method: "GET", headers }
        ); // Example endpoint
        if (!logsResponse.ok) {
          const errorData = await logsResponse.json();
          console.warn(
            `Failed to fetch audit logs: ${
              errorData.detail || logsResponse.status
            }`
          ); // Don't hard fail on logs
          // setData(prev => ({ ...prev, auditLogs: [] })); // Or set to empty array
        } else {
          const auditLogs = await logsResponse.json();
          setData((prev) => ({ ...prev, auditLogs }));
        }

        // Calculate usage based on fetched data
        const signedDocs = documents?.documents?.filter(
          (d) => d.signingRequests?.[0]?.status === "COMPLETED"
        );
        const activeRequests = documents?.documents?.filter((d) =>
          ["PENDING", "IN_PROGRESS"].includes(d.signingRequests?.[0]?.status)
        ).length;

        setData((prev) => ({
          ...prev,
          documents: documents?.documents,
          usage: {
            apiCalls: prev.usage.apiCalls, // Placeholder, needs backend endpoint
            documentsSigned: signedDocs.length,
            activeRequests,
            activeKeys: prev.apiKeys.length, // Update based on fetched keys
          },
        }));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]); // Only run after user is loaded

  const isAdmin = user?.role === "ADMIN";
  const isSigner = user?.role === "SIGNER";

  // ===============================
  // 🧩 Handlers
  // ===============================
  const handleDocumentAction = useCallback(
    (action, docId) => {
      switch (action) {
        case "view":
          navigate(`/documents/${docId}`);
          break;
        case "download":
          alert(`Download PDF for ${docId}`);
          break;
        case "resend":
          alert(`Resending invite for ${docId}`);
          break;
        case "edit":
          navigate(`/documents/${docId}/edit`);
          break;
        default:
          console.warn("Unknown action:", action);
      }
    },
    [navigate]
  );

  const handleCopyKey = useCallback((keyId, keyValue) => {
    navigator.clipboard
      .writeText(keyValue)
      .then(() => {
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 2000);
      })
      .catch((err) => console.error("Copy failed:", err));
  }, []);

  // ===============================
  // ⏳ Loading State
  // ===============================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your secure workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-red-900/20 border border-red-800/50 rounded-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ===============================
  // 🧾 Render — Role-Optimized
  // ===============================
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* 🎯 Hero */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back,{" "}
                <span className="text-blue-400">{user?.firstName}</span>
              </h1>
              <p className="text-gray-400 mt-1 max-w-2xl">
                {isAdmin
                  ? `Admin dashboard for ${organization.name}. Monitor security, compliance, and usage.`
                  : isSigner
                  ? `You have ${
                      data.documents.filter((d) =>
                        d.signingRequests[0]?.signers?.some(
                          (s) =>
                            s.email === user.email && s.status === "PENDING"
                        )
                      ).length
                    } pending documents to review.`
                  : `Developer workspace for ${organization.name}. Build, test, and integrate securely.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/documents/create")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> New Document
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Shield className="w-4 h-4" /> Admin Console
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 📊 Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="API Calls (30d)"
            value={data.usage.apiCalls.toLocaleString()}
            icon={Zap}
            change="+0%" // Placeholder
          />
          <StatCard
            title="Documents Signed"
            value={data.usage.documentsSigned.toLocaleString()}
            icon={FileText}
            change="+0%" // Placeholder
          />
          <StatCard
            title="Active Requests"
            value={data.usage.activeRequests}
            icon={Users}
            change="+0" // Placeholder
            trend="up"
          />
          <StatCard title="API Keys" value={data.usage.activeKeys} icon={Key} />
        </div>

        {/* 🧩 Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 🔷 Main Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* 📄 Recent Documents */}
            <section className="bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-700/70 flex items-center justify-between">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Recent Documents
                </h2>
                <Link
                  to="/documents"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-5 pt-0 space-y-4">
                {data.documents && data.documents.length > 0 ? (
                  // Sort by createdAt (newest first) and take the latest 5
                  [...data.documents]
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .slice(0, 5)
                    .map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        doc={doc}
                        onAction={handleDocumentAction}
                      />
                    ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto opacity-40 mb-3" />
                    <p>No documents yet.</p>
                    <button
                      onClick={() => navigate("/documents/create")}
                      className="mt-2 text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Create your first document
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 🕵️ Audit Log — Forensics Focus */}
            <section className="bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-700">
              <div className="px-5 py-4 border-b border-gray-700/70">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Audit Trail
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Immutable activity log — GDPR & ISO 27001 compliant
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {data.auditLogs.length > 0 ? (
                  data.auditLogs.map((log, i) => (
                    <AuditLogEntry key={i} log={log} />
                  ))
                ) : (
                  <div className="px-5 py-8 text-center text-gray-500">
                    <Info className="w-10 h-10 mx-auto opacity-50 mb-2" />
                    No audit events yet
                  </div>
                )}
              </div>
              <div className="px-5 py-3 bg-gray-900/30 border-t border-gray-700/50 text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  Export full log (CSV)
                </button>
              </div>
            </section>
          </div>

          {/* 🔶 Sidebar */}
          <div className="space-y-6">
            {/* 🔑 API Keys */}
            <section className="bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-700">
              <div className="px-5 py-4 border-b border-gray-700/70 flex items-center justify-between">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Key className="w-5 h-5" /> API Keys
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => navigate("/settings/api-keys")}
                    className="text-blue-400 hover:text-blue-300"
                    aria-label="Manage API keys"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="p-5 space-y-4">
                {data.apiKeys.map(
                  (
                    apiKey // Changed from 'key' to 'apiKey'
                  ) => (
                    <ApiKeyCard
                      key={apiKey.id}
                      apiKey={apiKey} // Changed prop name
                      onCopy={handleCopyKey}
                    />
                  )
                )}
                {copiedKey && (
                  <div className="flex items-center gap-2 text-green-400 text-sm p-2 bg-green-900/20 rounded">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Copied to clipboard!
                  </div>
                )}
              </div>
            </section>

            {/* 🛡️ Security Posture */}
            <section className="bg-gradient-to-br from-gray-800/40 to-blue-900/20 rounded-xl border border-blue-800/50 p-5">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" /> Security Posture
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">2FA Enforcement</span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <AlertTriangle className="w-3.5 h-3.5" /> Optional
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">IP Allowlisting</span>
                  <span className="text-gray-500">—</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Key Rotation</span>
                  <span className="text-green-400">90 days</span>
                </div>
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Shield className="w-4 h-4" /> Enhance Security
                </button>
              </div>
            </section>

            {/* 📈 Usage Summary */}
            <section className="bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-700 p-5">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" /> Usage Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate Limit</span>
                  <span>100 req/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Period</span>
                  <span>Nov 1–30, 2025</span>
                </div>
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">API Calls</span>
                    <span className="font-mono">
                      {data.usage.apiCalls.toLocaleString()} / 30,000
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (data.usage.apiCalls / 30_000) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  {/* Subscription Link */}
                  <div className="mt-3 text-center">
                    <Link
                      to="/subscription" // Replace with your actual subscription route
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                    >
                      Upgrade Plan <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
