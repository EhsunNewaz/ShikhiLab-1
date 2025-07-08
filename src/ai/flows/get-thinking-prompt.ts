'use server';
/**
 * @fileOverview An AI agent that coaches students on abstract thinking for IELTS Speaking Part 3.
 *
 * - getThinkingPrompt - A function that provides an abstract question and a structural guide.
 * - GetThinkingPromptInput - The input type for the function.
 * - GetThinkingPromptOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetThinkingPromptInputSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).describe("The difficulty level of the question to generate.")
});
export type GetThinkingPromptInput = z.infer<typeof GetThinkingPromptInputSchema>;


const GetThinkingPromptOutputSchema = z.object({
  question: z.string().describe("A challenging, abstract IELTS Speaking Part 3-style question."),
  structureGuide: z.array(z.object({
    step: z.string().describe("The name of the step in Bengali, e.g., 'মতামত দিন' (State Opinion)."),
    description: z.string().describe("A brief explanation of the step in Bengali, e.g., 'প্রশ্নের উত্তরে সরাসরি আপনার মতামত দিন।' (Directly state your opinion in response to the question).")
  })).describe("A 3-4 step structural guide in Bengali to help answer the question logically.")
});
export type GetThinkingPromptOutput = z.infer<typeof GetThinkingPromptOutputSchema>;

export async function getThinkingPrompt(input: GetThinkingPromptInput): Promise<GetThinkingPromptOutput> {
  return getThinkingPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getThinkingPrompt',
  input: {schema: GetThinkingPromptInputSchema},
  output: {schema: GetThinkingPromptOutputSchema},
  prompt: `You are an expert IELTS "Argument Coach" for Bengali-speaking students. Your goal is to help them master abstract thinking for Speaking Part 3 by providing a varied curriculum of question types and tailored structural advice.

Your task is to generate ONE new, high-quality, abstract IELTS Speaking Part 3 question.

1.  **Vary the Question Type:** Ensure you don't always ask the same type of question. Vary your questions across these common IELTS Part 3 categories:
    *   **Opinion:** Asking for the student's view (e.g., "Do you think X is positive?").
    *   **Compare & Contrast:** Asking about the differences/similarities between two things.
    *   **Advantages & Disadvantages:** Asking about the pros and cons of a topic.
    *   **Problem & Solution:** Asking about the causes of an issue and potential solutions.
    *   **Hypothetical/Future:** Asking the student to speculate about the future.

2.  **Match the Difficulty:** Generate a question that matches the requested difficulty level: {{{difficulty}}}.
    *   'easy' questions: Abstract but closer to personal experience.
    *   'medium' questions: Common societal topics.
    *   'hard' questions: More complex, speculative, or philosophical topics.

3.  **Create a TAILORED Structural Guide (in Bengali):** This is the most important step. Create a simple, powerful 3-4 step structural guide IN BENGALI that is specifically designed for the type of question you just generated. Do NOT use a generic guide.
    *   **If you ask an "Opinion" question,** your guide should be about stating an opinion, giving reasons, and maybe acknowledging another view.
    *   **If you ask a "Problem & Solution" question,** your guide should be about defining the problem, explaining a cause, and suggesting a solution.
    *   **If you ask a "Compare & Contrast" question,** your guide should be about introducing both sides and then discussing points of difference or similarity.

Generate a new, unique question and its corresponding tailored guide.`,
});

const getThinkingPromptFlow = ai.defineFlow(
  {
    name: 'getThinkingPromptFlow',
    inputSchema: GetThinkingPromptInputSchema,
    outputSchema: GetThinkingPromptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
