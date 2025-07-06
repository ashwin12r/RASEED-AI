'use server';

/**
 * @fileOverview A Genkit flow for setting return and refund reminders from receipts.
 *
 * - setReturnReminder - A function that handles setting reminders from a receipt.
 * - ReturnReminderInput - The input type for the setReturnReminder function.
 * - ReturnReminderOutput - The return type for the setReturnReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReturnReminderInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ReturnReminderInput = z.infer<typeof ReturnReminderInputSchema>;

const ReturnReminderOutputSchema = z.object({
  reminders: z.array(z.object({
    productName: z.string().describe('The name of the product.'),
    purchaseDate: z.string().describe('The date of purchase.'),
    returnByDate: z.string().describe('The calculated date by which the item must be returned.'),
  })).describe('A list of items with their return deadlines.'),
});
export type ReturnReminderOutput = z.infer<typeof ReturnReminderOutputSchema>;

export async function setReturnReminder(input: ReturnReminderInput): Promise<ReturnReminderOutput> {
  return returnReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'returnReminderPrompt',
  input: {schema: ReturnReminderInputSchema},
  output: {schema: ReturnReminderOutputSchema},
  prompt: `You are an expert at parsing receipts for return policy information.
  Analyze the following receipt and identify all items and their return-by dates.
  If the return policy is mentioned (e.g., "30-day returns"), calculate the return-by date from the purchase date.
  Assume a standard 14-day return policy if not specified.

  Receipt Image: {{media url=receiptDataUri}}

  Return the output in JSON format. If no items can be returned, return an empty reminders array.
  `,
});

const returnReminderFlow = ai.defineFlow(
  {
    name: 'returnReminderFlow',
    inputSchema: ReturnReminderInputSchema,
    outputSchema: ReturnReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
