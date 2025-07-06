'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate a shopping list pass for Google Wallet.
 *
 * - generateShoppingListPass - A function that generates a shopping list pass based on user input.
 * - GenerateShoppingListPassInput - The input type for the generateShoppingListPass function.
 * - GenerateShoppingListPassOutput - The return type for the generateShoppingListPass function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShoppingListPassInputSchema = z.object({
  query: z.string().describe('The user query to generate a shopping list from.'),
});
export type GenerateShoppingListPassInput = z.infer<typeof GenerateShoppingListPassInputSchema>;

const GenerateShoppingListPassOutputSchema = z.object({
  passDetails: z.string().describe('The details of the shopping list pass.'),
});
export type GenerateShoppingListPassOutput = z.infer<typeof GenerateShoppingListPassOutputSchema>;

export async function generateShoppingListPass(input: GenerateShoppingListPassInput): Promise<GenerateShoppingListPassOutput> {
  return generateShoppingListPassFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShoppingListPassPrompt',
  input: {schema: GenerateShoppingListPassInputSchema},
  output: {schema: GenerateShoppingListPassOutputSchema},
  prompt: `You are a personal assistant that generates shopping lists based on user queries.

  Based on the user's query, create a shopping list that can be added to Google Wallet.

  Query: {{{query}}}

  Shopping List Pass Details:`,
});

const generateShoppingListPassFlow = ai.defineFlow(
  {
    name: 'generateShoppingListPassFlow',
    inputSchema: GenerateShoppingListPassInputSchema,
    outputSchema: GenerateShoppingListPassOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
