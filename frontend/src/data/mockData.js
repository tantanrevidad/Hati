// Mock data simulating backend API responses per Lista v2 contracts

export const currentUser = {
  id: "user-001",
  displayName: "Alex Rivera",
  photoUrl: null,
  phone: "+63 917 123 4567",
  email: "alex@lista.ph",
  authMethod: "phone",
  linkedPaymentMethods: [
    { type: "gcash", referenceToken: "GC-TOKEN-001", linkedAt: "2026-07-01T10:00:00Z" },
  ],
  walletAddress: null,
  createdAt: "2026-07-01T10:00:00Z",
};

export const users = [
  currentUser,
  {
    id: "user-002",
    displayName: "Mark Santos",
    photoUrl: null,
    phone: "+63 918 234 5678",
    email: "mark@lista.ph",
    authMethod: "google",
    linkedPaymentMethods: [],
    walletAddress: null,
    createdAt: "2026-07-01T11:00:00Z",
  },
  {
    id: "user-003",
    displayName: "Rina Cruz",
    photoUrl: null,
    phone: "+63 919 345 6789",
    email: "rina@lista.ph",
    authMethod: "email",
    linkedPaymentMethods: [
      { type: "maya", referenceToken: "MY-TOKEN-003", linkedAt: "2026-07-02T09:00:00Z" },
    ],
    walletAddress: "GBTEST123STELLAR456WALLET789",
    createdAt: "2026-07-02T09:00:00Z",
  },
  {
    id: "user-004",
    displayName: "Jun Dela Rosa",
    photoUrl: null,
    phone: "+63 920 456 7890",
    email: "jun@lista.ph",
    authMethod: "phone",
    linkedPaymentMethods: [],
    walletAddress: null,
    createdAt: "2026-07-03T08:00:00Z",
  },
];

export const groups = [
  {
    id: "group-001",
    name: "Boracay Trip 🏖️",
    hostId: "user-001",
    memberIds: ["user-001", "user-002", "user-003", "user-004"],
    memberJoinedAt: {
      "user-001": "2026-07-01T12:00:00Z",
      "user-002": "2026-07-01T12:30:00Z",
      "user-003": "2026-07-01T13:00:00Z",
      "user-004": "2026-07-01T13:30:00Z",
    },
    createdAt: "2026-07-01T12:00:00Z",
    status: "active",
    zeroBalanceSince: null,
  },
  {
    id: "group-002",
    name: "BGC Condo 🏢",
    hostId: "user-001",
    memberIds: ["user-001", "user-002", "user-003"],
    memberJoinedAt: {
      "user-001": "2026-06-01T10:00:00Z",
      "user-002": "2026-06-01T10:05:00Z",
      "user-003": "2026-06-01T10:10:00Z",
    },
    createdAt: "2026-06-01T10:00:00Z",
    status: "active",
    zeroBalanceSince: null,
  },
  {
    id: "group-003",
    name: "Team Lunch 🍜",
    hostId: "user-002",
    memberIds: ["user-001", "user-002", "user-004"],
    memberJoinedAt: {
      "user-001": "2026-07-05T12:00:00Z",
      "user-002": "2026-07-05T12:00:00Z",
      "user-004": "2026-07-05T12:05:00Z",
    },
    createdAt: "2026-07-05T12:00:00Z",
    status: "active",
    zeroBalanceSince: "2026-07-08T12:00:00Z",
  },
];

