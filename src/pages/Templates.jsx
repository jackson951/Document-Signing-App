// src/pages/TemplatesPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Upload, Search, Filter, Users, Download, 
  Eye, Edit, Trash2, Copy, Star, Building, Clock, CheckCircle,
  ArrowRight, FolderOpen, Shield, Zap, LayoutTemplate, X,
  AlertCircle, RefreshCw, CreditCard, Lock, AlertTriangle
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
    info: 'bg-blue-900/30 text-blue-400 border border-blue-800/50',
    purple: 'bg-purple-900/30 text-purple-400 border border-purple-800/50',
    danger: 'bg-red-900/30 text-red-400 border border-red-800/50'
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="aspect-video bg-gray-700 rounded-lg"></div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-700 rounded w-16"></div>
            <div className="h-8 bg-gray-700 rounded w-24"></div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ===============================
// 🚨 Enhanced Error Display Components
// ===============================

const ErrorDisplay = ({ error, onRetry }) => {
  // Determine error type and appropriate UI
  const getErrorConfig = () => {
    if (!error) return null;

    // Check for subscription errors (402 status)
    if (error.status === 402 || error.detail?.includes('subscription') || error.title?.includes('Payment Required')) {
      return {
        icon: CreditCard,
        title: 'Subscription Required',
        message: error.detail || 'Your organization does not have an active subscription to access templates.',
        variant: 'warning',
        actions: [
          {
            label: 'Upgrade Plan',
            variant: 'primary',
            onClick: () =>window.location.href = '/subscription'
          },
          {
            label: 'Contact Support',
            variant: 'outline', 
            onClick: () => window.open('mailto:support@docsign.com', '_blank')
          }
        ]
      };
    }

    // Check for authentication errors (401 status)
    if (error.status === 401 || error.detail?.includes('authentication') || error.detail?.includes('log in')) {
      return {
        icon: Lock,
        title: 'Authentication Required',
        message: error.detail || 'Please log in again to access templates.',
        variant: 'danger',
        actions: [
          {
            label: 'Log In Again',
            variant: 'primary',
            onClick: () => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }
          }
        ]
      };
    }

    // Check for permission errors (403 status)
    if (error.status === 403) {
      return {
        icon: AlertTriangle,
        title: 'Access Denied',
        message: error.detail || 'You do not have permission to access templates.',
        variant: 'danger',
        actions: [
          {
            label: 'Request Access',
            variant: 'outline',
            onClick: () => window.open('mailto:admin@yourcompany.com', '_blank')
          }
        ]
      };
    }

    // Generic server errors (500 status)
    if (error.status >= 500) {
      return {
        icon: AlertCircle,
        title: 'Server Error',
        message: error.detail || 'Our servers are experiencing issues. Please try again later.',
        variant: 'danger',
        actions: [
          {
            label: 'Try Again',
            variant: 'primary',
            onClick: onRetry
          },
          {
            label: 'Check Status',
            variant: 'outline',
            onClick: () => window.open('/status', '_blank')
          }
        ]
      };
    }

    // Network or other errors
    return {
      icon: AlertCircle,
      title: 'Failed to Load Templates',
      message: error.detail || error.message || 'Unable to connect to the server. Please check your connection.',
      variant: 'danger',
      actions: [
        {
          label: 'Try Again',
          variant: 'primary',
          onClick: onRetry
        },
        {
          label: 'Check Connection',
          variant: 'outline',
          onClick: () => window.location.reload()
        }
      ]
    };
  };

  const errorConfig = getErrorConfig();
  if (!errorConfig) return null;

  const ErrorIcon = errorConfig.icon;

  return (
    <Card className="text-center py-16">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
        errorConfig.variant === 'warning' ? 'bg-yellow-900/20 text-yellow-400' :
        errorConfig.variant === 'danger' ? 'bg-red-900/20 text-red-400' :
        'bg-blue-900/20 text-blue-400'
      }`}>
        <ErrorIcon className="w-8 h-8" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">{errorConfig.title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{errorConfig.message}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {errorConfig.actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            onClick={action.onClick}
            className="min-w-32 justify-center"
          >
            {action.label}
          </Button>
        ))}
        {onRetry && !errorConfig.actions.some(action => action.label === 'Try Again') && (
          <Button variant="outline" onClick={onRetry} className="min-w-32 justify-center">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>

      {/* Show error details in development */}
      {process.env.NODE_ENV === 'development' && error.rawError && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700 text-left">
          <p className="text-gray-400 text-sm font-mono break-all">
            Debug: {JSON.stringify(error.rawError)}
          </p>
        </div>
      )}
    </Card>
  );
};

// ===============================
// 📄 Template Card Components
// ===============================

const TemplateCard = ({ template, onUse, onPreview, onEdit, onDelete, isCustom = false }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:bg-gray-800/70 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${
            isCustom ? 'bg-blue-600/20' : 'bg-purple-600/20'
          } group-hover:scale-105 transition-transform`}>
            <FileText className={`w-5 h-5 ${isCustom ? 'text-blue-400' : 'text-purple-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
              {template.name}
            </h3>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
              {isCustom ? (
                <>
                  <Building className="w-3 h-3" />
                  Your Template • {formatDate(template.createdAt)}
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3" />
                  DocSign Template
                </>
              )}
            </p>
          </div>
        </div>
        
        {isCustom && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onEdit(template);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      onPreview(template);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(template.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy ID
                  </button>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button
                    onClick={() => {
                      onDelete(template);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div 
          onClick={() => onPreview(template)}
          className="aspect-video bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center cursor-pointer hover:border-gray-600 transition-colors"
        >
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">PDF Template</p>
            <p className="text-gray-500 text-xs">Click to preview</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant={isCustom ? 'info' : 'purple'}>
          {isCustom ? 'Custom' : 'Standard'}
        </Badge>
        
        <Button
          onClick={() => onUse(template)}
          variant={isCustom ? 'primary' : 'outline'}
          size="sm"
          className="group-hover:translate-x-1 transition-transform"
        >
          Use Template
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

// ===============================
// 📤 Create Template Modal
// ===============================

const CreateTemplateModal = ({ isOpen, onClose, onCreate }) => {
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    file: null
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError('');
    
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 25 * 1024 * 1024) { // 25MB
        setError('File size must be less than 25MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        file,
        name: prev.name || file.name.replace('.pdf', '')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.file || !formData.name.trim()) {
      setError('Please provide a name and select a PDF file');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(formData);
      setFormData({ name: '', file: null });
      onClose();
    } catch (error) {
      console.error('Error creating template:', error);
      setError(error.message || 'Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', file: null });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-blue-400" />
            Create New Template
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Employment Agreement, NDA"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PDF Document
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-300 font-medium">
                {formData.file ? 'Document Ready' : 'Drop your PDF here or click to browse'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Maximum file size: 25MB
              </p>
              {formData.file && (
                <p className="text-green-400 text-sm mt-2 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {formData.file.name} ({(formData.file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formData.file}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <LayoutTemplate className="w-4 h-4" />
                  Create Template
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
// 🎛️ Filter & Search Components
// ===============================

const FilterSection = ({ searchTerm, onSearchChange, activeTab, onTabChange, templates }) => {
  const tabs = [
    { id: 'all', label: 'All Templates', count: templates.length },
    { id: 'custom', label: 'My Templates', count: templates.filter(t => t.isCustom).length },
    { id: 'predefined', label: 'DocSign Templates', count: templates.filter(t => !t.isCustom).length }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mt-6">
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
      
      <div className="w-full lg:max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

// ===============================
// 🧠 MAIN TEMPLATES PAGE COMPONENT
// ===============================

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editName, setEditName] = useState('');

  // ===============================
  // 📥 Enhanced Fetch Templates with Better Error Handling
  // ===============================

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      if (!token && !apiKey) {
        throw { 
          status: 401, 
          detail: 'Authentication required. Please log in again.',
          rawError: 'No authentication tokens found'
        };
      }

      const response = await fetch('http://localhost:3000/api/v1/templates', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle different error status codes with proper error objects
        const errorMap = {
          401: {
            status: 401,
            title: 'Unauthorized',
            detail: responseData.detail || 'Authentication failed. Please log in again.'
          },
          402: {
            status: 402,
            title: responseData.title || 'Payment Required',
            detail: responseData.detail || 'Your organization does not have an active subscription.'
          },
          403: {
            status: 403,
            title: 'Forbidden',
            detail: responseData.detail || 'You do not have permission to access templates.'
          },
          500: {
            status: 500,
            title: 'Server Error',
            detail: responseData.detail || 'Internal server error. Please try again later.'
          }
        };

        throw errorMap[response.status] || {
          status: response.status,
          title: responseData.title || 'Request Failed',
          detail: responseData.detail || `Failed to fetch templates: ${response.statusText}`,
          rawError: responseData
        };
      }

      const fetchedTemplates = responseData;
      
      // Mark templates as custom or predefined based on organization
      const processedTemplates = fetchedTemplates.map(template => ({
        ...template,
        isCustom: template.organization && template.organization.name !== "DocSign Dev Team"
      }));

      setTemplates(processedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError({
        ...error,
        rawError: error.rawError || error
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // ===============================
  // 🧩 Enhanced Action Handlers with Error Handling
  // ===============================

  const handleCreateTemplate = async (templateData) => {
    const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', templateData.file);
    formData.append('name', templateData.name);

    try {
      const response = await fetch('http://localhost:3000/api/v1/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
        body: formData,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw {
          status: response.status,
          title: responseData.title || 'Create Failed',
          detail: responseData.detail || 'Failed to create template',
          rawError: responseData
        };
      }

      const newTemplate = await response.json();
      // Refetch to get all templates with proper organization data
      await fetchTemplates();
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error(error.detail || 'Failed to create template');
    }
  };

  const handleUseTemplate = (template) => {
    navigate('/documents/create', { 
      state: { 
        template: {
          id: template.id,
          name: template.name,
          fileUrl: template.fileUrl,
          isCustom: template.isCustom
        }
      }
    });
  };

  const handlePreviewTemplate = (template) => {
    const baseUrl = 'http://localhost:3000';
    const fullUrl = template.fileUrl.startsWith('http') ? template.fileUrl : baseUrl + template.fileUrl;
    window.open(fullUrl, '_blank');
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setEditName(template.name);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !editName.trim()) return;

    try {
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/api/v1/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ name: editName }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw {
          status: response.status,
          title: responseData.title || 'Update Failed',
          detail: responseData.detail || 'Failed to update template',
          rawError: responseData
        };
      }

      await fetchTemplates(); // Refetch to get updated data
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
      alert(error.detail || 'Failed to update template');
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/api/v1/templates/${template.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw {
          status: response.status,
          title: responseData.title || 'Delete Failed',
          detail: responseData.detail || 'Failed to delete template',
          rawError: responseData
        };
      }

      await fetchTemplates(); // Refetch to get updated data
    } catch (error) {
      console.error('Error deleting template:', error);
      alert(error.detail || 'Failed to delete template');
    }
  };

  // ===============================
  // 🎛️ Filtering & Search
  // ===============================

  const filterTemplates = (templates, tab, search) => {
    let filtered = templates;

    // Filter by tab
    if (tab === 'custom') {
      filtered = filtered.filter(t => t.isCustom);
    } else if (tab === 'predefined') {
      filtered = filtered.filter(t => !t.isCustom);
    }

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const displayedTemplates = filterTemplates(templates, activeTab, searchTerm);

  const customTemplatesCount = templates.filter(t => t.isCustom).length;
  const predefinedTemplatesCount = templates.filter(t => !t.isCustom).length;

  // ===============================
  // 🎯 Render
  // ===============================

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Templates</h1>
              <p className="text-gray-400 mt-1">
                Choose from predefined templates or create your own reusable documents
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="primary"
                disabled={error && error.status === 402} // Disable if subscription required
              >
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </div>
          </div>

          {/* Show subscription warning banner if needed */}
          {error && error.status === 402 && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-300 font-medium">Subscription Required</p>
                  <p className="text-yellow-400 text-sm">
                    Upgrade your plan to create and manage templates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs & Search - Only show if no critical errors */}
          {!error || (error.status !== 401 && error.status !== 402 && error.status !== 403) && (
            <FilterSection
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              templates={templates}
            />
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview - Only show if no errors */}
        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <Card className="text-center hover:bg-gray-800/70 transition-colors">
              <LayoutTemplate className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{templates.length}</p>
              <p className="text-gray-400 text-sm">Total Templates</p>
            </Card>
            
            <Card className="text-center hover:bg-gray-800/70 transition-colors">
              <Building className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{customTemplatesCount}</p>
              <p className="text-gray-400 text-sm">Your Templates</p>
            </Card>
            
            <Card className="text-center hover:bg-gray-800/70 transition-colors">
              <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{predefinedTemplatesCount}</p>
              <p className="text-gray-400 text-sm">DocSign Templates</p>
            </Card>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <SkeletonLoader />
        ) : error ? (
          <ErrorDisplay error={error} onRetry={fetchTemplates} />
        ) : displayedTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                onPreview={handlePreviewTemplate}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
                isCustom={template.isCustom}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search to find what you\'re looking for.'
                : activeTab === 'custom' 
                  ? 'Create your first template to get started with reusable documents.'
                  : 'Get started by creating your first template or browse predefined templates.'
              }
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
            >
              <Plus className="w-4 h-4" />
              Create Your First Template
            </Button>
          </Card>
        )}

        {/* Quick Start Section */}
        {!isLoading && !error && customTemplatesCount === 0 && (
          <div className="mt-12">
            <Card className="bg-gradient-to-br from-gray-800/50 to-blue-900/20 border-blue-800/50">
              <div className="text-center">
                <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Get Started with Templates</h2>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                  Save time by creating reusable document templates. Upload your most commonly used PDFs once, 
                  then quickly create new documents from them whenever needed.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Upload PDF</h4>
                    <p className="text-gray-400 text-sm">Upload your document as a template</p>
                  </div>
                  <div className="text-center p-4">
                    <LayoutTemplate className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Save Template</h4>
                    <p className="text-gray-400 text-sm">Give it a name and save for later</p>
                  </div>
                  <div className="text-center p-4">
                    <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Use Instantly</h4>
                    <p className="text-gray-400 text-sm">Start new documents from templates</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTemplate}
      />

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Rename Template</h2>
              <button
                onClick={() => setEditingTemplate(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingTemplate(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateTemplate}
                  className="flex-1"
                >
                  Update Name
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}