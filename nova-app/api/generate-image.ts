
import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, style = 'vivid', size = "1024x1024" } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: size,
            style: style,
            quality: "standard",
        });

        return res.status(200).json(response);

    } catch (err: any) {
        console.error("OpenAI Image Error:", err);
        return res.status(500).json({ error: "Error generating image", details: err.message });
    }
}
