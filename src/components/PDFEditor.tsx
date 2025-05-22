import React, { useState, useRef, useEffect } from 'react';
import { usePDF } from '../context/PDFContext';
import { Plus, Type, Highlighter, Undo2, Redo2, Trash2 } from 'lucide-react';

const PDFEditor: React.FC = () => {
  const { 
    currentPage, 
    addAnnotation, 
    removeAnnotation,
    annotations,
    canUndo,
    canRedo,
    undo,
    redo,
    updateAnnotation
  } = usePDF();
  const [activeToolType, setActiveToolType] = useState<string | null>(null);
  const [annotationText, setAnnotationText] = useState('');
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const dragRef = useRef<{ startX: number; startY: number }>({ startX: 0, startY: 0 });

  // Agregar una variable de referencia para seguir el proceso de eliminación
  const isDeleting = useRef(false);

  const handlePDFClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && activeToolType === 'text' && !isAddingAnnotation) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setAnnotationPosition({ x, y });
      setIsAddingAnnotation(true);
      setSelectedAnnotation(null);
    }
  };

  const handleAddAnnotation = () => {
    if (annotationText.trim() !== '' && !isProcessingAction) {
      setIsProcessingAction(true);
      console.log(annotationPosition);
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

  const handleAnnotationClick = (index: number, e: React.MouseEvent) => {
    console.log('handleAnnotationClick', index);
    e.stopPropagation();
    if (!isDragging) {
      setSelectedAnnotation(index);
    }
  };

  const handleDeleteAnnotation = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevenir cualquier acción por defecto
    console.log('handleDeleteAnnotation llamado', index);
    
    if (!isProcessingAction) {
      isDeleting.current = true;
      setIsProcessingAction(true);
      console.log('Eliminando anotación', index);
      
      // Uso de setTimeout para asegurar que setIsProcessingAction se aplique primero
      setTimeout(() => {
        removeAnnotation(index);
        setSelectedAnnotation(null);
        
        // Otro setTimeout para asegurar que el estado se actualice después de removeAnnotation
        setTimeout(() => {
          console.log('Eliminación completa');
          setIsProcessingAction(false);
          isDeleting.current = false;
        }, 150);
      }, 0);
    } else {
      console.log('No se puede eliminar, hay una acción en proceso');
    }
  };

  const handleDragStart = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const annotation = annotations[index];
    setDragStartPos({
      x: annotation.x,
      y: annotation.y
    });
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(true);
    setSelectedAnnotation(index);
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (isDragging && selectedAnnotation !== null) {
      const rect = e.currentTarget.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      
      // Solo actualizamos el offset visual durante el arrastre
      setDragOffset({
        x: newX - dragStartPos.x,
        y: newY - dragStartPos.y
      });
    }
  };

  const handleDragEnd = () => {
    if (isDragging && selectedAnnotation !== null && !isProcessingAction) {
      const annotation = annotations[selectedAnnotation];
      
      setIsProcessingAction(true);
      
      // Crear una copia de la anotación con la nueva posición
      const updatedAnnotation = {
        ...annotation,
        x: dragStartPos.x + dragOffset.x,
        y: dragStartPos.y + dragOffset.y
      };
      
      // Actualizamos la anotación existente directamente
      updateAnnotation(selectedAnnotation, updatedAnnotation);
      
      setTimeout(() => {
        setIsProcessingAction(false);
      }, 100);
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  // Modificar el useEffect para que respete el proceso de eliminación
  useEffect(() => {
    if (!isDeleting.current) {
      setIsProcessingAction(false);
    }
  }, [annotations.length]);

  // Asegurar que el click fuera de una anotación deselecciona la actual
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && selectedAnnotation !== null && !isDragging) {
      setSelectedAnnotation(null);
    }
  };

  return (
    <>
      <div
        className="absolute inset-0 z-10"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => {
          if (activeToolType === 'text') {
            handlePDFClick(e);
          } else {
            handleOutsideClick(e);
          }
        }}
        onMouseMove={isDragging && !isProcessingAction ? handleDragMove : undefined}
        onMouseUp={handleDragEnd}
      >
        {annotations
          .filter(annotation => annotation.page === currentPage)
          .map((annotation, index) => (
            <div
              key={`annotation-${index}`}
              className={`absolute cursor-move ${selectedAnnotation === index ? 'ring-2 ring-primary-500' : ''}`}
              style={{
                top: `${annotation.y}px`,
                left: `${annotation.x}px`,
                transform: isDragging && selectedAnnotation === index 
                  ? `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))` 
                  : 'translate(-50%, -50%)',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              onClick={(e) => handleAnnotationClick(index, e)}
              onMouseDown={(e) => handleDragStart(index, e)}
            >
              <div 
                className="bg-yellow-100 p-2 rounded shadow-sm text-sm group relative"
                style={{ width: `${annotation.width}px` }}
              >
                {annotation.text}
                {selectedAnnotation === index && !isDragging && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteAnnotation(index, e);
                    }}
                    className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-sm hover:bg-red-50 text-red-600 z-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
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