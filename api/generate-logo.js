import 'dotenv/config';
import Replicate from 'replicate';
import sharp from 'sharp';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { group } = req.body;
    const replicate = new Replicate();

    try {
      const input = {
        prompt: `a professional, minimal logo of ${group}, on a transparent background. no text, simple geometric shapes and lines.`,
        scheduler: "K_EULER"
      };

      const output = await replicate.run("stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", { input });

      // Load the generated image using Sharp
      const image = sharp(Buffer.from(output[0], 'base64'));

      // Remove the background and make it transparent
      const outputBuffer = await image
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .toBuffer();

      // Crop the image to a circle
      const logoSize = 512; // Adjust the size as needed
      const circleLogo = await sharp(outputBuffer)
        .resize(logoSize, logoSize)
        .composite([{
          input: Buffer.from(
            `<svg><circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="black"/></svg>`
          ),
          blend: 'dest-in'
        }])
        .toBuffer();

      // Convert the cropped logo to base64
      const logoBase64 = circleLogo.toString('base64');

      res.status(200).json({ logoUrl: `data:image/png;base64,${logoBase64}` });
    } catch (error) {
      console.error('Error generating logo:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}