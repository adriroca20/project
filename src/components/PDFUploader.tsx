import React, { useState, useRef } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { usePDF } from '../context/PDFContext';
import { PDFDocument } from 'pdf-lib';

interface PDFUploaderProps {
  onFileUpload: () => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileUpload }) => {
  const { setFile, setPdfBytes, setPdfDoc, setTotalPages } = usePDF();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Read the file
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(bytes);
      const totalPages = pdfDoc.getPageCount();

      // Update context
      setFile(file);
      setPdfBytes(bytes);
      setPdfDoc(pdfDoc);
      setTotalPages(totalPages);
      
      // Notify parent component
      onFileUpload();
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError('Failed to process PDF. Please try another file.');
    } finally {
      setIsLoading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 animate-fade-in ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 bg-white'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload
              className={`w-16 h-16 ${
                isDragging ? 'text-primary-500' : 'text-gray-400'
              }`}
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {isLoading ? 'Processing PDF...' : 'Upload your PDF file'}
          </h3>
          <p className="text-gray-500">
            Drag and drop your file here, or click to browse
          </p>
          {error && <p className="text-error-600">{error}</p>}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileUp className="w-5 h-5 mr-2" />
            Select PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;