const delay = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

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
  },
  {
    id: "dorm-404",
    name: "Dorm 404",
    members: [
      { initials: "JM", id: "1" },
      { initials: "SR", id: "2" },
      { initials: "AB", id: "3" },
      { initials: "CD", id: "4" }
    ],
    netBalance: 1250,
    status: "Confirmed",
    color: "#89D7B7",
  },
  {
    id: "baguio-trip",
    name: "Baguio Trip",
    members: [
      { initials: "MR", id: "5" },
      { initials: "TD", id: "6" },
      { initials: "EF", id: "7" }
    ],
    netBalance: -250,
    status: "Pending confirmation",
    color: "#DCA953",
  },
];

export const mockActivities = [
  { id: "a1", group: "Dorm 404", title: "Mark paid ₱750 for Groceries", amount: 750, by: "Mark", time: "2h ago", state: "Confirmed", initials: "M" },
  { id: "a2", group: "Dorm 404", title: "You paid ₱1,200 for Ut...", amount: 1200, by: "You", time: "5h ago", state: "Offline — will sync", initials: "Y" },
  { id: "a3", group: "Dorm 404", title: "Sophia settled ₱500 for Rent", amount: 500, by: "Sophia", time: "Yesterday", state: "Confirmed", initials: "S" },
];

export const api = {
  async getGroups() {
    await delay(280);
    return mockGroups;
  },

  async getActivity() {
    await delay(180);
    return mockActivities;
  },

  async createGroup(name) {
    await delay(320);
    return {
      id: `group-${Date.now()}`,
      name,
      members: [{ initials: "AR", id: "1" }],
      netBalance: 0,
      status: "Confirmed",
      color: "#B7C9C1",
    };
  },

  async joinGroup(reference) {
    await delay(360);
    return {
      id: `joined-${Date.now()}`,
      name: reference.trim() || "Shared Listahan",
      members: [{ initials: "AR", id: "1" }, { initials: "MS", id: "2" }],
      netBalance: 0,
      status: "Confirmed",
      color: "#D9B36C",
    };
  },

  // Ready to replace with JWT-authenticated Express calls:
  // POST /groups/:id/expenses
  async createExpense(groupId, payload, token) {
    await delay(480);
    return {
      id: `expense-${Date.now()}`,
      groupId,
      ...payload,
      state: "Pending confirmation",
      tokenUsed: Boolean(token),
    };
  },

  // Ready to replace with JWT-authenticated Express calls:
  // GET /groups/:id/ledger
  async getLedger(groupId, token) {
    await delay(260);
    return { groupId, tokenUsed: Boolean(token), entries: [] };
  },
};
