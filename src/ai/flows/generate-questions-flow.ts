'use server';
/**
 * @fileOverview AI Flow to generate exam questions from plain text.
 * Using Gemini 2.5 Flash for improved performance and accuracy.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// A single robust schema that Gemini can reliably fulfill for both types
const QuestionItemSchema = z.object({
  // Shared type indicator
  questionType: z.enum(['MCQ', 'CQ']),
  
  // MCQ specific fields
  question: z.string().optional().describe('The question text (for MCQ) in Bengali.'),
  options: z.array(z.string()).optional().describe('Exactly 4 options in Bengali (for MCQ).'),
  answer: z.string().optional().describe('The correct answer matching one of the options (for MCQ).'),
  explanation: z.string().optional().describe('Short explanation in Bengali (for MCQ).'),
  
  // CQ specific fields
  stimulus: z.string().optional().describe('The stimulus/context passage (উদ্দীপক) in Bengali (for CQ).'),
  parts: z.object({
    a: z.string().describe('Knowledge based question (ক)'),
    b: z.string().describe('Comprehension based question (খ)'),
    c: z.string().describe('Application based question (গ)'),
    d: z.string().describe('Higher order thinking based question (ঘ)'),
  }).optional().describe('The four sub-questions for CQ.'),
  answers: z.object({
    a: z.string().optional(),
    b: z.string().optional(),
    c: z.string().optional(),
    d: z.string().optional(),
  }).optional().describe('Optional model answers for CQ parts.'),
});

const GenerateQuestionsInputSchema = z.object({
  text: z.string().describe('The source text to generate questions from.'),
  count: z.number().min(1).max(20).describe('Number of questions to generate.'),
  type: z.enum(['MCQ', 'CQ']).describe('Type of questions to generate.'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(QuestionItemSchema).describe('List of generated questions.'),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

const questionPrompt = ai.definePrompt({
  name: 'questionPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `
You are an expert exam paper setter specializing in the Bengali curriculum. 
Based on the source text provided, generate exactly {{count}} {{type}} questions.

Source Text: 
{{{text}}}

INSTRUCTIONS:
- All output MUST be in the Bengali language.
- Follow professional educational standards for school/college exams in Bangladesh.

IF TYPE IS MCQ:
- Set questionType to 'MCQ'.
- Fill: question, options (exactly 4), answer, explanation.

IF TYPE IS CQ:
- Set questionType to 'CQ'.
- Fill: stimulus, parts (a, b, c, d), and optionally answers (a, b, c, d).

Return only valid JSON matching the requested schema.`,
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
    try {
      const { output } = await questionPrompt(input);
      
      if (!output || !output.questions || output.questions.length === 0) {
        throw new Error('AI failed to generate questions. Please try providing more context or different text.');
      }

      return output;
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      // Fallback for common API issues
      if (error.message?.includes('404')) {
        throw new Error('Model not found. Please check your Genkit/Gemini configuration.');
      }
      throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
    }
  }
);
