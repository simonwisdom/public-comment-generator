import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export default async (req, res) => {
  if (req.method === 'POST') {
    const { documentNumber } = req.body;

    try {
      const documentUrl = `http://api.federalregister.gov/v1/articles/${documentNumber}.json`;
      const documentResponse = await fetch(documentUrl);
      const documentData = await documentResponse.json();

      const fullTextXml = documentData.full_text_xml_url;
      const truncatedFullTextXml = fullTextXml.slice(0, 10000);

      const fields = {
        documentNumber: documentNumber,
        truncatedFullTextXml: truncatedFullTextXml,
      };

      const prompt = `Provide a concise, high-level summary of the key points from the document below...`;

      const messages = [
        {
          role: "user",
          content: prompt,
        }
      ];

      const model = "claude-3-haiku-20240307"; // Modify as needed
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
      const summary = content.content[0].text;

      // Return the summary along with the document number and title
      res.status(200).json({
        summary,
        documentNumber: documentNumber,
        title: documentData.title // Assuming the title field exists in the fetched data
      });

    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
