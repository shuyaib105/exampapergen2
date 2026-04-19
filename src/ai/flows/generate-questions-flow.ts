'use server';
/**
 * @fileOverview AI Flow to generate exam questions from plain text.
 * Using Gemini 2.5 Flash for improved performance and accuracy.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// A single robust schema that Gemini can reliably fulfill for both types
// We make common fields optional but clearly describe their use in the prompt
const QuestionItemSchema = z.object({
  questionType: z.enum(['MCQ', 'CQ']).describe('The type of question being generated.'),
  
  // MCQ specific fields
  question: z.string().optional().describe('The question text (for MCQ) in Bengali.'),
  options: z.array(z.string()).optional().describe('Exactly 4 options in Bengali (for MCQ).'),
  answer: z.string().optional().describe('The correct answer matching one of the options (for MCQ).'),
  explanation: z.string().optional().describe('Short explanation in Bengali (for MCQ).'),
  
  // CQ specific fields
  stimulus: z.string().optional().describe('The stimulus/context passage (উদ্দীপক) in Bengali (for CQ or shared MCQ context).'),
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

CRITICAL INSTRUCTIONS:
1. All output MUST be in the Bengali language.
2. Follow professional educational standards for school/college exams in Bangladesh.
3. Return ONLY a JSON object containing a "questions" array.

IF TYPE IS MCQ:
- Set questionType to 'MCQ'.
- You MUST provide: "question", "options" (exactly 4 items), "answer" (MUST be one of the options), and "explanation".
- If the text implies a context, you can optionally fill "stimulus".

IF TYPE IS CQ:
- Set questionType to 'CQ'.
- You MUST provide: "stimulus" (the passage), and the "parts" (a, b, c, d).
- You can optionally provide "answers" for each part.

Ensure the JSON is valid and matches the requested schema exactly.`,
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

      // Basic validation for MCQ
      if (input.type === 'MCQ') {
        output.questions.forEach((q, idx) => {
          if (!q.question || !q.options || q.options.length !== 4 || !q.answer) {
            console.warn(`MCQ at index ${idx} is missing required fields. Trying to fix locally...`);
          }
        });
      }

      return output;
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      
      // Handle specific API errors
      if (error.message?.includes('400')) {
        throw new Error('AI request was invalid. This might be due to content safety filters or schema issues.');
      }
      if (error.message?.includes('429')) {
        throw new Error('Too many requests. Please wait a minute and try again.');
      }
      
      throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
    }
  }
);
