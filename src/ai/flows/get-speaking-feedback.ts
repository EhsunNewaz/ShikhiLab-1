'use server';
/**
 * @fileOverview An AI agent that provides feedback on speaking exercises.
 * 
 * - getSpeakingFeedback - A function that analyzes a user's speech.
 * - GetSpeakingFeedbackInput - The input type for the getSpeakingFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { SpeakingFeedback } from '@/lib/types';

const SpeakingFeedbackSchema = z.object({
  pronunciationScore: z.number().min(1).max(9).describe('The pronunciation score from 1 to 9, based on IELTS criteria.'),
  fluencyScore: z.number().min(1).max(9).describe('The fluency and coherence score from 1 to 9, based on IELTS criteria.'),
  feedback: z.string().describe('Detailed, constructive feedback on pronunciation, fluency, and areas for improvement, written in Bengali (Bangla). This should be a few sentences long and written in a very friendly, positive, and encouraging tone.'),
});

const GetSpeakingFeedbackInputSchema = z.object({
  modelAnswerText: z.string().describe('The original text prompt that the user was supposed to read.'),
  userAudioDataUri: z.string().describe("The user's recorded audio as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GetSpeakingFeedbackInput = z.infer<typeof GetSpeakingFeedbackInputSchema>;


export async function getSpeakingFeedback(input: GetSpeakingFeedbackInput): Promise<SpeakingFeedback> {
  return getSpeakingFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'speakingFeedbackPrompt',
  input: {schema: GetSpeakingFeedbackInputSchema},
  output: {schema: SpeakingFeedbackSchema},
  prompt: `You are an expert IELTS speaking examiner who is also a friendly and encouraging language coach. Your task is to analyze a user's spoken audio and provide feedback in Bengali (Bangla). The feedback must be positive and encouraging, focusing on building the user's confidence.

You will be given the original English text the user was supposed to say, and the user's audio recording.

Analyze the user's audio recording carefully. Compare it against the model answer text provided.

Your analysis must focus on:
1.  **Pronunciation:** How clear and easy to understand the user is. Assess their use of individual sounds, stress, rhythm, and intonation.
2.  **Fluency & Coherence:** The user's ability to speak smoothly, without unnatural pauses or self-correction. Assess their speed and the logical flow of their speech.

Based on your analysis, provide a score from 1 (lowest) to 9 (highest) for both Pronunciation and Fluency.

Then, write a short, constructive, and extremely encouraging feedback paragraph in Bengali (Bangla). Start by highlighting what the user did well. Then, gently suggest specific areas for improvement in a way that feels helpful and not critical. The goal is to motivate the user, not to make them feel down.

Model Answer Text (English):
"{{modelAnswerText}}"

User's Audio for Analysis:
{{media url=userAudioDataUri}}
`,
});

const getSpeakingFeedbackFlow = ai.defineFlow(
  {
    name: 'getSpeakingFeedbackFlow',
    inputSchema: GetSpeakingFeedbackInputSchema,
    outputSchema: SpeakingFeedbackSchema,
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
