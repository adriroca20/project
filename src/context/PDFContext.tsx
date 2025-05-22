import React, { createContext, useState, useContext, ReactNode } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PDFContextType {
  file: File | null;
  setFile: (file: File | null) => void;
  pdfBytes: Uint8Array | null;
  setPdfBytes: (bytes: Uint8Array | null) => void;
  pdfDoc: PDFDocument | null;
  setPdfDoc: (doc: PDFDocument | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (total: number) => void;
  scale: number;
  setScale: (scale: number) => void;
  mode: 'view' | 'edit' | 'sign';
  setMode: (mode: 'view' | 'edit' | 'sign') => void;
  annotations: any[];
  addAnnotation: (annotation: any) => number;
  updateAnnotation: (index: number, annotation: any) => void;
  removeAnnotation: (index: number) => void;
  signatures: any[];
  addSignature: (signature: any) => void;
  removeSignature: (index: number) => void;
  resetPDF: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

interface EditState {
  annotations: any[];
  signatures: any[];
}

const defaultContext: PDFContextType = {
  file: null,
  setFile: () => {},
  pdfBytes: null,
  setPdfBytes: () => {},
  pdfDoc: null,
  setPdfDoc: () => {},
  currentPage: 1,
  setCurrentPage: () => {},
  totalPages: 0,
  setTotalPages: () => {},
  scale: 1,
  setScale: () => {},
  mode: 'view',
  setMode: () => {},
  annotations: [],
  addAnnotation: () => 0,
  updateAnnotation: () => {},
  removeAnnotation: () => {},
  signatures: [],
  addSignature: () => {},
  removeSignature: () => {},
  resetPDF: () => {},
  canUndo: false,
  canRedo: false,
  undo: () => {},
  redo: () => {},
};

const PDFContext = createContext<PDFContextType>(defaultContext);

export const usePDF = () => useContext(PDFContext);

interface PDFProviderProps {
  children: ReactNode;
}

export const PDFProvider: React.FC<PDFProviderProps> = ({ children }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [mode, setMode] = useState<'view' | 'edit' | 'sign'>('view');
  
  // History states
  const [history, setHistory] = useState<EditState[]>([{ annotations: [], signatures: [] }]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const currentState = history[currentHistoryIndex];
  const annotations = currentState.annotations;
  const signatures = currentState.signatures;

  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;

  const pushToHistory = (newState: EditState) => {
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentHistoryIndex(currentHistoryIndex + 1);
  };

  const addAnnotation = (annotation: any) => {
    const newAnnotations = [...annotations, annotation];
    console.log('newAnnotations', newAnnotations);
    pushToHistory({
      annotations: newAnnotations,
      signatures: signatures,
    });
    return newAnnotations.length - 1;
  };

  const updateAnnotation = (index: number, annotation: any) => {
    const newAnnotations = [...annotations];
    newAnnotations[index] = annotation;
    pushToHistory({
      annotations: newAnnotations,
      signatures: signatures,
    });
  };

  const removeAnnotation = (index: number) => {
    const newAnnotations = annotations.filter((_, i) => i !== index);
    pushToHistory({
      annotations: newAnnotations,
      signatures: signatures,
    });
  };

  const addSignature = (signature: any) => {
    const newSignatures = [...signatures, signature];
    pushToHistory({
      annotations: annotations,
      signatures: newSignatures,
    });
  };

  const removeSignature = (index: number) => {
    const newSignatures = signatures.filter((_, i) => i !== index);
    pushToHistory({
      annotations: annotations,
      signatures: newSignatures,
    });
  };

  const undo = () => {
    if (canUndo) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  const redo = () => {
    if (canRedo) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  };

  const resetPDF = () => {
    setFile(null);
    setPdfBytes(null);
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    setScale(1);
    setMode('view');
    setHistory([{ annotations: [], signatures: [] }]);
    setCurrentHistoryIndex(0);
  };

  return (
    <PDFContext.Provider
      value={{
        file,
        setFile,
        pdfBytes,
        setPdfBytes,
        pdfDoc,
        setPdfDoc,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        scale,
        setScale,
        mode,
        setMode,
        annotations,
        addAnnotation,
        updateAnnotation,
        removeAnnotation,
        signatures,
        addSignature,
        removeSignature,
        resetPDF,
        canUndo,
        canRedo,
        undo,
        redo,
      }}
    >
      {children}
    </PDFContext.Provider>
  );
};