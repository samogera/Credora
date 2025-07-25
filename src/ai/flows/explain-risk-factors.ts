'use server';

/**
 * @fileOverview An AI agent that explains the top factors influencing a user's Credora score.
 *
 * - explainRiskFactors - A function that explains the risk factors influencing the credit score.
 * - ExplainRiskFactorsInput - The input type for the explainRiskFactors function.
 * - ExplainRiskFactorsOutput - The return type for the explainRiskFactors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainRiskFactorsInputSchema = z.object({
  score: z.number().describe('The Credora score of the user.'),
  stellarActivity: z
    .string()
    .describe('The Stellar activity of the user (e.g., transaction frequency, asset holdings).'),
  offChainSignals: z
    .string()
    .describe('The off-chain signals of the user (e.g., utility bills, phone number).'),
});
export type ExplainRiskFactorsInput = z.infer<typeof ExplainRiskFactorsInputSchema>;

const ExplainRiskFactorsOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the top factors influencing the Credora score.'),
  improvementSuggestions: z
    .string()
    .describe('Suggestions on how the user can improve their Credora score.'),
});
export type ExplainRiskFactorsOutput = z.infer<typeof ExplainRiskFactorsOutputSchema>;

export async function explainRiskFactors(
  input: ExplainRiskFactorsInput
): Promise<ExplainRiskFactorsOutput> {
  return explainRiskFactorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainRiskFactorsPrompt',
  input: {schema: ExplainRiskFactorsInputSchema},
  output: {schema: ExplainRiskFactorsOutputSchema},
  prompt: `You are an AI assistant that explains the factors influencing a user's Credora score.

  Provide a clear and concise explanation of the top factors influencing the user's score based on the provided data.
  Also, provide suggestions on how the user can improve their score.

  Credora Score: {{{score}}}
  Stellar Activity: {{{stellarActivity}}}
  Off-chain Signals: {{{offChainSignals}}}

  Explanation:
  {{explanation}}

  Improvement Suggestions:
  {{improvementSuggestions}}`,
});

const explainRiskFactorsFlow = ai.defineFlow(
  {
    name: 'explainRiskFactorsFlow',
    inputSchema: ExplainRiskFactorsInputSchema,
    outputSchema: ExplainRiskFactorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
