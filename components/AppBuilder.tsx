'use client';

import { useState, useEffect } from 'react';
import { generateApp } from '@/lib/gemini';
import { collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { Send, Copy, Download, Play, Sparkles, History, Code2, FileText, Eye, Monitor, Smartphone, Tablet } from 'lucide-react';
import AppPreview from './AppPreview';

interface AppSession {
  id: string;
  prompt: string;
  appCode: string;
  appName: string;
  timestamp: Date;
  userId: string;
  files: { [key: string]: string };
}

export default function AppBuilder() {
  const [user] = useAuthState(auth);
  const [prompt, setPrompt] = useState('');
  const [generatedApp, setGeneratedApp] = useState<{
    code: string;
    files: { [key: string]: string };
    appName: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'appSessions'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData: AppSession[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessionsData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as AppSession);
      });
      setSessions(sessionsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGenerateApp = async () => {
    if (!prompt.trim() || !user) return;

    setLoading(true);
    try {
      console.log('Starting app generation...');
      const appData = await generateApp(prompt);
      console.log('App generated successfully:', appData);
      
      setGeneratedApp(appData);

      // Save to Firebase
      try {
        await addDoc(collection(db, 'appSessions'), {
          prompt,
          appCode: appData.code,
          appName: appData.appName,
          files: appData.files,
          timestamp: new Date(),
          userId: user.uid,
        });
        console.log('Saved to Firebase successfully');
      } catch (firebaseError) {
        console.error('Firebase save error (non-critical):', firebaseError);
        // Don't fail the whole operation if Firebase save fails
      }

      setPrompt('');
    } catch (error) {
      console.error('Error generating app:', error);
      alert(`Failed to generate app: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  const downloadApp = () => {
    if (!generatedApp) return;
    
    // Create a zip-like structure (simplified)
    let allFiles = '';
    Object.entries(generatedApp.files).forEach(([filename, content]) => {
      allFiles += `// ${filename}\n${content}\n\n`;
    });
    
    const blob = new Blob([allFiles], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedApp.appName || 'generated-app'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSession = (session: AppSession) => {
    setGeneratedApp({
      code: session.appCode,
      files: session.files,
      appName: session.appName
    });
    setSelectedSession(session.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Previous Sessions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center space-x-2 mb-4">
              <History className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Previous Apps</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No apps yet</p>
                  <p className="text-xs text-gray-400">Start building to see your history</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedSession === session.id
                        ? 'bg-primary-50 border-primary-200'
                        : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.appName || 'Untitled App'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {session.prompt}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {session.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">AI App Builder</h2>
              </div>
              
              {generatedApp && (
                <div className="flex items-center space-x-2">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        viewMode === 'preview'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Eye className="h-4 w-4 inline mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={() => setViewMode('code')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        viewMode === 'code'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Code2 className="h-4 w-4 inline mr-1" />
                      Code
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Prompt Input */}
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Describe the app you want to build:
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a todo app with dark mode, drag and drop functionality, and local storage. Include a clean modern design with animations."
                  className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-gray-900"
                  disabled={loading}
                />
                <button
                  onClick={handleGenerateApp}
                  disabled={loading || !prompt.trim()}
                  className="absolute bottom-3 right-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Building...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Build App</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const testApp = {
                      code: `function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Counter App</h1>
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-4">{count}</div>
        <div className="space-x-2">
          <button 
            onClick={() => setCount(count - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            -
          </button>
          <button 
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}`,
                      files: { 'App.tsx': `function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Counter App</h1>
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-4">{count}</div>
        <div className="space-x-2">
          <button 
            onClick={() => setCount(count - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            -
          </button>
          <button 
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}` },
                      appName: 'Test Counter App'
                    };
                    setGeneratedApp(testApp);
                  }}
                  className="absolute bottom-3 left-3 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Test
                </button>
              </div>
            </div>

            {/* Generated App */}
            {generatedApp && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-primary-600" />
                    <label className="text-lg font-semibold text-gray-900">
                      {generatedApp.appName || 'Generated App'}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    {viewMode === 'preview' && (
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setPreviewDevice('desktop')}
                          className={`p-2 rounded transition-colors ${
                            previewDevice === 'desktop'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title="Desktop"
                        >
                          <Monitor className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setPreviewDevice('tablet')}
                          className={`p-2 rounded transition-colors ${
                            previewDevice === 'tablet'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title="Tablet"
                        >
                          <Tablet className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setPreviewDevice('mobile')}
                          className={`p-2 rounded transition-colors ${
                            previewDevice === 'mobile'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title="Mobile"
                        >
                          <Smartphone className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => copyToClipboard(generatedApp.code)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={downloadApp}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {viewMode === 'preview' ? (
                  <AppPreview 
                    code={generatedApp.code} 
                    files={generatedApp.files}
                    device={previewDevice}
                  />
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-400 text-sm">Generated Code</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {Object.entries(generatedApp.files).map(([filename, content]) => (
                        <div key={filename} className="border-b border-gray-200 last:border-b-0">
                          <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                            {filename}
                          </div>
                          <pre className="code-editor bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto">
                            <code>{content}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Example Prompts */}
            {!generatedApp && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Example Apps You Can Build
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {[
                    "A simple counter app with increment and decrement buttons",
                    "A todo app with add, delete, and mark complete functionality",
                    "A weather dashboard with current weather display",
                    "A calculator app with basic math operations",
                    "A color picker tool with hex and RGB values",
                    "A timer app with start, stop, and reset functionality"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors text-sm text-blue-800 hover:text-blue-900"
                    >
                      {example}
                    </button>
                  ))}
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>💡 Tip:</strong> Start with simple apps first. Be specific about the functionality you want, 
                    and mention if you want specific colors or styling preferences.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}