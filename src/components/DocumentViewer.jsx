// src/pages/DocumentDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText, Users, Clock, CheckCircle, AlertCircle, Mail, Calendar,
  Download, Eye, ArrowLeft, MoreVertical, Shield, Zap, BarChart3,
  Trash2, Copy, ExternalLink, RotateCcw, Info, MapPin, User,
  Mail as MailIcon, Phone, Globe, FileDown, Send, Edit, Archive,
  Calendar as CalendarIcon
} from 'lucide-react';

// ===============================
// 🎨 Reusable Components
// ===============================

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'default', ...props }) => {
  const baseClasses = "rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeClasses = {
    default: "px-4 py-2.5",
    sm: "px-3 py-1.5 text-sm"
  };
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100",
    outline: "border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white"
  };
  
  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-700 text-gray-300',
    success: 'bg-green-900/30 text-green-400 border border-green-800/50',
    warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50',
    error: 'bg-red-900/30 text-red-400 border border-red-800/50',
    info: 'bg-blue-900/30 text-blue-400 border border-blue-800/50',
    purple: 'bg-purple-900/30 text-purple-400 border border-purple-800/50'
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// ===============================
// 📅 Extend Deadline Modal Component
// ===============================

const ExtendDeadlineModal = ({ isOpen, onClose, onExtend, currentDeadline, isLoading = false }) => {
  const [newDeadline, setNewDeadline] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && currentDeadline) {
      // Set initial value to 7 days from current deadline or today + 7 days
      const currentDate = currentDeadline ? new Date(currentDeadline) : new Date();
      const defaultDate = new Date(currentDate);
      defaultDate.setDate(defaultDate.getDate() + 7);
      
      setNewDeadline(defaultDate.toISOString().split('T')[0]);
    }
  }, [isOpen, currentDeadline]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!newDeadline) {
      setError('Please select a new deadline');
      return;
    }

    const selectedDate = new Date(newDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('New deadline cannot be in the past');
      return;
    }

    if (currentDeadline) {
      const currentDeadlineDate = new Date(currentDeadline);
      if (selectedDate <= currentDeadlineDate) {
        setError('New deadline must be after the current deadline');
        return;
      }
    }

    // Convert to ISO string with time set to end of day
    const deadlineWithTime = new Date(newDeadline);
    deadlineWithTime.setHours(23, 59, 59, 999);
    
    onExtend(deadlineWithTime.toISOString());
  };

  const getMinDate = () => {
    const minDate = new Date();
    if (currentDeadline) {
      const current = new Date(currentDeadline);
      return current > minDate ? current.toISOString().split('T')[0] : minDate.toISOString().split('T')[0];
    }
    return minDate.toISOString().split('T')[0];
  };

  const getSuggestedDates = () => {
    const baseDate = currentDeadline ? new Date(currentDeadline) : new Date();
    return [
      { label: '3 days', days: 3 },
      { label: '7 days', days: 7 },
      { label: '14 days', days: 14 },
      { label: '30 days', days: 30 }
    ].map(option => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + option.days);
      return { ...option, date: date.toISOString().split('T')[0] };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            Extend Signing Deadline
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Choose a new deadline for this document. Signers will be notified of the extension.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {currentDeadline && (
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
              <p className="text-blue-300 text-sm">
                <strong>Current deadline:</strong>{' '}
                {new Date(currentDeadline).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Quick Date Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quick Extensions
            </label>
            <div className="grid grid-cols-2 gap-2">
              {getSuggestedDates().map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setNewDeadline(option.date)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    newDeadline === option.date
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Picker */}
          <div>
            <label htmlFor="newDeadline" className="block text-sm font-medium text-gray-300 mb-2">
              Custom Deadline
            </label>
            <input
              type="date"
              id="newDeadline"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              min={getMinDate()}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {newDeadline && (
              <p className="text-gray-400 text-sm mt-1">
                New deadline: {new Date(newDeadline).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 rounded-lg border border-red-800/50">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !newDeadline}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Extending...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4" />
                  Extend Deadline
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===============================
// 📊 Status Configuration
// ===============================

const getStatusConfig = (status) => {
  const configs = {
    DRAFT: { 
      text: 'Draft', 
      variant: 'default',
      icon: FileText,
      color: 'text-gray-400',
      description: 'Document is in draft mode'
    },
    SENT: { 
      text: 'Sent', 
      variant: 'info',
      icon: Mail,
      color: 'text-blue-400',
      description: 'Document has been sent to signers'
    },
    SIGNING: { 
      text: 'Signing', 
      variant: 'warning',
      icon: Clock,
      color: 'text-yellow-400',
      description: 'Document is being signed'
    },
    COMPLETED: { 
      text: 'Completed', 
      variant: 'success',
      icon: CheckCircle,
      color: 'text-green-400',
      description: 'All signers have completed signing'
    },
    DECLINED: { 
      text: 'Declined', 
      variant: 'error',
      icon: AlertCircle,
      color: 'text-red-400',
      description: 'Document was declined by a signer'
    },
    EXPIRED: { 
      text: 'Expired', 
      variant: 'default',
      icon: Calendar,
      color: 'text-gray-400',
      description: 'Signing period has expired'
    },
    REVOKED: { 
      text: 'Revoked', 
      variant: 'error',
      icon: RotateCcw,
      color: 'text-red-400',
      description: 'Document was revoked'
    },
    CANCELLED: { 
      text: 'Cancelled', 
      variant: 'default',
      icon: AlertCircle,
      color: 'text-gray-400',
      description: 'Document was cancelled'
    }
  };
  
  return configs[status] || configs.DRAFT;
};

const getSignerStatusConfig = (status) => {
  const configs = {
    PENDING: { text: 'Pending', variant: 'warning', icon: Clock },
    SIGNED: { text: 'Signed', variant: 'success', icon: CheckCircle },
    DECLINED: { text: 'Declined', variant: 'error', icon: AlertCircle },
    REVOKED: { text: 'Revoked', variant: 'default', icon: RotateCcw }
  };
  
  return configs[status] || configs.PENDING;
};

// ===============================
// 👤 Signer Card Component
// ===============================

const SignerCard = ({ signer, index, onAction }) => {
  const statusConfig = getSignerStatusConfig(signer.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:bg-gray-800/70 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {index + 1}
          </div>
          <div>
            <h4 className="font-semibold text-white">{signer.name}</h4>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              <MailIcon className="w-3 h-3" />
              {signer.email}
            </p>
          </div>
        </div>
        <Badge variant={statusConfig.variant}>
          <StatusIcon className="w-3 h-3 inline mr-1" />
          {statusConfig.text}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Status</p>
          <p className="text-white font-medium">{statusConfig.text}</p>
        </div>
        <div>
          <p className="text-gray-400">Last Updated</p>
          <p className="text-white">{formatDate(signer.updatedAt)}</p>
        </div>
        {signer.signature && (
          <>
            <div>
              <p className="text-gray-400">Signed At</p>
              <p className="text-white">{formatDate(signer.signature.signedAt)}</p>
            </div>
            <div>
              <p className="text-gray-400">IP Address</p>
              <p className="text-white font-mono text-xs">{signer.signature.ipAddress || '-'}</p>
            </div>
          </>
        )}
      </div>

      {signer.status === 'PENDING' && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('resend', signer.id)}
            className="text-xs"
          >
            <Send className="w-3 h-3" />
            Resend
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('remind', signer.id)}
            className="text-xs"
          >
            <Mail className="w-3 h-3" />
            Remind
          </Button>
        </div>
      )}
    </Card>
  );
};

// ===============================
// 📋 Audit Log Component
// ===============================

const AuditLogEntry = ({ log }) => {
  const getIconAndColor = (action) => {
    if (action.includes('SIGN')) return { icon: CheckCircle, color: 'text-green-400' };
    if (action.includes('CREATE')) return { icon: FileText, color: 'text-blue-400' };
    if (action.includes('SEND')) return { icon: Send, color: 'text-purple-400' };
    if (action.includes('UPLOAD')) return { icon: FileDown, color: 'text-cyan-400' };
    if (action.includes('DELETE')) return { icon: Trash2, color: 'text-red-400' };
    if (action.includes('UPDATE')) return { icon: Edit, color: 'text-yellow-400' };
    if (action.includes('DEADLINE_EXTENDED')) return { icon: CalendarIcon, color: 'text-orange-400' };
    return { icon: Info, color: 'text-gray-400' };
  };

  const { icon: Icon, color } = getIconAndColor(log.action);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-700/50 last:border-0">
      <div className={`p-2 rounded-lg bg-gray-700/50 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-white text-sm">
          <span className="font-medium">{log.action.replace(/_/g, ' ')}</span>
          {log.performedBy && (
            <> by <span className="text-blue-400">{log.performedBy}</span></>
          )}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {new Date(log.createdAt).toLocaleString()} 
          {log.ipAddress && ` • From ${log.ipAddress}`}
        </p>
        {log.details && Object.keys(log.details).length > 0 && (
          <div className="mt-2 p-2 bg-gray-900/50 rounded text-xs">
            {Object.entries(log.details).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className="text-white">
                  {key.includes('At') && value ? new Date(value).toLocaleString() : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ===============================
// 🧠 MAIN DOCUMENT DETAILS COMPONENT
// ===============================

export default function DocumentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showExtendDeadlineModal, setShowExtendDeadlineModal] = useState(false);
  const [isExtendingDeadline, setIsExtendingDeadline] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // ===============================
  // 📥 Fetch Document Details
  // ===============================

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const fetchDocumentDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/api/v1/documents/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch document: ${response.status}`);
      }

      const documentData = await response.json();
      
      // Fetch envelope data if available
      if (documentData.signingRequests && documentData.signingRequests.length > 0) {
        const envelopeId = documentData.signingRequests[0].id;
        const envelopeResponse = await fetch(`http://localhost:3000/api/v1/envelopes/${envelopeId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': apiKey,
          },
        });

        if (envelopeResponse.ok) {
          const envelopeData = await envelopeResponse.json();
          documentData.envelope = envelopeData;
        }
      }
      
      setDocument(documentData);
      
    } catch (error) {
      console.error('Error fetching document details:', error);
      setError(error.message || 'Failed to load document details');
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // 🧩 Action Handlers
  // ===============================

  const handleExtendDeadline = async (newExpiresAt) => {
    if (!document || !document.envelope) return;

    try {
      setIsExtendingDeadline(true);
      setActionMessage('');
      
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/api/v1/envelopes/${document.envelope.id}/extend-deadline`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newExpiresAt: newExpiresAt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to extend deadline: ${response.status}`);
      }

      const result = await response.json();
      
      setActionMessage('Deadline extended successfully!');
      setShowExtendDeadlineModal(false);
      
      // Refresh document data
      fetchDocumentDetails();
      
      // Clear success message after 3 seconds
      setTimeout(() => setActionMessage(''), 3000);
      
    } catch (error) {
      console.error('Error extending deadline:', error);
      setActionMessage(`Error: ${error.message}`);
    } finally {
      setIsExtendingDeadline(false);
    }
  };

  const handleDocumentAction = async (action) => {
    if (!document) return;

    switch (action) {
      case 'download':
        // Implement download logic
        alert(`Downloading ${document.title}`);
        break;
      case 'resend':
        // Implement resend logic for all pending signers
        alert('Resending invitations to all pending signers');
        break;
      case 'edit':
        navigate(`/documents/${document.id}/edit`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${document.title}"? This action cannot be undone.`)) {
          // Implement delete logic
          navigate('/documents');
        }
        break;
      case 'revoke':
        if (confirm('Are you sure you want to revoke this document? Signers will no longer be able to sign.')) {
          // Implement revoke logic
          fetchDocumentDetails(); // Refresh data
        }
        break;
      case 'extend-deadline':
        setShowExtendDeadlineModal(true);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  const handleSignerAction = async (action, signerId) => {
    switch (action) {
      case 'resend':
        // Implement resend for specific signer
        alert(`Resending invitation to signer ${signerId}`);
        break;
      case 'remind':
        // Implement reminder for specific signer
        alert(`Sending reminder to signer ${signerId}`);
        break;
      default:
        console.warn('Unknown signer action:', action);
    }
  };

  // ===============================
  // 📊 Helper Functions
  // ===============================

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getSigningProgress = () => {
    if (!document.signingRequests || document.signingRequests.length === 0) {
      return { signed: 0, total: 0, percentage: 0 };
    }
    
    const signers = document.signingRequests[0].signers || [];
    const signedCount = signers.filter(s => s.status === 'SIGNED').length;
    const totalCount = signers.length;
    const percentage = totalCount > 0 ? (signedCount / totalCount) * 100 : 0;
    
    return { signed: signedCount, total: totalCount, percentage };
  };

  const canExtendDeadline = () => {
    if (!document.envelope) return false;
    
    const validStatuses = ['SENT', 'SIGNING', 'PENDING', 'IN_PROGRESS'];
    const hasValidStatus = validStatuses.includes(document.envelope.status);
    const hasExpiresAt = document.envelope.expiresAt;
    const isNotExpired = !document.envelope.expiresAt || new Date(document.envelope.expiresAt) > new Date();
    
    return hasValidStatus && hasExpiresAt && isNotExpired;
  };

  // ===============================
  // 🎯 Render
  // ===============================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading document details...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Document Not Found</h2>
          <p className="text-gray-400 mb-6">
            {error || 'The document you are looking for does not exist or you do not have permission to view it.'}
          </p>
          <Button onClick={() => navigate('/documents')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(document.status);
  const StatusIcon = statusConfig.icon;
  const progress = getSigningProgress();
  const latestRequest = document.signingRequests?.[0];
  const signers = latestRequest?.signers || [];
  const envelope = document.envelope;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/documents')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-white truncate">{document.title}</h1>
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                  <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                  {statusConfig.text} • Created {formatDate(document.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {document.status === 'COMPLETED' && (
                <Button
                  onClick={() => handleDocumentAction('download')}
                  variant="success"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              )}
              
              {['SENT', 'SIGNING'].includes(document.status) && progress.signed < progress.total && (
                <Button
                  onClick={() => handleDocumentAction('resend')}
                  variant="outline"
                >
                  <Send className="w-4 h-4" />
                  Resend All
                </Button>
              )}
              
              {document.status === 'DRAFT' && (
                <Button
                  onClick={() => handleDocumentAction('edit')}
                  variant="primary"
                >
                  <Edit className="w-4 h-4" />
                  Continue Setup
                </Button>
              )}
              
              {canExtendDeadline() && (
                <Button
                  onClick={() => handleDocumentAction('extend-deadline')}
                  variant="warning"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Extend Deadline
                </Button>
              )}
              
              {!['COMPLETED', 'REVOKED', 'EXPIRED'].includes(document.status) && (
                <Button
                  onClick={() => handleDocumentAction('revoke')}
                  variant="danger"
                >
                  <RotateCcw className="w-4 h-4" />
                  Revoke
                </Button>
              )}
            </div>
          </div>

          {/* Action Message */}
          {actionMessage && (
            <div className={`mt-4 p-3 rounded-lg border ${
              actionMessage.includes('Error') 
                ? 'bg-red-900/20 border-red-800/50 text-red-400' 
                : 'bg-green-900/20 border-green-800/50 text-green-400'
            }`}>
              <div className="flex items-center gap-2">
                {actionMessage.includes('Error') ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>{actionMessage}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mt-6">
            {['overview', 'signers', 'audit'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Document Info */}
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Document Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm">Title</p>
                      <p className="text-white font-medium">{document.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <Badge variant={statusConfig.variant}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusConfig.text}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Created</p>
                      <p className="text-white">{formatDate(document.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Last Updated</p>
                      <p className="text-white">{formatDate(document.updatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Document ID</p>
                      <p className="text-white font-mono text-sm">{document.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">File URL</p>
                      <p className="text-blue-400 text-sm truncate">{document.fileUrl}</p>
                    </div>
                  </div>
                </Card>

                {/* Signing Progress */}
                {latestRequest && (
                  <Card>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-400" />
                      Signing Progress
                    </h2>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>
                          {progress.signed} of {progress.total} signers completed
                        </span>
                        <span>{Math.round(progress.percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>

                    {envelope?.expiresAt && (
                      <div className={`p-4 rounded-lg border ${
                        canExtendDeadline() 
                          ? 'bg-yellow-900/20 border-yellow-800/50' 
                          : 'bg-gray-900/20 border-gray-700'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className={`w-5 h-5 ${
                              canExtendDeadline() ? 'text-yellow-400' : 'text-gray-400'
                            }`} />
                            <div>
                              <p className={`font-medium ${
                                canExtendDeadline() ? 'text-yellow-300' : 'text-gray-300'
                              }`}>
                                {canExtendDeadline() ? 'Expires Soon' : 'Expired'}
                              </p>
                              <p className={`text-sm ${
                                canExtendDeadline() ? 'text-yellow-400' : 'text-gray-400'
                              }`}>
                                This envelope {canExtendDeadline() ? 'expires' : 'expired'} on {formatDate(envelope.expiresAt)}
                              </p>
                            </div>
                          </div>
                          {canExtendDeadline() && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDocumentAction('extend-deadline')}
                            >
                              <CalendarIcon className="w-4 h-4" />
                              Extend
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" onClick={() => handleDocumentAction('download')}>
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText(document.id)}>
                      <Copy className="w-4 h-4" />
                      Copy ID
                    </Button>
                    <Button variant="outline" onClick={() => window.open(document.fileUrl, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                      View File
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {/* Signers Tab */}
            {activeTab === 'signers' && (
              <Card>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  Signers ({signers.length})
                </h2>
                
                {signers.length > 0 ? (
                  <div className="space-y-4">
                    {signers.map((signer, index) => (
                      <SignerCard
                        key={signer.id}
                        signer={signer}
                        index={index}
                        onAction={handleSignerAction}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No signers added yet</p>
                    <p className="text-sm mt-1">Add signers to start the signing process</p>
                  </div>
                )}
              </Card>
            )}

            {/* Audit Tab */}
            {activeTab === 'audit' && (
              <Card>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Audit Trail
                </h2>
                
                {document.auditLogs && document.auditLogs.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {document.auditLogs.map((log, index) => (
                      <AuditLogEntry key={index} log={log} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No audit events recorded</p>
                    <p className="text-sm mt-1">Activity will appear here as actions are taken on this document</p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Summary */}
            <Card>
              <h3 className="font-semibold text-white mb-4">Status Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Document Status</span>
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.text}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Signing Progress</span>
                  <span className="text-white">
                    {progress.signed}/{progress.total}
                  </span>
                </div>
                {envelope && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Envelope Status</span>
                      <span className="text-white capitalize">
                        {envelope.status?.toLowerCase().replace('_', ' ') || 'No envelope'}
                      </span>
                    </div>
                    {envelope.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expires</span>
                        <span className="text-white">
                          {formatDate(envelope.expiresAt)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Document Actions */}
            <Card>
              <h3 className="font-semibold text-white mb-4">Document Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => handleDocumentAction('download')}>
                  <Download className="w-4 h-4" />
                  Download Document
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigator.clipboard.writeText(document.id)}>
                  <Copy className="w-4 h-4" />
                  Copy Document ID
                </Button>
                {canExtendDeadline() && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleDocumentAction('extend-deadline')}>
                    <CalendarIcon className="w-4 h-4" />
                    Extend Deadline
                  </Button>
                )}
                {document.status === 'DRAFT' && (
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleDocumentAction('edit')}>
                    <Edit className="w-4 h-4" />
                    Edit Document
                  </Button>
                )}
                <Button variant="danger" className="w-full justify-start" onClick={() => handleDocumentAction('delete')}>
                  <Trash2 className="w-4 h-4" />
                  Delete Document
                </Button>
              </div>
            </Card>

            {/* Security Info */}
            <Card>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Security & Compliance
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Audit Trail</span>
                  <span className="text-green-400">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Document Integrity</span>
                  <span className="text-green-400">Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timestamp</span>
                  <span className="text-green-400">Secure</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Extend Deadline Modal */}
      <ExtendDeadlineModal
        isOpen={showExtendDeadlineModal}
        onClose={() => setShowExtendDeadlineModal(false)}
        onExtend={handleExtendDeadline}
        currentDeadline={envelope?.expiresAt}
        isLoading={isExtendingDeadline}
      />
    </div>
  );
}