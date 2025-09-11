'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate a shopping list pass for Google Wallet.
 *
 * - generateShoppingListPass - A function that generates a shopping list pass based on user input.
 * - GenerateShoppingListPassInput - The input type for the generateShoppingListPass function.
 * - GenerateShoppingListPassOutput - The return type for the generateShoppingListPass function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const GenerateShoppingListPassInputSchema = z.object({
  query: z.string().describe('The user query to generate a shopping list from.'),
});
export type GenerateShoppingListPassInput = z.infer<typeof GenerateShoppingListPassInputSchema>;


const ShoppingListSchema = z.object({
    store: z.string().describe("A plausible store where the items can be purchased."),
    items: z.array(z.string()).describe("The list of items for the shopping list."),
});

const GenerateShoppingListPassOutputSchema = z.object({
  jwt: z.string().describe('The signed JWT for the Google Wallet pass.'),
  items: z.array(z.string()).describe('The list of items on the shopping list.'),
  store: z.string().describe('The store for the shopping list.'),
});
export type GenerateShoppingListPassOutput = z.infer<typeof GenerateShoppingListPassOutputSchema>;

export async function generateShoppingListPass(input: GenerateShoppingListPassInput): Promise<GenerateShoppingListPassOutput> {
  return generateShoppingListPassFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractShoppingListPrompt',
  input: {schema: GenerateShoppingListPassInputSchema},
  output: {schema: ShoppingListSchema},
  prompt: `You are a personal assistant that generates shopping lists based on user queries.
  From the query, extract the items for the shopping list, and suggest a common store where these items can be purchased.
  
  Query: {{{query}}}
  
  Return the output in JSON format with "items" and "store" keys. Do not include any other prose.`,
});

const generateShoppingListPassFlow = ai.defineFlow(
  {
    name: 'generateShoppingListPassFlow',
    inputSchema: GenerateShoppingListPassInputSchema,
    outputSchema: GenerateShoppingListPassOutputSchema,
  },
  async (input) => {
    
    // 1. Get the shopping list from the LLM
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Could not generate shopping list details.");
    }
    const { store, items } = output;

    // 2. Get credentials from environment variables
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!issuerId || !serviceAccountEmail || !serviceAccountKey || !appUrl) {
        throw new Error("Google Wallet credentials or App URL are not configured in .env file.");
    }
    
    // 3. Construct the Google Wallet Pass Object
    const passId = uuidv4();
    const passClass = 'shopping-list'; // Should be pre-created in Google Wallet Console

    const passObject: any = {
        id: `${issuerId}.${passId}`,
        classId: `${issuerId}.${passClass}`,
        genericType: 'GENERIC_TYPE_UNSPECIFIED',
        hexBackgroundColor: '#4285f4',
        logo: {
            sourceUri: {
                uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg'
            }
        },
        cardTitle: {
            defaultValue: {
                language: 'en',
                value: 'Shopping List'
            }
        },
        subheader: {
            defaultValue: {
                language: 'en',
                value: `At ${store}`
            }
        },
        header: {
            defaultValue: {
                language: 'en',
                value: store
            }
        },
        textModulesData: [
            {
                id: 'items_list',
                header: 'Items',
                body: items.join('\n')
            }
        ],
    };
    
    // Only add the app link if not on localhost
    if (!appUrl.includes('localhost')) {
        passObject.linksModuleData = {
            uris: [
                {
                    uri: `${appUrl}/analysis`,
                    description: 'Back to Analysis'
                }
            ]
        };
    }
    
    // 4. Create and sign the JWT
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
    
    return { jwt: signedJwt, items, store };
  }
);
