'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import AuthComponent from '@/components/AuthComponent';
import AppBuilder from '@/components/AppBuilder';
import Header from '@/components/Header';
import LandingPage from '@/components/LandingPage';
import { useState } from 'react';

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <AppBuilder />
      </main>
    );
  }

  return (
    <main>
      <Header onAuthClick={() => setShowAuth(true)} />
      {showAuth ? (
        <AuthComponent />
      ) : (
        <div onClick={() => setShowAuth(true)}>
          <LandingPage />
        </div>
      )}
    </main>
  );
}