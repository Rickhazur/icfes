
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    try {
        const data = await resend.emails.send({
            from: 'Nova Schola <onboarding@resend.dev>', // Default testing sender
            to: [to],
            subject: subject,
            html: html,
        });

        console.log('✅ Email sent successfully:', data);
        return res.status(200).json(data);
    } catch (error) {
        console.error('❌ Resend Error:', error);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}
