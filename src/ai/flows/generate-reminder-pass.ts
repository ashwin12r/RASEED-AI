'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate a Google Wallet pass for a return reminder.
 *
 * - generateReminderPass - A function that generates a pass for a given reminder.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// This is the data we expect from the client.
const ReminderPassInputSchema = z.object({
  id: z.string(),
  productName: z.string(),
  purchaseDate: z.string().describe("The date of purchase in ISO format."),
  returnByDate: z.string().describe("The return-by date in ISO format."),
});

export type ReminderPassInput = z.infer<typeof ReminderPassInputSchema>;

const GenerateWalletPassOutputSchema = z.object({
  jwt: z.string().describe('The signed JWT for the Google Wallet pass.'),
});

export type GenerateWalletPassOutput = z.infer<typeof GenerateWalletPassOutputSchema>;

export async function generateReminderPass(input: ReminderPassInput): Promise<GenerateWalletPassOutput> {
  return generateReminderPassFlow(input);
}

const generateReminderPassFlow = ai.defineFlow(
  {
    name: 'generateReminderPassFlow',
    inputSchema: ReminderPassInputSchema,
    outputSchema: GenerateWalletPassOutputSchema,
  },
  async (reminder) => {
    // 1. Get credentials from environment variables
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!issuerId || !serviceAccountEmail || !serviceAccountKey || !appUrl) {
      throw new Error("Google Wallet credentials or App URL are not configured in environment variables.");
    }
    
    // 2. Construct the Google Wallet Pass Object
    const passId = uuidv4();
    const passClass = 'reminder'; // Should be pre-created in Google Wallet Console

    const passObject: any = {
      id: `${issuerId}.${passId}`,
      classId: `${issuerId}.${passClass}`,
      genericType: 'GENERIC_TYPE_UNSPECIFIED',
      hexBackgroundColor: '#f57c00', // An orange color for reminders
      logo: {
        sourceUri: {
          uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg'
        }
      },
      cardTitle: {
        defaultValue: {
          language: 'en',
          value: 'Return Reminder'
        }
      },
      subheader: {
        defaultValue: {
          language: 'en',
          value: reminder.productName
        }
      },
      header: {
        defaultValue: {
          language: 'en',
          value: `Return by ${new Date(reminder.returnByDate).toLocaleDateString()}`
        }
      },
      textModulesData: [
        {
          id: 'reminder_details',
          header: 'Return Details',
          body: `Product: ${reminder.productName}\nPurchase Date: ${new Date(reminder.purchaseDate).toLocaleDateString()}`
        },
      ],
    };
    
    // Only add the app link if not on localhost
    if (!appUrl.includes('localhost')) {
        passObject.linksModuleData = {
            uris: [
                {
                    uri: `${appUrl}/reminders?id=${reminder.id}`,
                    description: 'View Reminder in App'
                }
            ]
        };
    }
    
    // 3. Create and sign the JWT
    // If running locally, use a placeholder public URL for the origin to prevent loading issues.
    const originUrl = appUrl.includes('localhost') ? 'https://google.com' : appUrl;
    
    const claims = {
      iss: serviceAccountEmail,
      aud: 'google',
      typ: 'savetowallet',
      origins: [originUrl],
      payload: {
        genericObjects: [passObject]
      }
    };

    const signedJwt = jwt.sign(claims, serviceAccountKey, { algorithm: 'RS256' });
    
    return { jwt: signedJwt };
  }
);
