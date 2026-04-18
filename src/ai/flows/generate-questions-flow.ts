'use server';
/**
 * @fileOverview AI Flow to generate exam questions from plain text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

const GenerateQuestionsInputSchema = z.object({
  text: z.string().describe('The source text to generate questions from.'),
  count: z.number().min(1).max(20).describe('Number of questions to generate.'),
  type: z.enum(['MCQ', 'CQ']).describe('Type of questions to generate.'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(z.union([MCQSchema, CQSchema])),
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

Your task is to generate ONLY {{type}} questions.

If the requested type is MCQ:
- Each question must be in Bengali.
- Provide exactly 4 options for each question in Bengali.
- Specify the correct answer which MUST match one of the options exactly.
- Add a brief Bengali explanation for the answer.

If the requested type is CQ:
- Provide a Bengali stimulus (উদ্দীপক).
- Provide sub-questions ক, খ, গ, ঘ in Bengali as a, b, c, d fields.
- Provide model answers for each sub-question in Bengali.

Ensure all text output is in Bengali language and follows professional educational standards.`,
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
      throw new Error('AI failed to generate questions properly. Please try with different text.');
    }

    return output;
  }
);
