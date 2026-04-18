import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

// Register helper for Handlebars
// Note: In standard Genkit, you might need to handle logic in the flow 
// but for simple cases, defining separate prompts or checking type works best.
