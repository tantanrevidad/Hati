const getToken = () => localStorage.getItem('lista-token');

async function request(method: string, path: string, body: any = null) {
  const token = getToken();
  console.log(`[API] ${method} ${path} | token=${token ? token.substring(0, 20) + '...' : 'NONE'}`);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    console.error(`[API] ${method} ${path} FAILED:`, errData);
    throw new Error(errData.error || `Request failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log(`[API] ${method} ${path} OK`);
  return data;
}

export const api = {
  // Authentication
  async checkUser(method: 'phone' | 'email', credential: string) {
    return request('POST', '/auth/check-user', { method, credential });
  },

  async login(method: 'phone' | 'email' | 'google', credential: string, displayName?: string, photoUrl?: string) {
    const res = await request('POST', '/auth/login', {
      method,
      credential,
      displayName,
      photoUrl
    });
    if (res.token) {
      localStorage.setItem('lista-token', res.token);
      localStorage.setItem('lista-user', JSON.stringify(res.user));
    }
    return res;
  },

  async linkPaymentMethod(type: 'gcash' | 'maya' | 'bank', referenceToken: string) {
    const res = await request('POST', '/users/me/payment-methods', {
      type: type.toLowerCase(),
      referenceToken
    });
    localStorage.setItem('lista-user', JSON.stringify(res));
    return res;
  },

  // Groups (Listahan)
  async getGroups() {
    return request('GET', '/groups');
  },

  async getGroup(groupId: string) {
    return request('GET', `/groups/${groupId}`);
  },

  async createGroup(name: string) {
    return request('POST', '/groups', { name });
  },

  async getGroupMembers(groupId: string) {
    return request('GET', `/groups/${groupId}/members`);
  },

  async getJoinLink(groupId: string) {
    return request('POST', `/groups/${groupId}/join-link`);
  },

  async joinGroup(slug: string) {
    const cleanSlug = slug.includes('/') ? slug.split('/').pop() : slug;
    return request('GET', `/join/${cleanSlug?.trim()}`);
  },

  // Expenses & Ledgers
  async createExpense(groupId: string, expense: { description: string; amount: number; category: string; paidBy: string; splitType?: string; participantIds?: string[] }) {
    const payload = {
      description: expense.description,
      amount: Math.round(expense.amount * 100), // convert to smallest unit centavos
      currency: 'PHP',
      category: expense.category.toLowerCase(),
      paidBy: expense.paidBy,
      splitType: expense.splitType || 'equal',
      splitDetails: expense.participantIds ? { participantIds: expense.participantIds } : undefined
    };
    return request('POST', `/groups/${groupId}/expenses`, payload);
  },

  async getExpenses(groupId: string) {
    return request('GET', `/groups/${groupId}/expenses`);
  },

  async getLedger(groupId: string) {
    return request('GET', `/groups/${groupId}/ledger`);
  },

  // Settlements & Roommates
  async settleDebt(groupId: string, fromUserId: string, amount: number, method: 'qrph' | 'cash' | 'stellar', toUserIds: string[]) {
    const payload = {
      groupId,
      fromUserId,
      amount: Math.round(amount * 100), // convert to smallest unit centavos
      method: method.toLowerCase(),
      toUserIds
    };
    return request('POST', '/settlements', payload);
  },

  async confirmSettlement(settlementId: string) {
    return request('POST', `/settlements/${settlementId}/confirm`);
  },

  async nudgeRoommate(groupId: string, toUserId: string) {
    return request('POST', `/groups/${groupId}/nudge`, { toUserId });
  },

  async generateQrPh(groupId: string, fromUserId: string, toUserId: string, amountCentavos: number) {
    return request('POST', '/settlements/qrph/generate', {
      groupId,
      fromUserId,
      toUserId,
      amountCentavos
    });
  }
};
