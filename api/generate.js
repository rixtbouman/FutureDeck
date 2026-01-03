import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cards, direction } = req.body;

    if (!cards || cards.length === 0) {
      return res.status(400).json({ error: 'No cards provided' });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const cardList = cards.map((c, i) => `${i + 1}. ${c.name} (${c.category.toUpperCase()}): ${c.description}`).join('\n');

    const prompt = `You are a speculative fiction writer creating vivid future scenarios for the Futures Deck card game.

Cards drawn:
${cardList}

${direction ? `Direction hint: ${direction}` : ''}

Write a scenario in this exact format:

TITLE: [An evocative 2-4 word title]

SUBTITLE: [One sentence describing the scenario]

SCENARIO:
[2-3 paragraphs of vivid worldbuilding, written in present tense as if this future already exists. Be specific with names, places, products, institutions. Show don't tell.]

SCENE:
[A single paragraph showing a specific moment - one person experiencing this future. Include their name, age, and a concrete action they're taking. Make it feel real and grounded.]

IMPLICATIONS:
- [First implication with bold keyword]: [Explanation]
- [Second implication with bold keyword]: [Explanation]
- [Third implication with bold keyword]: [Explanation]
- [Fourth implication with bold keyword]: [Explanation]

ILLUSTRATION_PROMPT:
art deco engraving illustration, hand-tinted vintage colors, intricate linework, ornate geometric borders -- [TITLE IN CAPS]: [Detailed visual description of a key moment, including specific elements, colors, mood, composition]

Be creative, specific, and thought-provoking. Focus on second-order effects and unintended consequences.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text;

    // Parse the response
    const parseSection = (label) => {
      const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    };

    const result = {
      title: parseSection('TITLE'),
      subtitle: parseSection('SUBTITLE'),
      scenario: parseSection('SCENARIO'),
      scene: parseSection('SCENE'),
      implications: parseSection('IMPLICATIONS'),
      illustrationPrompt: parseSection('ILLUSTRATION_PROMPT'),
      cards: cards,
      raw: text,
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
