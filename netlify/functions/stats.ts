import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

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

    if (event.httpMethod === 'GET' && pathParts[0] === 'stats' && pathParts[1] === 'today') {
      // GET /api/stats/today
      const today = new Date().toISOString().split('T')[0];
      const stats = await storage.getChatStats(today);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
      };
    }

    if (event.httpMethod === 'GET' && pathParts[0] === 'stats' && pathParts.length === 2) {
      // GET /api/stats/:date
      const date = pathParts[1];
      const stats = await storage.getChatStats(date);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not found' })
    };

  } catch (error: any) {
    console.error('Error in stats function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
};