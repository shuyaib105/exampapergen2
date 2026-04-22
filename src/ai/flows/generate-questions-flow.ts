
'use server';
/**
 * @fileOverview AI Flow to generate exam questions from plain text.
 * Using Gemini 2.5 Flash with robust schema for MCQ, CQ, and Written.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionItemSchema = z.object({
  questionType: z.enum(['MCQ', 'CQ', 'WRITTEN']).describe('Type: MCQ, CQ, or WRITTEN (Short questions)'),
  
  // MCQ/WRITTEN specific fields
  question: z.string().optional().describe('The question text in Bengali'),
  options: z.array(z.string()).optional().describe('Exactly 4 options in Bengali (only for MCQ)'),
  answer: z.string().optional().describe('The correct answer (for MCQ/WRITTEN)'),
  explanation: z.string().optional().describe('Short explanation in Bengali'),
  
  // Shared/CQ fields
  stimulus: z.string().optional().describe('The passage or stimulus in Bengali'),
  parts: z.object({
    a: z.string().describe('ক'),
    b: z.string().describe('খ'),
    c: z.string().describe('গ'),
    d: z.string().describe('ঘ'),
  }).optional().describe('The parts of a CQ question'),
  answers: z.object({
    a: z.string().optional().describe('ক এর আদর্শ উত্তর'),
    b: z.string().optional().describe('খ এর আদর্শ উত্তর'),
    c: z.string().optional().describe('গ এর আদর্শ উত্তর'),
    d: z.string().optional().describe('ঘ এর আদর্শ উত্তর'),
  }).optional().describe('Model answers for each part of the CQ'),
});

const GenerateQuestionsInputSchema = z.object({
  text: z.string().describe('Source text'),
  count: z.number().min(1).max(20).describe('Number of questions'),
  type: z.enum(['MCQ', 'CQ', 'WRITTEN']).describe('Type to generate'),
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
3. For CQ:
   - Provide "stimulus", "parts" (a, b, c, d), and "answers" (a, b, c, d).
   - "questionType" must be 'CQ'.
4. For WRITTEN:
   - Provide "question" and "answer" (model answer/explanation).
   - "questionType" must be 'WRITTEN'.
5. Ensure the output is valid JSON matching the schema.
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
    
    if (!output || !output.questions || output.questions.length === 0) {
      throw new Error('AI failed to generate questions. Please try providing more context or different text.');
    }

    return output;
  }
);
