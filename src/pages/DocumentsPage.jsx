// src/pages/DocumentsPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Calendar,
  Download,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronRight,
  Shield,
  Zap,
  BarChart3,
  Trash2,
  Copy,
  ExternalLink,
  RotateCcw,
  Info,
  ArrowUpDown,
  FileSearch,
  Loader,
} from "lucide-react";

// ===============================
// 🎨 Reusable Components
// ===============================

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, variant = "primary", ...props }) => {
  const baseClasses =
    "px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100",
    outline:
      "border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-700 text-gray-300",
    success: "bg-green-900/30 text-green-400 border border-green-800/50",
    warning: "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50",
    error: "bg-red-900/30 text-red-400 border border-red-800/50",
    info: "bg-blue-900/30 text-blue-400 border border-blue-800/50",
    purple: "bg-purple-900/30 text-purple-400 border border-purple-800/50",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

// ===============================
// 📊 Status Configuration
// ===============================

const getStatusConfig = (status) => {
  const configs = {
    DRAFT: {
      text: "Draft",
      variant: "default",
      icon: FileText,
      color: "text-gray-400",
    },
    SENT: {
      text: "Sent",
      variant: "info",
      icon: Mail,
      color: "text-blue-400",
    },
    SIGNING: {
      text: "Signing",
      variant: "warning",
      icon: Clock,
      color: "text-yellow-400",
    },
    COMPLETED: {
      text: "Completed",
      variant: "success",
      icon: CheckCircle,
      color: "text-green-400",
    },
    DECLINED: {
      text: "Declined",
      variant: "error",
      icon: AlertCircle,
      color: "text-red-400",
    },
    EXPIRED: {
      text: "Expired",
      variant: "default",
      icon: Calendar,
      color: "text-gray-400",
    },
    REVOKED: {
      text: "Revoked",
      variant: "error",
      icon: RotateCcw,
      color: "text-red-400",
    },
    CANCELLED: {
      text: "Cancelled",
      variant: "default",
      icon: AlertCircle,
      color: "text-gray-400",
    },
  };

  return configs[status] || configs.DRAFT;
};

// ===============================
// 📄 Document Card Component
// ===============================

const DocumentCard = ({ document: doc, onAction }) => {
  const [showMenu, setShowMenu] = useState(false);
  const statusConfig = getStatusConfig(doc.status);
  const StatusIcon = statusConfig.icon;

  const latestRequest = doc.signingRequests?.[0];
  const signers = latestRequest?.signers || [];
  const signedCount = signers.filter((s) => s.status === "SIGNED").length;
  const totalSigners = signers.length;
  const pendingSigners = signers.filter((s) => s.status === "PENDING").length;
  const completionPercentage =
    totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
    }
  }, [showMenu]);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (e, action) => {
    e.stopPropagation();
    onAction(action, doc.id);
    setShowMenu(false);
  };

  return (
    <Card className="hover:bg-gray-800/70 transition-all duration-200 group relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors cursor-pointer"
              onClick={() => onAction("view", doc.id)}
            >
              {doc.title}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Created {formatRelativeTime(doc.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={statusConfig.variant}>
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {statusConfig.text}
          </Badge>

          <div className="relative">
            <button
              onClick={handleMenuToggle}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={(e) => handleMenuAction(e, "view")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>

                  {doc.status === "COMPLETED" && (
                    <button
                      onClick={(e) => handleMenuAction(e, "download")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  )}

                  {["SENT", "SIGNING"].includes(doc.status) &&
                    pendingSigners > 0 && (
                      <button
                        onClick={(e) => handleMenuAction(e, "resend")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Resend Invites
                      </button>
                    )}

                  {doc.status === "DRAFT" && (
                    <button
                      onClick={(e) => handleMenuAction(e, "edit")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Continue Setup
                    </button>
                  )}

                  <div className="border-t border-gray-700 my-1"></div>

                  <button
                    onClick={(e) => handleMenuAction(e, "delete")}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signing Progress */}
      {totalSigners > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {signedCount} of {totalSigners} signed
              {pendingSigners > 0 && (
                <span className="text-yellow-400 ml-2">
                  • {pendingSigners} pending
                </span>
              )}
            </span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Document Metadata */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-400">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {latestRequest ? "Envelope" : "Document"}
          </span>
          {latestRequest?.expiresAt &&
            new Date(latestRequest.expiresAt) > new Date() && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Expires {formatRelativeTime(latestRequest.expiresAt)}
              </span>
            )}
        </div>

        <button
          onClick={() => onAction("view", doc.id)}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform"
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};

// ===============================
// 🔍 Filter & Search Components
// ===============================

const FilterDropdown = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-lg text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
      >
        {label}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            <div className="py-1 max-h-60 overflow-y-auto">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...value, option.value]);
                      } else {
                        onChange(value.filter((v) => v !== option.value));
                      }
                    }}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300 flex items-center justify-between w-full">
                    {option.label}
                    <span className="text-gray-500 text-xs">
                      {option.count}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ===============================
