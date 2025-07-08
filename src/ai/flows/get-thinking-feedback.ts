'use server';
/**
 * @fileOverview An AI agent that provides feedback for the Thinking Lab.
 *
 * - getThinkingFeedback - A function that analyzes a user's spoken response against a structural guide.
 * - GetThinkingFeedbackInput - The input type for the function.
 * - GetThinkingFeedbackOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetThinkingFeedbackInputSchema = z.object({
  question: z.string().describe("The abstract question the user was asked."),
  structureGuide: z.array(z.object({
    step: z.string(),
    description: z.string(),
  })).describe("The structural guide provided to the user in Bengali."),
  userAudioDataUri: z.string().describe("The user's recorded audio as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GetThinkingFeedbackInput = z.infer<typeof GetThinkingFeedbackInputSchema>;

const GetThinkingFeedbackOutputSchema = z.object({
    transcript: z.string().describe("An accurate transcription of the user's spoken response."),
    structuralFeedback: z.string().describe("Constructive feedback in English on how well the user followed the structural guide. This should be encouraging and reference the Bengali guide steps."),
    languageFeedback: z.string().describe("Constructive feedback in Bengali (Bangla) on the user's English language use (fluency, grammar, vocabulary). This should be encouraging and help the user sound more natural."),
});
export type GetThinkingFeedbackOutput = z.infer<typeof GetThinkingFeedbackOutputSchema>;


export async function getThinkingFeedback(input: GetThinkingFeedbackInput): Promise<GetThinkingFeedbackOutput> {
  return getThinkingFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getThinkingFeedbackPrompt',
  input: {schema: GetThinkingFeedbackInputSchema},
  output: {schema: GetThinkingFeedbackOutputSchema},
  prompt: `You are an expert IELTS "Argument Coach" for Bengali-speaking students. Your goal is to help them master abstract thinking. The student has been given a question and a structural guide in Bengali. They have recorded their answer in English.

Your task is to provide two types of feedback:
1.  **Transcribe the Audio:** First, provide an accurate transcription of the user's English response.
2.  **Structural Feedback (in English):** Analyze the transcript and evaluate how well the student followed the provided Bengali structure guide. Be specific. Reference the steps from the guide (e.g., "You did a great job with the first step, 'মতামত দিন'"). Give clear, encouraging, and actionable advice on how to improve their argument structure.
3.  **Language Feedback (in Bengali):** Analyze the transcript for English fluency, grammar, and vocabulary. Provide encouraging feedback IN BENGALI (BANGLA). Praise their strengths and gently suggest improvements. Focus on making them sound more natural and confident. For example, suggest better connectors or more idiomatic phrases if you notice awkward "Banglish" translations.

**THE TASK DATA:**

**Question:**
"{{question}}"

**Structural Guide (Bengali):**
{{#each structureGuide}}
- {{step}}: {{description}}
{{/each}}

**User's Spoken Answer (Audio):**
{{media url=userAudioDataUri}}

Provide the full analysis in the required JSON format.
`,
});

const getThinkingFeedbackFlow = ai.defineFlow(
  {
    name: 'getThinkingFeedbackFlow',
    inputSchema: GetThinkingFeedbackInputSchema,
    outputSchema: GetThinkingFeedbackOutputSchema,
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
