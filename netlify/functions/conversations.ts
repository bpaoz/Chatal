import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { insertConversationSchema, type Message } from "../../shared/schema";
import { z } from "zod";
import crypto from "crypto";

// Import storage for Netlify
import { MemStorage } from "../../server/storage";
const storage = new MemStorage();

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
    const path = event.path.replace('/api/', '').replace('/.netlify/functions/', '');
    const pathParts = path.split('/');

    if (event.httpMethod === 'GET' && pathParts.length === 2 && pathParts[0] === 'conversations') {
      // GET /api/conversations/:userId
      const userId = pathParts[1];
      const conversation = await storage.getConversationByUserId(userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(conversation)
      };
    }

    if (event.httpMethod === 'POST' && pathParts[0] === 'conversations' && pathParts.length === 1) {
      // POST /api/conversations
      const body = JSON.parse(event.body || '{}');
      const validatedData = insertConversationSchema.parse(body);
      const conversation = await storage.createConversation(validatedData);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(conversation)
      };
    }

    if (event.httpMethod === 'POST' && pathParts.length === 3 && pathParts[0] === 'conversations' && pathParts[2] === 'messages') {
      // POST /api/conversations/:id/messages
      const conversationId = pathParts[1];
      const body = JSON.parse(event.body || '{}');
      
      const messageSchema = z.object({
        text: z.string(),
        sender: z.enum(['user', 'bot']),
        language: z.enum(['ar', 'fr']).optional()
      });
      
      const { text, sender, language } = messageSchema.parse(body);
      const message: Message = {
        id: crypto.randomUUID(),
        text,
        sender,
        timestamp: Date.now(),
        language
      };

      const success = await storage.addMessageToConversation(conversationId, message);
      if (!success) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "Conversation not found" })
        };
      }

      // If user message, generate bot response
      let botResponse: Message | null = null;
      if (sender === 'user') {
        const intent = await analyzeIntent(text);
        const response = await generateBotResponse(intent, language || 'ar');
        if (response) {
          const botMessage: Message = {
            id: crypto.randomUUID(),
            text: response,
            sender: 'bot',
            timestamp: Date.now(),
            language
          };
          await storage.addMessageToConversation(conversationId, botMessage);
          botResponse = botMessage;
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message, botResponse })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not found' })
    };

  } catch (error: any) {
    console.error('Error in conversations function:', error);
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