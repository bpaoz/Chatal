import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { insertFacebookSettingsSchema } from "../../shared/schema";

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
    if (event.httpMethod === 'GET') {
      // GET /api/facebook-settings
      const settings = await storage.getFacebookSettings();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(settings)
      };
    }

    if (event.httpMethod === 'POST') {
      // POST /api/facebook-settings
      const body = JSON.parse(event.body || '{}');
      const validatedData = insertFacebookSettingsSchema.parse(body);
      const settings = await storage.updateFacebookSettings(validatedData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(settings)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not found' })
    };

  } catch (error: any) {
    console.error('Error in facebook-settings function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
};