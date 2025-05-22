import React, { useState, useRef, useEffect } from 'react';
import { usePDF } from '../context/PDFContext';
import { Pencil, Upload, Check, X, Trash2, Undo2, Redo2 } from 'lucide-react';

const PDFSigner: React.FC = () => {
  const { 
    currentPage, 
    addSignature, 
    removeSignature,
    signatures,
    canUndo,
    canRedo,
    undo,
    redo
  } = usePDF();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showSignatureTools, setShowSignatureTools] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingSignature, setIsDraggingSignature] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isDrawMode && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
      }
    }
  }, [isDrawMode]);

  const handlePDFClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (signatureImage && !isDraggingSignature && !showSignatureTools) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPosition({ x, y });
      setIsDraggingSignature(true);
      setSelectedSignature(null);
    }
  };

  const handleSignatureMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingSignature) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPosition({ x, y });
    }
  };

  const handleSignatureDrop = () => {
    if (isDraggingSignature && signatureImage) {
      const width = signatureRef.current?.width || 200;
      
      addSignature({
        dataUrl: signatureImage,
        x: position.x,
        y: position.y,
        width: width,
        page: currentPage,
      });
      
      setSignatureImage(null);
      setIsDraggingSignature(false);
      setShowSignatureTools(false);
    }
  };

  const handleSignatureClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSignature(index);
  };

  const handleDeleteSignature = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSignature(index);
    setSelectedSignature(null);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSaveSignature = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setSignatureImage(dataUrl);
      setIsDrawMode(false);
    }
  };

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setSignatureImage(event.target.result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <>
      <div
        className="absolute inset-0 z-10"
        style={{ pointerEvents: 'auto' }}
        onClick={handlePDFClick}
        onMouseMove={handleSignatureMove}
        onMouseUp={handleSignatureDrop}
      >
        {signatures
          .filter(signature => signature.page === currentPage)
          .map((signature, index) => (
            <div
              key={`signature-${index}`}
              className={`absolute cursor-pointer ${selectedSignature === index ? 'ring-2 ring-primary-500' : ''}`}
              style={{
                top: signature.y,
                left: signature.x,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={(e) => handleSignatureClick(index, e)}
            >
              <div className="relative group">
                <img
                  src={signature.dataUrl}
                  alt="Signature"
                  style={{ width: `${signature.width}px` }}
                  className="max-w-xs"
                />
                {selectedSignature === index && (
                  <button
                    onClick={(e) => handleDeleteSignature(index, e)}
                    className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-sm hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        
        {isDraggingSignature && signatureImage && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: position.y,
              left: position.x,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img
              ref={signatureRef}
              src={signatureImage}
              alt="Signature"
              className="max-w-xs"
              style={{ maxHeight: '100px' }}
            />
          </div>
        )}
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-1 flex items-center space-x-1 z-20">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-full ${
            canUndo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Undo"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-full ${
            canRedo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Redo"
        >
          <Redo2 className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          onClick={() => setShowSignatureTools(true)}
          className="p-2 rounded-full hover:bg-gray-100"
          title="Add signature"
        >
          <Pencil className="w-5 h-5" />
        </button>
      </div>
      
      {showSignatureTools && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add Your Signature</h3>
              <button 
                onClick={() => setShowSignatureTools(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {!isDrawMode && !signatureImage && (
              <div className="space-y-4">
                <button
                  onClick={() => setIsDrawMode(true)}
                  className="w-full py-3 px-4 border border-gray-300 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-50"
                >
                  <Pencil className="w-5 h-5" />
                  <span>Draw Signature</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 border border-gray-300 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-50"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Signature</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadSignature}
                  />
                </div>
              </div>
            )}
            
            {isDrawMode && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Draw your signature below:</p>
                <div className="border border-gray-300 rounded">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={200}
                    className="w-full h-48 bg-white cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={clearSignature}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSaveSignature}
                    className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </button>
                </div>
              </div>
            )}
            
            {signatureImage && !isDrawMode && (
              <div className="space-y-4">
                <div className="border border-gray-300 rounded p-4 flex items-center justify-center bg-white">
                  <img
                    src={signatureImage}
                    alt="Your signature"
                    className="max-h-48"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Click anywhere on the document to place your signature.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSignatureImage(null)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSignatureTools(false)}
                    className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Use This Signature
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PDFSigner;