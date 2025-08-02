// In-Memory Storage for Vercel Deployment
export class MemStorage {
  constructor() {
    this.conversations = new Map();
    this.botResponses = [
      {
        id: 1,
        intent: 'balance',
        keywords: ['رصيد', 'balance', 'solde'],
        responseAr: 'لفحص رصيدك، اطلب *555#',
        responseFr: 'Pour vérifier votre solde, composez *555#',
        isActive: true
      },
      {
        id: 2,
        intent: 'recharge',
        keywords: ['تعبئة', 'recharge', 'recharger'],
        responseAr: 'للتعبئة، اطلب *777*الكود#',
        responseFr: 'Pour recharger: *777*code#',
        isActive: true
      },
      {
        id: 3,
        intent: 'plans',
        keywords: ['خطة', 'forfait', 'plan', 'abonnement'],
        responseAr: 'لمعرفة الخطط المتاحة، اطلب *123#',
        responseFr: 'Pour voir les forfaits disponibles, composez *123#',
        isActive: true
      },
      {
        id: 4,
        intent: 'support',
        keywords: ['مساعدة', 'aide', 'support', 'problème'],
        responseAr: 'للدعم الفني، اتصل بـ 3033',
        responseFr: 'Pour le support technique, appelez le 3033',
        isActive: true
      }
    ];
    this.facebookSettings = {
      pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
      verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || 'mobilis_verify_token_2024',
      isConfigured: false,
      webhookUrl: ''
    };
    this.chatStats = [
      {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        totalMessages: 150,
        webMessages: 80,
        facebookMessages: 70,
        uniqueUsers: 45
      }
    ];
  }

  // Conversation methods
  async getConversation(userId) {
    return this.conversations.get(userId) || {
      userId,
      platform: 'web',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getAllConversations() {
    return Array.from(this.conversations.values());
  }

  async createConversation(data) {
    const conversation = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.conversations.set(data.userId, conversation);
    return conversation;
  }

  async updateConversation(userId, data) {
    const existing = this.conversations.get(userId);
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.conversations.set(userId, updated);
    return updated;
  }

  // Bot Response methods
  async getAllBotResponses() {
    return this.botResponses;
  }

  async createBotResponse(data) {
    const response = {
      ...data,
      id: Math.max(...this.botResponses.map(r => r.id)) + 1,
      createdAt: new Date().toISOString()
    };
    this.botResponses.push(response);
    return response;
  }

  async updateBotResponse(id, data) {
    const index = this.botResponses.findIndex(r => r.id === id);
    if (index !== -1) {
      this.botResponses[index] = { ...this.botResponses[index], ...data };
      return this.botResponses[index];
    }
    throw new Error('Response not found');
  }

  async deleteBotResponse(id) {
    const index = this.botResponses.findIndex(r => r.id === id);
    if (index !== -1) {
      this.botResponses.splice(index, 1);
    }
  }

  // Facebook Settings methods
  async getFacebookSettings() {
    return this.facebookSettings;
  }

  async updateFacebookSettings(data) {
    this.facebookSettings = { ...this.facebookSettings, ...data };
    return this.facebookSettings;
  }

  // Chat Stats methods
  async getChatStats() {
    return this.chatStats;
  }

  async createChatStat(data) {
    const stat = {
      ...data,
      id: Math.max(...this.chatStats.map(s => s.id)) + 1
    };
    this.chatStats.push(stat);
    return stat;
  }
}