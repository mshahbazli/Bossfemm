import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

async function main() {
  try {
    const ai = new Anthropic();
    const response = await ai.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: {
        effort: 'low',
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: { category: { type: 'string' } },
            required: ['category'],
            additionalProperties: false,
          },
        },
      },
      messages: [{ role: 'user', content: "Hello world, what category is this: 'Maaşım azdır'" }],
    });
    const text = response.content.flatMap(b => (b.type === 'text' ? [b.text] : [])).join('');
    console.log("Success:", text);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
main();
