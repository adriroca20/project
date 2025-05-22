import React, { useState, useRef, useEffect } from 'react';
import { usePDF } from '../context/PDFContext';
import { Plus, Type, Highlighter, Undo2, Redo2 } from 'lucide-react';

const PDFEditor: React.FC = () => {
  const { 
    currentPage, 
    addAnnotation, 
    canUndo,
    canRedo,
    undo,
    redo,
  } = usePDF();
  const [activeToolType, setActiveToolType] = useState<string | null>(null);
  const [annotationText, setAnnotationText] = useState('');
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  // Agregar una variable de referencia para seguir el proceso de eliminación
  const isDeleting = useRef(false);

  const handlePDFClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeToolType === 'text' && !isAddingAnnotation) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setAnnotationPosition({ x, y });
      setIsAddingAnnotation(true);
    }
  };

  const handleAddAnnotation = () => {
    if (annotationText.trim() !== '' && !isProcessingAction) {
      setIsProcessingAction(true);
      addAnnotation({
        type: 'text',
        text: annotationText,
        x: annotationPosition.x,
        y: annotationPosition.y,
        page: currentPage,
        width: 200,
      });
      
      setAnnotationText('');
      setIsAddingAnnotation(false);
      setActiveToolType(null);
      
      // Restablecer el estado de procesamiento después de un breve retraso
      setTimeout(() => {
        setIsProcessingAction(false);
      }, 100);
    }
  };

  const handleCancelAnnotation = () => {
    setAnnotationText('');
    setIsAddingAnnotation(false);
    setActiveToolType(null);
  };

  // Modificar el useEffect para que respete el proceso de eliminación
  useEffect(() => {
    if (!isDeleting.current) {
      setIsProcessingAction(false);
    }
  }, []);

  return (
    <>
      <div
        className="absolute inset-0 z-10"
        style={{ pointerEvents: activeToolType === 'text' ? 'auto' : 'none' }}
        onClick={(e) => {
          if (activeToolType === 'text') {
            handlePDFClick(e);
          }
        }}
      >
        {/* Ya no renderizamos anotaciones aquí */}
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-1 flex items-center space-x-1 z-20">
        <button
          onClick={undo}
          disabled={!canUndo || isProcessingAction}
          className={`p-2 rounded-full ${
            canUndo && !isProcessingAction ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Undo"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo || isProcessingAction}
          className={`p-2 rounded-full ${
            canRedo && !isProcessingAction ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Redo"
        >
          <Redo2 className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          onClick={() => setActiveToolType(activeToolType === 'text' ? null : 'text')}
          className={`p-2 rounded-full ${
            activeToolType === 'text' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
          }`}
          title="Add text"
        >
          <Type className="w-5 h-5" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          title="Highlight text (coming soon)"
          disabled
        >
          <Highlighter className="w-5 h-5 text-gray-400" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          title="More tools (coming soon)"
          disabled
        >
          <Plus className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      {isAddingAnnotation && (
        <div
          className="absolute z-30 bg-white shadow-lg rounded-md p-2 border border-gray-300 animate-scale-in"
          style={{
            top: annotationPosition.y,
            left: annotationPosition.x,
            transform: 'translate(-50%, -50%)',
            width: '250px',
          }}
        >
          <textarea
            value={annotationText}
            onChange={(e) => setAnnotationText(e.target.value)}
            placeholder="Add your text here..."
            className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={handleCancelAnnotation}
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleAddAnnotation}
              disabled={isProcessingAction}
              className={`px-3 py-1 text-sm ${
                isProcessingAction ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
              } text-white rounded`}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PDFEditor;