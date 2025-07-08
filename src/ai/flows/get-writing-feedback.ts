// src/ai/flows/get-writing-feedback.ts
'use server';

/**
 * @fileOverview An AI agent for providing feedback on user-submitted essays.
 *
 * - getWritingFeedback - A function that handles the essay feedback process.
 * - GetWritingFeedbackInput - The input type for the getWritingFeedback function.
 * - GetWritingFeedbackOutput - The return type for the getWritingFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetWritingFeedbackInputSchema = z.object({
  essay: z.string().describe('The essay written by the user.'),
});
export type GetWritingFeedbackInput = z.infer<typeof GetWritingFeedbackInputSchema>;

const GetWritingFeedbackOutputSchema = z.object({
  taskAchievement: z.object({
    score: z.number().describe('The estimated band score for Task Achievement.'),
    feedback: z.string().describe('Feedback on Task Achievement in Bangla.'),
  }).describe('Feedback on Task Achievement'),
  coherenceAndCohesion: z.object({
    score: z.number().describe('The estimated band score for Coherence and Cohesion.'),
    feedback: z.string().describe('Feedback on Coherence and Cohesion in Bangla.'),
  }).describe('Feedback on Coherence and Cohesion'),
  lexicalResource: z.object({
    score: z.number().describe('The estimated band score for Lexical Resource.'),
    feedback: z.string().describe('Feedback on Lexical Resource in Bangla.'),
  }).describe('Feedback on Lexical Resource'),
  grammaticalRangeAndAccuracy: z.object({
    score: z.number().describe('The estimated band score for Grammatical Range and Accuracy.'),
    feedback: z.string().describe('Feedback on Grammatical Range and Accuracy in Bangla.'),
  }).describe('Feedback on Grammatical Range and Accuracy'),
  overallScore: z.number().describe('The overall estimated band score for the essay.'),
  overallFeedback: z.string().describe('Overall feedback on the essay in Bangla.'),
});
export type GetWritingFeedbackOutput = z.infer<typeof GetWritingFeedbackOutputSchema>;

export async function getWritingFeedback(input: GetWritingFeedbackInput): Promise<GetWritingFeedbackOutput> {
  return getWritingFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWritingFeedbackPrompt',
  input: {schema: GetWritingFeedbackInputSchema},
  output: {schema: GetWritingFeedbackOutputSchema},
  prompt: `You are an expert IELTS examiner. Analyze the following essay written by a Bengali student for IELTS Writing Task 2. 
Provide a detailed evaluation in four sections: Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy. 
Give an estimated band score for each section and an overall score.
Provide all feedback in simple Bangla, offering constructive, actionable advice for improvement.

Essay: {{{essay}}}`,
});

const getWritingFeedbackFlow = ai.defineFlow(
  {
    name: 'getWritingFeedbackFlow',
    inputSchema: GetWritingFeedbackInputSchema,
    outputSchema: GetWritingFeedbackOutputSchema,
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
