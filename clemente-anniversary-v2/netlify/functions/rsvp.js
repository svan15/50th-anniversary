// Server-side proxy: the Apps Script URL is stored in Netlify environment variables.
exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  try {
    const payload = JSON.parse(event.body || '{}');
    const name = String(payload.name || '').trim();
    const attendance = String(payload.attendance || '');
    const guests = Number(payload.guests);
    if (!name || name.length > 120 || !['Joyfully accepts', 'Regretfully declines'].includes(attendance) ||
      !Number.isInteger(guests) || guests < 0 || guests > 20 ||
      (attendance === 'Joyfully accepts' && guests < 1) ||
      (attendance === 'Regretfully declines' && guests !== 0) || String(payload.message || '').length > 1000) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Invalid RSVP' }) };
    }
    const url = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
      return { statusCode: 503, headers, body: JSON.stringify({ success: false, error: 'RSVP service not configured' }) };
    }
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name, attendance, guests, message: String(payload.message || '') }),
      redirect: 'follow',
      signal: AbortSignal.timeout(12000)
    });
    if (!upstream.ok) throw new Error(`Google endpoint returned ${upstream.status}`);
    const text = await upstream.text();
    let json;
    try { json = JSON.parse(text); } catch { throw new Error('Google endpoint did not return JSON'); }
    if (json.success !== true) throw new Error('Google Sheets did not confirm the save');
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('RSVP proxy error:', error);
    return { statusCode: 502, headers, body: JSON.stringify({ success: false, error: 'Unable to confirm save' }) };
  }
};
