const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const getToken = () => localStorage.getItem('lista-token') || localStorage.getItem('lista_token');

async function request(method, path, body = null) {
  const token = getToken();
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Authentication
  async checkUser(method, credential) {
    return request('POST', '/auth/check-user', { method, credential });
  },

  async login(method, credential, displayName, photoUrl) {
    const res = await request('POST', '/auth/login', {
      method,
      credential,
      displayName,
      photoUrl
    });
    if (res.token) {
      localStorage.setItem('lista-token', res.token);
      localStorage.setItem('lista_token', res.token);
      localStorage.setItem('lista-user', JSON.stringify(res.user));
      localStorage.setItem('lista_user', JSON.stringify(res.user));
    }
    return res;
  },

  async linkPaymentMethod(type, referenceToken) {
    const res = await request('POST', '/users/me/payment-methods', {
      type: type.toLowerCase(),
      referenceToken
    });
    localStorage.setItem('lista-user', JSON.stringify(res));
    localStorage.setItem('lista_user', JSON.stringify(res));
    return res;
  },

  // Groups (Listahan)
  async getGroups() {
    return request('GET', '/groups');
  },

  async getGroup(groupId) {
    return request('GET', `/groups/${groupId}`);
  },

  async createGroup(name) {
    return request('POST', '/groups', { name });
  },

  async getGroupMembers(groupId) {
    return request('GET', `/groups/${groupId}/members`);
  },

  async getJoinLink(groupId) {
    return request('POST', `/groups/${groupId}/join-link`);
  },

  async joinGroup(slug) {
    const cleanSlug = slug.includes('/') ? slug.split('/').pop() : slug;
    return request('GET', `/join/${cleanSlug?.trim()}`);
  },

  // Expenses & Ledgers
  async createExpense(groupId, expense) {
    const payload = {
      description: expense.description,
      amount: Math.round(expense.amount * 100), // convert to smallest unit centavos
      currency: 'PHP',
      category: expense.category.toLowerCase(),
      paidBy: expense.paidBy,
      splitType: expense.splitType || 'equal',
      splitDetails: expense.splitDetails || (expense.participantIds ? { participantIds: expense.participantIds } : undefined)
    };
    return request('POST', `/groups/${groupId}/expenses`, payload);
  },

  async getExpenses(groupId) {
    return request('GET', `/groups/${groupId}/expenses`);
  },

  async getLedger(groupId) {
    return request('GET', `/groups/${groupId}/ledger`);
  },

  // Settlements & Roommates
  async settleDebt(groupId, fromUserId, amount, method, toUserIds) {
    const payload = {
      groupId,
      fromUserId,
      amount: Math.round(amount * 100), // convert to smallest unit centavos
      method: method.toLowerCase(),
      toUserIds
    };
    return request('POST', '/settlements', payload);
  },

  async confirmSettlement(settlementId, toUserId) {
    return request('POST', `/settlements/${settlementId}/confirm`, toUserId ? { toUserId } : null);
  },

  async nudgeRoommate(groupId, toUserId) {
    return request('POST', `/groups/${groupId}/nudge`, { toUserId });
  },

  async generateQrPh(groupId, fromUserId, toUserId, amountCentavos) {
    return request('POST', '/settlements/qrph/generate', {
      groupId,
      fromUserId,
      toUserId,
      amountCentavos
    });
  },

  // JS version compatibility aliases
  getGroupJoinLink(groupId) { return this.getJoinLink(groupId); },
  getGroupExpenses(groupId) { return this.getExpenses(groupId); },
  getGroupLedger(groupId) { return this.getLedger(groupId); },
  getGroupSettlements(groupId) { return request('GET', `/groups/${groupId}/settlements`); },
  createSettlement(settlementData) { return request('POST', '/settlements', settlementData); },
  
  async getSettlements(groupId) {
    return request('GET', `/groups/${groupId}/settlements`);
  },

  async analyzeReceiptText(description, groupMembersCount, userName) {
    return request('POST', '/api/analyze-receipt', { description, groupMembersCount, userName });
  },

  async scanReceipt(groupId, imageBase64, mimeType) {
    return request('POST', `/groups/${groupId}/expenses/scan`, { imageBase64, mimeType });
  }
};
