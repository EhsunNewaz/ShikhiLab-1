// src/ai/flows/get-listening-feedback.ts
'use server';

/**
 * @fileOverview An AI agent for providing feedback on listening transcription exercises.
 *
 * - getListeningFeedback - A function that handles the transcription feedback process.
 * - GetListeningFeedbackInput - The input type for the function.
 * - GetListeningFeedbackOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetListeningFeedbackInputSchema = z.object({
  originalTranscript: z.string().describe("The correct, original transcript of the audio."),
  userTranscript: z.string().describe("The transcript written by the user."),
});
export type GetListeningFeedbackInput = z.infer<typeof GetListeningFeedbackInputSchema>;

const GetListeningFeedbackOutputSchema = z.object({
  feedback: z.string().describe("Encouraging feedback in simple Bangla about the user's accuracy."),
  highlightedTranscript: z.string().describe("The user's transcript with any incorrect words wrapped in single asterisks. E.g., 'I *leve* here.'"),
  isCorrect: z.boolean().describe("Whether the user's transcript was perfectly correct."),
});
export type GetListeningFeedbackOutput = z.infer<typeof GetListeningFeedbackOutputSchema>;

export async function getListeningFeedback(input: GetListeningFeedbackInput): Promise<GetListeningFeedbackOutput> {
  return getListeningFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getListeningFeedbackPrompt',
  input: {schema: GetListeningFeedbackInputSchema},
  output: {schema: GetListeningFeedbackOutputSchema},
  prompt: `You are an English pronunciation and listening coach for a student from Bangladesh.
The student has just transcribed a short audio clip. Your task is to compare their transcription with the original.

Original Transcript: {{{originalTranscript}}}
Student's Transcript: {{{userTranscript}}}

Analyze the student's work. 
1. Determine if the student's transcript is perfectly correct.
2. Provide short, encouraging feedback in simple, clear Bangla.
3. Return the student's transcript, but wrap any and all incorrect or misspelled words in single asterisks (*). Be strict; even a small typo is an error. If the transcript is perfect, return it without any asterisks.

For example, if the original is "I live in a big city" and the student wrote "I *liv* in a big cty", you must wrap 'liv' and 'cty' in asterisks.
Another example: Original "She sells sea-shells by the sea-shore." Student "She *sells* *seashells* by the sea-shore.". This is incorrect because of the hyphenation difference.
If they are perfectly identical, provide positive feedback.`,
});

const getListeningFeedbackFlow = ai.defineFlow(
  {
    name: 'getListeningFeedbackFlow',
    inputSchema: GetListeningFeedbackInputSchema,
    outputSchema: GetListeningFeedbackOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
