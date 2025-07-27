/**
 * @fileOverview Zod schemas for the chat flow.
 */

import {z} from 'genkit';

export const ChatInputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({text: z.string()})),
      })
    )
    .describe('The conversation history.'),
  message: z.string().describe('The latest message from the user.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  message: z
    .string()
    .describe('The response message from the Credora assistant.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
