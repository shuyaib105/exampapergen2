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

const MCQSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.string(),
  explanation: z.string().optional(),
});

const CQSchema = z.object({
  stimulus: z.string(),
  parts: z.object({
    a: z.string(),
    b: z.string(),
    c: z.string(),
    d: z.string(),
  }),
  answers: z.object({
    a: z.string().optional(),
    b: z.string().optional(),
    c: z.string().optional(),
    d: z.string().optional(),
  }),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(z.any()), // Using any to allow union of MCQ and CQ
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

const questionPrompt = ai.definePrompt({
  name: 'questionPrompt',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `
You are an expert exam paper setter in Bengali. 
Generate exactly {{count}} {{type}} questions based on the following source text.

Source Text: 
{{{text}}}

Requirements for {{type}}:
{{#if (eq type "MCQ")}}
- Each MCQ must have a "question" in Bengali.
- "options" must be an array of exactly 4 Bengali strings.
- "answer" must match one of the options exactly.
- "explanation" should be a brief Bengali explanation.
{{else}}
- Each CQ must have a "stimulus" (উদ্দীপক) in Bengali.
- "parts" must have a, b, c, d as sub-questions in Bengali.
- "answers" must have a, b, c, d as model answers in Bengali.
{{/if}}

Output must be a JSON object with a "questions" array.`,
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
    
    if (!output || !output.questions) {
      throw new Error('AI failed to generate questions properly.');
    }

    return output;
  }
);
