
'use server';
/**
 * @fileOverview An AI agent that provides detailed pronunciation feedback.
 *
 * - getPronunciationFeedback - A function that analyzes a user's speech for pronunciation, rhythm, and linking.
 * - GetPronunciationFeedbackInput - The input type for the function.
 * - PronunciationAnalysis - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { PronunciationAnalysis } from '@/lib/types';


const GetPronunciationFeedbackInputSchema = z.object({
  modelText: z.string().describe("The original text prompt the user was supposed to read."),
  userAudioDataUri: z.string().describe("The user's recorded audio as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GetPronunciationFeedbackInput = z.infer<typeof GetPronunciationFeedbackInputSchema>;

const PronunciationAnalysisSchema = z.object({
  wordIssues: z.array(z.object({
    word: z.string().describe("The specific word with an issue from the original text."),
    issue: z.string().describe("A brief, specific description of the pronunciation error (e.g., 'vowel sound too short', 'unvoiced /t/ sound')."),
  })).describe("A list of words with specific pronunciation problems."),
  
  linkingOpportunities: z.array(z.object({
    wordIndexes: z.array(z.number()).describe("The 0-based indexes of the words that should be linked together, e.g., [2, 3] for the third and fourth words."),
  })).describe("A list of adjacent words that should be linked together for smoother speech."),
  
  pauses: z.array(z.object({
    afterWordIndex: z.number().describe("The 0-based index of the word in the original text after which a pause should occur."),
    strength: z.enum(['short', 'long']).describe("Use 'short' for a brief phrase break, and 'long' for a sentence or major clause break."),
  })).describe("A list of recommended pauses to improve rhythm and phrasing."),

  overallFeedback: z.string().describe("A summary of the feedback in encouraging, simple Bengali."),
});


export async function getPronunciationFeedback(input: GetPronunciationFeedbackInput): Promise<PronunciationAnalysis> {
  return getPronunciationFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pronunciationFeedbackPrompt',
  input: {schema: GetPronunciationFeedbackInputSchema},
  output: {schema: PronunciationAnalysisSchema},
  prompt: `You are an expert American English pronunciation and phonetics coach for a Bengali speaker. Your task is to analyze a user's spoken audio against a model text and provide detailed, structured feedback.

The user's native language is Bengali, so pay close attention to common issues like vowel sounds (e.g., /ɪ/ vs /iː/), consonant clusters, and sentence rhythm (Bengali is syllable-timed, English is stress-timed).

You will be given the original English text and the user's audio recording. The original text has been split into words, and you must use the 0-based index for words when identifying linking and pauses.

Original Text: "{{modelText}}"

Your analysis must focus on three areas:
1.  **Word Issues:** Identify specific words that were mispronounced. For each, provide the word and a very short description of the error (e.g., "The /æ/ vowel sound in 'cat' was incorrect."). Be precise.
2.  **Linking:** Identify opportunities where the user could link words together for smoother, more natural speech (e.g., consonant-to-vowel linking like in "an apple"). For each opportunity, provide the 0-based indexes of the words to be linked.
3.  **Pauses and Rhythm:** Identify where the user should pause to create natural thought groups. For each pause, specify the 0-based index of the word it should come *after*, and whether it should be a 'short' or 'long' pause.

Finally, provide a short, encouraging overall feedback summary in **simple Bengali (Bangla)**.

User's Audio for Analysis:
{{media url=userAudioDataUri}}
`,
});

const getPronunciationFeedbackFlow = ai.defineFlow(
  {
    name: 'getPronunciationFeedbackFlow',
    inputSchema: GetPronunciationFeedbackInputSchema,
    outputSchema: PronunciationAnalysisSchema,
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
