// Facebook Settings API - Vercel Serverless Function
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
      const settings = await storage.getFacebookSettings();
      return res.status(200).json(settings);
    }

    if (req.method === 'POST') {
      const settings = await storage.updateFacebookSettings(req.body);
      return res.status(200).json(settings);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Facebook settings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}