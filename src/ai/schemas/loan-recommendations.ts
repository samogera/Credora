/**
 * @fileOverview Zod schemas for the loan recommendation flow.
 */

import {z} from 'genkit';

export const GetLoanRecommendationsInputSchema = z.object({
  score: z.number().describe('The Credora score of the user.'),
  loanProducts: z
    .array(
      z.object({
        partnerName: z.string(),
        productName: z.string(),
        interestRate: z.string(),
        maxAmount: z.string(),
        requirements: z
          .string()
          .describe('Credit score or other requirements for the loan.'),
      })
    )
    .describe('A list of available loan products from all partners.'),
});
export type GetLoanRecommendationsInput = z.infer<
  typeof GetLoanRecommendationsInputSchema
>;

export const LoanRecommendationSchema = z.object({
  partnerName: z.string(),
  productName: z.string(),
  interestRate: z.string(),
  maxAmount: z.string(),
  reason: z
    .string()
    .describe('A brief explanation of why this loan is a good fit for the user.'),
  isRecommended: z
    .boolean()
    .describe(
      'Whether this product is recommended for the user based on their score.'
    ),
});
export type LoanRecommendation = z.infer<typeof LoanRecommendationSchema>;

export const GetLoanRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(LoanRecommendationSchema)
    .describe('A list of personalized loan recommendations.'),
  improvementSuggestion: z.string().optional().describe("A suggestion for how the user can improve their score if no products are recommended.")
});
export type GetLoanRecommendationsOutput = z.infer<
  typeof GetLoanRecommendationsOutputSchema
>;
