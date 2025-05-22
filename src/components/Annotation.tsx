import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { usePDF } from '../context/PDFContext';
import Draggable from 'react-draggable';

interface AnnotationProps {
  annotation: any;
  index: number;
  scale: number;
  pageWidth: number;
  isViewOnly?: boolean;
  onSelect?: (index: number) => void;
  selectedIndex?: number | null;
}

const Annotation: React.FC<AnnotationProps> = ({ 
  annotation, 
  index, 
  scale, 
  pageWidth,
  onSelect,
  selectedIndex,
  isViewOnly = false
}) => {
  const { removeAnnotation, updateAnnotation } = usePDF();
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef(null);
  
  // Determinar si esta anotación está seleccionada
  const isSelected = selectedIndex === index;

  // Manejar el inicio del arrastre
  const handleStart = () => {
    if (isViewOnly) return false;
    setIsDragging(true);
    if (onSelect) onSelect(index);
  };

  // Manejar el fin del arrastre
  const handleStop = (_e: any, data: any) => {
    setIsDragging(false);
    
    // Convertir posición de píxeles a unidades del PDF
    const newX = annotation.x + data.x / scale;
    const newY = annotation.y + data.y / scale;
    
    // Actualizar la posición en el contexto
    updateAnnotation(index, {
      ...annotation,
      x: newX,
      y: newY
    });
  };

  // Manejador de clic
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect && !isViewOnly) onSelect(index);
  };

  // Eliminar la anotación
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Asegurarnos de que el evento no burbujee
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    // Eliminar con un pequeño retraso para evitar conflictos con otros eventos
    setTimeout(() => {
      console.log(`Eliminando anotación ${index}`);
      removeAnnotation(index);
    }, 10);
  };

  // Renderizar botón de eliminación fuera del componente Draggable para evitar conflictos
  const renderDeleteButton = () => {
    if (isSelected && !isDragging && !isViewOnly) {
      return (
        <button
          onClick={handleDelete}
          className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-sm hover:bg-red-50 text-red-600 z-[1000]"
          style={{ pointerEvents: 'auto' }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      );
    }
    return null;
  };

  return (
    <div className="annotation-wrapper relative" style={{ position: 'absolute' }}>
      {renderDeleteButton()}
      <Draggable
        nodeRef={nodeRef}
        disabled={isViewOnly}
        onStart={handleStart}
        onStop={handleStop}
        position={{x: 0, y: 0}} // Siempre reiniciar a 0,0 para evitar acumulación
        scale={scale}
      >
        <div
          ref={nodeRef}
          className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
          style={{
            top: `${annotation.y * scale}px`,
            left: `${annotation.x * scale}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: isDragging ? 1000 : 10,
            touchAction: 'none'
          }}
          onClick={handleClick}
        >
          <div 
            className="bg-yellow-100 p-2 rounded shadow-sm text-sm group relative"
            style={{ 
              width: `${annotation.width * scale}px`,
              maxWidth: `${pageWidth * scale * 0.4}px`,
              userSelect: 'none'
            }}
          >
            {annotation.text}
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default Annotation; 