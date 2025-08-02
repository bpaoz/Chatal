// Conversations API - Vercel Serverless Function
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
      const { userId } = req.query;
      if (userId) {
        const conversation = await storage.getConversation(userId);
        return res.status(200).json(conversation);
      } else {
        const conversations = await storage.getAllConversations();
        return res.status(200).json(conversations);
      }
    }

    if (req.method === 'POST') {
      const conversation = await storage.createConversation(req.body);
      return res.status(201).json(conversation);
    }

    if (req.method === 'PUT') {
      const { userId } = req.query;
      const conversation = await storage.updateConversation(userId, req.body);
      return res.status(200).json(conversation);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Conversations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}