// src/pages/CreateDocumentPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Upload, FileText, Users, Mail, Settings, X, Plus, Trash2,
  Download, Eye, Save, ArrowLeft, AlertCircle, CheckCircle,
  Clock, Calendar, MapPin, Signature, Type, Image, Send, Info, Edit, Loader,
  MousePointer, Square, Move, ZoomIn, ZoomOut, RotateCcw, ExternalLink
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

const Select = ({ label, options, error, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
    <select
      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
  </div>
);

// ===============================
// 📄 CUSTOM PDF VIEWER - NO EXTERNAL DEPENDENCIES
// ===============================

const CustomPDFViewer = ({ 
  file, 
  signers, 
  signatureFields, 
  onFieldAdd, 
  onFieldUpdate, 
  onFieldRemove,
  selectedSignerId,
  onSignerSelect,
  selectedFieldType,
  onFieldTypeSelect,
  mode = 'placement'
}) => {
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [pdfImages, setPdfImages] = useState([]);

  const containerRef = useRef();
  const fileInputRef = useRef();

  // Field types configuration
  const fieldTypes = {
    SIGNATURE: { label: 'Signature', color: 'border-blue-400 bg-blue-500/20', icon: Signature },
    INITIALS: { label: 'Initials', color: 'border-green-400 bg-green-500/20', icon: Type },
    DATE: { label: 'Date', color: 'border-purple-400 bg-purple-500/20', icon: Calendar },
    TEXT: { label: 'Text', color: 'border-orange-400 bg-orange-500/20', icon: Type }
  };

  // Reset when file changes
  useEffect(() => {
    if (file) {
      loadPDFPreview();
    } else {
      setPdfImages([]);
      setTotalPages(0);
      setCurrentPage(1);
      setError(null);
    }
  }, [file]);

  // Simple PDF preview using object URL
  const loadPDFPreview = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // For uploaded files, create object URL
      let pdfUrl;
      if (file instanceof File) {
        pdfUrl = URL.createObjectURL(file);
      } else if (file.url) {
        // For existing documents, use the URL directly
        pdfUrl = `http://localhost:3000${file.url}`;
      } else {
        throw new Error('Invalid file format');
      }

      // Create iframe for PDF preview
      setPdfImages([pdfUrl]);
      setTotalPages(1); // We'll assume 1 page for simplicity
      setCurrentPage(1);

    } catch (err) {
      console.error('PDF loading error:', err);
      setError('Failed to load PDF. Please ensure it\'s a valid PDF file.');
    } finally {
      setIsLoading(false);
    }
  };

  // Alternative: Use canvas to render PDF pages (more advanced)
  const loadPDFWithCanvas = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');

      // Set worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

      let pdfData;
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        pdfData = arrayBuffer;
      } else if (file.url) {
        const response = await fetch(`http://localhost:3000${file.url}`);
        const arrayBuffer = await response.arrayBuffer();
        pdfData = arrayBuffer;
      }

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      setTotalPages(pdf.numPages);

      // Render first page as preview
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      const imageUrl = canvas.toDataURL();
      setPdfImages([imageUrl]);

    } catch (err) {
      console.error('PDF.js loading error:', err);
      // Fallback to simple object URL method
      loadPDFPreview();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageClick = (event, pageIndex) => {
    if (mode !== 'placement' || !selectedSignerId || !selectedFieldType) return;

    const pageElement = containerRef.current?.querySelector('.pdf-page');
    if (!pageElement) return;

    const pageRect = pageElement.getBoundingClientRect();
    const x = (event.clientX - pageRect.left) / scale;
    const y = (event.clientY - pageRect.top) / scale;

    // Create new field
    const newField = {
      id: `field-${Date.now()}`,
      pageNumber: pageIndex + 1,
      x,
      y,
      width: 150,
      height: 40,
      type: selectedFieldType,
      signerId: selectedSignerId,
      temporary: true
    };

    setCurrentField(newField);
    setIsDragging(true);
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !currentField || mode !== 'placement') return;

    const pageElement = containerRef.current?.querySelector('.pdf-page');
    if (!pageElement) return;

    const pageRect = pageElement.getBoundingClientRect();
    const currentX = (event.clientX - pageRect.left) / scale;
    const currentY = (event.clientY - pageRect.top) / scale;

    const width = Math.max(80, currentX - currentField.x);
    const height = Math.max(30, currentY - currentField.y);

    setCurrentField(prev => ({
      ...prev,
      width,
      height
    }));
  };

  const handleMouseUp = () => {
    if (isDragging && currentField && mode === 'placement') {
      if (currentField.width >= 50 && currentField.height >= 20) {
        onFieldAdd({
          ...currentField,
          temporary: false
        });
      }
      
      setCurrentField(null);
      setIsDragging(false);
    }
  };

  // Add event listeners for drag operations
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, currentField]);

  const getFieldStyle = (field) => {
    const typeConfig = fieldTypes[field.type] || fieldTypes.SIGNATURE;
    
    return {
      position: 'absolute',
      left: `${field.x * scale}px`,
      top: `${field.y * scale}px`,
      width: `${field.width * scale}px`,
      height: `${field.height * scale}px`,
      border: '2px dashed',
      borderRadius: '4px',
      cursor: 'pointer',
      zIndex: 10,
      pointerEvents: 'none'
    };
  };

  const getSignerName = (signerId) => {
    const signer = signers.find(s => s.id === signerId);
    return signer?.name || `Signer ${signerId}`;
  };

  const openPDFInNewTab = () => {
    if (!file) return;

    let pdfUrl;
    if (file instanceof File) {
      pdfUrl = URL.createObjectURL(file);
    } else if (file.url) {
      pdfUrl = `http://localhost:3000${file.url}`;
    }

    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Document Preview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={openPDFInNewTab}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            title="Open PDF in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            disabled={scale <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-gray-400 text-sm min-w-12 text-center">{(scale * 100).toFixed(0)}%</span>
          <button
            onClick={() => setScale(prev => Math.min(3, prev + 0.2))}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            disabled={scale >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Field Placement Controls */}
      {mode === 'placement' && (
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Signer
              </label>
              <select
                value={selectedSignerId || ''}
                onChange={(e) => onSignerSelect(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Choose a signer...</option>
                {signers.map(signer => (
                  <option key={signer.id} value={signer.id}>
                    {signer.name} ({signer.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Field Type
              </label>
              <select
                value={selectedFieldType || ''}
                onChange={(e) => onFieldTypeSelect(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Select field type...</option>
                {Object.entries(fieldTypes).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedSignerId && selectedFieldType && (
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
              <p className="text-blue-300 text-sm flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Click and drag on the document to place {selectedFieldType.toLowerCase()} fields for {getSignerName(selectedSignerId)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* PDF Document Container */}
      <div 
        ref={containerRef}
        className="border border-gray-700 rounded-lg overflow-auto bg-gray-900 max-h-96 min-h-64 flex items-center justify-center relative"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Loading PDF...</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="text-center p-8 text-red-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="font-medium">{error}</p>
            <p className="text-sm text-gray-400 mt-1">
              Please ensure you're using a valid PDF file
            </p>
            <Button
              variant="outline"
              onClick={loadPDFPreview}
              className="mt-4"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Loading
            </Button>
          </div>
        ) : pdfImages.length > 0 ? (
          <div className="relative">
            {pdfImages.map((imageUrl, index) => (
              <div
                key={index}
                className="pdf-page relative border border-gray-600 bg-white shadow-lg"
                style={{ 
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  cursor: selectedSignerId && selectedFieldType && mode === 'placement' ? 'crosshair' : 'default'
                }}
                onClick={(e) => handlePageClick(e, index)}
              >
                {/* PDF Preview */}
                {imageUrl.startsWith('data:') ? (
                  <img
                    src={imageUrl}
                    alt={`PDF Page ${index + 1}`}
                    className="max-w-full h-auto"
                  />
                ) : (
                  <iframe
                    src={imageUrl}
                    className="w-full h-80 border-0"
                    title={`PDF Page ${index + 1}`}
                  />
                )}
                
                {/* Render existing signature fields */}
                {signatureFields
                  .filter(field => field.pageNumber === index + 1)
                  .map(field => {
                    const FieldIcon = fieldTypes[field.type]?.icon || Signature;
                    const signer = signers.find(s => s.id === field.signerId);
                    
                    return (
                      <div
                        key={field.id}
                        style={getFieldStyle(field)}
                        className="group"
                      >
                        <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 min-w-max z-20">
                          <FieldIcon className="w-3 h-3" />
                          <span>{fieldTypes[field.type]?.label}</span>
                          <span className="text-gray-300">• {signer?.name}</span>
                          {mode === 'placement' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onFieldRemove(field.id);
                              }}
                              className="text-red-400 hover:text-red-300 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className={`w-full h-full flex items-center justify-center text-xs ${
                          fieldTypes[field.type]?.color || 'border-blue-400 bg-blue-500/20'
                        } text-gray-700`}>
                          {field.type.toLowerCase()}
                        </div>
                      </div>
                    );
                  })}
                
                {/* Render current dragging field */}
                {currentField && currentField.pageNumber === index + 1 && (
                  <div 
                    style={getFieldStyle(currentField)}
                    className="border-blue-400 bg-blue-500/10"
                  >
                    <div className="w-full h-full flex items-center justify-center text-xs text-blue-400">
                      New {currentField.type.toLowerCase()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : file ? (
          <div className="text-center p-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p>PDF document loaded</p>
            <p className="text-sm mt-1">Setting up preview...</p>
            <Button
              variant="outline"
              onClick={loadPDFPreview}
              className="mt-4"
            >
              <RotateCcw className="w-4 h-4" />
              Load Preview
            </Button>
          </div>
        ) : (
          <div className="text-center p-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p>No PDF document loaded</p>
            <p className="text-sm mt-1">Upload a PDF file to preview</p>
          </div>
        )}
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 text-gray-300 hover:text-white transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 text-gray-300 hover:text-white transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </Card>
  );
};

// ===============================
// 👤 Signer Form Component
// ===============================

const SignerForm = ({ signer, index, onUpdate, onRemove, isLast, isSigned = false }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const isEditable = !isSigned;

  return (
    <Card className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
            isSigned ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            {index + 1}
          </div>
          <div>
            <h4 className="font-medium text-white">
              {signer.name || `Signer ${index + 1}`}
              {isSigned && <CheckCircle className="w-4 h-4 text-green-400 inline ml-2" />}
            </h4>
            <p className="text-gray-400 text-sm">{signer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditable && (
            <>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
              >
                <Settings className="w-4 h-4" />
              </button>
              {!isLast && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          {isSigned && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800/50">
              Signed
            </span>
          )}
        </div>
      </div>

      {isExpanded && isEditable && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={signer.name}
            onChange={(e) => onUpdate({ ...signer, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={signer.email}
            onChange={(e) => onUpdate({ ...signer, email: e.target.value })}
            required
          />
        </div>
      )}
    </Card>
  );
};

// ===============================
// 🧠 MAIN CREATE/EDIT DOCUMENT COMPONENT
// ===============================

export default function CreateDocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // State
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdDocument, setCreatedDocument] = useState(null);
  const [createdEnvelope, setCreatedEnvelope] = useState(null);
  const [error, setError] = useState('');

  // Signature field state
  const [signatureFields, setSignatureFields] = useState([]);
  const [selectedSignerId, setSelectedSignerId] = useState(null);
  const [selectedFieldType, setSelectedFieldType] = useState('SIGNATURE');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    file: null,
    signers: [
      { 
        id: 1, 
        name: '', 
        email: ''
      }
    ],
    expirationDays: 30,
    message: 'Please review and sign this document.',
    reminders: true,
    allowDecline: false
  });

  const isEditMode = !!id;

  // Check for template from location state
  useEffect(() => {
    if (location.state?.template) {
      const template = location.state.template;
      console.log('Template from location state:', template);
      
      // If it's a predefined template, we need to fetch the actual file
      if (template.isPredefined) {
        // For predefined templates, we'll use the fileUrl directly
        setFormData(prev => ({
          ...prev,
          title: template.name,
          file: { url: template.fileUrl } // This will be handled by our PDF viewer
        }));
      } else {
        // For custom templates, we might need to fetch the file
        setFormData(prev => ({
          ...prev,
          title: template.name,
          file: { url: template.fileUrl }
        }));
      }
      
      // Auto-advance to step 2 since we have a template
      setStep(2);
    }
  }, [location.state]);

  // ===============================
  // 📥 Fetch Existing Data for Edit Mode
  // ===============================

  useEffect(() => {
    if (isEditMode) {
      fetchExistingDocument();
    }
  }, [id]);

  const fetchExistingDocument = async () => {
    try {
      setIsLoading(true);
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      // Fetch document details
      const docResponse = await fetch(`http://localhost:3000/api/v1/documents/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
      });

      if (!docResponse.ok) {
        throw new Error('Failed to fetch document');
      }

      const documentData = await docResponse.json();
      
      setCreatedDocument(documentData);

      // Try to fetch envelope and signature fields
      await fetchEnvelopeAndFields(documentData.id);

      // Pre-fill form with existing data
      setFormData(prev => ({
        ...prev,
        title: documentData.title,
        file: { url: documentData.fileUrl }
      }));

      // Auto-advance to step 2 if we have a document
      setStep(2);

    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document for editing');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnvelopeAndFields = async (documentId) => {
    try {
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      // Fetch envelopes for this document
      const envelopesResponse = await fetch(`http://localhost:3000/api/v1/envelopes?documentId=${documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
      });

      if (envelopesResponse.ok) {
        const envelopesData = await envelopesResponse.json();
        if (envelopesData.length > 0) {
          const envelope = envelopesData[0];
          setCreatedEnvelope(envelope);
          
          // Pre-fill signers from envelope
          if (envelope.signers && envelope.signers.length > 0) {
            const signersWithIds = envelope.signers.map((signer, index) => ({
              id: signer.id || index + 1,
              name: signer.name,
              email: signer.email,
              status: signer.status
            }));
            
            setFormData(prev => ({
              ...prev,
              signers: signersWithIds
            }));

            // Auto-select first signer
            if (signersWithIds.length > 0) {
              setSelectedSignerId(signersWithIds[0].id);
            }
          }

          // Fetch signature fields
          await fetchSignatureFields(envelope.id);
        }
      }
    } catch (error) {
      console.error('Error fetching envelope data:', error);
    }
  };

  const fetchSignatureFields = async (envelopeId) => {
    try {
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/api/v1/signature-fields/${envelopeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
      });

      if (response.ok) {
        const fields = await response.json();
        setSignatureFields(fields.map(field => ({
          ...field,
          id: field.id || `field-${Date.now()}`
        })));
      }
    } catch (error) {
      console.error('Error fetching signature fields:', error);
    }
  };

  // ===============================
  // 🧩 Signature Field Handlers
  // ===============================

  const handleAddSignatureField = useCallback((field) => {
    setSignatureFields(prev => [...prev, { ...field, id: `field-${Date.now()}` }]);
  }, []);

  const handleUpdateSignatureField = useCallback((fieldId, updates) => {
    setSignatureFields(prev => 
      prev.map(field => field.id === fieldId ? { ...field, ...updates } : field)
    );
  }, []);

  const handleRemoveSignatureField = useCallback((fieldId) => {
    setSignatureFields(prev => prev.filter(field => field.id !== fieldId));
  }, []);

  const handleSignerSelect = useCallback((signerId) => {
    setSelectedSignerId(signerId);
  }, []);

  const handleFieldTypeSelect = useCallback((fieldType) => {
    setSelectedFieldType(fieldType);
  }, []);

  // ===============================
  // 📤 Save Signature Fields to Backend
  // ===============================

  const saveSignatureFields = async (signingRequestId) => {
    try {
      if (signatureFields.length === 0) return;

      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3000/api/v1/signature-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          signingRequestId,
          fields: signatureFields.map(field => ({
            signerId: field.signerId,
            pageNumber: field.pageNumber,
            x: Math.round(field.x),
            y: Math.round(field.y),
            width: Math.round(field.width),
            height: Math.round(field.height),
            type: field.type
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to save signature fields');
      
      return await response.json();
    } catch (error) {
      console.error('Error saving signature fields:', error);
      throw error;
    }
  };

  // ===============================
  // 📄 Document Upload Handler
  // ===============================

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.replace('.pdf', '')
      }));
      // Reset signature fields when new file is selected
      setSignatureFields([]);
    } else {
      alert('Please select a PDF file');
    }
  }, []);

  // ===============================
  // 👥 Signer Management Handlers
  // ===============================

  const handleAddSigner = useCallback(() => {
    const newSignerId = Math.max(...formData.signers.map(s => s.id), 0) + 1;
    
    setFormData(prev => ({
      ...prev,
      signers: [
        ...prev.signers,
        { 
          id: newSignerId, 
          name: '', 
          email: ''
        }
      ]
    }));
  }, [formData.signers]);

  const handleUpdateSigner = useCallback((index, updatedSigner) => {
    setFormData(prev => ({
      ...prev,
      signers: prev.signers.map((signer, i) => 
        i === index ? updatedSigner : signer
      )
    }));
  }, []);

  const handleRemoveSigner = useCallback((index) => {
    const signerToRemove = formData.signers[index];
    
    setFormData(prev => ({
      ...prev,
      signers: prev.signers.filter((_, i) => i !== index)
    }));

    // Remove signature fields for this signer
    setSignatureFields(prev => 
      prev.filter(field => field.signerId !== signerToRemove.id)
    );

    // Reset selected signer if it was the removed one
    if (selectedSignerId === signerToRemove.id) {
      setSelectedSignerId(formData.signers[0]?.id || null);
    }
  }, [formData.signers, selectedSignerId]);

  // ===============================
  // 🚀 Main Action Handlers
  // ===============================

  const handleUploadDocument = async () => {
    if (!formData.file) {
      alert('Please upload a PDF document');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const submitData = new FormData();
      submitData.append('file', formData.file);
      submitData.append('title', formData.title);
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:3000/api/v1/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': apiKey,
        },
        body: submitData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Failed to upload document (${response.status})`);
      }

      const document = await response.json();
      setUploadProgress(100);
      
      setCreatedDocument(document);
      setStep(2);

    } catch (error) {
      console.error('Error uploading document:', error);
      alert(`Upload failed: ${error?.message || 'Unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEnvelope = async () => {
    if (formData.signers.some(signer => !signer.name || !signer.email)) {
      alert('Please fill in all signer information');
      return;
    }

    if (signatureFields.length === 0) {
      alert('Please place at least one signature field on the document');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expirationDays);

      // Prepare signers for envelope creation
      const envelopeSigners = formData.signers.map(signer => ({
        name: signer.name,
        email: signer.email
      }));

      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;

      let envelope;
      
      if (isEditMode && createdEnvelope) {
        // Update existing envelope
        const response = await fetch(`http://localhost:3000/api/v1/envelopes/${createdEnvelope.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            signers: envelopeSigners,
            expiresAt: expiresAt.toISOString(),
            message: formData.message
          })
        });

        if (!response.ok) throw new Error('Failed to update envelope');
        envelope = await response.json();
      } else {
        // Create new envelope
        const response = await fetch('http://localhost:3000/api/v1/envelopes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            documentId: createdDocument.id,
            signers: envelopeSigners,
            expiresAt: expiresAt.toISOString(),
            message: formData.message
          })
        });

        if (!response.ok) throw new Error('Failed to create envelope');
        envelope = await response.json();
        setCreatedEnvelope(envelope);
      }

      // Save signature fields
      await saveSignatureFields(envelope.id);
      
      alert(isEditMode ? 'Envelope updated successfully!' : 'Envelope created successfully!');
      setStep(3);

    } catch (error) {
      console.error('Error creating/updating envelope:', error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} envelope. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEnvelope = async () => {
    setIsSubmitting(true);

    try {
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      
      const response = await fetch(`http://localhost:3000/api/v1/envelopes/${createdEnvelope.id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-api-key': apiKey,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to send envelope');
      }

      const result = await response.json();
      
      alert('Envelope sent successfully! Signers will receive email invitations.');
      navigate('/documents');

    } catch (error) {
      console.error('Error sending envelope:', error);
      alert('Failed to send envelope. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===============================
  // 🎯 Render Steps
  // ===============================

  const renderStep1 = () => (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-400" />
        {isEditMode ? 'Update Document' : 'Upload Document'}
      </h2>
      
      <div className="space-y-4">
        <Input
          label="Document Title"
          placeholder="e.g., Employment Agreement, NDA, Contract"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isEditMode ? 'Update PDF Document (Optional)' : 'Upload PDF Document'}
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-gray-500 transition-colors cursor-pointer"
          >
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 font-medium">
              {formData.file ? 'Document Ready' : 'Drop your PDF here or click to browse'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Maximum file size: 25MB
            </p>
            {formData.file && (
              <p className="text-green-400 text-sm mt-2 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {formData.file.name || 'Template loaded'} 
                {formData.file.size && ` (${(formData.file.size / (1024 * 1024)).toFixed(2)} MB)`}
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

        {isSubmitting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Uploading document...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {isEditMode && (
        <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-300 font-medium">Editing Mode</p>
              <p className="text-blue-400 mt-1">
                You are editing an existing document. Upload a new PDF file only if you want to replace the current one.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );

  const renderStep2 = () => {
    const signedSigners = formData.signers.filter(s => s.status === 'SIGNED').length;

    return (
      <>
        {/* Signers Section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              {isEditMode ? 'Manage Signers' : 'Add Signers'} ({formData.signers.length})
              {signedSigners > 0 && (
                <span className="text-sm text-green-400 ml-2">
                  • {signedSigners} signed
                </span>
              )}
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSigner}
            >
              <Plus className="w-4 h-4" />
              Add Signer
            </Button>
          </div>

          <div className="space-y-4">
            {formData.signers.map((signer, index) => (
              <SignerForm
                key={signer.id}
                signer={signer}
                index={index}
                onUpdate={(updated) => handleUpdateSigner(index, updated)}
                onRemove={() => handleRemoveSigner(index)}
                isLast={index === 0 && formData.signers.length === 1}
                isSigned={signer.status === 'SIGNED'}
              />
            ))}
          </div>
        </Card>

        {/* Signature Field Placement */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Square className="w-5 h-5 text-blue-400" />
            Place Signature Fields
            <span className="text-sm text-gray-400 ml-2">({signatureFields.length} placed)</span>
          </h2>
          
          <CustomPDFViewer
            file={formData.file}
            signers={formData.signers}
            signatureFields={signatureFields}
            onFieldAdd={handleAddSignatureField}
            onFieldUpdate={handleUpdateSignatureField}
            onFieldRemove={handleRemoveSignatureField}
            selectedSignerId={selectedSignerId}
            onSignerSelect={handleSignerSelect}
            selectedFieldType={selectedFieldType}
            onFieldTypeSelect={handleFieldTypeSelect}
            mode="placement"
          />

          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-300 font-medium">Signature Field Placement</p>
                <p className="text-blue-400 mt-1">
                  1. Select a signer and field type from the dropdowns<br/>
                  2. Click and drag on the document to place signature fields<br/>
                  3. Each signer can have multiple fields of different types
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Section */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            Envelope Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Expiration"
              value={formData.expirationDays}
              onChange={(e) => setFormData(prev => ({ ...prev, expirationDays: parseInt(e.target.value) }))}
              options={[
                { value: 7, label: '7 days' },
                { value: 14, label: '14 days' },
                { value: 30, label: '30 days' },
                { value: 60, label: '60 days' },
                { value: 90, label: '90 days' }
              ]}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message to Signers
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Add a personal message for your signers..."
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.reminders}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminders: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                />
                <Mail className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-white text-sm font-medium">Send reminder emails</p>
                  <p className="text-gray-400 text-xs">Automatically remind signers every 3 days</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.allowDecline}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowDecline: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                />
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <div>
                  <p className="text-white text-sm font-medium">Allow signers to decline</p>
                  <p className="text-gray-400 text-xs">Signers can decline to sign with a reason</p>
                </div>
              </label>
            </div>
          </div>
        </Card>
      </>
    );
  };

  const renderStep3 = () => {
    const signedSigners = formData.signers.filter(s => s.status === 'SIGNED').length;
    const canSend = signedSigners === 0;

    return (
      <Card>
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {isEditMode ? 'Ready to Update!' : 'Ready to Send!'}
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {isEditMode 
              ? 'Your envelope has been updated. You can send it now or make further changes.'
              : 'Your document has been uploaded and the envelope is ready. Send it now to start the signing process.'
            }
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 max-w-2xl mx-auto">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-white font-medium text-sm truncate">{createdDocument?.title}</p>
              <p className="text-gray-400 text-xs">Document</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-white font-medium">{formData.signers.length}</p>
              <p className="text-gray-400 text-xs">Signers</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <Square className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-medium">{signatureFields.length}</p>
              <p className="text-gray-400 text-xs">Fields</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-white font-medium">{formData.expirationDays}d</p>
              <p className="text-gray-400 text-xs">Expires In</p>
            </div>
          </div>

          {signedSigners > 0 && (
            <div className="mb-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-800/50 max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-yellow-300 font-medium">Cannot Resend</p>
                  <p className="text-yellow-400 text-sm">
                    {signedSigners} signer{signedSigners !== 1 ? 's have' : ' has'} already signed. 
                    You cannot resend the envelope.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
            >
              <Edit className="w-4 h-4" />
              Edit Signers & Fields
            </Button>
            
            {canSend && (
              <Button
                onClick={handleSendEnvelope}
                variant="success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {isEditMode ? 'Resend to Signers' : 'Send to Signers'}
                  </>
                )}
              </Button>
            )}
          </div>

          {!canSend && isEditMode && (
            <p className="text-gray-400 text-sm mt-4 max-w-md mx-auto">
              The envelope has already been sent and some signers have signed. 
              You can still edit unsigned signers and fields by going back.
            </p>
          )}
        </div>
      </Card>
    );
  };

  // ===============================
  // 🎯 Main Render
  // ===============================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  const pageTitle = isEditMode ? 'Edit Document' : 'Create Document';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/documents')}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{pageTitle}</h1>
                <p className="text-gray-400 text-sm">
                  {step === 1 && (isEditMode ? 'Document details' : 'Upload your PDF document')}
                  {step === 2 && 'Manage signers and place signature fields'}
                  {step === 3 && 'Review and send'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/documents')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              {step === 1 && (
                <Button
                  onClick={handleUploadDocument}
                  disabled={isSubmitting || (!formData.file && !isEditMode)}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditMode ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {isEditMode ? 'Update Document' : 'Upload Document'}
                    </>
                  )}
                </Button>
              )}
              
              {step === 2 && (
                <Button
                  onClick={handleCreateEnvelope}
                  disabled={isSubmitting || signatureFields.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      {isEditMode ? 'Update Envelope' : 'Create Envelope'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6">
            <div className="flex items-center">
              {[
                { number: 1, label: isEditMode ? 'Document' : 'Upload' },
                { number: 2, label: 'Signers & Fields' },
                { number: 3, label: isEditMode ? 'Update' : 'Send' }
              ].map((stepInfo, index) => (
                <div key={stepInfo.number} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step >= stepInfo.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {step >= stepInfo.number ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      stepInfo.number
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step >= stepInfo.number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {stepInfo.label}
                  </span>
                  {index < 2 && (
                    <div
                      className={`w-16 h-1 mx-4 transition-all ${
                        step > stepInfo.number ? 'bg-blue-600' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="xl:col-span-2 space-y-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          {/* Right Column - Preview & Summary */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <h3 className="font-semibold text-white mb-4">Process Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Document</span>
                  <span className="text-white truncate">{createdDocument?.title || formData.title || 'Not uploaded'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Signers</span>
                  <span className="text-white">{formData.signers.length} people</span>
                </div>
                {step >= 2 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Signature Fields</span>
                      <span className="text-white">{signatureFields.length} placed</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Expires In</span>
                      <span className="text-white">{formData.expirationDays} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <span className={`${
                        isEditMode ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {isEditMode ? 'Editing' : 'New'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Field Types Legend */}
            {step >= 2 && (
              <Card>
                <h3 className="font-semibold text-white mb-4">Field Types</h3>
                <div className="space-y-2">
                  {[
                    { type: 'SIGNATURE', label: 'Signature', color: 'bg-blue-500' },
                    { type: 'INITIALS', label: 'Initials', color: 'bg-green-500' },
                    { type: 'DATE', label: 'Date', color: 'bg-purple-500' },
                    { type: 'TEXT', label: 'Text', color: 'bg-orange-500' }
                  ].map(({ type, label, color }) => (
                    <div key={type} className="flex items-center gap-3 text-sm">
                      <div className={`w-3 h-3 rounded ${color}`} />
                      <span className="text-gray-300">{label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            {step >= 2 && (
              <Card>
                <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSignerId(formData.signers[0]?.id || null);
                      setSelectedFieldType('SIGNATURE');
                    }}
                    className="w-full justify-center"
                  >
                    <Square className="w-4 h-4" />
                    Reset Field Placement
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSignatureFields([])}
                    disabled={signatureFields.length === 0}
                    className="w-full justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Fields
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}