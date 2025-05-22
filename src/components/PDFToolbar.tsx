import React from 'react';
import { Download, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { usePDF } from '../context/PDFContext';
import { PDFDocument } from 'pdf-lib';

interface PDFToolbarProps {
  onReset: () => void;
}

const PDFToolbar: React.FC<PDFToolbarProps> = ({ onReset }) => {
  const { file, pdfDoc, scale, setScale, mode, setMode } = usePDF();

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.2, 0.6));
  };

  const handleDownload = async () => {
    if (!pdfDoc || !file) return;

    try {
      // Save any modifications to the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create a blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited_${file.name}`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap justify-between items-center">
      <div className="flex items-center space-x-2">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      <div className="flex sm:hidden space-x-2">
        <button
          onClick={() => setMode('view')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            mode === 'view'
              ? 'bg-primary-100 text-primary-800'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          View
        </button>
        <button
          onClick={() => setMode('edit')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            mode === 'edit'
              ? 'bg-primary-100 text-primary-800'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setMode('sign')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            mode === 'sign'
              ? 'bg-primary-100 text-primary-800'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Sign
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleDownload}
          className="p-2 rounded-md hover:bg-primary-50 text-primary-700 flex items-center"
          title="Download PDF"
        >
          <Download className="w-5 h-5 mr-1" />
          <span className="text-sm">Download</span>
        </button>
        <button
          onClick={onReset}
          className="p-2 rounded-md hover:bg-gray-200 text-gray-700 flex items-center"
          title="Upload new PDF"
        >
          <RotateCcw className="w-5 h-5 mr-1" />
          <span className="text-sm">New</span>
        </button>
      </div>
    </div>
  );
};

export default PDFToolbar;