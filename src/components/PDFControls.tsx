import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePDF } from '../context/PDFContext';

const PDFControls: React.FC = () => {
  const { currentPage, setCurrentPage, totalPages } = usePDF();

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageNumber = parseInt(e.target.value, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 flex items-center justify-center space-x-4">
      <button
        onClick={goToPreviousPage}
        disabled={currentPage <= 1}
        className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="flex items-center">
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={handlePageInputChange}
          className="w-12 text-center border border-gray-300 rounded-md p-1 text-sm"
        />
        <span className="mx-2 text-gray-600">of</span>
        <span className="text-gray-800">{totalPages}</span>
      </div>
      
      <button
        onClick={goToNextPage}
        disabled={currentPage >= totalPages}
        className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default PDFControls;