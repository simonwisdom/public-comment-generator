import 'dotenv/config';
import Replicate from 'replicate';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { group } = req.body;
    const replicate = new Replicate();

    try {
      const input = {
        prompt: `a professional, minimal logo of ${group}`,
        scheduler: "K_EULER"
      };
      const output = await replicate.run("stability-ai/stable-diffusion", { input });
      res.status(200).json({ logoUrl: output[0] });
    } catch (error) {
      console.error('Error generating logo:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
