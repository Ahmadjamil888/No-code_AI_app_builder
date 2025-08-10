'use client';

import { useState, useEffect } from 'react';
import { generateCode } from '@/lib/gemini';
import { collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { Send, Copy, Download, Play, Sparkles, History, Code2, FileText } from 'lucide-react';
import ExamplePrompts from './ExamplePrompts';

interface CodeSession {
  id: string;
  prompt: string;
  code: string;
  timestamp: Date;
  userId: string;
}

export default function CodeGenerator() {
  const [user] = useAuthState(auth);
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<CodeSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'codeSessions'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData: CodeSession[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessionsData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as CodeSession);
      });
      setSessions(sessionsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGenerateCode = async () => {
    if (!prompt.trim() || !user) return;

    setLoading(true);
    try {
      const code = await generateCode(prompt);
      setGeneratedCode(code);

      // Save to Firebase
      await addDoc(collection(db, 'codeSessions'), {
        prompt,
        code,
        timestamp: new Date(),
        userId: user.uid,
      });

      setPrompt('');
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  const downloadCode = (code: string, filename: string = 'generated-code.txt') => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSession = (session: CodeSession) => {
    setGeneratedCode(session.code);
    setSelectedSession(session.id);
  };

  const handleSelectPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Previous Sessions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <History className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Previous Sessions</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No sessions yet</p>
                  <p className="text-xs text-gray-400">Start generating code to see your history</p>
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
                      {session.prompt}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.timestamp.toLocaleDateString()} at {session.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="h-6 w-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">AI Code Generator</h2>
            </div>
            
            {/* Prompt Input */}
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Describe what you want to build:
              </label>
              <div className="relative">
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a React component for a todo list with add, delete, and mark complete functionality using TypeScript and Tailwind CSS"
                  className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  disabled={loading}
                />
                <button
                  onClick={handleGenerateCode}
                  disabled={loading || !prompt.trim()}
                  className="absolute bottom-3 right-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Code */}
            {generatedCode && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-5 w-5 text-primary-600" />
                    <label className="text-lg font-semibold text-gray-900">
                      Generated Code
                    </label>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(generatedCode)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => downloadCode(generatedCode)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-400 text-sm">Generated Code</span>
                  </div>
                  <pre className="code-editor bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm max-h-96 overflow-y-auto">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Example Prompts */}
            {!generatedCode && (
              <ExamplePrompts onSelectPrompt={handleSelectPrompt} />
            )}

            {/* Features Info */}
            {!generatedCode && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  What can I help you build?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h4 className="font-medium mb-2">Web Development</h4>
                    <ul className="space-y-1">
                      <li>• React/Next.js components</li>
                      <li>• HTML/CSS layouts</li>
                      <li>• JavaScript functions</li>
                      <li>• API endpoints</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Backend & More</h4>
                    <ul className="space-y-1">
                      <li>• Python scripts</li>
                      <li>• Database queries</li>
                      <li>• Mobile app code</li>
                      <li>• Any programming language</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Be specific about your requirements, including the programming language, 
                    framework, and any specific features you need.
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