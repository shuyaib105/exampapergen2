'use server';
/**
 * @fileOverview AI Flow to generate exam questions from plain text.
 * Using Gemini 2.5 Flash for improved performance and accuracy.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MCQQuestionSchema = z.object({
  question: z.string().describe('MCQ question text in Bengali.'),
  options: z.array(z.string()).describe('Exactly 4 options in Bengali.'),
  answer: z.string().describe('The correct answer (must match one of the options).'),
  explanation: z.string().optional().describe('Short explanation in Bengali.'),
});

const CQQuestionSchema = z.object({
  stimulus: z.string().describe('Bengali stimulus (উদ্দীপক).'),
  parts: z.object({
    a: z.string().describe('Knowledge based question (ক নং প্রশ্ন)'),
    b: z.string().describe('Comprehension based question (খ নং প্রশ্ন)'),
    c: z.string().describe('Application based question (গ নং প্রশ্ন)'),
    d: z.string().describe('Higher order thinking based question (ঘ নং প্রশ্ন)'),
  }).describe('Sub-questions ক, খ, গ, ঘ.'),
  answers: z.object({
    a: z.string().optional().describe('Answer for ক'),
    b: z.string().optional().describe('Answer for খ'),
    c: z.string().optional().describe('Answer for গ'),
    d: z.string().optional().describe('Answer for ঘ'),
  }).optional(),
});

const GenerateQuestionsInputSchema = z.object({
  text: z.string().describe('The source text to generate questions from.'),
  count: z.number().min(1).max(20).describe('Number of questions to generate.'),
  type: z.enum(['MCQ', 'CQ']).describe('Type of questions to generate.'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(z.any()).describe('Array of generated questions matching the requested type structure.'),
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
- Each item in "questions" must have: "question" (string), "options" (array of 4 strings), "answer" (string, must be one of options), "explanation" (string).

IF TYPE IS CQ:
- Each item in "questions" must have: "stimulus" (string), "parts" (object with a, b, c, d keys), "answers" (optional object with a, b, c, d keys).

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
