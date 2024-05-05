import 'dotenv/config';
import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, summary, group, interest, generatedLogoUrl, officialLogoUrl, address } = req.body;

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

    We appreciate the opportunity to provide comments in response to the Commerce Department's Notice of Proposed Rulemaking on Preventing the Improper Use of CHIPS Act Funding ("Proposed Rule"). 
    While we applaud the passage of the CHIPS Act and the Administration's efforts to ensure CHIPS Act funding does not inadvertently benefit the United States' adversaries or otherwise put our national security at risk, we have serious concerns that the breadth of the restrictions contained in the Proposed Rule—particularly those restricting certain technology licensing agreements—will harm rather than protect U.S. economic and national security interests.

    Sincerely,
    Innovation Alliance
    U.S. Startups and Inventors for Jobs (USIJ)
    Licensing Executives Society (USA & Canada), Inc.

    Example 2:
    {
    "title": "Airworthiness Directives: The Boeing Company Airplanes",
    "summary": "The proposed rule aims to implement new safety regulations affecting all Boeing Company airplanes, with specific emphasis on improving fuselage and wing structure integrity.",
    "group": "Qantas Airlines",
    "interest": "Ensuring the highest standards of safety and compliance in aircraft operations, maintaining fleet efficiency, and protecting passenger safety."
    }

    Qantas would like to provide the following comments to the FAA regarding NPRM FAA-2024-0231.

    Qantas notes that DDG MEL 30-21-01-02 has been updated to state "Perform a General Visual Inspection (GVI) of the engine inlet cavity for heat damage and applicable corrective actions at the completion of the dispatch interval period in accordance with Boeing Requirements Bulletin SB B787-81205-SB540023-00 and Collins Service Bulletin SB 787-G71-013, Rev 00 or later approved revisions." which will cover future applications of MEL 30-21-01-02 and MEL 30-21-01-07 for heat damage.
    
    Qantas finds that using a Service Bulletin to rectify an MEL is highly unusual and that MEL rectification by Maintenance Personnel is primarily driven by the appliable AMM. Qantas is concerned that Maintenance Personnel don’t typically refer to the application procedure of the MEL as part of the MEL rectification process and that Maintenance Personnel could inadvertently fail to carry out the required inspections per Boeing Requirements Bulletin SB B787-81205-SB540023-00 and Collins Service Bulletin SB 787-G71-013, Rev 00 or later approved revisions.
    
    Qantas would like to suggest that the AMM is also updated with the requirements of Boeing Requirements Bulletin SB B787-81205-SB540023-00 and Collins Service Bulletin SB 787-G71-013 to ensure that Maintenance Personnel cannot overlook these inspection requirements.
    
    Boeing Requirements Bulletin SB B787-81205-SB540023-00 specifies the actions required to be carried out on an Inlet Cowl currently fitted to an aircraft. However, Qantas notes that sometimes Inlet Cowls are not fitted to an aircraft and the last install position is unknown, hence the application of MEL 30-21-01-02 or MEL 30-21-01-07 is also unknown. An example would be an Inlet Cowl that is second hand. Qantas would like to politely request that FAA provide guidance to Operators in how to comply with the NPRM for Inlet Cowls not fitted to an aircraft and the last install position is unknown.

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
    const fetch = (await import('node-fetch')).default;
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

    // Add logo to the header
    if (officialLogoUrl) {
      const response = await fetch(officialLogoUrl);
      const buffer = await response.buffer();
      doc.image(buffer, 50, 50, { width: 80 });  // Reduced image width
    } else if (generatedLogoUrl) {
      const response = await fetch(generatedLogoUrl);
      const buffer = await response.buffer();  
      doc.image(buffer, 50, 50, { width: 80 });  // Reduced image width
    }

    // Add address to the right of the logo
    if (address) {
      const textWidth = doc.widthOfString(address);
      const pageWidth = doc.page.width;
      const addressX = pageWidth - textWidth - 50;
      doc.text(address, addressX, 50);
    }

    doc.text(`Title: ${title}`, 50, 140, { width: 500 });

    // Not including group and interest
    // doc.moveDown();
    // doc.text(`Group: ${group}`);
    // doc.text(`Interest: ${interest}`);

    // Add detailed content
    if (detailedContent) {
      doc.moveDown();
      doc.fontSize(12).text(detailedContent, { align: 'left' });  // Remove indentation
    } else {
      doc.moveDown();
      doc.fontSize(12).text('No detailed content received from the model.', { align: 'left' });
    }

    doc.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  }
}