// 🧠 MAIN DOCUMENTS PAGE COMPONENT
// ===============================

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [sortBy, setSortBy] = useState("newest");

  // ===============================
  // 📥 Fetch Documents
  // ===============================

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError("");
      const apiKey =
        localStorage.getItem("apiKey") || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/api/v1/documents", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError(error.message || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // 🎛️ Filtering & Sorting
  // ===============================

  const statusCounts = useMemo(() => {
    const counts = {
      DRAFT: 0,
      SENT: 0,
      SIGNING: 0,
      COMPLETED: 0,
      DECLINED: 0,
      EXPIRED: 0,
      REVOKED: 0,
      CANCELLED: 0,
    };

    documents.forEach((doc) => {
      counts[doc.status] = (counts[doc.status] || 0) + 1;
    });

    return counts;
  }, [documents]);

  const statusOptions = [
    { value: "DRAFT", label: "Draft", count: statusCounts.DRAFT },
    { value: "SENT", label: "Sent", count: statusCounts.SENT },
    { value: "SIGNING", label: "Signing", count: statusCounts.SIGNING },
    { value: "COMPLETED", label: "Completed", count: statusCounts.COMPLETED },
    { value: "DECLINED", label: "Declined", count: statusCounts.DECLINED },
    { value: "EXPIRED", label: "Expired", count: statusCounts.EXPIRED },
  ];

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus.length > 0) {
      filtered = filtered.filter((doc) => selectedStatus.includes(doc.status));
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchTerm, selectedStatus, sortBy]);

  // ===============================
  // 🧩 Action Handlers
  // ===============================

  const handleDocumentAction = async (action, documentId) => {
    const document = documents.find((d) => d.id === documentId);
    console.log("the document", document);

    switch (action) {
      case "view":
        navigate(`/documents/${documentId}`);
        break;
      case "download":
        // Implement download logic
        alert(`Downloading ${document?.title}`);
        break;
      case "resend":
        // Implement resend logic
        alert(`Resending invites for ${document?.title}`);
        break;
      case "edit":
        navigate(`/documents/${documentId}/edit`);
        break;
      case "delete":
        if (
          confirm(
            `Are you sure you want to delete "${document?.title}"? This action cannot be undone.`
          )
        ) {
          try {
            // Implement delete API call here
            const apiKey =
              localStorage.getItem("apiKey") || import.meta.env.VITE_API_KEY;
            const token = localStorage.getItem("token");
            const id=documentId;

            const response = await fetch(
              `http://localhost:3000/api/v1/documents/${id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "x-api-key": apiKey,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              throw new Error(
                `Failed to delete document: ${response.status} ${response.statusText}` +
                  (errorData ? ` - ${JSON.stringify(errorData)}` : "")
              );
            }

            const result = await response.json(); // Assuming your API returns JSON
            setDocuments((prev) => prev.filter((d) => d.id !== documentId));
          } catch (error) {
            alert("Failed to delete document");
          }
        }
        break;
      default:
        console.warn("Unknown action:", action);
    }
  };

  // ===============================
  // 📊 Statistics
  // ===============================

  const stats = useMemo(() => {
    const totalSignatures = documents.reduce((acc, doc) => {
      const signers = doc.signingRequests?.[0]?.signers || [];
      return acc + signers.filter((s) => s.status === "SIGNED").length;
    }, 0);

    const inProgress = documents.filter((d) =>
      ["SENT", "SIGNING"].includes(d.status)
    ).length;
    const completed = documents.filter((d) => d.status === "COMPLETED").length;
    const awaitingAction = documents.reduce((acc, doc) => {
      const signers = doc.signingRequests?.[0]?.signers || [];
      return acc + signers.filter((s) => s.status === "PENDING").length;
    }, 0);

    return { totalSignatures, inProgress, completed, awaitingAction };
  }, [documents]);

  // ===============================
  // 🎯 Render
  // ===============================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Documents
              </h1>
              <p className="text-gray-400 mt-1">
                Manage and track all your signing documents
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/documents/create")}
                variant="primary"
              >
                <Plus className="w-4 h-4" />
                New Document
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Failed to load documents</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchDocuments}
                className="ml-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="text-center hover:bg-gray-800/70 transition-colors">
            <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{documents.length}</p>
            <p className="text-gray-400 text-sm">Total Documents</p>
          </Card>

          <Card className="text-center hover:bg-gray-800/70 transition-colors">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
            <p className="text-gray-400 text-sm">Completed</p>
          </Card>

          <Card className="text-center hover:bg-gray-800/70 transition-colors">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
            <p className="text-gray-400 text-sm">In Progress</p>
          </Card>

          <Card className="text-center hover:bg-gray-800/70 transition-colors">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {stats.totalSignatures}
            </p>
            <p className="text-gray-400 text-sm">Total Signatures</p>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search documents by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <FilterDropdown
                label={`Status ${
                  selectedStatus.length > 0 ? `(${selectedStatus.length})` : ""
                }`}
                options={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="status">Status</option>
              </select>

              {(searchTerm || selectedStatus.length > 0) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus([]);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Documents Grid */}
        {filteredAndSortedDocuments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 relative">
            {filteredAndSortedDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onAction={handleDocumentAction}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <FileSearch className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {documents.length === 0
                ? "No documents yet"
                : "No documents found"}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {documents.length === 0
                ? "Get started by creating your first signing document. Upload a PDF and send it to signers for electronic signatures."
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            <Button
              onClick={() => navigate("/documents/create")}
              variant="primary"
            >
              <Plus className="w-4 h-4" />
              Create Your First Document
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