export const expenses = [
  {
    id: "exp-001",
    groupId: "group-001",
    description: "@Mark and @Rina booked the villa for 3 nights",
    mentions: ["user-002", "user-003"],
    amount: 1800000, // ₱18,000.00 in centavos
    currency: "PHP",
    category: "other",
    paidBy: "user-001",
    splitType: "equal",
    splitDetails: { participantIds: ["user-001", "user-002", "user-003", "user-004"] },
    source: "manual_description",
    createdAt: "2026-07-06T10:00:00Z",
    syncStatus: "synced",
  },
  {
    id: "exp-002",
    groupId: "group-001",
    description: "Grocery run — snacks and drinks",
    mentions: [],
    amount: 350000, // ₱3,500.00
    currency: "PHP",
    category: "groceries",
    paidBy: "user-002",
    splitType: "equal",
    splitDetails: { participantIds: ["user-001", "user-002", "user-003", "user-004"] },
    source: "invoice_scan",
    createdAt: "2026-07-07T08:30:00Z",
    syncStatus: "synced",
  },
  {
    id: "exp-003",
    groupId: "group-001",
    description: "Island hopping tour",
    mentions: [],
    amount: 800000, // ₱8,000.00
    currency: "PHP",
    category: "other",
    paidBy: "user-003",
    splitType: "equal",
    splitDetails: { participantIds: ["user-001", "user-002", "user-003", "user-004"] },
    source: "manual_description",
    createdAt: "2026-07-08T09:00:00Z",
    syncStatus: "synced",
  },
  {
    id: "exp-004",
    groupId: "group-002",
    description: "July rent",
    mentions: [],
    amount: 4500000, // ₱45,000.00
    currency: "PHP",
    category: "rent",
    paidBy: "user-001",
    splitType: "equal",
    splitDetails: { participantIds: ["user-001", "user-002", "user-003"] },
    source: "manual_description",
    createdAt: "2026-07-01T09:00:00Z",
    syncStatus: "synced",
  },
  {
    id: "exp-005",
    groupId: "group-002",
    description: "Electricity bill — June",
    mentions: [],
    amount: 285000, // ₱2,850.00
    currency: "PHP",
    category: "utilities",
    paidBy: "user-002",
    splitType: "equal",
    splitDetails: { participantIds: ["user-001", "user-002", "user-003"] },
    source: "invoice_scan",
    createdAt: "2026-07-03T14:00:00Z",
    syncStatus: "synced",
  },
];

export const ledgers = {
  "group-001": {
    groupId: "group-001",
    balances: [
      { userId: "user-001", netBalance: 680000 },   // owed ₱6,800
      { userId: "user-002", netBalance: -212500 },  // owes ₱2,125
      { userId: "user-003", netBalance: 12500 },    // owed ₱125
      { userId: "user-004", netBalance: -480000 },  // owes ₱4,800
    ],
  },
  "group-002": {
    groupId: "group-002",
    balances: [
      { userId: "user-001", netBalance: 1404500 },  // owed ₱14,045
      { userId: "user-002", netBalance: -595000 },  // owes ₱5,950
      { userId: "user-003", netBalance: -809500 },  // owes ₱8,095
    ],
  },
  "group-003": {
    groupId: "group-003",
    balances: [
      { userId: "user-001", netBalance: 0 },
      { userId: "user-002", netBalance: 0 },
      { userId: "user-004", netBalance: 0 },
    ],
  },
};

export const settlements = [
  {
    id: "settle-001",
    groupId: "group-001",
    fromUserId: "user-004",
    method: "qrph",
    amount: 480000,
    status: "awaiting_confirmation",
    stellarTxHash: null,
    confirmations: [
      { toUserId: "user-001", confirmedAt: null },
    ],
    initiatedAt: "2026-07-09T10:00:00Z",
  },
];

export const nudges = [];

// Helpers
export const getUserById = (id) => users.find((u) => u.id === id);
export const getGroupById = (id) => groups.find((g) => g.id === id);
export const getExpensesByGroup = (groupId) => expenses.filter((e) => e.groupId === groupId);
export const getLedgerByGroup = (groupId) => ledgers[groupId];

export const formatPeso = (centavos) => {
  const amount = centavos / 100;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (userId) => {
  const colors = [
    "#7C5CFC", "#00D2A0", "#FF5C7A", "#FFB347",
    "#4FC3F7", "#CE93D8", "#80CBC4", "#FFAB91",
  ];
  const index = parseInt(userId.replace(/\D/g, ""), 10) % colors.length;
  return colors[index];
};
