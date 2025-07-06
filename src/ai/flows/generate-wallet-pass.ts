'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate a Google Wallet pass for a receipt.
 *
 * - generateWalletPass - A function that generates a pass for a given receipt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { Receipt } from '@/hooks/use-receipts';


const GenerateWalletPassOutputSchema = z.object({
  jwt: z.string().describe('The signed JWT for the Google Wallet pass.'),
});
export type GenerateWalletPassOutput = z.infer<typeof GenerateWalletPassOutputSchema>;

export async function generateWalletPass(receipt: Receipt): Promise<GenerateWalletPassOutput> {
  return generateWalletPassFlow(receipt);
}

const generateWalletPassFlow = ai.defineFlow(
  {
    name: 'generateWalletPassFlow',
    inputSchema: z.any(), // Using any because Receipt type is complex for Zod here
    outputSchema: GenerateWalletPassOutputSchema,
  },
  async (receipt) => {
    // 1. Get credentials from environment variables
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!issuerId || !serviceAccountEmail || !serviceAccountKey) {
      throw new Error("Google Wallet credentials are not configured in .env file.");
    }
    
    // 2. Construct the Google Wallet Pass Object
    const passId = uuidv4();
    const passClass = 'receipt'; // Should be pre-created in Google Wallet Console

    const passObject = {
      id: `${issuerId}.${passId}`,
      classId: `${issuerId}.${passClass}`,
      genericType: 'GENERIC_TYPE_UNSPECIFIED',
      hexBackgroundColor: '#3f51b5',
      logo: {
        sourceUri: {
          uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg'
        }
      },
      cardTitle: {
        defaultValue: {
          language: 'en',
          value: 'Purchase Receipt'
        }
      },
      subheader: {
        defaultValue: {
          language: 'en',
          value: `From ${receipt.vendor}`
        }
      },
      header: {
        defaultValue: {
          language: 'en',
          value: `₹${receipt.total.toFixed(2)}`
        }
      },
      textModulesData: [
        {
          id: 'purchase_details',
          header: 'Purchase Details',
          body: `Date: ${new Date(receipt.date).toLocaleDateString()}\nCategory: ${receipt.category}`
        },
        {
          id: 'items_list',
          header: 'Items Purchased',
          body: receipt.items.join('\n')
        }
      ],
      linksModuleData: {
          uris: [
              {
                  uri: 'https://www.example.com',
                  description: 'View Online Receipt'
              }
          ]
      }
    };
    
    // 3. Create and sign the JWT
    const claims = {
      iss: serviceAccountEmail,
      aud: 'google',
      typ: 'savetowallet',
      origins: [],
      payload: {
        genericObjects: [passObject]
      }
    };

    const signedJwt = jwt.sign(claims, serviceAccountKey, { algorithm: 'RS256' });
    
    return { jwt: signedJwt };
  }
);
