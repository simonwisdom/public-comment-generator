import 'dotenv/config';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { group } = req.body;

    try {
      // Generate domain format using Anthropic Claude API
      const prompt = `Convert the company name "${group}" into a domain format suitable for the Clearbit API. For example, if the input is "Microsoft", return "microsoft.com".`;

      const messages = [
        {
          role: "user",
          content: prompt,
        }
      ];

      const model = "claude-3-haiku-20240307";
      const max_tokens = 1024;

      const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({ model, max_tokens, messages })
      });

      if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        throw new Error(`API responded with status: ${apiResponse.status} and body: ${errorBody}`);
      }

      const content = await apiResponse.json();
      const domain = content.content[0].text;

      console.log('Generated domain:', domain); // Log the generated domain

      // Fetch the company logo using Clearbit API
      const clearbitResponse = await fetch(`https://logo.clearbit.com/${domain}`);

      console.log('Clearbit API response status:', clearbitResponse.status); // Log the Clearbit API response status

      if (!clearbitResponse.ok) {
        throw new Error(`Clearbit API responded with status: ${clearbitResponse.status}`);
      }

      const logoBuffer = await clearbitResponse.arrayBuffer();
      const logoBase64 = Buffer.from(logoBuffer).toString('base64');
      const logoDataUri = `data:${clearbitResponse.headers.get('content-type')};base64,${logoBase64}`;

      res.status(200).json({ logoUrl: logoDataUri });
    } catch (error) {
      console.error('Error searching for logo:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}