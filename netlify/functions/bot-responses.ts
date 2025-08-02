import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { insertBotResponseSchema } from "../../shared/schema";

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

    if (event.httpMethod === 'GET' && pathParts[0] === 'bot-responses') {
      // GET /api/bot-responses
      const responses = await storage.getAllBotResponses();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(responses)
      };
    }

    if (event.httpMethod === 'POST' && pathParts[0] === 'bot-responses') {
      // POST /api/bot-responses
      const body = JSON.parse(event.body || '{}');
      const validatedData = insertBotResponseSchema.parse(body);
      const response = await storage.createBotResponse(validatedData);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(response)
      };
    }

    if (event.httpMethod === 'PUT' && pathParts.length === 2 && pathParts[0] === 'bot-responses') {
      // PUT /api/bot-responses/:id
      const id = pathParts[1];
      const body = JSON.parse(event.body || '{}');
      const updates = insertBotResponseSchema.partial().parse(body);
      const response = await storage.updateBotResponse(id, updates);
      if (!response) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "Bot response not found" })
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response)
      };
    }

    if (event.httpMethod === 'DELETE' && pathParts.length === 2 && pathParts[0] === 'bot-responses') {
      // DELETE /api/bot-responses/:id
      const id = pathParts[1];
      const success = await storage.deleteBotResponse(id);
      if (!success) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "Bot response not found" })
        };
      }
      return {
        statusCode: 204,
        headers,
        body: ''
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not found' })
    };

  } catch (error: any) {
    console.error('Error in bot-responses function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
};