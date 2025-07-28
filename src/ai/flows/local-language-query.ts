// src/ai/flows/local-language-query.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that allows users to ask questions about their purchases in their local language and receive helpful responses.
 *
 * - localLanguageQuery - A function that handles the user's query and returns a response.
 * - LocalLanguageQueryInput - The input type for the localLanguageQuery function.
 * - LocalLanguageQueryOutput - The return type for the localLanguageQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LocalLanguageQueryInputSchema = z.object({
  query: z.string().describe('The user query in their local language.'),
});
export type LocalLanguageQueryInput = z.infer<typeof LocalLanguageQueryInputSchema>;

const LocalLanguageQueryOutputSchema = z.object({
  response: z.string().describe('The response to the user query.'),
});
export type LocalLanguageQueryOutput = z.infer<typeof LocalLanguageQueryOutputSchema>;

export async function localLanguageQuery(input: LocalLanguageQueryInput): Promise<LocalLanguageQueryOutput> {
  return localLanguageQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'localLanguageQueryPrompt',
  input: {schema: LocalLanguageQueryInputSchema},
  output: {schema: LocalLanguageQueryOutputSchema},
  prompt: `You are a helpful assistant that answers questions about user purchases.

  The user will ask a question in their local language about their purchases. You should answer the question to the best of your ability.

  User Query: {{{query}}}`,
});

const localLanguageQueryFlow = ai.defineFlow(
  {
    name: 'localLanguageQueryFlow',
    inputSchema: LocalLanguageQueryInputSchema,
    outputSchema: LocalLanguageQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
