// /api/send-quote.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, msg:'Method not allowed' });
  try {
    const { name, email, phone, postal, bill, roof, notes } = req.body || {};
    const TO = process.env.TO_EMAIL;
    const FROM = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const API = process.env.RESEND_API_KEY;
    if (!API || !TO || !FROM) return res.status(500).json({ ok:false, msg:'Missing env vars' });

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization:`Bearer ${API}`, 'Content-Type':'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `New Quote Request — ${name || 'No name'}`,
        text: [
          `Name: ${name||''}`,
          `Email: ${email||''}`,
          `Phone: ${phone||''}`,
          `Postal: ${postal||''}`,
          `Avg Bill: ${bill||''}`,
          `Roof: ${roof||''}`,
          `Notes: ${notes||''}`,
          `Time: ${new Date().toISOString()}`
        ].join('\n'),
        reply_to: email || undefined
      })
    });

    if (!r.ok) return res.status(500).json({ ok:false, msg:'Resend failed', err: await r.text() });
    return res.status(200).json({ ok:true });
  } catch (e) {
    return res.status(500).json({ ok:false, msg:'Server error', err:String(e) });
  }
}
