'use server';
/**
 * @fileOverview AI Flow to generate exam questions from plain text.
 * Using Gemini 2.5 Flash with robust schema for MCQ and CQ.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Unified schema for both MCQ and CQ to avoid "missing field" errors in structured output
const QuestionItemSchema = z.object({
  questionType: z.enum(['MCQ', 'CQ']).describe('Type: MCQ for Multiple Choice, CQ for Creative Question'),
  
  // MCQ specific fields (required if MCQ)
  question: z.string().describe('The question text in Bengali'),
  options: z.array(z.string()).describe('Exactly 4 options in Bengali (only for MCQ)'),
  answer: z.string().describe('The correct answer matching one of the options (only for MCQ)'),
  explanation: z.string().optional().describe('Short explanation in Bengali'),
  
  // Shared/CQ fields
  stimulus: z.string().optional().describe('The passage or stimulus in Bengali'),
  parts: z.object({
    a: z.string().describe('Knowledge (ক)'),
    b: z.string().describe('Comprehension (খ)'),
    c: z.string().describe('Application (গ)'),
    d: z.string().describe('Higher Thinking (ঘ)'),
  }).optional().describe('The four parts of a CQ question'),
  answers: z.object({
    a: z.string().optional(),
    b: z.string().optional(),
    c: z.string().optional(),
    d: z.string().optional(),
  }).optional().describe('Model answers for CQ parts'),
});

const GenerateQuestionsInputSchema = z.object({
  text: z.string().describe('Source text'),
  count: z.number().min(1).max(20).describe('Number of questions'),
  type: z.enum(['MCQ', 'CQ']).describe('Type to generate'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z.array(QuestionItemSchema),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

const questionPrompt = ai.definePrompt({
  name: 'questionPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `
You are an expert Bengali exam paper setter. 
Generate exactly {{count}} {{type}} questions based on this text:
{{{text}}}

STRICT RULES:
1. All text MUST be in Bengali.
2. For MCQ:
   - Provide "question", "options" (exactly 4), and "answer" (must be one of the options).
   - "questionType" must be 'MCQ'.
3. For CQ:
   - Provide "stimulus" and "parts" (a, b, c, d).
   - "questionType" must be 'CQ'.
4. Ensure the output is valid JSON matching the schema.
`,
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
      throw new Error('AI failed to generate questions.');
    }

    return output;
  }
);
