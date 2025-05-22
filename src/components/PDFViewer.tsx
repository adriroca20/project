import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePDF } from '../context/PDFContext';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import Annotation from './Annotation';

// Set the workerSrc
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer: React.FC = () => {
  const { 
    file, 
    currentPage, 
    setCurrentPage, 
    totalPages, 
    setTotalPages,
    scale,
    annotations,
    signatures,
    mode,
  } = usePDF();
  
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setIsLoading(false);
  };

  const handlePageLoadSuccess = (page: any) => {
    setPageWidth(page.width);
    setPageHeight(page.height);
  };

  const handleSelectAnnotation = (index: number) => {
    setSelectedAnnotation(index === selectedAnnotation ? null : index);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && mode !== 'view') {
      setSelectedAnnotation(null);
    }
  };

  if (!file) return null;

  return (
    <div 
      className="flex-grow flex flex-col items-center justify-start overflow-auto bg-gray-100 p-4"
      onClick={handleClickOutside}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading PDF...</p>
          </div>
        </div>
      )}

      <Document
        file={file}
        onLoadSuccess={handleDocumentLoadSuccess}
        className="shadow-lg"
      >
        <div className="relative">
          <Page
            pageNumber={currentPage}
            scale={scale}
            onLoadSuccess={handlePageLoadSuccess}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="bg-white"
          />

          {/* Render annotations */}
          <div className="absolute top-0 left-0">
            {annotations
              .filter(annotation => annotation.page === currentPage)
              .map((annotation, index) => (
                <Annotation
                  key={`annotation-${index}`}
                  annotation={annotation}
                  index={index}
                  scale={scale}
                  pageWidth={pageWidth}
                  isViewOnly={mode === 'view'}
                  onSelect={mode !== 'view' ? handleSelectAnnotation : undefined}
                  selectedIndex={selectedAnnotation}
                />
              ))}
          </div>

          {/* Render signatures */}
          <div className="absolute top-0 left-0" style={{ pointerEvents: 'none' }}>
            {signatures
              .filter(signature => signature.page === currentPage)
              .map((signature, index) => (
                <div
                  key={`signature-${index}`}
                  className="absolute"
                  style={{
                    top: `${signature.y * scale}px`,
                    left: `${signature.x * scale}px`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'all',
                  }}
                >
                  <img 
                    src={signature.dataUrl} 
                    alt="Signature" 
                    style={{ 
                      width: `${signature.width * scale}px`,
                      height: 'auto',
                    }}
                    className="max-w-xs"
                  />
                </div>
              ))}
          </div>
        </div>
      </Document>
    </div>
  );
};

export default PDFViewer;