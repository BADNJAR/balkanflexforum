// Pokrece se automatski kad netko posalje formu "zalba" (Netlify Forms).
// Salje zalbu na Discord preko webhooka (env varijabla DISCORD_WEBHOOK_URL).

const PING_ID = process.env.DISCORD_PING_ID || '919569204661858384';

const cut = (v, n) => {
  const s = String(v == null || v === '' ? '-' : v);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
};

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const p = body.payload || {};
    if (p.form_name !== 'zalba') return { statusCode: 200, body: 'ignored' };

    // Bot (preporuceno): DISCORD_BOT_TOKEN + (opcionalno) DISCORD_CHANNEL_ID u Netlify env varijablama.
    // Rezervno: DISCORD_WEBHOOK_URL.
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID || '1558935607302950932';
    const webhook = process.env.DISCORD_WEBHOOK_URL;
    let url, headers = { 'Content-Type': 'application/json' };
    if (botToken) {
      url = `https://discord.com/api/v10/channels/${channelId}/messages`;
      headers.Authorization = `Bot ${botToken}`;
    } else if (webhook) {
      url = webhook;
    } else {
      console.error('Nije postavljen ni DISCORD_BOT_TOKEN ni DISCORD_WEBHOOK_URL.');
      return { statusCode: 200, body: 'no discord config' };
    }

    const d = p.data || {};
    const payload = {
      content: PING_ID ? `<@${PING_ID}> nova prijava na forumu` : 'Nova prijava na forumu',
      allowed_mentions: PING_ID ? { users: [PING_ID] } : { parse: [] },
      embeds: [{
        title: cut(`${d.tip || 'Prijava'} ${d.broj_prijave || ''}`.trim(), 250),
        color: 0xff2a3d,
        fields: [
          { name: 'Ime u igri', value: cut(d.ime, 1000), inline: true },
          { name: 'Discord', value: cut(d.discord, 1000), inline: true },
          { name: 'Detalj', value: cut(d.detalj, 1000) },
          { name: 'Datum događaja', value: cut(d.datum, 1000), inline: true },
          { name: 'Dokaz', value: cut(d.dokaz, 1000), inline: true },
          { name: 'Opis', value: cut(d.opis, 1000) }
        ],
        footer: { text: 'Balkan Flex Roleplay forum' },
        timestamp: new Date().toISOString()
      }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) console.error('Discord odgovor:', res.status, await res.text());
    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    console.error(e);
    return { statusCode: 200, body: 'error' };
  }
};
