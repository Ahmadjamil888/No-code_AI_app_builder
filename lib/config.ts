// Configuration utility for environment variables

export const config = {
  // Firebase
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  },

  // Gemini AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY!,
    apiUrl: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  },

  // App settings
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'AI App Builder',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Build complete React applications with AI',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
    maxPromptLength: parseInt(process.env.NEXT_PUBLIC_MAX_PROMPT_LENGTH || '2000'),
  },

  // Features
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    errorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
    previewSandbox: process.env.NEXT_PUBLIC_ENABLE_PREVIEW_SANDBOX === 'true',
  },

  // Preview settings
  preview: {
    timeout: parseInt(process.env.NEXT_PUBLIC_PREVIEW_TIMEOUT || '30000'),
  },

  // Rate limiting
  rateLimit: {
    rpm: parseInt(process.env.RATE_LIMIT_RPM || '10'),
  },

  // Security
  security: {
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
};

// Validation function to check if all required environment variables are set
export function validateConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'GEMINI_API_KEY',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Development helper to log configuration (without sensitive data)
export function logConfig() {
  if (config.app.debug) {
    console.log('App Configuration:', {
      app: config.app,
      features: config.features,
      preview: config.preview,
      rateLimit: config.rateLimit,
      // Don't log sensitive data like API keys
    });
  }
}