// /api/send-quote.js  (Node 18+ on Vercel)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, msg: 'Method not allowed' });

  try {
    const { name, email, phone, postal, bill, roof, notes } = req.body || {};
    const TO = process.env.TO_EMAIL;                // e.g. hello@stellrsolar.com
    const FROM = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // works before domain is verified
    const API = process.env.RESEND_API_KEY;

    if (!API || !TO || !FROM) return res.status(500).json({ ok: false, msg: 'Missing env vars' });

    const subject = `New Quote Request — ${name || 'No name'}`;
    const text = [
      `Name: ${name || ''}`,
      `Email: ${email || ''}`,
      `Phone: ${phone || ''}`,
      `Postal: ${postal || ''}`,
      `Avg Bill: ${bill || ''}`,
      `Roof: ${roof || ''}`,
      `Notes: ${notes || ''}`,
      `Time: ${new Date().toISOString()}`
    ].join('\n');

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject,
        text,
        reply_to: email || undefined
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ ok: false, msg: 'Resend failed', err });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: 'Server error', e: String(e) });
  }
}
