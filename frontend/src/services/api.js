const API_BASE = "http://localhost:3000";

// Helper to make HTTP requests with JWT token
async function request(method, path, body = null) {
  const token = localStorage.getItem("lista_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  return res.json().catch(() => ({}));
}

export const api = {
  // Auth
  login: (method, credential, displayName, photoUrl) => 
    request("POST", "/auth/login", { method, credential, displayName, photoUrl }),
    
  linkPaymentMethod: (type, referenceToken) =>
    request("POST", "/users/me/payment-methods", { type, referenceToken }),

  // Groups
  getGroups: () => request("GET", "/groups"),
  
  createGroup: (name) => request("POST", "/groups", { name }),
  
  getGroupJoinLink: (groupId) => request("POST", `/groups/${groupId}/join-link`),
  
  joinGroup: (slug) => request("GET", `/join/${slug}`),
  
  getGroupMembers: (groupId) => request("GET", `/groups/${groupId}/members`),

  // Expenses
  getGroupExpenses: (groupId) => request("GET", `/groups/${groupId}/expenses`),
  
  createExpense: (groupId, expenseData) => 
    request("POST", `/groups/${groupId}/expenses`, expenseData),

  // Ledger & Nudge
  getGroupLedger: (groupId) => request("GET", `/groups/${groupId}/ledger`),
  
  nudgeRoommate: (groupId, toUserId) => 
    request("POST", `/groups/${groupId}/nudge`, { toUserId }),

  // Settlements
  getGroupSettlements: (groupId) => request("GET", `/groups/${groupId}/settlements`),
  
  createSettlement: (settlementData) => 
    request("POST", "/settlements", settlementData),
    
  confirmSettlement: (settlementId, toUserId) => 
    request("POST", `/settlements/${settlementId}/confirm`, { toUserId }),
};
