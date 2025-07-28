'use server';
/**
 * @fileOverview A receipt ingestion and analysis AI agent.
 *
 * - ingestAndAnalyzeReceipt - A function that handles the receipt ingestion and analysis process.
 * - IngestAndAnalyzeReceiptsInput - The input type for the ingestAndAnalyzeReceipt function.
 * - IngestAndAnalyzeReceiptsOutput - The return type for the ingestAndAnalyzeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngestAndAnalyzeReceiptsInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A photo or video of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IngestAndAnalyzeReceiptsInput = z.infer<typeof IngestAndAnalyzeReceiptsInputSchema>;

const DetailedReceiptSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().describe('The name of the item.'),
      price: z.number().describe('The price of the item.'),
      amount: z.number().describe('The quantity of the item.'),
      taxes: z.number().describe('The taxes applied to the item.'),
    })
  ).describe('The list of items extracted from the receipt.'),
  total: z.number().describe('The total amount on the receipt.'),
});

const IngestAndAnalyzeReceiptsOutputSchema = z.object({
  receipts: z.array(DetailedReceiptSchema).describe('An array of all detailed receipts found in the media.')
});

export type IngestAndAnalyzeReceiptsOutput = z.infer<typeof IngestAndAnalyzeReceiptsOutputSchema>;

export async function ingestAndAnalyzeReceipt(input: IngestAndAnalyzeReceiptsInput): Promise<IngestAndAnalyzeReceiptsOutput> {
  return ingestAndAnalyzeReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ingestAndAnalyzeReceiptPrompt',
  input: {schema: IngestAndAnalyzeReceiptsInputSchema},
  output: {schema: IngestAndAnalyzeReceiptsOutputSchema},
  prompt: `You are an expert AI agent specializing in analyzing receipts. You will extract the items, price, amount, and taxes from each receipt found in the provided media. Return a json format.

Analyze the following media:

Media: {{media url=mediaDataUri}}

Return your findings as a JSON object with a single key "receipts". The value of "receipts" must be an array of receipt objects, where each object contains the detailed itemization. If you find no receipts, return an empty "receipts" array.`,
});

const ingestAndAnalyzeReceiptFlow = ai.defineFlow(
  {
    name: 'ingestAndAnalyzeReceiptFlow',
    inputSchema: IngestAndAnalyzeReceiptsInputSchema,
    outputSchema: IngestAndAnalyzeReceiptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
