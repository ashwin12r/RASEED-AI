import { config } from 'dotenv';
config();

import '@/ai/flows/dynamic-categorization.ts';
import '@/ai/flows/generate-shopping-list-pass.ts';
import '@/ai/flows/ingest-and-analyze-receipt.ts';
import '@/ai/flows/spending-analysis.ts';
import '@/ai/flows/local-language-query.ts';
import '@/ai/flows/savings-suggestions.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/warranty-tracker.ts';
import '@/ai/flows/return-reminder.ts';
import '@/ai/flows/generate-wallet-pass.ts';
import '@/ai/flows/fraud-detection.ts';
import '@/ai/flows/extract-items-from-receipt.ts';
import '@/ai/flows/generate-warranty-pass.ts';
import '@/ai/flows/generate-reminder-pass.ts';
