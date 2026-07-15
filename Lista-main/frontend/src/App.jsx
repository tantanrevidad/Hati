import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import GroupDetail from "./pages/GroupDetail";
import AddExpense from "./pages/AddExpense";
import SettleUp from "./pages/SettleUp";
import CreateGroup from "./pages/CreateGroup";
import JoinGroup from "./pages/JoinGroup";
import Profile from "./pages/Profile";

function PrivateRoute({ children }) {
  const { state } = useApp();
  if (!state.isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const { state } = useApp();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Protected routes */}
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/groups" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/groups/new" element={<PrivateRoute><CreateGroup /></PrivateRoute>} />
      <Route path="/groups/:id" element={<PrivateRoute><GroupDetail /></PrivateRoute>} />
      <Route path="/groups/:id/expenses/new" element={<PrivateRoute><AddExpense /></PrivateRoute>} />
      <Route path="/groups/:id/settle" element={<PrivateRoute><SettleUp /></PrivateRoute>} />
      <Route path="/join/:slug" element={<PrivateRoute><JoinGroup /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
