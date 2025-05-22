import React from 'react';
import { FileText } from 'lucide-react';
import { usePDF } from '../context/PDFContext';

const Header: React.FC = () => {
  const { file, mode, setMode } = usePDF();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">PDF Editor & Signer</h1>
          </div>
          
          {file && (
            <div className="hidden sm:flex space-x-2">
              <button
                onClick={() => setMode('view')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'view'
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                View
              </button>
              <button
                onClick={() => setMode('edit')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'edit'
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setMode('sign')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'sign'
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sign
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;