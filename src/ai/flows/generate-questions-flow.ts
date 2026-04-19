'use server';
/**
 * @fileOverview AI Flow to generate exam questions from plain text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define a unified item schema that handles both MCQ and CQ fields.
const GeneratedQuestionSchema = z.object({
  // MCQ fields
  question: z.string().optional().describe('Question text in Bengali.'),
  options: z.array(z.string()).optional().describe('4 options in Bengali.'),
  answer: z.string().optional().describe('Correct answer.'),
  explanation: z.string().optional().describe('Short explanation in Bengali.'),
  
  // CQ fields
  stimulus: z.string().optional().describe('Bengali stimulus (উদ্দীপক).'),
  parts: z.object({
    a: z.string().optional().describe('ক নং প্রশ্ন'),
    b: z.string().optional().describe('খ নং প্রশ্ন'),
    c: z.string().optional().describe('গ নং প্রশ্ন'),
    d: z.string().optional().describe('ঘ নং প্রশ্ন'),
  }).optional().describe('Sub-questions ক, খ, গ, ঘ.'),
  answers: z.object({
    a: z.string().optional().describe('ক এর উত্তর'),
    b: z.string().optional().describe('খ এর উত্তর'),
    c: z.string().optional().describe('গ এর উত্তর'),
    d: z.string().optional().describe('ঘ এর উত্তর'),
  }).optional().describe('Answers for ক, খ, গ, ঘ.'),
});

const GenerateQuestionsInputSchema = z.object({
  text: z.string().describe('The source text to generate questions from.'),
  count: z.number().min(1).max(20).describe('Number of questions to generate.'),
  type: z.enum(['MCQ', 'CQ']).describe('Type of questions to generate.'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).describe('Array of generated questions matching the requested type.'),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

const questionPrompt = ai.definePrompt({
  name: 'questionPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `
You are an expert exam paper setter specializing in the Bengali curriculum. 
Based on the source text provided below, generate exactly {{count}} {{type}} questions.

Source Text: 
{{{text}}}

INSTRUCTIONS:
- All output MUST be in the Bengali language.
- Follow professional educational standards for school/college exams in Bangladesh.

IF TYPE IS MCQ:
- For each item in the "questions" array, provide:
  - "question": string
  - "options": array of exactly 4 strings
  - "answer": string (must match one of the options)
  - "explanation": string (short reason for the answer)

IF TYPE IS CQ:
- For each item in the "questions" array, provide:
  - "stimulus": string (the উদ্দীপক)
  - "parts": { "a": "...", "b": "...", "c": "...", "d": "..." }
  - "answers": { "a": "...", "b": "...", "c": "...", "d": "..." } (optional but helpful)

Return a valid JSON object with the "questions" key.`,
});

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
    const { output } = await questionPrompt(input);
    
    if (!output || !output.questions || output.questions.length === 0) {
      throw new Error('AI failed to generate questions. Please try providing more context or different text.');
    }

    return output;
  }
);
