'use server';
/**
 * @fileOverview AI Flow to generate exam questions from plain text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define individual schemas for better clarity
const MCQSchema = z.object({
  question: z.string().describe('The question text in Bengali.'),
  options: z.array(z.string()).length(4).describe('Exactly 4 options in Bengali.'),
  answer: z.string().describe('The correct answer from the options.'),
  explanation: z.string().optional().describe('A short explanation in Bengali.'),
});

const CQSchema = z.object({
  stimulus: z.string().describe('The Bengali stimulus (উদ্দীপক).'),
  parts: z.object({
    a: z.string().describe('Knowledge based question (ক)'),
    b: z.string().describe('Understanding based question (খ)'),
    c: z.string().describe('Application based question (গ)'),
    d: z.string().describe('Higher order thinking based question (ঘ)'),
  }),
  answers: z.object({
    a: z.string().optional().describe('Answer to ক'),
    b: z.string().optional().describe('Answer to খ'),
    c: z.string().optional().describe('Answer to গ'),
    d: z.string().optional().describe('Answer to ঘ'),
  }),
});

const GenerateQuestionsInputSchema = z.object({
  text: z.string().describe('The source text to generate questions from.'),
  count: z.number().min(1).max(20).describe('Number of questions to generate.'),
  type: z.enum(['MCQ', 'CQ']).describe('Type of questions to generate.'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(z.any()).describe('Array of generated questions matching the requested type.'),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

const questionPrompt = ai.definePrompt({
  name: 'questionPrompt',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `
You are an expert exam paper setter specializing in the Bengali curriculum. 
Based on the source text provided below, generate exactly {{count}} {{type}} questions.

Source Text: 
{{{text}}}

INSTRUCTIONS:
- All output MUST be in the Bengali language.
- Follow professional educational standards for school/college exams.

IF TYPE IS MCQ:
- Each object in the 'questions' array must follow this structure:
  { "question": "...", "options": ["...", "...", "...", "..."], "answer": "...", "explanation": "..." }
- The 'answer' MUST be one of the strings provided in the 'options' array.

IF TYPE IS CQ:
- Each object in the 'questions' array must follow this structure:
  { "stimulus": "...", "parts": { "a": "...", "b": "...", "c": "...", "d": "..." }, "answers": { "a": "...", "b": "...", "c": "...", "d": "..." } }
- Ensure the stimulus is relevant to the text and sub-questions (ক, খ, গ, ঘ) flow logically.

Ensure the final output is a valid JSON object with a "questions" field containing the array.`,
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
