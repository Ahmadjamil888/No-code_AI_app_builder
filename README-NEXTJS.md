# AI Code Generator - Lovable.dev Clone

A modern SaaS platform for generating code using AI, built with Next.js, Firebase, and Google Gemini AI. This application allows users to describe what they want to build and generates production-ready code instantly.

## Features

- 🤖 **AI-Powered Code Generation** - Powered by Google Gemini 2.0 Flash
- 🔐 **Firebase Authentication** - Email/password and Google OAuth
- 💾 **Session History** - Save and access previous code generations
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Built with Tailwind CSS
- 📋 **Copy & Download** - Easy code sharing and export
- 🔍 **Example Prompts** - Pre-built prompts for common use cases

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI**: Google Gemini 2.0 Flash
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crush
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database
4. Add your domain to authorized domains in Authentication settings
5. Copy your Firebase config to the `.env.local` file

## Gemini AI Setup

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your `.env.local` file

## Project Structure

```
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # API endpoint for code generation
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard page (protected)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── AuthComponent.tsx         # Authentication form
│   ├── CodeGenerator.tsx         # Main code generation interface
│   ├── ExamplePrompts.tsx        # Pre-built example prompts
│   ├── Header.tsx                # Navigation header
│   └── LandingPage.tsx           # Landing page
├── lib/
│   ├── firebase.ts               # Firebase configuration
│   └── gemini.ts                 # Gemini AI integration
└── ...
```

## Usage

1. **Sign Up/Sign In**: Create an account or sign in with Google
2. **Generate Code**: Describe what you want to build in the prompt area
3. **View Results**: Generated code appears with syntax highlighting
4. **Copy/Download**: Use the buttons to copy or download the code
5. **Session History**: Access your previous generations from the sidebar

## Example Prompts

- "Create a React component for a todo list with add, delete, and mark complete functionality"
- "Build a REST API endpoint for user authentication using Node.js and Express"
- "Create a responsive navbar component with mobile menu using React and Tailwind CSS"
- "Build a Python script for web scraping with BeautifulSoup"

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@yourapp.com or create an issue in the repository.