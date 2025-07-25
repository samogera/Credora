'use server';

/**
 * @fileOverview Flow for generating synthetic user data with varied financial profiles for testing the credit scoring engine.
 *
 * - generateSyntheticData - A function that generates synthetic user data.
 * - GenerateSyntheticDataInput - The input type for the generateSyntheticData function.
 * - GenerateSyntheticDataOutput - The return type for the generateSyntheticData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSyntheticDataInputSchema = z.object({
  numberOfUsers: z
    .number()
    .describe('The number of synthetic users to generate.')
    .default(5),
  assetHoldingsRange: z
    .string()
    .describe("A range of possible asset holdings for users, e.g., '1000-10000'.")
    .default('1000-10000'),
  transactionFrequencyRange: z
    .string()
    .describe("A range of possible transaction frequencies for users, e.g., '1-10'.")
    .default('1-10'),
  utilityBillsRange: z
    .string()
    .describe("A range of possible values for monthly utility bills, e.g. '50-200'")
    .default('50-200'),
});
export type GenerateSyntheticDataInput = z.infer<
  typeof GenerateSyntheticDataInputSchema
>;

const GenerateSyntheticDataOutputSchema = z.object({
  syntheticUsers: z
    .array(z.record(z.any()))
    .describe('An array of synthetic user data.'),
});
export type GenerateSyntheticDataOutput = z.infer<
  typeof GenerateSyntheticDataOutputSchema
>;

export async function generateSyntheticData(
  input: GenerateSyntheticDataInput
): Promise<GenerateSyntheticDataOutput> {
  return generateSyntheticDataFlow(input);
}

const generateSyntheticDataPrompt = ai.definePrompt({
  name: 'generateSyntheticDataPrompt',
  input: {schema: GenerateSyntheticDataInputSchema},
  output: {schema: GenerateSyntheticDataOutputSchema},
  prompt: `You are an expert in generating synthetic user data for financial applications.  Given the
  specifications of number of users: {{{numberOfUsers}}}, asset holdings range: {{{assetHoldingsRange}}},
  transaction frequency range: {{{transactionFrequencyRange}}}, and utility bills range: {{{utilityBillsRange}}},
  generate a JSON array of synthetic user data.

  Each user object in the array should contain the following fields:
  - stellarWalletId (string): A unique Stellar wallet ID.
  - assetHoldings (number):  Asset holdings within the specified range.
  - transactionFrequency (number): Transaction frequency within the specified range.
  - utilityBills (number):  Monthly utility bills within the specified range.
  - offChainIdentifiers (object): An object containing a phone number (string).

  Ensure the data is realistic and varied to effectively test a credit scoring engine.

  The output must be a valid JSON array.
  `,
});

const generateSyntheticDataFlow = ai.defineFlow(
  {
    name: 'generateSyntheticDataFlow',
    inputSchema: GenerateSyntheticDataInputSchema,
    outputSchema: GenerateSyntheticDataOutputSchema,
  },
  async input => {
    const {output} = await generateSyntheticDataPrompt(input);
    return output!;
  }
);
