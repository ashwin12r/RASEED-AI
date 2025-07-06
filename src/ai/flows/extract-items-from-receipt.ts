'use server';
/**
 * @fileOverview A Genkit flow for extracting a list of items from a receipt image.
 *
 * - extractItemsFromReceipt - A function that handles the item extraction process.
 * - ExtractItemsInput - The input type for the extractItemsFromReceipt function.
 * - ExtractItemsOutput - The return type for the extractItemsFromReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractItemsInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractItemsInput = z.infer<typeof ExtractItemsInputSchema>;

const ExtractItemsOutputSchema = z.object({
  items: z.array(z.string()).describe('A list of items purchased.'),
});
export type ExtractItemsOutput = z.infer<typeof ExtractItemsOutputSchema>;

export async function extractItemsFromReceipt(input: ExtractItemsInput): Promise<ExtractItemsOutput> {
  return extractItemsFlow(input);
}

const extractItemsPrompt = ai.definePrompt({
  name: 'extractItemsPrompt',
  input: {schema: ExtractItemsInputSchema},
  output: {schema: ExtractItemsOutputSchema},
  prompt: `You are an expert at reading receipts. Extract only the list of items purchased from the following receipt image.
  
  Receipt Image: {{media url=receiptDataUri}}
  
  Return the output in JSON format with a single key "items" which is an array of strings. Do not include any other prose.`,
});

const extractItemsFlow = ai.defineFlow(
  {
    name: 'extractItemsFlow',
    inputSchema: ExtractItemsInputSchema,
    outputSchema: ExtractItemsOutputSchema,
  },
  async (input) => {
    const {output} = await extractItemsPrompt(input);
    return output!;
  }
);
