export default async function handler(req, res) {
  const { text, agent } = req.query;
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }
  
  // Map agent names to bot tokens
  const botTokens = {
    'jarvis': process.env.TELEGRAM_BOT_TOKEN_JARVIS,
    'mcraft': process.env.TELEGRAM_BOT_TOKEN_MCRAFT,
    'foxos': process.env.TELEGRAM_BOT_TOKEN_FOXOS
  };
  
  const chatIds = {
    'jarvis': process.env.TELEGRAM_CHAT_ID_JARVIS || '8788969906',
    'mcraft': process.env.TELEGRAM_CHAT_ID_MCRAFT || '8788969906',
    'foxos': process.env.TELEGRAM_CHAT_ID_FOXOS || '8788969906'
  };
  
  const botKey = agent || 'jarvis';
  const BOT_TOKEN = botTokens[botKey];
  const targetChatId = chatIds[botKey];
  
  if (!BOT_TOKEN) {
    return res.status(500).json({ error: `Bot token not configured for ${botKey}` });
  }
  
  if (!targetChatId) {
    return res.status(500).json({ error: `Chat ID not configured for ${botKey}` });
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
      return res.status(200).json({ 
        success: true, 
        message_id: result.result.message_id,
        agent: botKey,
        bot: BOT_TOKEN.substring(0, 10) + '...'
      });
    } else {
      return res.status(400).json({ error: result.description });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}