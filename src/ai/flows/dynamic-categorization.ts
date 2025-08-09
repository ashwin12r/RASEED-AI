'use server';

/**
 * @fileOverview A Genkit flow for dynamically categorizing receipts based on vendor, items, and spending patterns from various media types.
 *
 * - categorizeReceipt - A function that handles the receipt categorization process.
 * - CategorizeReceiptsInput - The input type for the categorizeReceipt function.
 * - CategorizeReceiptsOutput - The return type for the categorizeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeReceiptsInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A receipt as an image, video, or PDF, provided as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type CategorizeReceiptsInput = z.infer<typeof CategorizeReceiptsInputSchema>;

const ReceiptDetailsSchema = z.object({
  vendor: z.string().describe('The name of the vendor.'),
  category: z.string().describe('The category of the receipt (e.g., groceries, dining, etc.).'),
  items: z.array(z.string()).describe('The list of items purchased.'),
  totalAmount: z.number().describe('The total amount spent on the receipt.'),
});

const CategorizeReceiptsOutputSchema = z.object({
    receipts: z.array(ReceiptDetailsSchema).describe('An array of all receipts found in the media.')
});

export type CategorizeReceiptsOutput = z.infer<typeof CategorizeReceiptsOutputSchema>;
export type ReceiptDetails = z.infer<typeof ReceiptDetailsSchema>;


export async function categorizeReceipt(input: CategorizeReceiptsInput): Promise<CategorizeReceiptsOutput> {
  return categorizeReceiptFlow(input);
}

const categorizeReceiptPrompt = ai.definePrompt({
  name: 'categorizeReceiptPrompt',
  input: {schema: CategorizeReceiptsInputSchema},
  output: {schema: CategorizeReceiptsOutputSchema},
  prompt: `You are an expert financial assistant. Your job is to categorize receipts from images, videos, or PDFs.

  Analyze the following media and identify all distinct receipts. For each receipt you find, extract the following information:
  - The vendor's name.
  - The most appropriate category (e.g., groceries, dining, travel, etc.).
  - A list of all items purchased.
  - The total amount spent.

  The 'items' property in your output for each receipt MUST be an array of strings. If you cannot identify any items for a receipt, return an empty array for its 'items' property.

  Media: {{media url=mediaDataUri}}

  Return your findings as a JSON object with a single key "receipts". The value of "receipts" must be an array of receipt objects, where each object corresponds to a receipt you found. If you find no receipts, return an empty "receipts" array. Do not include any other prose.`,
});

const categorizeReceiptFlow = ai.defineFlow(
  {
    name: 'categorizeReceiptFlow',
    inputSchema: CategorizeReceiptsInputSchema,
    outputSchema: CategorizeReceiptsOutputSchema,
  },
  async input => {
    const {output} = await categorizeReceiptPrompt(input);
    return output!;
  }
);
