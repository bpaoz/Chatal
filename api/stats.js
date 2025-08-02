// Chat Statistics API - Vercel Serverless Function
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
      const stats = await storage.getChatStats();
      return res.status(200).json(stats);
    }

    if (req.method === 'POST') {
      const stat = await storage.createChatStat(req.body);
      return res.status(201).json(stat);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}