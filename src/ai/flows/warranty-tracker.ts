'use server';

/**
 * @fileOverview A Genkit flow for automatically tracking warranties from receipts.
 *
 * - trackWarranty - A function that handles warranty tracking from a receipt.
 * - WarrantyTrackerInput - The input type for the trackWarranty function.
 * - WarrantyTrackerOutput - The return type for the trackWarranty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WarrantyTrackerInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type WarrantyTrackerInput = z.infer<typeof WarrantyTrackerInputSchema>;

const WarrantyTrackerOutputSchema = z.object({
  items: z.array(z.object({
    productName: z.string().describe('The name of the product.'),
    purchaseDate: z.string().describe('The date of purchase.'),
    warrantyEndDate: z.string().describe('The calculated end date of the warranty.'),
  })).describe('A list of items with their warranty information.'),
});
export type WarrantyTrackerOutput = z.infer<typeof WarrantyTrackerOutputSchema>;

export async function trackWarranty(input: WarrantyTrackerInput): Promise<WarrantyTrackerOutput> {
  return warrantyTrackerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'warrantyTrackerPrompt',
  input: {schema: WarrantyTrackerInputSchema},
  output: {schema: WarrantyTrackerOutputSchema},
  prompt: `You are an expert at parsing receipts to find warranty information.
  Analyze the following receipt and identify all items that likely come with a warranty.
  For each item, extract the product name, purchase date, and estimate the warranty expiration date.
  Assume standard warranty periods for electronics (1 year), appliances (1-2 years), etc., if not explicitly mentioned.

  Receipt Image: {{media url=receiptDataUri}}

  Return the output in JSON format. If no items have a warranty, return an empty items array.
  `,
});

const warrantyTrackerFlow = ai.defineFlow(
  {
    name: 'warrantyTrackerFlow',
    inputSchema: WarrantyTrackerInputSchema,
    outputSchema: WarrantyTrackerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
