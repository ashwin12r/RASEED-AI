'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate a Google Wallet pass for a warranty.
 *
 * - generateWarrantyPass - A function that generates a pass for a given warranty.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// This is the data we expect from the client.
const WarrantyPassInputSchema = z.object({
  id: z.string(),
  productName: z.string(),
  purchaseDate: z.string().describe("The date of purchase in ISO format."),
  warrantyEndDate: z.string().describe("The warranty end date in ISO format."),
});

export type WarrantyPassInput = z.infer<typeof WarrantyPassInputSchema>;

const GenerateWalletPassOutputSchema = z.object({
  jwt: z.string().describe('The signed JWT for the Google Wallet pass.'),
});

export type GenerateWalletPassOutput = z.infer<typeof GenerateWalletPassOutputSchema>;

export async function generateWarrantyPass(input: WarrantyPassInput): Promise<GenerateWalletPassOutput> {
  return generateWarrantyPassFlow(input);
}

const generateWarrantyPassFlow = ai.defineFlow(
  {
    name: 'generateWarrantyPassFlow',
    inputSchema: WarrantyPassInputSchema,
    outputSchema: GenerateWalletPassOutputSchema,
  },
  async (warranty) => {
    // 1. Get credentials from environment variables
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!issuerId || !serviceAccountEmail || !serviceAccountKey || !appUrl) {
      throw new Error("Google Wallet credentials or App URL are not configured in environment variables.");
    }
    
    // 2. Construct the Google Wallet Pass Object
    const passId = uuidv4();
    const passClass = 'warranty'; // Should be pre-created in Google Wallet Console

    const passObject = {
      id: `${issuerId}.${passId}`,
      classId: `${issuerId}.${passClass}`,
      genericType: 'GENERIC_TYPE_UNSPECIFIED',
      hexBackgroundColor: '#388e3c', // A green color for warranties
      logo: {
        sourceUri: {
          uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg'
        }
      },
      cardTitle: {
        defaultValue: {
          language: 'en',
          value: 'Product Warranty'
        }
      },
      subheader: {
        defaultValue: {
          language: 'en',
          value: warranty.productName
        }
      },
      header: {
        defaultValue: {
          language: 'en',
          value: 'Warranty Information'
        }
      },
      textModulesData: [
        {
          id: 'warranty_details',
          header: 'Warranty Details',
          body: `Product: ${warranty.productName}\nPurchase Date: ${new Date(warranty.purchaseDate).toLocaleDateString()}\nExpires On: ${new Date(warranty.warrantyEndDate).toLocaleDateString()}`
        },
      ],
      linksModuleData: {
          uris: [
              {
                  uri: `${appUrl}/warranty?id=${warranty.id}`,
                  description: 'View Warranty in App'
              }
          ]
      }
    };
    
    // 3. Create and sign the JWT
    const claims = {
      iss: serviceAccountEmail,
      aud: 'google',
      typ: 'savetowallet',
      origins: [appUrl],
      payload: {
        genericObjects: [passObject]
      }
    };

    const signedJwt = jwt.sign(claims, serviceAccountKey, { algorithm: 'RS256' });
    
    return { jwt: signedJwt };
  }
);
