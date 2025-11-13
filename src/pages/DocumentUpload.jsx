// src/pages/CreateDocumentPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Upload, FileText, Users, Mail, Settings, X, Plus, Trash2,
  Download, Eye, Save, ArrowLeft, AlertCircle, CheckCircle,
  Clock, Calendar, MapPin, Signature, Type, Image, Send, Info, Edit, Loader,
  MousePointer, Square, Move, ZoomIn, ZoomOut, RotateCcw, ExternalLink,
  Grip, Maximize2, Minimize2, Layers, Grid, Copy, Scissors
} from 'lucide-react';

// ===============================
// 🎨 Enhanced Reusable Components
// ===============================

const Card = ({ children, className = '', ...props }) => (
  <div 
    className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'default', ...props }) => {
  const baseClasses = "rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900";
  const sizeClasses = {
    default: "px-4 py-2.5 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base"
  };
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-100 shadow-sm",
    outline: "border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white bg-transparent",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    success: "bg-green-600 hover:bg-green-700 text-white shadow-sm",
    warning: "bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
  };
  
  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, error, helper, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
    <input
      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      {...props}
    />
    {error && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
    {helper && !error && <p className="text-gray-500 text-sm">{helper}</p>}
  </div>
);

const Select = ({ label, options, error, helper, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
    <select
      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
    {helper && !error && <p className="text-gray-500 text-sm">{helper}</p>}
  </div>
);

const Tooltip = ({ children, content, position = 'top' }) => {
  const [visible, setVisible] = useState(false);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-xl border border-gray-700 whitespace-nowrap ${positionClasses[position]}`}>
          {content}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 border border-gray-700 ${
            position === 'top' ? 'top-full -translate-x-1/2 border-t-0 border-l-0' :
            position === 'bottom' ? 'bottom-full -translate-x-1/2 border-b-0 border-r-0' :
            position === 'left' ? 'left-full -translate-y-1/2 border-l-0 border-b-0' :
            'right-full -translate-y-1/2 border-r-0 border-t-0'
          }`} />
        </div>
      )}
    </div>
  );
};

// Field types configuration - MOVED OUTSIDE COMPONENT
const fieldTypes = {
  SIGNATURE: { 
    label: 'Signature', 
    color: 'border-blue-400 bg-blue-500/20', 
    icon: Signature,
    defaultWidth: 200,
    defaultHeight: 60
  },
  INITIALS: { 
    label: 'Initials', 
    color: 'border-green-400 bg-green-500/20', 
    icon: Type,
    defaultWidth: 100,
    defaultHeight: 40
  },
  DATE: { 
    label: 'Date', 
    color: 'border-purple-400 bg-purple-500/20', 
    icon: Calendar,
    defaultWidth: 150,
    defaultHeight: 40
  },
  TEXT: { 
    label: 'Text', 
    color: 'border-orange-400 bg-orange-500/20', 
    icon: Type,
    defaultWidth: 200,
    defaultHeight: 40
  },
  NAME: {
    label: 'Name',
    color: 'border-cyan-400 bg-cyan-500/20',
    icon: Type,
    defaultWidth: 200,
    defaultHeight: 40
  },
  COMPANY: {
    label: 'Company',
    color: 'border-pink-400 bg-pink-500/20',
    icon: Type,
    defaultWidth: 200,
    defaultHeight: 40
  },
  TITLE: {
    label: 'Title',
    color: 'border-yellow-400 bg-yellow-500/20',
    icon: Type,
    defaultWidth: 200,
    defaultHeight: 40
  },
  EMAIL: {
    label: 'Email',
    color: 'border-indigo-400 bg-indigo-500/20',
    icon: Mail,
    defaultWidth: 250,
    defaultHeight: 40
  }
};

// ===============================
// 🎯 Enhanced PDF Viewer with Advanced Field Placement
// ===============================

