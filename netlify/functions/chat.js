exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const body = JSON.parse(event.body);
    let messages;
    let systemContent = 'You are a tourism assistant for Croatia on the OtkrijtHR portal. IMPORTANT: Always respond in the same language the user writes in. If the user writes in English, respond in English. If the user writes in Croatian, respond in Croatian. If the user writes in German, respond in German. And so on for any language. Give concrete recommendations about beaches, accommodation, restaurants and activities. Be brief and helpful.';
    if (body.messages && Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (body.message) {
      if (body.context) systemContent = body.context;
      messages = [{ role: 'user', content: String(body.message) }];
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'No message provided' }) };
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemContent },
          ...messages
        ],
        max_tokens: 500
      })
    });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, please try again.';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply, choices: data.choices })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
