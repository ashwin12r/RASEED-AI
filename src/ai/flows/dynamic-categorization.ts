// This is a server-side file
'use server';

/**
 * @fileOverview A Genkit flow for dynamically categorizing receipts based on vendor, items, and spending patterns.
 *
 * - categorizeReceipt - A function that handles the receipt categorization process.
 * - CategorizeReceiptInput - The input type for the categorizeReceipt function.
 * - CategorizeReceiptOutput - The return type for the categorizeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeReceiptInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  ocrText: z.string().describe('The OCR text extracted from the receipt.'),
  previousSpendingPatterns: z
    .string()
    .optional()
    .describe('Optional: Previous spending patterns of the user.'),
});

export type CategorizeReceiptInput = z.infer<typeof CategorizeReceiptInputSchema>;

const CategorizeReceiptOutputSchema = z.object({
  vendor: z.string().describe('The name of the vendor.'),
  category: z.string().describe('The category of the receipt (e.g., groceries, dining, etc.).'),
  items: z.array(z.string()).describe('The list of items purchased.'),
  totalAmount: z.number().describe('The total amount spent on the receipt.'),
});

export type CategorizeReceiptOutput = z.infer<typeof CategorizeReceiptOutputSchema>;

export async function categorizeReceipt(input: CategorizeReceiptInput): Promise<CategorizeReceiptOutput> {
  return categorizeReceiptFlow(input);
}

const categorizeReceiptPrompt = ai.definePrompt({
  name: 'categorizeReceiptPrompt',
  input: {schema: CategorizeReceiptInputSchema},
  output: {schema: CategorizeReceiptOutputSchema},
  prompt: `You are an expert financial assistant.  Your job is to categorize receipts.

  Analyze the following receipt information and categorize it based on the vendor, items, and spending patterns.

  Receipt Image: {{media url=receiptDataUri}}
  OCR Text: {{{ocrText}}}
  Previous Spending Patterns: {{{previousSpendingPatterns}}}

  Based on this information, extract the vendor, categorize the receipt, list the items purchased, and identify the total amount spent.
  Return the output in JSON format. Do not include any other prose.
`,
});

const categorizeReceiptFlow = ai.defineFlow(
  {
    name: 'categorizeReceiptFlow',
    inputSchema: CategorizeReceiptInputSchema,
    outputSchema: CategorizeReceiptOutputSchema,
  },
  async input => {
    const {output} = await categorizeReceiptPrompt(input);
    return output!;
  }
);
