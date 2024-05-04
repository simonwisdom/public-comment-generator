const fetch = require('node-fetch');
require('dotenv').config();


module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { documentNumber } = req.body;

    try {
      // Fetch the document by its document number
      const documentUrl = `http://api.federalreigster.gov/v1/articles/${documentNumber}.json`;
      const documentResponse = await fetch(documentUrl);
      const documentData = await documentResponse.json();

      // Extract the full text content from the document data
      const fullTextXml = documentData.full_text_xml_url;

      // Truncate the full text XML to 10,000 characters
      const truncatedFullTextXml = fullTextXml.slice(0, 10000);

      // Prepare the fields to pass to Claude for summarization
      const fields = {
        documentNumber: documentNumber,
        truncatedFullTextXml: truncatedFullTextXml,
        // Add other relevant fields from the document as needed
      };

      const prompt = `Provide a concise, high-level summary of the key points from the document below, as if an experienced policy researcher were briefing a senior staffer. Focus on essential information and context, synthesizing the content to address why this document is important.

Additionally, identify key stakeholders likely to be affected by or interested in the document's proposals. For each stakeholder, include a sentence describing their potential bias or interest in influencing the document's proposals. Ensure that the stakeholders are relevant to the specific context of the document being summarized.

Pick stakeholders that represent diverse interests that ideally do not agree with each other.

Prioritize clarity and brevity while ensuring no critical details are omitted.

Input:

"""`;

      // Create a message array with the correct format
      const messages = [
        {
          role: "user",
          content: prompt,
        }
      ];

      // Include the required fields model and max_tokens
      const model = "claude-3-haiku-20240307"; // Use the correct model identifier as needed
      const max_tokens = 1024; // Set the maximum number of tokens to generate

      // Interact with the Anthropic API
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
        console.error('API Error Response:', errorBody);
        throw new Error(`API responded with status: ${apiResponse.status} and body: ${errorBody}`);
      }

      const content = await apiResponse.json();
      console.log('API Response:', JSON.stringify(content)); // Log the entire response

      // Extract the summary from the API response
      const summary = content.content[0].text; // Assuming the summary is always the first element

      // Send the summary as the response
      res.status(200).json({ summary });

    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};