const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getToken = () => localStorage.getItem('lista-token');

async function request(method, path, body = null) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
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
  async login(method, credential, displayName, photoUrl) {
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

  async linkPaymentMethod(type, referenceToken) {
    const res = await request('POST', '/users/me/payment-methods', {
      type: type.toLowerCase(),
      referenceToken
    });
    localStorage.setItem('lista-user', JSON.stringify(res));
    return res;
  },

  // Groups
  async getGroups() {
    return request('GET', '/groups');
  },

  async getGroup(groupId) {
    return request('GET', `/groups/${groupId}`);
  },

  async createGroup(name) {
    return request('POST', '/groups', { name });
  },

  async joinGroup(reference) {
    const slug = reference.includes('/') ? reference.split('/').pop() : reference;
    const res = await request('GET', `/join/${slug.trim()}`);
    return res.group;
  },

  // Expenses & Ledgers
  async createExpense(groupId, expense) {
    const user = JSON.parse(localStorage.getItem('lista-user') || '{}');
    const payload = {
      description: expense.description,
      amount: Math.round(expense.amount * 100),
      currency: 'PHP',
      category: expense.category.toLowerCase(),
      paidBy: user.id,
      splitType: 'equal',
      mentions: expense.mentions || []
    };
    return request('POST', `/groups/${groupId}/expenses`, payload);
  },

  async getLedger(groupId) {
    return request('GET', `/groups/${groupId}/ledger`);
  },

  async getActivities(groupId) {
    return request('GET', `/groups/${groupId}/activities`);
  },

  // Settlements & Roommates
  async settleDebt(groupId, amount, method, toUserIds) {
    const currentUser = JSON.parse(localStorage.getItem('lista-user') || '{}');
    const payload = {
      groupId,
      fromUserId: currentUser.id,
      amount: Math.round(amount * 100),
      method: method.toLowerCase(),
      toUserIds
    };
    return request('POST', '/settlements', payload);
  },

  async nudgeRoommate(groupId, toUserId) {
    return request('POST', `/groups/${groupId}/nudge`, { toUserId });
  }
};

// Temporarily keeping mock data exports to prevent compile breakages before App.tsx is updated
export const mockGroups = [
  {
    id: "bahay-604",
    name: "Bahay 604",
    members: [
      { initials: "AR", id: "1" },
      { initials: "MS", id: "2" },
      { initials: "JC", id: "3" }
    ],
    netBalance: 680,
    status: "Confirmed",
    color: "#89D7B7",
  }
];

export const mockActivities = [];
