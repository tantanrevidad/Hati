import React, { createContext, useContext, useReducer } from "react";
import {
  currentUser as initialUser,
  groups as initialGroups,
  expenses as initialExpenses,
  settlements as initialSettlements,
  nudges as initialNudges,
  ledgers,
  getUserById,
} from "../data/mockData";

const AppContext = createContext(null);

const initialState = {
  user: initialUser,
  isAuthenticated: false,
  onboardingComplete: false,
  groups: initialGroups,
  expenses: initialExpenses,
  settlements: initialSettlements,
  nudges: initialNudges,
  ledgers,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, isAuthenticated: true, user: action.payload };
    case "LOGOUT":
      return { ...state, isAuthenticated: false };
    case "COMPLETE_ONBOARDING":
      return { ...state, onboardingComplete: true, user: { ...state.user, ...action.payload } };
    case "ADD_GROUP":
      return { ...state, groups: [...state.groups, action.payload] };
    case "ADD_EXPENSE": {
      const newExpenses = [...state.expenses, action.payload];
      // Recalculate ledger (simplified equal split)
      const groupExpenses = newExpenses.filter((e) => e.groupId === action.payload.groupId);
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (!group) return { ...state, expenses: newExpenses };
      const balances = {};
      group.memberIds.forEach((id) => (balances[id] = 0));
      groupExpenses.forEach((exp) => {
        const participants = exp.splitDetails?.participantIds || group.memberIds;
        const share = Math.floor(exp.amount / participants.length);
        balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
        participants.forEach((pid) => {
          balances[pid] = (balances[pid] || 0) - share;
        });
      });
      const newLedger = {
        ...state.ledgers,
        [action.payload.groupId]: {
          groupId: action.payload.groupId,
          balances: Object.entries(balances).map(([userId, netBalance]) => ({ userId, netBalance })),
        },
      };
      return { ...state, expenses: newExpenses, ledgers: newLedger };
    }
    case "INITIATE_SETTLEMENT":
      return { ...state, settlements: [...state.settlements, action.payload] };
    case "CONFIRM_SETTLEMENT": {
      const updated = state.settlements.map((s) => {
        if (s.id !== action.payload.settlementId) return s;
        const confirmations = s.confirmations.map((c) =>
          c.toUserId === action.payload.toUserId ? { ...c, confirmedAt: new Date().toISOString() } : c
        );
        const allConfirmed = confirmations.every((c) => c.confirmedAt !== null);
        return { ...s, confirmations, status: allConfirmed ? "confirmed" : "awaiting_confirmation" };
      });
      return { ...state, settlements: updated };
    }
    case "SEND_NUDGE":
      return { ...state, nudges: [...state.nudges, action.payload] };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch, getUserById }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
