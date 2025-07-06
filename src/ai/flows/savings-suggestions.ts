// savings-suggestions.ts
'use server';

/**
 * @fileOverview Analyzes spending trends and suggests ways to save money.
 *
 * - generateSavingsSuggestions - A function that generates savings suggestions based on spending data.
 * - SavingsSuggestionsInput - The input type for the generateSavingsSuggestions function.
 * - SavingsSuggestionsOutput - The return type for the generateSavingsSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SavingsSuggestionsInputSchema = z.object({
  spendingData: z.string().describe('A detailed record of the user\'s spending habits, including dates, amounts, categories, and merchants.'),
  userPreferences: z.string().optional().describe('Optional user preferences that affect suggestions.'),
});
export type SavingsSuggestionsInput = z.infer<typeof SavingsSuggestionsInputSchema>;

const SavingsSuggestionsOutputSchema = z.object({
  insights: z.string().describe('Key insights about the user\'s spending trends.'),
  suggestions: z.array(z.string()).describe('Specific, actionable suggestions for saving money, such as identifying recurring subscriptions or suggesting cheaper alternatives.'),
  overallAssessment: z.string().describe('An overall assessment of the user\'s spending habits and potential for savings.'),
});
export type SavingsSuggestionsOutput = z.infer<typeof SavingsSuggestionsOutputSchema>;

export async function generateSavingsSuggestions(input: SavingsSuggestionsInput): Promise<SavingsSuggestionsOutput> {
  return savingsSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'savingsSuggestionsPrompt',
  input: {schema: SavingsSuggestionsInputSchema},
  output: {schema: SavingsSuggestionsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's spending data and provide insights and suggestions to help them save money.

Spending Data: {{{spendingData}}}
User Preferences (optional): {{{userPreferences}}}

Consider these factors:
- Recurring subscriptions
- Opportunities to reduce spending on frequently purchased items
- Potential for savings in different spending categories
- Overall trends in spending habits

Output the insights, suggestions, and overall assessment.  The suggestions should be a numbered list.

Make sure to output in JSON format.
`, 
});

const savingsSuggestionsFlow = ai.defineFlow(
  {
    name: 'savingsSuggestionsFlow',
    inputSchema: SavingsSuggestionsInputSchema,
    outputSchema: SavingsSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
