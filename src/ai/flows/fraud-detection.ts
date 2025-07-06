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
  receiptDataUri: z
    .string()
    .describe(
      'A photo of the receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type FraudDetectionInput = z.infer<typeof FraudDetectionInputSchema>;

const FraudDetectionOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the receipt is potentially fraudulent.'),
  fraudExplanation: z
    .string()
    .describe('Explanation of why the receipt is considered fraudulent.'),
  confidenceScore: z.number().describe('A score representing the confidence in the fraud detection (0-1).'),
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
  Given the receipt image, determine if the receipt is potentially fraudulent.
  Look for signs of tampering, unusual formatting, inconsistencies, or other indicators of fraud.

  Receipt Image: {{media url=receiptDataUri}}

  Based on your analysis, determine whether the receipt is fraudulent or not, provide an explanation for your reasoning, and a confidence score.
  Output your answer as JSON.
  `,
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
