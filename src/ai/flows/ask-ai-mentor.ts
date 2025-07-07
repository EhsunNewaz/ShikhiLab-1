// src/ai/flows/ask-ai-mentor.ts
'use server';

/**
 * @fileOverview An AI agent that acts as an IELTS mentor for Bangladeshi students.
 *
 * - askAiMentor - A function that allows users to ask IELTS-related questions and receive guidance.
 * - AskAiMentorInput - The input type for the askAiMentor function.
 * - AskAiMentorOutput - The return type for the askAiMentor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAiMentorInputSchema = z.object({
  prompt: z.string().describe('The user\u2019s question about IELTS preparation.'),
});
export type AskAiMentorInput = z.infer<typeof AskAiMentorInputSchema>;

const AskAiMentorOutputSchema = z.object({
  response: z.string().describe('The AI Mentor\u2019s response to the user\u2019s question, with Bangla explanations and English examples.'),
});
export type AskAiMentorOutput = z.infer<typeof AskAiMentorOutputSchema>;

export async function askAiMentor(input: AskAiMentorInput): Promise<AskAiMentorOutput> {
  return askAiMentorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAiMentorPrompt',
  input: {schema: AskAiMentorInputSchema},
  output: {schema: AskAiMentorOutputSchema},
  prompt: `You are ShikhiLab AI Mentor, a friendly, encouraging, and culturally-aware IELTS expert for Bangladeshi students. Your primary language for explanation is simple, clear Bangla. Always explain concepts in Bangla first before providing English examples. Your tone is like a helpful older brother or sister (Bhaia/Apu), not a formal robot. Be supportive and never discouraging.

User Query: {{{prompt}}}`,
});

const askAiMentorFlow = ai.defineFlow(
  {
    name: 'askAiMentorFlow',
    inputSchema: AskAiMentorInputSchema,
    outputSchema: AskAiMentorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
