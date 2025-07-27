'use server';
/**
 * @fileOverview A conversational AI agent for user support.
 *
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {MessageData} from 'genkit';
import {
  ChatInput,
  ChatInputSchema,
  ChatOutput,
  ChatOutputSchema,
} from '@/ai/schemas/chat';

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  system: `You are the Credora Assistant, a friendly and helpful AI chatbot. Your goal is to assist users with navigating the Credora platform and answering their questions about its features.

You can help with:
- Explaining what a Credora Score is.
- How to connect data sources.
- How to find and apply for loans.
- How to check application status.

If a user asks for something you cannot help with, or if they explicitly ask to speak to a real person, your response must be: "I am sorry, I cannot help with that. Would you like to be connected to a human support agent?".

Keep your answers concise and helpful. Use markdown for formatting if needed.`,
  prompt: `History:
{{#each history}}
- {{role}}: {{{content.[0].text}}}
{{/each}}

New User Message: {{{message}}}
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const history: MessageData[] = input.history.map(msg => ({
      role: msg.role,
      content: msg.content.map(c => ({text: c.text})),
    }));

    const llmResponse = await ai.generate({
      prompt: input.message,
      history,
      model: 'googleai/gemini-2.0-flash',
    });

    return {
      message: llmResponse.text,
    };
  }
);
