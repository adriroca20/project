import React from 'react';
import { usePDF } from '../context/PDFContext';
import PDFViewer from './PDFViewer';
import PDFToolbar from './PDFToolbar';
import PDFEditor from './PDFEditor';
import PDFSigner from './PDFSigner';
import PDFControls from './PDFControls';

interface PDFWorkspaceProps {
  onReset: () => void;
}

const PDFWorkspace: React.FC<PDFWorkspaceProps> = ({ onReset }) => {
  const { file, mode, resetPDF } = usePDF();

  const handleReset = () => {
    resetPDF();
    onReset();
  };

  if (!file) return null;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-6xl mx-auto flex flex-col">
        <PDFToolbar onReset={handleReset} />
        
        <div className="flex-grow flex flex-col relative min-h-[70vh]">
          <PDFViewer />
          {mode === 'edit' && <PDFEditor />}
          {mode === 'sign' && <PDFSigner />}
        </div>

        <PDFControls />
      </div>
    </div>
  );
};

export default PDFWorkspace;