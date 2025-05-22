import React, { useState } from 'react';
import Header from './components/Header';
import PDFUploader from './components/PDFUploader';
import PDFWorkspace from './components/PDFWorkspace';
import { PDFProvider } from './context/PDFContext';

function App() {
  const [fileUploaded, setFileUploaded] = useState(false);

  return (
    <PDFProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
          {!fileUploaded ? (
            <PDFUploader onFileUpload={() => setFileUploaded(true)} />
          ) : (
            <PDFWorkspace onReset={() => setFileUploaded(false)} />
          )}
        </main>
        <footer className="bg-white py-4 border-t border-gray-200 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} PDF Editor & Signer. All rights reserved.
        </footer>
      </div>
    </PDFProvider>
  );
}

export default App;