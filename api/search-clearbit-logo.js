import 'dotenv/config';
import fetch from 'node-fetch';

function generateAddressPrompt(group) {
    return `Provide the most likely corporate headquarters address for the company "${group}". For example, if the input is "Microsoft", return the address in the following format:
  
  Microsoft Corporation
  One Microsoft Way
  Redmond, WA 98052-6399
  USA
  
  Here are 5 examples that clearly demonstrate the desired input and output format:
  
  Example 1:
  
  Input: "Apple Inc."
  
  Output:
  
  Apple Inc.
  One Apple Park Way
  Cupertino, CA 95014
  USA
  
  Example 2:
  
  Input: "Amazon.com, Inc."
  
  Output:
  
  Amazon.com, Inc.
  410 Terry Avenue North
  Seattle, WA 98109-5210
  USA
  
  Example 3:
  
  Input: "Alphabet Inc."
  
  Output:
  
  Alphabet Inc.
  1600 Amphitheatre Parkway
  Mountain View, CA 94043
  USA
  
  Example 4:
  
  Input: "Meta Platforms, Inc."
  
  Output:
  
  Meta Platforms, Inc.
  1 Hacker Way
  Menlo Park, CA 94025
  USA
  
  Example 5:
  
  Input: "The Coca-Cola Company"
  
  Output:
  
  The Coca-Cola Company
  One Coca-Cola Plaza
  Atlanta, GA 30313
  USA
  
  The model should not provide any additional explanations, instructions, or code snippets. It should simply return the corporate headquarters address in the specified format.
  
  Input: "${group}"
  
  Output: `;
  }

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { group } = req.body;

    try {
      // Generate domain format using Anthropic Claude API
      const prompt = `Convert the company name "${group}" into a domain format suitable for the Clearbit API. For example, if the input is "Microsoft", return "microsoft.com".
      
        Here are 5 examples that clearly demonstrate the desired input and output format:
    Example 1:
    Input: "Microsoft"
    Output: microsoft.com
    Example 2:
    Input: "Apple Inc."
    Output: apple.com
    Example 3:
    Input: "Amazon.com, Inc."
    Output: amazon.com
    Example 4:
    Input: "Alphabet Inc."
    Output: alphabet.com
    Example 5:
    Input: "Meta Platforms, Inc."
    Output: meta.com
    Please note that the ONLY acceptable output format is the lowercase company name followed by the ".com" TLD, as shown in the examples above. 
    The model should not provide any additional explanations, instructions, or code snippets. It should simply return the domain in the specified format.
    
    Input: "${group}"
    Output: `;

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
      const domainMatch = content.content[0].text.match(/^([a-z0-9-]+\.com)$/i);

      if (!domainMatch) {
        throw new Error('Invalid domain format returned by Claude API');
      }

      const domain = domainMatch[1].toLowerCase();

      console.log('Generated domain:', domain); // Log the generated domain

      // Generate corporate address using Anthropic Claude API
        const addressPrompt = generateAddressPrompt(group);
        const addressMessages = [
        {
            role: "user",
            content: addressPrompt,
        }
        ];

        const addressApiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({ model, max_tokens, messages: addressMessages })
        });

        if (!addressApiResponse.ok) {
        const errorBody = await addressApiResponse.text();
        throw new Error(`API responded with status: ${addressApiResponse.status} and body: ${errorBody}`);
        }

        const addressContent = await addressApiResponse.json();
        const address = addressContent.content[0].text.trim();

      // Fetch the company logo using Clearbit API
      const clearbitResponse = await fetch(`https://logo.clearbit.com/${domain}`);

      console.log('Clearbit API response status:', clearbitResponse.status); // Log the Clearbit API response status

      if (!clearbitResponse.ok) {
        throw new Error(`Clearbit API responded with status: ${clearbitResponse.status}`);
      }

      const logoBuffer = await clearbitResponse.arrayBuffer();
      const logoBase64 = Buffer.from(logoBuffer).toString('base64');
      const logoDataUri = `data:${clearbitResponse.headers.get('content-type')};base64,${logoBase64}`;

      res.status(200).json({ logoUrl: logoDataUri, address });
    } catch (error) {
      console.error('Error searching for logo:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}