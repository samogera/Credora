'use server';

/**
 * @fileOverview An AI agent that recommends loan products based on a user's credit score.
 *
 * - getLoanRecommendations - A function that returns suitable loan products.
 * - GetLoanRecommendationsInput - The input type for the getLoanRecommendations function.
 * - GetLoanRecommendationsOutput - The return type for the getLoanRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GetLoanRecommendationsInputSchema = z.object({
  score: z.number().describe('The Credora score of the user.'),
  loanProducts: z.array(z.object({
    partnerName: z.string(),
    productName: z.string(),
    interestRate: z.string(),
    maxAmount: z.string(),
    requirements: z.string().describe("Credit score or other requirements for the loan.")
  })).describe("A list of available loan products from all partners.")
});
export type GetLoanRecommendationsInput = z.infer<typeof GetLoanRecommendationsInputSchema>;


export const LoanRecommendationSchema = z.object({
    partnerName: z.string(),
    productName: z.string(),
    interestRate: z.string(),
    maxAmount: z.string(),
    reason: z.string().describe("A brief explanation of why this loan is a good fit for the user."),
    isRecommended: z.boolean().describe("Whether this product is recommended for the user based on their score."),
});
export type LoanRecommendation = z.infer<typeof LoanRecommendationSchema>;


export const GetLoanRecommendationsOutputSchema = z.object({
  recommendations: z.array(LoanRecommendationSchema).describe('A list of personalized loan recommendations.'),
});
export type GetLoanRecommendationsOutput = z.infer<typeof GetLoanRecommendationsOutputSchema>;

export async function getLoanRecommendations(
  input: GetLoanRecommendationsInput
): Promise<GetLoanRecommendationsOutput> {
  return getLoanRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getLoanRecommendationsPrompt',
  input: {schema: GetLoanRecommendationsInputSchema},
  output: {schema: GetLoanRecommendationsOutputSchema},
  prompt: `You are an AI financial advisor for Credora. Your task is to analyze a list of available loan products and recommend the most suitable ones for a user based on their credit score.

User's Credit Score: {{{score}}}

Available Loan Products:
{{#each loanProducts}}
- Partner: {{partnerName}}, Product: {{productName}}, Rate: {{interestRate}}, Max Amount: {{maxAmount}}, Requirements: {{requirements}}
{{/each}}

Analyze each product. For each one, set 'isRecommended' to true if the user's score meets the product's requirements. Provide a short 'reason' explaining why it is or isn't a good fit. Focus on the user's score and the product requirements in your reasoning. Return a recommendation object for every loan product provided.
`,
});

const getLoanRecommendationsFlow = ai.defineFlow(
  {
    name: 'getLoanRecommendationsFlow',
    inputSchema: GetLoanRecommendationsInputSchema,
    outputSchema: GetLoanRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
