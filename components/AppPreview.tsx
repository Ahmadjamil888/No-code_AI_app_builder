'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AppPreviewProps {
  code: string;
  files: { [key: string]: string };
  device: 'desktop' | 'tablet' | 'mobile';
}

export default function AppPreview({ code, files, device }: AppPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const deviceStyles = {
    desktop: 'w-full h-[600px]',
    tablet: 'w-[768px] h-[600px] mx-auto',
    mobile: 'w-[375px] h-[600px] mx-auto'
  };

  useEffect(() => {
    if (!iframeRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Create the HTML content for the iframe
      const htmlContent = createPreviewHTML(files);
      
      // Write content to iframe
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        
        // Handle iframe load
        iframe.onload = () => {
          setLoading(false);
        };

        // Handle errors
        iframe.onerror = () => {
          setError('Failed to load preview');
          setLoading(false);
        };
      }
    } catch (err) {
      setError('Error creating preview');
      setLoading(false);
    }
  }, [code, files]);

  const createPreviewHTML = (files: { [key: string]: string }): string => {
    // Find the main component file (usually App.tsx or page.tsx)
    const mainFile = files['App.tsx'] || files['page.tsx'] || files['index.tsx'] || Object.values(files)[0];
    
    if (!mainFile) {
      throw new Error('No main file found');
    }

    console.log('Creating preview for:', mainFile);

    // Extract React component from the code
    const componentMatch = mainFile.match(/function\s+(\w+)/);
    const componentName = componentMatch?.[1] || 'App';

    // Create a complete HTML page with React
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Preview</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #ffffff;
        }
        .error { 
            padding: 20px; 
            color: #dc2626; 
            background: #fef2f2; 
            border: 1px solid #fecaca; 
            border-radius: 8px; 
            margin: 20px; 
        }
        #root {
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        // Make React hooks available globally
        const { useState, useEffect, useRef, useCallback, useMemo } = React;
        
        try {
            console.log('Loading component...');
            
            // Component code
            ${processComponentCode(mainFile)}
            
            console.log('Component loaded, rendering...');
            
            // Render the component
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(${componentName}));
            
            console.log('Component rendered successfully');
        } catch (error) {
            console.error('Preview error:', error);
            document.getElementById('root').innerHTML = 
                '<div class="error"><h3>Error rendering component:</h3><p>' + error.message + '</p><pre>' + error.stack + '</pre></div>';
        }
    </script>
</body>
</html>`;
  };

  const processComponentCode = (code: string): string => {
    console.log('Processing code:', code);
    
    // Remove import statements and export statements for browser compatibility
    let processedCode = code
      .replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '')
      .trim();

    // Ensure the code doesn't have any syntax issues
    processedCode = processedCode
      .replace(/React\./g, '') // Remove React. prefix since hooks are global
      .replace(/\bReact\b/g, ''); // Remove standalone React references

    console.log('Processed code:', processedCode);
    return processedCode;
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 ml-2">Live Preview</span>
        </div>
        <button
          onClick={refreshPreview}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh Preview"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-4 bg-gray-100">
        <div className={`${deviceStyles[device]} bg-white rounded-lg shadow-lg overflow-hidden relative`}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
          
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refreshPreview}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="App Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}