import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import type { Message } from "../../shared/schema";
import crypto from "crypto";

// Import storage for Netlify
import { MemStorage } from "../../server/storage";
const storage = new MemStorage();

interface FacebookMessage {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message: {
    mid: string;
    text: string;
  };
}

interface FacebookWebhookEntry {
  id: string;
  time: number;
  messaging: FacebookMessage[];
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Webhook verification
      const queryParams = event.queryStringParameters || {};
      const mode = queryParams["hub.mode"];
      const token = queryParams["hub.verify_token"];
      const challenge = queryParams["hub.challenge"];

      if (mode === "subscribe") {
        const settings = await storage.getFacebookSettings();
        if (settings && token === settings.verifyToken) {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain' },
            body: challenge || ''
          };
        } else {
          return {
            statusCode: 403,
            headers,
            body: 'Forbidden'
          };
        }
      } else {
        return {
          statusCode: 400,
          headers,
          body: 'Bad Request'
        };
      }
    }

    if (event.httpMethod === 'POST') {
      // Handle incoming messages
      const body = JSON.parse(event.body || '{}');
      
      if (body.object === "page") {
        for (const entry of body.entry as FacebookWebhookEntry[]) {
          for (const messagingEvent of entry.messaging) {
            if (messagingEvent.message) {
              await handleFacebookMessage(messagingEvent);
            }
          }
        }
      }
      
      return {
        statusCode: 200,
        headers,
        body: 'EVENT_RECEIVED'
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not found' })
    };

  } catch (error: any) {
    console.error('Facebook webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
};

// Helper Functions
async function analyzeIntent(text: string) {
  const normalizedText = text.toLowerCase();
  const responses = await storage.getAllBotResponses();
  
  let bestMatch = {
    intent: "unknown",
    confidence: 0,
    category: "general" as const
  };

  for (const response of responses) {
    const keywords = Array.isArray(response.keywords) ? response.keywords : [];
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        const confidence = keyword.length / text.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            intent: response.intent,
            confidence,
            category: response.category as any
          };
        }
      }
    }
  }

  return bestMatch;
}

async function generateBotResponse(intent: any, language: 'ar' | 'fr'): Promise<string | null> {
  if (intent.confidence < 0.1) {
    return language === 'ar' 
      ? "عذراً، لم أفهم استفساركم. يمكنكم التواصل مع خدمة العملاء على 600"
      : "Désolé, je n'ai pas compris votre demande. Vous pouvez contacter le service client au 600";
  }

  const response = await storage.getBotResponseByIntent(intent.intent);
  if (!response) return null;

  return language === 'ar' ? response.responseAr : response.responseFr;
}

async function handleFacebookMessage(messagingEvent: FacebookMessage) {
  const senderId = messagingEvent.sender.id;
  const messageText = messagingEvent.message.text;

  // Get or create conversation
  let conversation = await storage.getConversationByUserId(senderId);
  if (!conversation) {
    conversation = await storage.createConversation({
      userId: senderId,
      platform: 'messenger',
      messages: [],
      isActive: true
    });
  }

  // Add user message
  const userMessage: Message = {
    id: crypto.randomUUID(),
    text: messageText,
    sender: 'user',
    timestamp: messagingEvent.timestamp,
    language: 'ar' // Default to Arabic for Facebook messages
  };
  
  await storage.addMessageToConversation(conversation.id, userMessage);

  // Generate and send bot response
  const intent = await analyzeIntent(messageText);
  const botResponseText = await generateBotResponse(intent, 'ar');
  
  if (botResponseText) {
    const botMessage: Message = {
      id: crypto.randomUUID(),
      text: botResponseText,
      sender: 'bot',
      timestamp: Date.now(),
      language: 'ar'
    };
    
    await storage.addMessageToConversation(conversation.id, botMessage);
    
    // Send response back to Facebook
    await sendFacebookMessage(senderId, botResponseText);
  }
}

async function sendFacebookMessage(recipientId: string, messageText: string) {
  const settings = await storage.getFacebookSettings();
  if (!settings || !settings.pageAccessToken) {
    console.error("Facebook settings not configured");
    return;
  }

  const messageData = {
    recipient: { id: recipientId },
    message: { text: messageText }
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v12.0/me/messages?access_token=${settings.pageAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending Facebook message:", error);
  }
}