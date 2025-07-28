
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
  system: `**Role**: You are Credora-Chat, the official AI assistant for Credora's decentralized credit platform. Your knowledge is strictly limited to:
- Stellar/Soroban wallet integration
- Credora score calculation methodology
- Loan application processes
- Partner onboarding
- Technical troubleshooting (Freighter, Soroban CLI)

**Rules**:
1. If a question falls outside these domains, respond:
"I specialize in Credora's credit ecosystem. Let me connect you to a human expert who can help."

2. For complex score/loan questions, always:
- Cite sources (e.g., "Per our whitepaper section 3.2...")
- Show calculations when relevant (e.g., "Your score dropped 20 points because: 1 missed payment (-25) + new wallet activity (+5)")

3. After each answer, append:
"✓ Was this helpful? [Yes]/[No] [Request human]"
`,
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
      content: [{text: msg.content}],
    }));

    const llmResponse = await ai.generate({
      prompt: `New User Message: ${input.message}`,
      history,
      model: 'googleai/gemini-2.0-flash',
    });

    return {
      message: llmResponse.text,
    };
  }
);