const AdvancedPDFViewer = ({ 
  file, 
  signers, 
  signatureFields, 
  onFieldAdd, 
  onFieldUpdate, 
  onFieldRemove,
  onFieldSelect,
  selectedSignerId,
  onSignerSelect,
  selectedFieldType,
  onFieldTypeSelect,
  selectedFieldId,
  mode = 'placement',
  className = ''
}) => {
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [pdfImages, setPdfImages] = useState([]);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);

  const containerRef = useRef();
  const canvasRef = useRef();
  const pdfDocRef = useRef();

  // Enhanced field templates
  const fieldTemplates = [
    { type: 'SIGNATURE', label: 'Signature', icon: Signature },
    { type: 'INITIALS', label: 'Initials', icon: Type },
    { type: 'DATE', label: 'Date Signed', icon: Calendar },
    { type: 'NAME', label: 'Full Name', icon: Type },
    { type: 'EMAIL', label: 'Email', icon: Mail },
    { type: 'COMPANY', label: 'Company', icon: Type },
    { type: 'TITLE', label: 'Title', icon: Type },
    { type: 'TEXT', label: 'Custom Text', icon: Type }
  ];

  // Reset when file changes
  useEffect(() => {
    if (file) {
      loadPDFWithPDFJS();
    } else {
      setPdfImages([]);
      setTotalPages(0);
      setCurrentPage(1);
      setError(null);
    }
  }, [file]);

  // Enhanced PDF loading with PDF.js
  const loadPDFWithPDFJS = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');

      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

      let pdfData;
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        pdfData = arrayBuffer;
      } else if (file.url) {
        const response = await fetch(`http://localhost:3000${file.url}`);
        const arrayBuffer = await response.arrayBuffer();
        pdfData = arrayBuffer;
      } else {
        throw new Error('Invalid file format');
      }

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);

      // Render all pages
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        pages.push({
          imageUrl: canvas.toDataURL(),
          width: viewport.width,
          height: viewport.height,
          pageNumber: i
        });
      }

      setPdfImages(pages);
      setCurrentPage(1);

    } catch (err) {
      console.error('PDF.js loading error:', err);
      setError('Failed to load PDF document. Please ensure it\'s a valid PDF file.');
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Enhanced drag and drop handlers
  const handleFieldDragStart = (fieldType, event) => {
    if (!selectedSignerId || mode !== 'placement') return;
    
    event.dataTransfer.setData('application/field-type', fieldType);
    event.dataTransfer.effectAllowed = 'copy';
    
    // Visual feedback
    event.currentTarget.style.opacity = '0.4';
  };

  const handleDragOver = (event) => {
    if (!selectedSignerId || mode !== 'placement') return;
    
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    
    if (!selectedSignerId || mode !== 'placement') return;

    const fieldType = event.dataTransfer.getData('application/field-type');
    if (!fieldType) return;

    const pageElement = containerRef.current?.querySelector('.pdf-page-container');
    if (!pageElement) return;

    const rect = pageElement.getBoundingClientRect();
    
    // Calculate position relative to PDF page
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    const fieldConfig = fieldTypes[fieldType];
    
    // Create new field at drop position
    const newField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: fieldType,
      signerId: selectedSignerId,
      pageNumber: currentPage,
      x: Math.max(0, x - fieldConfig.defaultWidth / 2), // Center the field on drop position
      y: Math.max(0, y - fieldConfig.defaultHeight / 2),
      width: fieldConfig.defaultWidth,
      height: fieldConfig.defaultHeight,
      createdAt: new Date().toISOString()
    };

    onFieldAdd(newField);
    
    // Reset drag visual
    const draggedElement = document.querySelector('[draggable]');
    if (draggedElement) {
      draggedElement.style.opacity = '1';
    }
  };

  const handleDragEnd = (event) => {
    // Reset visual feedback
    event.currentTarget.style.opacity = '1';
  };

  // FIXED: Enhanced click-and-drag field creation
  const handleMouseDown = (event) => {
    if (mode !== 'placement' || !selectedSignerId || !selectedFieldType) return;
    if (event.target.closest('.field-container')) return; // Don't interfere with existing fields

    const pageElement = containerRef.current?.querySelector('.pdf-page-container');
    if (!pageElement) return;

    const rect = pageElement.getBoundingClientRect();
    const startX = (event.clientX - rect.left) / scale;
    const startY = (event.clientY - rect.top) / scale;

    const fieldConfig = fieldTypes[selectedFieldType];
    
    setCurrentField({
      id: `temp-${Date.now()}`,
      type: selectedFieldType,
      signerId: selectedSignerId,
      pageNumber: currentPage,
      x: startX,
      y: startY,
      width: fieldConfig.defaultWidth,
      height: fieldConfig.defaultHeight,
      isDragging: true
    });
    
    setDragStart({ x: startX, y: startY });
    setIsDragging(true);
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !currentField || !dragStart) return;

    const pageElement = containerRef.current?.querySelector('.pdf-page-container');
    if (!pageElement) return;

    const rect = pageElement.getBoundingClientRect();
    const currentX = (event.clientX - rect.left) / scale;
    const currentY = (event.clientY - rect.top) / scale;

    const width = Math.max(fieldTypes[currentField.type].defaultWidth, currentX - dragStart.x);
    const height = Math.max(fieldTypes[currentField.type].defaultHeight, currentY - dragStart.y);

    setCurrentField(prev => ({
      ...prev,
      width,
      height
    }));
  };

  const handleMouseUp = () => {
    if (isDragging && currentField && dragStart) {
      // Validate field placement (must be within page bounds)
      const currentPageData = pdfImages[currentPage - 1];
      if (currentPageData) {
        const maxX = currentPageData.width - currentField.width;
        const maxY = currentPageData.height - currentField.height;

        const validatedField = {
          ...currentField,
          x: Math.max(0, Math.min(currentField.x, maxX)),
          y: Math.max(0, Math.min(currentField.y, maxY)),
          isDragging: false
        };

        if (validatedField.width >= 50 && validatedField.height >= 20) {
          onFieldAdd(validatedField);
        }
      }

      setCurrentField(null);
      setIsDragging(false);
      setDragStart(null);
    }
  };

  // Field selection and manipulation
  const handleFieldSelect = (fieldId) => {
    setSelectedField(fieldId);
    onFieldSelect?.(fieldId);
  };

  const handleFieldDrag = (fieldId, newX, newY) => {
    const field = signatureFields.find(f => f.id === fieldId);
    if (!field) return;

    const currentPageData = pdfImages[field.pageNumber - 1];
    if (!currentPageData) return;

    // Constrain to page boundaries
    const maxX = currentPageData.width - field.width;
    const maxY = currentPageData.height - field.height;

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    onFieldUpdate(fieldId, { x: constrainedX, y: constrainedY });
  };

  const handleFieldResize = (fieldId, direction, deltaX, deltaY) => {
    const field = signatureFields.find(f => f.id === fieldId);
    if (!field) return;

    const fieldConfig = fieldTypes[field.type];
    const minWidth = fieldConfig.defaultWidth / 2;
    const minHeight = fieldConfig.defaultHeight / 2;

    let updates = {};

    switch (direction) {
      case 'nw':
        updates = {
          x: field.x + deltaX,
          y: field.y + deltaY,
          width: Math.max(minWidth, field.width - deltaX),
          height: Math.max(minHeight, field.height - deltaY)
        };
        break;
      case 'ne':
        updates = {
          y: field.y + deltaY,
          width: Math.max(minWidth, field.width + deltaX),
          height: Math.max(minHeight, field.height - deltaY)
        };
        break;
      case 'sw':
        updates = {
          x: field.x + deltaX,
          width: Math.max(minWidth, field.width - deltaX),
          height: Math.max(minHeight, field.height + deltaY)
        };
        break;
      case 'se':
        updates = {
          width: Math.max(minWidth, field.width + deltaX),
          height: Math.max(minHeight, field.height + deltaY)
        };
        break;
    }

    onFieldUpdate(fieldId, updates);
  };

  // Enhanced field rendering with resize handles
  const renderField = (field) => {
    const fieldConfig = fieldTypes[field.type] || fieldTypes.SIGNATURE;
    const isSelected = selectedField === field.id;
    const signer = signers.find(s => s.id === field.signerId);
    
    const style = {
      position: 'absolute',
      left: `${field.x * scale}px`,
      top: `${field.y * scale}px`,
      width: `${field.width * scale}px`,
      height: `${field.height * scale}px`,
      border: isSelected ? '2px solid #60a5fa' : '2px dashed #9ca3af',
      borderRadius: '4px',
      backgroundColor: fieldConfig.color.split(' ')[1],
      cursor: mode === 'placement' ? 'move' : 'default',
      zIndex: isSelected ? 20 : 10,
      pointerEvents: mode === 'placement' ? 'auto' : 'none'
    };

    return (
      <div
        key={field.id}
        style={style}
        className={`field-container group ${fieldConfig.color}`}
        onClick={() => handleFieldSelect(field.id)}
      >
        {/* Field Content */}
        <div className="w-full h-full flex flex-col items-center justify-center p-1">
          <fieldConfig.icon className="w-4 h-4 mb-1 opacity-70" />
          <span className="text-xs font-medium text-center leading-tight">
            {fieldConfig.label}
          </span>
          {signer && (
            <span className="text-xs opacity-60 text-center leading-tight">
              {signer.name}
            </span>
          )}
        </div>

        {/* Resize Handles */}
        {isSelected && mode === 'placement' && (
          <>
            {/* Northwest */}
            <div
              className="absolute -left-1 -top-1 w-2 h-2 bg-blue-400 rounded-sm cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('nw');
              }}
            />
            {/* Northeast */}
            <div
              className="absolute -right-1 -top-1 w-2 h-2 bg-blue-400 rounded-sm cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('ne');
              }}
            />
            {/* Southwest */}
            <div
              className="absolute -left-1 -bottom-1 w-2 h-2 bg-blue-400 rounded-sm cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('sw');
              }}
            />
            {/* Southeast */}
            <div
              className="absolute -right-1 -bottom-1 w-2 h-2 bg-blue-400 rounded-sm cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('se');
              }}
            />
          </>
        )}

        {/* Delete Button */}
        {isSelected && mode === 'placement' && (
          <button
            className="absolute -right-2 -top-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onFieldRemove(field.id);
            }}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  // Event listeners for drag and resize operations
  useEffect(() => {
    const handleGlobalMouseMove = (event) => {
      if (isDragging && currentField) {
        handleMouseMove(event);
      }
      
      if (isResizing && selectedField && resizeDirection) {
        const field = signatureFields.find(f => f.id === selectedField);
        if (!field) return;

        const pageElement = containerRef.current?.querySelector('.pdf-page-container');
        if (!pageElement) return;

        const rect = pageElement.getBoundingClientRect();
        const deltaX = (event.movementX / scale);
        const deltaY = (event.movementY / scale);

        handleFieldResize(selectedField, resizeDirection, deltaX, deltaY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
      if (isResizing) {
        setIsResizing(false);
        setResizeDirection(null);
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, isResizing, currentField, selectedField, resizeDirection, scale]);

  const currentPageData = pdfImages[currentPage - 1];

  return (
    <Card className={className}>
      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          Document Preview
          {totalPages > 0 && (
            <span className="text-sm text-gray-400 font-normal">
              (Page {currentPage} of {totalPages})
            </span>
          )}
        </h3>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Controls */}
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            <Tooltip content="Show Grid" position="bottom">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded transition-colors ${
                  showGrid ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </Tooltip>
            
            <Tooltip content="Zoom Out" position="bottom">
              <button
                onClick={() => setScale(prev => Math.max(0.3, prev - 0.2))}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded"
                disabled={scale <= 0.3}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </Tooltip>
            
            <span className="text-gray-400 text-sm min-w-12 text-center px-2">
              {Math.round(scale * 100)}%
            </span>
            
            <Tooltip content="Zoom In" position="bottom">
              <button
                onClick={() => setScale(prev => Math.min(3, prev + 0.2))}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded"
                disabled={scale >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </Tooltip>
            
            <Tooltip content="Reset Zoom" position="bottom">
              <button
                onClick={() => setScale(1.0)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          {/* Fullscreen Toggle */}
          <Tooltip content={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} position="bottom">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </Tooltip>

          {/* External View */}
          <Tooltip content="Open in New Tab" position="bottom">
            <button
              onClick={() => {
                if (file) {
                  let pdfUrl;
                  if (file instanceof File) {
                    pdfUrl = URL.createObjectURL(file);
                  } else if (file.url) {
                    pdfUrl = `http://localhost:3000${file.url}`;
                  }
                  if (pdfUrl) window.open(pdfUrl, '_blank');
                }
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Field Placement Instructions */}
      {mode === 'placement' && (
        <div className="mb-4 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assign to Signer
              </label>
              <select
                value={selectedSignerId || ''}
                onChange={(e) => onSignerSelect(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a signer...</option>
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
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose field type...</option>
                {fieldTemplates.map(template => (
                  <option key={template.type} value={template.type}>
                    {template.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedSignerId && selectedFieldType && (
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
              <p className="text-blue-300 text-sm flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                <span>
                  Drag a field template below and drop it on the document, or click and drag directly on the document to place a {selectedFieldType.toLowerCase()} field for {signers.find(s => s.id === selectedSignerId)?.name}
                </span>
              </p>
            </div>
          )}

          {/* Draggable Field Templates */}
          {selectedSignerId && selectedFieldType && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400 text-sm w-full mb-2">Drag these templates to the document:</p>
              {fieldTemplates
                .filter(template => template.type === selectedFieldType)
                .map(template => {
                  const fieldConfig = fieldTypes[template.type];
                  return (
                    <div
                      key={template.type}
                      draggable
                      onDragStart={(e) => handleFieldDragStart(template.type, e)}
                      onDragEnd={handleDragEnd}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-lg cursor-grab bg-gray-700 hover:bg-gray-600 active:cursor-grabbing transition-all duration-200"
                    >
                      <template.icon className="w-4 h-4" />
                      <span className="text-sm text-white">{template.label}</span>
                      <Grip className="w-4 h-4 text-gray-400" />
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* PDF Document Container */}
      <div 
        ref={containerRef}
        className={`border border-gray-700 rounded-lg overflow-auto bg-gray-900 relative transition-all ${
          isFullscreen ? 'fixed inset-4 z-50' : 'max-h-96 min-h-96'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Loading PDF document...</p>
              <p className="text-gray-500 text-xs mt-1">This may take a moment for large files</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="font-medium text-red-400 mb-2">{error}</p>
              <p className="text-gray-400 text-sm mb-4">
                Please ensure you're using a valid PDF file and try again.
              </p>
              <Button
                variant="outline"
                onClick={loadPDFWithPDFJS}
                className="mt-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Loading
              </Button>
            </div>
          </div>
        ) : currentPageData ? (
          <div 
            className="pdf-page-container relative"
            style={{
              width: `${currentPageData.width * scale}px`,
              height: `${currentPageData.height * scale}px`,
              margin: '0 auto',
              cursor: isDragging ? 'grabbing' : (mode === 'placement' && selectedSignerId && selectedFieldType) ? 'crosshair' : 'default'
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: `${20 * scale}px ${20 * scale}px`
                }}
              />
            )}

            {/* PDF Page */}
            <img
              src={currentPageData.imageUrl}
              alt={`PDF Page ${currentPage}`}
              className="absolute top-0 left-0 w-full h-full shadow-lg"
              style={{ pointerEvents: 'none' }}
            />

            {/* Signature Fields */}
            {signatureFields
              .filter(field => field.pageNumber === currentPage)
              .map(renderField)}

            {/* Current Dragging Field */}
            {currentField && currentField.pageNumber === currentPage && (
              <div 
                style={{
                  position: 'absolute',
                  left: `${currentField.x * scale}px`,
                  top: `${currentField.y * scale}px`,
                  width: `${currentField.width * scale}px`,
                  height: `${currentField.height * scale}px`,
                  border: '2px dashed #60a5fa',
                  backgroundColor: 'rgba(96, 165, 250, 0.1)',
                  borderRadius: '4px',
                  pointerEvents: 'none',
                  zIndex: 15
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-blue-400 text-sm">
                  Placing {fieldTypes[currentField.type]?.label}
                </div>
              </div>
            )}

            {/* Drop Zone Overlay */}
            {mode === 'placement' && selectedSignerId && selectedFieldType && (
              <div className="absolute inset-0 border-2 border-dashed border-blue-400 opacity-0 hover:opacity-100 transition-opacity pointer-events-none rounded" />
            )}
          </div>
        ) : file ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">PDF document loaded</p>
              <p className="text-gray-500 text-sm mt-1">Preparing enhanced preview...</p>
              <Button
                variant="outline"
                onClick={loadPDFWithPDFJS}
                className="mt-4"
              >
                <RotateCcw className="w-4 h-4" />
                Generate Preview
              </Button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No PDF document loaded</p>
              <p className="text-gray-500 text-sm mt-1">Upload a PDF file to begin</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Page Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
          >
            Previous Page
          </Button>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Page {i + 1}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
          >
            Next Page
          </Button>
        </div>
      )}

      {/* Field Statistics */}
      {mode === 'placement' && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Fields on current page:</span>
            <span className="text-white font-medium">
              {signatureFields.filter(f => f.pageNumber === currentPage).length} fields
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-400">Total fields in document:</span>
            <span className="text-white font-medium">
              {signatureFields.length} fields across {new Set(signatureFields.map(f => f.pageNumber)).size} pages
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

// ===============================
// 👤 Enhanced Signer Form Component
// ===============================

const SignerForm = ({ signer, index, onUpdate, onRemove, isLast, isSigned = false, isCurrent = false }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const isEditable = !isSigned;

  return (
    <Card className={`relative transition-all ${
      isCurrent ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
            isSigned ? 'bg-green-600' : 
            isCurrent ? 'bg-blue-600' : 'bg-gray-600'
          }`}>
            {index + 1}
          </div>
          <div>
            <h4 className="font-medium text-white flex items-center gap-2">
              {signer.name || `Signer ${index + 1}`}
              {isSigned && <CheckCircle className="w-4 h-4 text-green-400" />}
              {isCurrent && <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />}
            </h4>
            <p className="text-gray-400 text-sm">{signer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditable && (
            <>
              <Tooltip content={isExpanded ? "Collapse" : "Expand"} position="top">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </Tooltip>
              {!isLast && (
                <Tooltip content="Remove Signer" position="top">
                  <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Tooltip>
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
            helper="The signer's full legal name"
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={signer.email}
            onChange={(e) => onUpdate({ ...signer, email: e.target.value })}
            required
            helper="Where to send the signing invitation"
          />
        </div>
      )}
    </Card>
  );
};

// ===============================
// 🧠 Enhanced MAIN CREATE/EDIT DOCUMENT COMPONENT
// ===============================

export default function CreateDocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Enhanced State
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdDocument, setCreatedDocument] = useState(null);
  const [createdEnvelope, setCreatedEnvelope] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Enhanced Signature field state
  const [signatureFields, setSignatureFields] = useState([]);
  const [selectedSignerId, setSelectedSignerId] = useState(null);
  const [selectedFieldType, setSelectedFieldType] = useState('SIGNATURE');
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [fieldHistory, setFieldHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Enhanced Form data
  const [formData, setFormData] = useState({
    title: '',
    file: null,
    signers: [
      { 
        id: 1, 
        name: '', 
        email: '',
        role: 'signer',
        order: 1
      }
    ],
    expirationDays: 30,
    message: 'Please review and sign this document at your earliest convenience.',
    reminders: true,
    allowDecline: false,
    enableAuditTrail: true,
    requireAuthentication: false,
    branding: {
      companyName: '',
      logoUrl: '',
      primaryColor: '#2563eb'
    }
  });

  const isEditMode = !!id;

  // Enhanced template handling
  useEffect(() => {
    if (location.state?.template) {
      const template = location.state.template;
      console.log('Template from location state:', template);
      
      if (template.isPredefined) {
        setFormData(prev => ({
          ...prev,
          title: template.name,
          file: { url: template.fileUrl, name: template.name }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          title: template.name,
          file: { url: template.fileUrl, name: template.name }
        }));
      }
      
      setStep(2);
    }
  }, [location.state]);

  // FIXED: Enhanced field history management
  const saveToHistory = useCallback((fields) => {
    const newHistory = fieldHistory.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(fields))); // Deep clone
    setFieldHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [fieldHistory, historyIndex]);

  const undoFieldChange = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSignatureFields(JSON.parse(JSON.stringify(fieldHistory[newIndex])));
    }
  }, [historyIndex, fieldHistory]);

  const redoFieldChange = useCallback(() => {
    if (historyIndex < fieldHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSignatureFields(JSON.parse(JSON.stringify(fieldHistory[newIndex])));
    }
  }, [historyIndex, fieldHistory]);

  // FIXED: Enhanced field operations with history
  const handleAddSignatureField = useCallback((field) => {
    const newField = { 
      ...field, 
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      // Ensure signerId is properly set
      signerId: field.signerId || selectedSignerId
    };
    
    const newFields = [...signatureFields, newField];
    setSignatureFields(newFields);
    saveToHistory(newFields);
    console.log('Field added:', newField);
    console.log('Total fields:', newFields.length);
    console.log('Fields by signer:', newFields.reduce((acc, f) => {
      acc[f.signerId] = (acc[f.signerId] || 0) + 1;
      return acc;
    }, {}));
  }, [signatureFields, saveToHistory, selectedSignerId]);

  const handleUpdateSignatureField = useCallback((fieldId, updates) => {
    const newFields = signatureFields.map(field => 
      field.id === fieldId ? { ...field, ...updates, updatedAt: new Date().toISOString() } : field
    );
    setSignatureFields(newFields);
    saveToHistory(newFields);
  }, [signatureFields, saveToHistory]);

  const handleRemoveSignatureField = useCallback((fieldId) => {
    const newFields = signatureFields.filter(field => field.id !== fieldId);
    setSignatureFields(newFields);
    setSelectedFieldId(null);
    saveToHistory(newFields);
  }, [signatureFields, saveToHistory]);

  const handleDuplicateField = useCallback((fieldId) => {
    const fieldToDuplicate = signatureFields.find(f => f.id === fieldId);
    if (fieldToDuplicate) {
      const duplicatedField = {
        ...fieldToDuplicate,
        id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: fieldToDuplicate.x + 20,
        y: fieldToDuplicate.y + 20,
        createdAt: new Date().toISOString()
      };
      const newFields = [...signatureFields, duplicatedField];
      setSignatureFields(newFields);
      saveToHistory(newFields);
    }
  }, [signatureFields, saveToHistory]);

  const handleClearAllFields = useCallback(() => {
    if (signatureFields.length > 0 && window.confirm('Are you sure you want to remove all signature fields? This action cannot be undone.')) {
      setSignatureFields([]);
      setSelectedFieldId(null);
      saveToHistory([]);
    }
  }, [signatureFields, saveToHistory]);

  // Enhanced signer management
  const handleAddSigner = useCallback(() => {
    const newSignerId = Math.max(...formData.signers.map(s => s.id), 0) + 1;
    
    setFormData(prev => ({
      ...prev,
      signers: [
        ...prev.signers,
        { 
          id: newSignerId, 
          name: '', 
          email: '',
          role: 'signer',
          order: prev.signers.length + 1
        }
      ]
    }));

    // Auto-select the new signer
    setSelectedSignerId(newSignerId);
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
    const newFields = signatureFields.filter(field => field.signerId !== signerToRemove.id);
    setSignatureFields(newFields);
    saveToHistory(newFields);

    // Reset selected signer if it was the removed one
    if (selectedSignerId === signerToRemove.id) {
      setSelectedSignerId(formData.signers[0]?.id || null);
    }
  }, [formData.signers, signatureFields, selectedSignerId, saveToHistory]);

  // FIXED: Enhanced field validation
  const validateForm = useCallback(() => {
    console.log('Validating form...');
    console.log('Signers:', formData.signers);
    console.log('Signature fields:', signatureFields);
    console.log('Fields by signer:', signatureFields.reduce((acc, f) => {
      acc[f.signerId] = (acc[f.signerId] || 0) + 1;
      return acc;
    }, {}));

    // Validate signers
    const invalidSigners = formData.signers.filter(signer => !signer.name.trim() || !signer.email.trim());
    if (invalidSigners.length > 0) {
      setError('Please fill in all signer information (name and email)');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = formData.signers.filter(signer => !emailRegex.test(signer.email));
    if (invalidEmails.length > 0) {
      setError('Please enter valid email addresses for all signers');
      return false;
    }

    // Validate signature fields
    if (signatureFields.length === 0) {
      setError('Please place at least one signature field on the document');
      return false;
    }

    // Validate that each signer has at least one field
    const signersWithFields = new Set(signatureFields.map(field => parseInt(field.signerId)));
    const signersWithoutFields = formData.signers.filter(signer => !signersWithFields.has(parseInt(signer.id)));
    
    console.log('Signers with fields:', Array.from(signersWithFields));
    console.log('Signers without fields:', signersWithoutFields.map(s => s.id));

    if (signersWithoutFields.length > 0) {
      const signerNames = signersWithoutFields.map(s => s.name || `Signer ${s.id}`).join(', ');
      setError(`The following signers have no signature fields: ${signerNames}. Please place at least one field for each signer.`);
      return false;
    }

    setError('');
    return true;
  }, [formData.signers, signatureFields]);

  // Enhanced API calls with proper error handling
  const handleUploadDocument = async () => {
    if (!formData.file && !isEditMode) {
      setError('Please upload a PDF document');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setError('');

    try {
      const submitData = new FormData();
      
      if (formData.file instanceof File) {
        submitData.append('file', formData.file);
      }
      
      submitData.append('title', formData.title);
      submitData.append('metadata', JSON.stringify({
        pageCount: 1, // Will be updated after upload
        fileSize: formData.file?.size || 0,
        uploadedAt: new Date().toISOString()
      }));

      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

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

      const url = isEditMode && createdDocument 
        ? `http://localhost:3000/api/v1/documents/${createdDocument.id}`
        : 'http://localhost:3000/api/v1/documents';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
        body: submitData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'upload'} document (${response.status})`);
      }

      const document = await response.json();
      setUploadProgress(100);
      
      setCreatedDocument(document);
      setStep(2);
      setSuccess(`Document ${isEditMode ? 'updated' : 'uploaded'} successfully!`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error.message || `Failed to ${isEditMode ? 'update' : 'upload'} document. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FIXED: Enhanced envelope creation with proper field saving
  const handleCreateEnvelope = async () => {
    console.log('Creating envelope...');
    console.log('Current signature fields:', signatureFields);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formData.expirationDays);

      // Prepare enhanced signers data
      const envelopeSigners = formData.signers.map((signer, index) => ({
        name: signer.name,
        email: signer.email,
        role: signer.role,
        order: index + 1,
        requireAuthentication: formData.requireAuthentication
      }));

      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      let envelope;
      
      if (isEditMode && createdEnvelope) {
        // Update existing envelope
        const response = await fetch(`http://localhost:3000/api/v1/envelopes/${createdEnvelope.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            signers: envelopeSigners,
            expiresAt: expiresAt.toISOString(),
            message: formData.message,
            settings: {
              allowDecline: formData.allowDecline,
              enableAuditTrail: formData.enableAuditTrail,
              reminders: formData.reminders
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update envelope');
        }
        envelope = await response.json();
        
        // Save signature fields AFTER envelope update
        await saveSignatureFields(envelope.id);
      } else {
        // Create new envelope
        const response = await fetch('http://localhost:3000/api/v1/envelopes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            documentId: createdDocument.id,
            signers: envelopeSigners,
            expiresAt: expiresAt.toISOString(),
            message: formData.message,
            settings: {
              allowDecline: formData.allowDecline,
              enableAuditTrail: formData.enableAuditTrail,
              reminders: formData.reminders
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create envelope');
        }
        envelope = await response.json();
        setCreatedEnvelope(envelope);
        
        // Save signature fields AFTER envelope creation
        await saveSignatureFields(envelope.id);
      }
      
      setStep(3);
      setSuccess(`Envelope ${isEditMode ? 'updated' : 'created'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Error creating/updating envelope:', error);
      setError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} envelope. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FIXED: Enhanced signature field saving
  const saveSignatureFields = async (envelopeId) => {
    try {
      if (signatureFields.length === 0) {
        console.warn('No signature fields to save');
        return;
      }

      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');

      // Prepare fields data with proper validation
      const fieldsToSave = signatureFields.map(field => {
        // Ensure all required properties exist and have valid values
        return {
          signerId: parseInt(field.signerId),
          pageNumber: field.pageNumber || 1,
          x: Math.max(0, Math.round(field.x)),
          y: Math.max(0, Math.round(field.y)),
          width: Math.max(50, Math.round(field.width)), // Minimum width
          height: Math.max(30, Math.round(field.height)), // Minimum height
          type: field.type || 'SIGNATURE',
          required: true,
          metadata: {
            createdAt: field.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      });

      console.log('Saving signature fields:', {
        envelopeId,
        fieldCount: fieldsToSave.length,
        fields: fieldsToSave
      });

      const response = await fetch('http://localhost:3000/api/v1/signature-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          signingRequestId:envelopeId,
          fields: fieldsToSave
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Failed to save signature fields: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Signature fields saved successfully:', result);
      return result;

    } catch (error) {
      console.error('Error saving signature fields:', error);
      throw error;
    }
  };

  const handleSendEnvelope = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const apiKey = localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/v1/envelopes/${createdEnvelope.id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': apiKey,
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send envelope');
      }

      const result = await response.json();
      
      setSuccess('Envelope sent successfully! Signers will receive email invitations.');
      setTimeout(() => {
        navigate('/documents');
      }, 2000);

    } catch (error) {
      console.error('Error sending envelope:', error);
      setError(error.message || 'Failed to send envelope. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced file handling
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file. Other file types are not supported.');
        return;
      }

      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        setError('File size must be less than 25MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.replace('.pdf', '')
      }));
      
      // Reset signature fields when new file is selected
      setSignatureFields([]);
      setFieldHistory([]);
      setHistoryIndex(-1);
      setError('');
    }
  }, []);

  // Enhanced field analysis
  const getFieldStatistics = useCallback(() => {
    const stats = {
      total: signatureFields.length,
      byType: {},
      bySigner: {},
      byPage: {}
    };

    signatureFields.forEach(field => {
      // Count by type
      stats.byType[field.type] = (stats.byType[field.type] || 0) + 1;
      
      // Count by signer
      const signerId = parseInt(field.signerId);
      stats.bySigner[signerId] = (stats.bySigner[signerId] || 0) + 1;
      
      // Count by page
      stats.byPage[field.pageNumber] = (stats.byPage[field.pageNumber] || 0) + 1;
    });

    return stats;
  }, [signatureFields]);

  const fieldStats = getFieldStatistics();

  // Auto-select first signer when component mounts
  useEffect(() => {
    if (formData.signers.length > 0 && !selectedSignerId) {
      setSelectedSignerId(formData.signers[0].id);
    }
  }, [formData.signers, selectedSignerId]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Enhanced Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tooltip content="Back to Documents" position="bottom">
                <button
                  onClick={() => navigate('/documents')}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Tooltip>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {isEditMode ? 'Edit Document' : 'Create Document'}
                </h1>
                <p className="text-gray-400 text-sm">
                  {step === 1 && (isEditMode ? 'Update document details' : 'Upload your PDF document to get started')}
                  {step === 2 && 'Configure signers and place signature fields precisely where needed'}
                  {step === 3 && 'Review all settings and send for signing'}
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
                  disabled={isSubmitting}
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

          {/* Enhanced Progress Steps */}
          <div className="flex items-center justify-center mt-6">
            <div className="flex items-center">
              {[
                { number: 1, label: isEditMode ? 'Document' : 'Upload', icon: Upload },
                { number: 2, label: 'Signers & Fields', icon: Users },
                { number: 3, label: isEditMode ? 'Update' : 'Send', icon: Send }
              ].map((stepInfo, index) => (
                <div key={stepInfo.number} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      step >= stepInfo.number
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {step >= stepInfo.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <stepInfo.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    step >= stepInfo.number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {stepInfo.label}
                  </span>
                  {index < 2 && (
                    <div
                      className={`w-20 h-1 mx-6 transition-all ${
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
        {/* Enhanced Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="flex-1">{error}</p>
              <button
                onClick={() => setError('')}
                className="p-1 hover:bg-red-800/30 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800/50 rounded-lg animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3 text-green-400">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="flex-1">{success}</p>
              <button
                onClick={() => setSuccess('')}
                className="p-1 hover:bg-green-800/30 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Enhanced Form */}
          <div className="xl:col-span-2 space-y-6">
            {step === 1 && (
              <Card>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  {isEditMode ? 'Update Document' : 'Upload Document'}
                </h2>
                
                <div className="space-y-6">
                  <Input
                    label="Document Title"
                    placeholder="e.g., Employment Agreement, NDA, Contract"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    helper="Give your document a clear, descriptive name"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isEditMode ? 'Update PDF Document (Optional)' : 'Upload PDF Document'}
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-gray-500 transition-colors cursor-pointer bg-gray-800/20 hover:bg-gray-800/40"
                    >
                      <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-300 font-medium">
                        {formData.file ? 'Document Ready for Processing' : 'Drop your PDF here or click to browse'}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Maximum file size: 25MB • Supports all PDF standards
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
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Processing document...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-gray-500 text-xs">
                        {uploadProgress < 100 ? 'Uploading and processing document...' : 'Finalizing document setup...'}
                      </p>
                    </div>
                  )}
                </div>

                {isEditMode && (
                  <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-blue-300 font-medium">Editing Mode Active</p>
                        <p className="text-blue-400 mt-1">
                          You are editing an existing document. Uploading a new PDF will replace the current file and reset all signature field placements.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {step === 2 && (
              <>
                {/* Enhanced Signers Section */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-400" />
                      Manage Signers
                      <span className="text-sm text-gray-400 font-normal ml-2">
                        ({formData.signers.length} signer{formData.signers.length !== 1 ? 's' : ''})
                      </span>
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
                        isCurrent={selectedSignerId === signer.id}
                      />
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Signing Order:</span>
                      <span className="text-white font-medium">
                        {formData.signers.map(s => s.name || `Signer ${s.id}`).join(' → ')}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Enhanced Field Placement Section */}
                <AdvancedPDFViewer
                  file={formData.file}
                  signers={formData.signers}
                  signatureFields={signatureFields}
                  onFieldAdd={handleAddSignatureField}
                  onFieldUpdate={handleUpdateSignatureField}
                  onFieldRemove={handleRemoveSignatureField}
                  onFieldSelect={setSelectedFieldId}
                  selectedSignerId={selectedSignerId}
                  onSignerSelect={setSelectedSignerId}
                  selectedFieldType={selectedFieldType}
                  onFieldTypeSelect={setSelectedFieldType}
                  selectedFieldId={selectedFieldId}
                  mode="placement"
                  className="min-h-[600px]"
                />

                {/* Enhanced Settings Section */}
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-400" />
                    Advanced Settings
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Select
                      label="Expiration Period"
                      value={formData.expirationDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, expirationDays: parseInt(e.target.value) }))}
                      options={[
                        { value: 3, label: '3 days - Urgent' },
                        { value: 7, label: '7 days - Standard' },
                        { value: 14, label: '14 days - Extended' },
                        { value: 30, label: '30 days - Monthly' },
                        { value: 60, label: '60 days - Quarterly' },
                        { value: 90, label: '90 days - Annual' }
                      ]}
                      helper="How long signers have to complete signing"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Security Level
                      </label>
                      <select
                        value={formData.requireAuthentication ? 'high' : 'standard'}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          requireAuthentication: e.target.value === 'high' 
                        }))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="standard">Standard Security</option>
                        <option value="high">High Security (Email Verification)</option>
                      </select>
                      <p className="text-gray-500 text-sm mt-1">
                        {formData.requireAuthentication 
                          ? 'Signers must verify their email before signing' 
                          : 'Standard email invitation process'
                        }
                      </p>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Personal Message to Signers
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Add a personal message explaining the document and any special instructions for your signers..."
                      />
                      <p className="text-gray-500 text-sm mt-1">
                        This message will be included in the signing invitation email
                      </p>
                    </div>

                    <div className="space-y-3 lg:col-span-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.reminders}
                          onChange={(e) => setFormData(prev => ({ ...prev, reminders: e.target.checked }))}
                          className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        />
                        <Mail className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-white text-sm font-medium">Automatic Reminders</p>
                          <p className="text-gray-400 text-xs">Send reminder emails every 3 days until signed</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.allowDecline}
                          onChange={(e) => setFormData(prev => ({ ...prev, allowDecline: e.target.checked }))}
                          className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        />
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                        <div>
                          <p className="text-white text-sm font-medium">Allow Signers to Decline</p>
                          <p className="text-gray-400 text-xs">Signers can decline to sign with a reason</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.enableAuditTrail}
                          onChange={(e) => setFormData(prev => ({ ...prev, enableAuditTrail: e.target.checked }))}
                          className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        />
                        <FileText className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-white text-sm font-medium">Enable Audit Trail</p>
                          <p className="text-gray-400 text-xs">Complete record of all signing activities</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {step === 3 && (
              <Card>
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isEditMode ? 'Ready to Update!' : 'Ready to Send!'}
                  </h2>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    {isEditMode 
                      ? 'Your envelope has been updated with all changes. You can send it now or make further adjustments.'
                      : 'Your document is perfectly configured and ready for signing. Send it now to start the secure signing process.'
                    }
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-white font-medium text-sm truncate">{createdDocument?.title}</p>
                      <p className="text-gray-400 text-xs">Document</p>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-white font-medium">{formData.signers.length}</p>
                      <p className="text-gray-400 text-xs">Signers</p>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <Square className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-white font-medium">{signatureFields.length}</p>
                      <p className="text-gray-400 text-xs">Fields</p>
                    </div>
                    <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                      <p className="text-white font-medium">{formData.expirationDays}d</p>
                      <p className="text-gray-400 text-xs">Expires</p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit Signers & Fields
                    </Button>
                    
                    <Button
                      onClick={handleSendEnvelope}
                      variant="success"
                      disabled={isSubmitting}
                      size="lg"
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
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Enhanced Right Column - Advanced Preview & Summary */}
          <div className="space-y-6">
            {/* Enhanced Quick Stats */}
            <Card>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Process Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Document</span>
                  <span className="text-white truncate max-w-[120px]" title={createdDocument?.title || formData.title}>
                    {createdDocument?.title || formData.title || 'Not uploaded'}
                  </span>
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
                      <span className="text-gray-400">Pages with Fields</span>
                      <span className="text-white">{Object.keys(fieldStats.byPage).length} pages</span>
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

            {/* Enhanced Field Management */}
            {step >= 2 && (
              <Card>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Square className="w-4 h-4 text-purple-400" />
                  Field Management
                </h3>
                
                <div className="space-y-3">
                  {/* Field Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Tooltip content="Undo Last Change" position="top">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={undoFieldChange}
                        disabled={historyIndex <= 0}
                        className="w-full justify-center"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </Tooltip>
                    
                    <Tooltip content="Redo Change" position="top">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={redoFieldChange}
                        disabled={historyIndex >= fieldHistory.length - 1}
                        className="w-full justify-center"
                      >
                        <RotateCcw className="w-3 h-3 transform rotate-180" />
                      </Button>
                    </Tooltip>
                  </div>

                  {selectedFieldId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateField(selectedFieldId)}
                      className="w-full justify-center"
                    >
                      <Copy className="w-3 h-3" />
                      Duplicate Selected Field
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleClearAllFields}
                    disabled={signatureFields.length === 0}
                    className="w-full justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All Fields
                  </Button>
                </div>

                {/* Field Statistics */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Field Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(fieldStats.byType).map(([type, count]) => {
                      const config = fieldTypes[type];
                      return (
                        <div key={type} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${config.color.split(' ')[1]}`} />
                            <span className="text-gray-300">{config.label}</span>
                          </div>
                          <span className="text-white font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Enhanced Field Types Legend */}
            {step >= 2 && (
              <Card>
                <h3 className="font-semibold text-white mb-4">Field Types Guide</h3>
                <div className="space-y-3">
                  {Object.entries(fieldTypes).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-gray-800/30">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${config.color} border`}>
                        <config.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{config.label}</p>
                        <p className="text-gray-400 text-xs">
                          {config.defaultWidth}×{config.defaultHeight}px default
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Enhanced Quick Actions */}
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
                      setSelectedFieldId(null);
                    }}
                    className="w-full justify-center"
                  >
                    <MousePointer className="w-3 h-3" />
                    Reset Field Placement
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Auto-place common fields
                      const commonFields = [
                        { type: 'SIGNATURE', x: 100, y: 100 },
                        { type: 'DATE', x: 100, y: 180 },
                        { type: 'NAME', x: 100, y: 260 }
                      ];
                      
                      commonFields.forEach(field => {
                        if (selectedSignerId) {
                          handleAddSignatureField({
                            ...field,
                            signerId: selectedSignerId,
                            pageNumber: 1,
                            width: fieldTypes[field.type].defaultWidth,
                            height: fieldTypes[field.type].defaultHeight
                          });
                        }
                      });
                    }}
                    disabled={!selectedSignerId}
                    className="w-full justify-center"
                  >
                    <Square className="w-3 h-3" />
                    Auto-Place Common Fields
                  </Button>
                </div>
              </Card>
            )}

            {/* Enhanced Tips & Best Practices */}
            {step >= 2 && (
              <Card>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  Pro Tips
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
                    <p className="text-blue-300 font-medium">Field Placement</p>
                    <p className="text-blue-400 text-xs mt-1">
                      Place fields in clear, designated areas. Use the grid for precise alignment.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-900/20 rounded-lg border border-green-800/50">
                    <p className="text-green-300 font-medium">Signer Experience</p>
                    <p className="text-green-400 text-xs mt-1">
                      Ensure each signer has all required fields. Test the flow before sending.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-800/50">
                    <p className="text-purple-300 font-medium">Legal Compliance</p>
                    <p className="text-purple-400 text-xs mt-1">
                      Include date fields and enable audit trail for legal documents.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};