import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config";

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateCode(prompt: string): Promise<string> {
  try {
    // Enhanced prompt for better code generation
    const enhancedPrompt = `
You are an expert software developer. Generate clean, well-commented, and production-ready code based on the following request:

${prompt}

Please provide:
1. Complete, working code
2. Proper error handling where applicable
3. Clear comments explaining key functionality
4. Best practices and modern syntax
5. If it's a web component, make it responsive and accessible

Return only the code without additional explanations unless specifically requested.
`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating code:", error);
    throw new Error("Failed to generate code");
  }
}

export async function generateApp(prompt: string): Promise<{
  code: string;
  files: { [key: string]: string };
  appName: string;
}> {
  try {
    console.log('Generating app with prompt:', prompt);
    
    const enhancedPrompt = `
Create a complete, functional React application based on this request: ${prompt}

IMPORTANT: Respond with ONLY a JSON object in this exact format (no markdown, no extra text):
{
  "appName": "descriptive-app-name",
  "files": {
    "App.tsx": "function App() { return (<div className='p-8 max-w-4xl mx-auto'>YOUR_COMPONENT_JSX_HERE</div>); }"
  }
}

Requirements for the React component:
1. Use ONLY React hooks (useState, useEffect, etc.) - no imports needed
2. Use Tailwind CSS classes for styling
3. Make it fully functional and interactive
4. Include proper state management
5. Make it responsive and visually appealing
6. No import statements - assume React and hooks are globally available
7. Return a complete JSX structure wrapped in a main div

Example structure:
function App() {
  const [state, setState] = React.useState(initialValue);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Your app content here */}
    </div>
  );
}
`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    console.log('Raw Gemini response:', responseText);
    
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      // Extract JSON from the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('No JSON found, creating fallback response');
        // Create a simple fallback app
        const fallbackCode = `function App() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Generated App</h1>
      <p className="text-gray-600">Based on: ${prompt}</p>
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <p className="text-blue-800">This is a generated React component. The AI response couldn't be parsed properly, but here's a basic structure.</p>
      </div>
    </div>
  );
}`;
        
        return {
          code: fallbackCode,
          files: { 'App.tsx': fallbackCode },
          appName: 'Generated App'
        };
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      console.log('Parsed response:', parsedResponse);
      
      const appCode = parsedResponse.files?.['App.tsx'] || parsedResponse.files?.[Object.keys(parsedResponse.files)[0]] || '';
      
      return {
        code: appCode,
        files: parsedResponse.files || { 'App.tsx': appCode },
        appName: parsedResponse.appName || 'Generated App'
      };
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Attempting to extract code directly...');
      
      // Try to extract React component directly from response
      const componentMatch = responseText.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*\}/);
      if (componentMatch) {
        const extractedCode = componentMatch[0];
        return {
          code: extractedCode,
          files: { 'App.tsx': extractedCode },
          appName: 'Generated App'
        };
      }
      
      // Final fallback
      const fallbackCode = `function App() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Generated App</h1>
      <p className="text-gray-600 mb-4">Request: ${prompt}</p>
      <div className="p-6 bg-gray-100 rounded-lg">
        <p className="text-gray-700">The AI generated content but it couldn't be parsed. Here's the raw response:</p>
        <pre className="mt-4 text-sm bg-white p-4 rounded border overflow-auto">{responseText.substring(0, 500)}...</pre>
      </div>
    </div>
  );
}`;
      
      return {
        code: fallbackCode,
        files: { 'App.tsx': fallbackCode },
        appName: 'Generated App'
      };
    }
  } catch (error) {
    console.error("Error generating app:", error);
    throw new Error(`Failed to generate app: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}