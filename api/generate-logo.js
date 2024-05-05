import 'dotenv/config';
import Replicate from 'replicate';
import Jimp from 'jimp';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { group } = req.body;

    try {
      // Generate logo description using Anthropic Claude API
      const prompt = `Generate a professional and minimal logo description for ${group}. The logo should use simple geometric shapes and lines, and have no text, and a white or transparent background. Provide the description in a concise manner.`;

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
      const logoDescription = content.content;

      // Generate logo image using Replicate API
      const replicate = new Replicate();
      const input = {
        prompt: `A logo based on the following description: ${logoDescription}`,
        scheduler: "K_EULER"
      };      

      const output = await replicate.run("stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", { input });

      const imageBuffer = Buffer.from(output[0], 'base64');
      const image = await Jimp.read(imageBuffer);

      // Remove the background and make it transparent
      image.rgba(false).background(0xFFFFFFFF).flatten();

      // Crop the image to a circle
      const logoSize = 512; // Adjust the size as needed
      const circleLogo = new Jimp(logoSize, logoSize, 0x00000000);
      circleLogo.circle();
      image.resize(logoSize, logoSize);
      image.mask(circleLogo, 0, 0);

      // Convert the cropped logo to base64
      const logoBase64 = await image.getBase64Async(Jimp.MIME_PNG);

      res.status(200).json({ logoUrl: logoBase64 });
    } catch (error) {
      console.error('Error generating logo:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}