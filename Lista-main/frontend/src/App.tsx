/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import PaymentMethodScreen from './components/PaymentMethodScreen';
import GroupSetupScreen from './components/GroupSetupScreen';
import GroupQRScreen from './components/GroupQRScreen';
import DashboardScreen from './components/DashboardScreen';
import { api } from './services/api';
import { ExpenseItem } from './types';

type ScreenState = 'login' | 'profile' | 'payment_setup' | 'group_setup' | 'add_group' | 'group_qr' | 'dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('login');
  const [returnToMenu, setReturnToMenu] = useState(false);
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('');
  const [userEmail, setUserEmail] = useState(''); // Store email temporarily during onboarding
  const [groupName, setGroupName] = useState('My Group');
  const [groups, setGroups] = useState<{ id: string; name: string; members: number; color?: string }[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  // Check login session on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }

    const token = localStorage.getItem('lista-token');
    const userStr = localStorage.getItem('lista-user');
    const savedColor = localStorage.getItem('userColor');
    
    // Clear invalid/stale tokens
    if (token && (!token.startsWith('ey') || token === 'offline-fallback')) {
      localStorage.removeItem('lista-token');
      localStorage.removeItem('lista-user');
      return;
    }
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.displayName);
      setUserEmail(user.email || user.phone || '');
      if (savedColor) setUserColor(savedColor);
      setCurrentScreen('dashboard');
      
      // Load actual groups from backend
      loadGroups();
    }
  }, []);

  const loadGroups = async () => {
    try {
      const backendGroups = await api.getGroups();
      setGroups(backendGroups.map((g: any) => ({
        id: g.id,
        name: g.name,
        members: g.memberIds?.length || 1,
        color: 'bg-leaf-green' // default color
      })));
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  const handleLoginSubmitted = (emailValue: string) => {
    setUserEmail(emailValue);
    setCurrentScreen('profile');
  };

  const handleDirectLogin = (user: any) => {
    setUserName(user.displayName);
    const savedColor = localStorage.getItem('userColor') || 'bg-[#236450]';
    setUserColor(savedColor);
    setReturnToMenu(false);
    loadGroups();
    setCurrentScreen('dashboard');
  };

  const handleProfileCreated = async (name: string, color: string) => {
    try {
      // Call backend `/auth/login` to register/login lazily
      const res = await api.login('email', userEmail, name);
      setUserName(res.user.displayName);
      setUserColor(color);
      localStorage.setItem('userColor', color);
      setReturnToMenu(false);
      setCurrentScreen('payment_setup');
    } catch (err: any) {
      console.error('Backend auth failed:', err.message);
      alert('Authentication failed: ' + (err.message || 'Could not reach the server. Make sure the backend is running on port 3001.'));
    }
  };

  const handlePaymentSetupFinished = () => {
    loadGroups();
    setCurrentScreen('dashboard');
  };

  const handleCreateOrJoinGroup = async (nameOrSlug: string) => {
    if (nameOrSlug.startsWith('join:')) {
      const slug = nameOrSlug.split(':')[1];
      try {
        const res = await api.joinGroup(slug);
        setGroupName(res.group.name);
        await loadGroups();
        setReturnToMenu(false);
        setCurrentScreen('dashboard');
      } catch (err: any) {
        alert(err.message || 'Failed to join group.');
      }
    } else {
      try {
        const newGroup = await api.createGroup(nameOrSlug);
        setGroupName(newGroup.name);
        // Load the updated group list
        await loadGroups();
        setCurrentScreen('group_qr');
      } catch (err: any) {
        alert(err.message || 'Failed to create group.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lista-token');
    localStorage.removeItem('lista-user');
    localStorage.removeItem('userEmail');
    setUserName('');
    setUserEmail('');
    setGroups([]);
    setExpenses([]);
    setCurrentScreen('login');
  };

  return (
    <>
      {currentScreen === 'login' && <LoginScreen onLogin={handleDirectLogin} onNext={handleLoginSubmitted} />}
      {currentScreen === 'profile' && <ProfileScreen onNext={handleProfileCreated} />}
      {currentScreen === 'payment_setup' && <PaymentMethodScreen onNext={handlePaymentSetupFinished} />}
      {currentScreen === 'group_setup' && <GroupSetupScreen onNext={handleCreateOrJoinGroup} />}
      {currentScreen === 'add_group' && <GroupSetupScreen onBack={() => { setReturnToMenu(false); setCurrentScreen('dashboard'); }} onNext={handleCreateOrJoinGroup} />}
      {currentScreen === 'group_qr' && <GroupQRScreen groupName={groupName} onNext={() => { setReturnToMenu(false); setCurrentScreen('dashboard'); }} />}
      {currentScreen === 'dashboard' && (
        <DashboardScreen 
          expenses={expenses} 
          setExpenses={setExpenses} 
          groups={groups} 
          initialMenuOpen={returnToMenu} 
          userName={userName} 
          userColor={userColor} 
          onCreateGroup={() => { setReturnToMenu(false); setCurrentScreen('add_group'); }} 
          onAddBillingMethod={() => { setReturnToMenu(true); setCurrentScreen('payment_setup'); }} 
          onLogout={handleLogout} 
        />
      )}
    </>
  );
}
