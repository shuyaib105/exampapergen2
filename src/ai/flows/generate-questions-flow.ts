'use server';
/**
 * @fileOverview AI Flow to generate exam questions from plain text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuestionsInputSchema = z.object({
  text: z.string().describe('The source text to generate questions from.'),
  count: z.number().min(1).max(20).describe('Number of questions to generate.'),
  type: z.enum(['MCQ', 'CQ']).describe('Type of questions to generate.'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(z.any()).describe('Array of generated questions in the application format.'),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async (input) => {
    const prompt = input.type === 'MCQ' 
      ? `You are an expert exam paper setter in Bengali. 
         Generate exactly ${input.count} Multiple Choice Questions (MCQ) from the following text.
         Each question must have:
         1. A clear question in Bengali.
         2. Exactly 4 options in Bengali.
         3. The correct answer (must be one of the options).
         4. A brief explanation in Bengali for why the answer is correct.
         
         Output format MUST be a JSON array of objects with these keys: "question", "options", "answer", "explanation".
         
         Text: ${input.text}`
      : `You are an expert exam paper setter in Bengali.
         Generate exactly ${input.count} Creative Questions (CQ) from the following text.
         Each question must have:
         1. A stimulus (উদ্দীপক) based on the text.
         2. Four parts: ক (Knowledge), খ (Comprehension), গ (Application), ঘ (Higher Order Thinking).
         3. Short model answers for each part.
         
         Output format MUST be a JSON array of objects with these keys: 
         "stimulus", 
         "parts": { "a": "...", "b": "...", "c": "...", "d": "..." },
         "answers": { "a": "...", "b": "...", "c": "...", "d": "..." }
         
         Text: ${input.text}`;

    const { output } = await ai.generate({
      prompt,
      output: { format: 'json' },
    });

    // Ensure it's an array. Gemini sometimes wraps it in an object.
    const rawQuestions = output as any;
    const questionsArray = Array.isArray(rawQuestions) ? rawQuestions : (rawQuestions.questions || []);

    return { questions: questionsArray };
  }
);
