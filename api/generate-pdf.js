import 'dotenv/config';
import PDFDocument from 'pdfkit';

let fetch;

import('node-fetch').then(mod => {
  fetch = mod.default;
}).catch(err => console.error('Failed to load node-fetch:', err));

module.exports = async (req, res) => {
  // ... rest of the code remains the same
};
  if (req.method === 'POST') {
    const { title, summary, group, interest } = req.body;

  // Construct a custom prompt and incorporate all relevant details
  const customPrompt = `Please generate a detailed and constructive comment based on the following inputs. Here are two examples of professional-sounding comments:

    Example 1:
    Input:
    {
    "title": "Response to Notice of Proposed Rulemaking on Preventing Improper Use of CHIPS Act Funding",
    "summary": "Concerns about the breadth of restrictions in the Proposed Rule, particularly those restricting technology licensing agreements, and their potential harm to U.S. economic and national security interests.",
    "group": "Innovation Alliance, U.S. Startups and Inventors for Jobs (USIJ), and Licensing Executives Society (USA & Canada), Inc.",
    "interest": "Protecting U.S. competitiveness in the semiconductor industry and securing U.S. economic and national security by ensuring U.S. leadership in innovation of critical technologies."
    }
    Output:
    May 23, 2023

    U.S. Department of Commerce
    National Institute of Standards and Technology
    100 Bureau Drive
    Gaithersburg, MD 20899

    Re: Preventing the Improper Use of CHIPS Act Funding (RIN 0693-AB70)

    We appreciate the opportunity to provide comments in response to the Commerce Department's Notice of Proposed Rulemaking on Preventing the Improper Use of CHIPS Act Funding ("Proposed Rule"). While we applaud the passage of the CHIPS Act and the Administration's efforts to ensure CHIPS Act funding does not inadvertently benefit the United States' adversaries or otherwise put our national security at risk, we have serious concerns that the breadth of the restrictions contained in the Proposed Rule—particularly those restricting certain technology licensing agreements—will harm rather than protect U.S. economic and national security interests.

    Sincerely,
    Innovation Alliance
    U.S. Startups and Inventors for Jobs (USIJ)
    Licensing Executives Society (USA & Canada), Inc.

    Example 2:
    Input:
    {
    "title": "Comments on Proposed Guardrails for CHIPS Act Funding Recipients",
    "summary": "Concerns about the proposed guardrails unintentionally curtailing the production of chips for downstream consumer technologies, creating supply shortages, and discouraging participation in the program.",
    "group": "Consumer Technology Association (CTA)",
    "interest": "Representing the U.S. consumer technology industry and manufacturers of consumer technologies that may contain both leading-edge and legacy chips."
    }
    Output:
    May 23, 2023

    U.S. Department of Commerce  
    National Institute of Standards and Technology
    100 Bureau Drive
    Gaithersburg, MD 20899

    Re: Preventing the Improper Use of CHIPS Act Funding (88 FR 17439; Docket Number: 230313-0074)

    Dear Under Secretary Locascio:

    The Consumer Technology Association (CTA)® appreciates the opportunity to submit comments in response to the National Institute of Standards and Technology's (NIST's) Proposed Rule on Preventing the Improper Use of CHIPS Act Funding.

    CTA strongly supports efforts by the Biden-Harris Administration to strengthen supply chain security and resilience, spur innovation, increase competitiveness, de-risk from the People's Republic of China, and ensure long-term U.S. global technology leadership. However, our overarching concern is that the proposed guardrails will unintentionally curtail the production of chips for use in downstream consumer technologies, thereby creating further supply shortages in the future. The Proposed Rule will also prevent recipients and their affiliates from participating in international semiconductor activity and thereby discourage their participation in the program.

    Sincerely,
    Consumer Technology Association (CTA)

    Now, please generate a comment based on the following inputs:`;

    const content = `${customPrompt}\nTitle: ${title}\nSummary: ${summary}\nGroup: ${group}\nInterest: ${interest}`;

  // Create a message array with the correct format
  const messages = [{
    role: "user",
    content: content
  }];

  // Include the required fields model and max_tokens
  const model = "claude-3-haiku-20240307"; // Use the correct model identifier as needed
  const max_tokens = 1024; // Set the maximum number of tokens to generate

  try {
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

    // Extract the detailed content from the API response
    const detailedContent = content.content[0].text; // Assuming the detailed content is always the first element

    // Generate PDF
    const doc = new PDFDocument();
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="output.pdf"',
        'Content-Length': pdfData.length
      });
      res.end(pdfData);
    });

    // Add header
    // doc.fontSize(16).text('Public Comment on CHIPS Act Funding', { align: 'center' });
    // doc.moveDown();

    // Add title
    doc.fontSize(14).text(`Title: ${title}`, { align: 'left' });
    doc.moveDown();

    // Add group and interest
    doc.fontSize(12).text(`Group: ${group}`, { align: 'left' });
    doc.fontSize(12).text(`Interest: ${interest}`, { align: 'left' });
    doc.moveDown();

    // Add detailed content
    if (detailedContent) {
      doc.fontSize(12).text(detailedContent, { align: 'left' });
    } else {
      doc.fontSize(12).text('No detailed content received from the model.', { align: 'left' });
    }

    doc.end();
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} else {
  res.status(405).json({ error: 'Method Not Allowed' });
}
};