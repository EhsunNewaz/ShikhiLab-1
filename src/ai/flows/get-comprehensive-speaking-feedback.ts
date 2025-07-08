'use server';
/**
 * @fileOverview An AI agent that provides comprehensive feedback on a user's spoken answer.
 *
 * - getComprehensiveSpeakingFeedback - A function that analyzes a user's speech against the four IELTS criteria.
 * - GetComprehensiveSpeakingFeedbackInput - The input type for the function.
 */

import {ai} from '@/ai/genkit';
import type { ComprehensiveSpeakingFeedback } from '@/lib/types';
import {z} from 'genkit';

const ComprehensiveSpeakingFeedbackSchema = z.object({
  pronunciationScore: z.number().min(1).max(9).describe('The pronunciation score from 1 to 9, based on IELTS criteria.'),
  pronunciationFeedback: z.string().describe('Detailed, constructive feedback on pronunciation, written in Bengali (Bangla) in an encouraging tone.'),
  
  fluencyScore: z.number().min(1).max(9).describe('The fluency and coherence score from 1 to 9, based on IELTS criteria.'),
  fluencyFeedback: z.string().describe('Detailed, constructive feedback on fluency and coherence, written in Bengali (Bangla) in an encouraging tone.'),
  
  lexicalResourceScore: z.number().min(1).max(9).describe('The lexical resource (vocabulary) score from 1 to 9, based on IELTS criteria.'),
  lexicalResourceFeedback: z.string().describe('Detailed, constructive feedback on lexical resource, written in Bengali (Bangla) in an encouraging tone.'),

  grammaticalRangeAndAccuracyScore: z.number().min(1).max(9).describe('The grammatical range and accuracy score from 1 to 9, based on IELTS criteria.'),
  grammaticalRangeAndAccuracyFeedback: z.string().describe('Detailed, constructive feedback on grammar, written in Bengali (Bangla) in an encouraging tone.'),
  
  overallBandScore: z.number().min(1).max(9).step(0.5).describe('The overall estimated band score from 1 to 9, based on the four criteria. Can be in .5 increments.'),
});

const GetComprehensiveSpeakingFeedbackInputSchema = z.object({
  questionText: z.string().describe('The question the user was asked to answer.'),
  userAudioDataUri: z.string().describe("The user's recorded audio as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GetComprehensiveSpeakingFeedbackInput = z.infer<typeof GetComprehensiveSpeakingFeedbackInputSchema>;


export async function getComprehensiveSpeakingFeedback(input: GetComprehensiveSpeakingFeedbackInput): Promise<ComprehensiveSpeakingFeedback> {
  return getComprehensiveSpeakingFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'comprehensiveSpeakingFeedbackPrompt',
  input: {schema: GetComprehensiveSpeakingFeedbackInputSchema},
  output: {schema: ComprehensiveSpeakingFeedbackSchema},
  prompt: `You are an expert, friendly, and encouraging IELTS speaking examiner. Your task is to provide a comprehensive evaluation of a user's spoken answer in response to a given question.

You will be given the question and the user's audio recording.

Analyze the user's audio recording carefully based on the four official IELTS speaking assessment criteria:
1.  **Fluency and Coherence:** Assess the user's ability to speak at length, the speed of their speech, any hesitations, and their use of cohesive devices.
2.  **Lexical Resource (Vocabulary):** Evaluate the range of vocabulary used, their ability to use less common and idiomatic language, and their precision.
3.  **Grammatical Range and Accuracy:** Assess the variety and accuracy of grammatical structures used. Look for a mix of simple and complex sentences.
4.  **Pronunciation:** Evaluate clarity, individual sounds, stress, rhythm, and intonation.

Based on your analysis, provide a score from 1 (lowest) to 9 (highest) for EACH of the four criteria. Then, calculate an overall band score, which can be in .5 increments (e.g., 6.5, 7.0, 7.5).

Finally, write detailed, constructive, and extremely encouraging feedback for each of the four criteria in **Bengali (Bangla)**. For each criterion, start by highlighting what the user did well, then gently suggest specific areas for improvement. The goal is to motivate the user and build their confidence.

Question:
"{{questionText}}"

User's Audio for Analysis:
{{media url=userAudioDataUri}}
`,
});

const getComprehensiveSpeakingFeedbackFlow = ai.defineFlow(
  {
    name: 'getComprehensiveSpeakingFeedbackFlow',
    inputSchema: GetComprehensiveSpeakingFeedbackInputSchema,
    outputSchema: ComprehensiveSpeakingFeedbackSchema,
    retry: {
      maxRetries: 3,
      backoff: {initialDelay: 2000, factor: 2},
    },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
