import dotenv from 'dotenv';

dotenv.config();

export default async (req, res) => {
  if (req.method === 'POST') {
    const { documentNumber } = req.body;

    try {
      const documentUrl = `https://www.federalregister.gov/api/v1/documents/${documentNumber}`;
      const documentResponse = await fetch(documentUrl);

      console.log('Response Status:', documentResponse.status);
      console.log('Response Headers:', documentResponse.headers);

      let documentData;
      if (documentResponse.headers.get('content-type').includes('application/json')) {
        documentData = await documentResponse.json();
        console.log('Response Body:', JSON.stringify(documentData));
      } else {
        const responseBody = await documentResponse.text();
        console.log('Unexpected response format:', responseBody);
        throw new Error('Unexpected response format');
      }

      // Extract the full_text_xml_url from the API response
      const fullTextXmlUrl = documentData.full_text_xml_url;

      // Fetch the full text XML data using the extracted URL
      const fullTextResponse = await fetch(fullTextXmlUrl);
      const fullTextXml = await fullTextResponse.text();

      const truncatedFullTextXml = fullTextXml.slice(0, 10000);

      const prompt = `Provide a concise, high-level summary of the key points from the document below, as if an experienced policy researcher were briefing a senior staffer. Focus on essential information and context, synthesizing the content to address why this document is important.

Additionally, identify key stakeholders likely to be affected by or interested in the document's proposals. For each stakeholder, include a sentence describing their potential bias or interest in influencing the document's proposals. Ensure that the stakeholders are relevant to the specific context of the document being summarized.

Pick stakeholders that represent diverse interests that ideally do not agree with each other.

Prioritize clarity and brevity while ensuring no critical details are omitted. Do not include preamble like 'this is a summary..', jump straight into the summary content.

Input:
${truncatedFullTextXml}`;

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