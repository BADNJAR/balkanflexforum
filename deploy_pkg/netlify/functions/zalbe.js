// Javna lista zalbi. Cita Netlify Forms submissione preko Netlify API-ja
// (potrebna env varijabla NETLIFY_API_TOKEN) i vraca samo javna polja.
// Discord korisnika se NE salje na front.

const API = 'https://api.netlify.com/api/v1';
const MAX_PAGES = 5; // 5 x 100 = zadnjih 500 prijava

const clean = (v, n) => String(v == null ? '' : v).slice(0, n);

exports.handler = async () => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=30, s-maxage=30'
  };
  try {
    const token = process.env.NETLIFY_API_TOKEN;
    const siteId = process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
    if (!token || !siteId) {
      console.error('Nedostaje NETLIFY_API_TOKEN ili SITE_ID.');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'not configured' }) };
    }
    const auth = { Authorization: `Bearer ${token}` };

    const formsRes = await fetch(`${API}/sites/${siteId}/forms`, { headers: auth });
    if (!formsRes.ok) throw new Error('forms ' + formsRes.status);
    const form = (await formsRes.json()).find((f) => f.name === 'zalba');
    if (!form) return { statusCode: 200, headers, body: JSON.stringify({ igraci: [], admini: [] }) };

    const igraci = [];
    const admini = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const r = await fetch(`${API}/forms/${form.id}/submissions?per_page=100&page=${page}`, { headers: auth });
      if (!r.ok) throw new Error('submissions ' + r.status);
      const subs = await r.json();
      for (const s of subs) {
        const d = s.data || {};
        const broj = String(d.broj_prijave || '');
        const item = {
          broj: clean(broj, 20),
          created: s.created_at,
          ime: clean(d.ime, 80),
          detalj: clean(d.detalj, 120),
          datum: clean(d.datum, 20),
          opis: clean(d.opis, 2000),
          dokaz: clean(d.dokaz, 500)
        };
        if (broj.startsWith('#ZI')) igraci.push(item);
        else if (broj.startsWith('#ZA')) admini.push(item); // unban zahtjevi nisu javni
      }
      if (subs.length < 100) break;
    }
    return { statusCode: 200, headers, body: JSON.stringify({ igraci, admini }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'failed' }) };
  }
};
