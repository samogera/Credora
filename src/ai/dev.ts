import { config } from 'dotenv';
config();

import '@/ai/flows/generate-synthetic-data.ts';
import '@/ai/flows/explain-risk-factors.ts';
import '@/ai/flows/get-loan-recommendations.ts';
import '@/ai/flows/chat.ts';
