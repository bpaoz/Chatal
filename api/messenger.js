// Facebook Messenger Webhook - Vercel Serverless Function
import { MemStorage } from '../shared/storage.js';

const storage = new MemStorage();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Facebook webhook verification
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'mobilis_verify_token_2024';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  if (req.method === 'POST') {
    const body = req.body;

    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhook_event = entry.messaging[0];
        console.log('Webhook event:', webhook_event);

        const sender_psid = webhook_event.sender.id;
        
        if (webhook_event.message) {
          await handleMessage(sender_psid, webhook_event.message);
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.status(404).json({ error: 'Not Found' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text) {
    const messageText = received_message.text.toLowerCase();
    
    // Simple intent matching
    if (messageText.includes('balance') || messageText.includes('رصيد')) {
      response = {
        text: "Pour vérifier votre solde, composez *555# / لفحص رصيدك، اطلب *555#"
      };
    } else if (messageText.includes('recharge') || messageText.includes('تعبئة')) {
      response = {
        text: "Pour recharger: *777*code# / للتعبئة: *777*الكود#"
      };
    } else {
      response = {
        text: "Bonjour! Comment puis-je vous aider? / مرحباً! كيف يمكنني مساعدتك؟"
      };
    }
  } else {
    response = {
      text: "Désolé, je ne comprends que les messages texte. / عذراً، أفهم الرسائل النصية فقط."
    };
  }

  await callSendAPI(sender_psid, response);
}

async function callSendAPI(sender_psid, response) {
  const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  
  if (!PAGE_ACCESS_TOKEN) {
    console.error('PAGE_ACCESS_TOKEN not found');
    return;
  }

  const request_body = {
    recipient: {
      id: sender_psid
    },
    message: response
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request_body)
    });

    if (!response.ok) {
      console.error('Failed to send message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}