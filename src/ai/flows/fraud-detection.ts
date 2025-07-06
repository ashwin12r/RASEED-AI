'use server';

/**
 * @fileOverview Fraud detection flow for receipt submissions.
 *
 * - detectFraud - A function that detects potential fraud in receipt data.
 * - FraudDetectionInput - The input type for the detectFraud function.
 * - FraudDetectionOutput - The return type for the detectFraud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FraudDetectionInputSchema = z.object({
  receiptData: z.string().describe('The extracted data from the receipt.'),
  receiptImage: z
    .string()
    .describe(
      'A photo of the receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected the typo here
    ),
  priorReceipts: z.array(z.string()).optional().describe('A list of prior receipts from the user.'), // Optional array of prior receipts
});

export type FraudDetectionInput = z.infer<typeof FraudDetectionInputSchema>;

const FraudDetectionOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the receipt is potentially fraudulent.'),
  fraudExplanation: z
    .string()
    .describe('Explanation of why the receipt is considered fraudulent.'),
  confidenceScore: z.number().describe('A score representing the confidence in the fraud detection.'),
});

export type FraudDetectionOutput = z.infer<typeof FraudDetectionOutputSchema>;

export async function detectFraud(input: FraudDetectionInput): Promise<FraudDetectionOutput> {
  return detectFraudFlow(input);
}

const detectFraudPrompt = ai.definePrompt({
  name: 'detectFraudPrompt',
  input: {schema: FraudDetectionInputSchema},
  output: {schema: FraudDetectionOutputSchema},
  prompt: `You are an expert in fraud detection specializing in receipts.
  Given the receipt data and image, determine if the receipt is potentially fraudulent.
  Consider factors such as inconsistencies in the data, unusual patterns, and anomalies compared to prior receipts.

  Receipt Data: {{{receiptData}}}
  Receipt Image: {{media url=receiptImage}}
  Prior Receipts: {{#each priorReceipts}}{{{this}}}\n{{/each}}

  Based on your analysis, determine whether the receipt is fraudulent or not and provide an explanation for your reasoning.
  Also, provide a confidence score representing the certainty of your detection (0-1). If there are no prior receipts, then only use the other provided data.

  Output your answer as JSON conforming to the following schema:
  ${JSON.stringify(FraudDetectionOutputSchema.describe)}`,
});

const detectFraudFlow = ai.defineFlow(
  {
    name: 'detectFraudFlow',
    inputSchema: FraudDetectionInputSchema,
    outputSchema: FraudDetectionOutputSchema,
  },
  async input => {
    const {output} = await detectFraudPrompt(input);
    return output!;
  }
);
