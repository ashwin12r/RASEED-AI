// use server'
'use server';
/**
 * @fileOverview A receipt ingestion and analysis AI agent.
 *
 * - ingestAndAnalyzeReceipt - A function that handles the receipt ingestion and analysis process.
 * - IngestAndAnalyzeReceiptInput - The input type for the ingestAndAnalyzeReceipt function.
 * - IngestAndAnalyzeReceiptOutput - The return type for the ingestAndAnalyzeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngestAndAnalyzeReceiptInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo or video of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IngestAndAnalyzeReceiptInput = z.infer<typeof IngestAndAnalyzeReceiptInputSchema>;

const IngestAndAnalyzeReceiptOutputSchema = z.object({
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
export type IngestAndAnalyzeReceiptOutput = z.infer<typeof IngestAndAnalyzeReceiptOutputSchema>;

export async function ingestAndAnalyzeReceipt(input: IngestAndAnalyzeReceiptInput): Promise<IngestAndAnalyzeReceiptOutput> {
  return ingestAndAnalyzeReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ingestAndAnalyzeReceiptPrompt',
  input: {schema: IngestAndAnalyzeReceiptInputSchema},
  output: {schema: IngestAndAnalyzeReceiptOutputSchema},
  prompt: `You are an expert AI agent specializing in analyzing receipts. You will extract the items, price, amount, and taxes from the receipt. Return a json format.

Analyze the following receipt:

Receipt: {{media url=receiptDataUri}}`,
});

const ingestAndAnalyzeReceiptFlow = ai.defineFlow(
  {
    name: 'ingestAndAnalyzeReceiptFlow',
    inputSchema: IngestAndAnalyzeReceiptInputSchema,
    outputSchema: IngestAndAnalyzeReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
