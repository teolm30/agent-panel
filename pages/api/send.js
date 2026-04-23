export default async function handler(req, res) {
  const { text, chat_id } = req.query;
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }
  
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!BOT_TOKEN) {
    return res.status(500).json({ error: 'Bot token not configured' });
  }
  
  const targetChatId = chat_id || process.env.DEFAULT_CHAT_ID;
  
  if (!targetChatId) {
    return res.status(500).json({ error: 'No chat_id provided and DEFAULT_CHAT_ID not set' });
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      return res.status(200).json({ success: true, message_id: result.result.message_id });
    } else {
      return res.status(400).json({ error: result.description });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
