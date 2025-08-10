'use client';

import { useState } from 'react';
import { Code, Database, Smartphone, Globe } from 'lucide-react';

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const examples = [
  {
    icon: Code,
    category: "React Components",
    prompts: [
      "Create a responsive navbar component with mobile menu using React and Tailwind CSS",
      "Build a todo list component with add, delete, edit, and filter functionality",
      "Create a modal component with backdrop blur and smooth animations",
      "Build a data table component with sorting, filtering, and pagination"
    ]
  },
  {
    icon: Database,
    category: "Backend & APIs",
    prompts: [
      "Create a REST API endpoint for user authentication using Node.js and Express",
      "Build a GraphQL resolver for fetching and updating user profiles",
      "Create a database schema for an e-commerce application using PostgreSQL",
      "Build a middleware function for JWT token validation"
    ]
  },
  {
    icon: Smartphone,
    category: "Mobile Development",
    prompts: [
      "Create a React Native login screen with form validation",
      "Build a Flutter widget for displaying a list of products",
      "Create a SwiftUI view for a weather app with animations",
      "Build an Android fragment for displaying user profile"
    ]
  },
  {
    icon: Globe,
    category: "Web Development",
    prompts: [
      "Create a responsive landing page with hero section and features",
      "Build a CSS animation for a loading spinner",
      "Create a JavaScript function for form validation",
      "Build a responsive grid layout using CSS Grid"
    ]
  }
];

export default function ExamplePrompts({ onSelectPrompt }: ExamplePromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Prompts</h3>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {examples.map((category, index) => {
          const Icon = category.icon;
          return (
            <button
              key={index}
              onClick={() => setSelectedCategory(index)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === index
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.category}</span>
            </button>
          );
        })}
      </div>

      {/* Prompts */}
      <div className="space-y-2">
        {examples[selectedCategory].prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt)}
            className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700 hover:text-gray-900"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}