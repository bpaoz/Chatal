// Bot Responses API - Vercel Serverless Function
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

  try {
    if (req.method === 'GET') {
      const responses = await storage.getAllBotResponses();
      return res.status(200).json(responses);
    }

    if (req.method === 'POST') {
      const response = await storage.createBotResponse(req.body);
      return res.status(201).json(response);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const response = await storage.updateBotResponse(Number(id), req.body);
      return res.status(200).json(response);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await storage.deleteBotResponse(Number(id));
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Bot responses error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}