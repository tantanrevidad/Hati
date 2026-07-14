/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import PaymentMethodScreen from './components/PaymentMethodScreen';
import GroupSetupScreen from './components/GroupSetupScreen';
import GroupQRScreen from './components/GroupQRScreen';
import DashboardScreen from './components/DashboardScreen';
import { ExpenseItem } from './types';

type ScreenState = 'login' | 'profile' | 'payment_setup' | 'group_setup' | 'add_group' | 'group_qr' | 'dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('login');
  const [returnToMenu, setReturnToMenu] = useState(false);
  React.useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedColor = localStorage.getItem('userColor');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    if (savedName) setUserName(savedName);
    if (savedColor) setUserColor(savedColor);
  }, []);
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('');
  const [groupName, setGroupName] = useState('My Group');
  const [groups, setGroups] = useState<{ id: string; name: string; members: number; color?: string }[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  return (
    <>
      {currentScreen === 'login' && <LoginScreen onLogin={() => setCurrentScreen('profile')} />}
      {currentScreen === 'profile' && <ProfileScreen onNext={(name, color) => {
          setUserName(name); localStorage.setItem('userName', name);
          setUserColor(color); localStorage.setItem('userColor', color);
          setReturnToMenu(false);
          setCurrentScreen('payment_setup');
      }} />}
      {currentScreen === 'payment_setup' && <PaymentMethodScreen onNext={() => { setCurrentScreen('dashboard'); }} />}
      {currentScreen === 'group_setup' && <GroupSetupScreen onNext={(name) => { 
        if (name === 'Joined Group') {
          setGroupName(name);
          setReturnToMenu(false);
          setCurrentScreen('dashboard');
        } else {
          setGroupName(name); 
          setGroups([...groups, { id: Date.now().toString(), name, members: 1 }]);
          setCurrentScreen('group_qr'); 
        }
      }} />}
      {currentScreen === 'add_group' && <GroupSetupScreen onBack={() => { setReturnToMenu(false); setCurrentScreen('dashboard'); }} onNext={(name) => { 
        if (name === 'Joined Group') {
          setGroupName(name);
          setReturnToMenu(false);
          setCurrentScreen('dashboard');
        } else {
          setGroupName(name); 
          setGroups([...groups, { id: Date.now().toString(), name, members: 1 }]);
          setCurrentScreen('group_qr'); 
        }
      }} />}
      {currentScreen === 'group_qr' && <GroupQRScreen groupName={groupName} onNext={() => { setReturnToMenu(false); setCurrentScreen('dashboard'); }} />}
      {currentScreen === 'dashboard' && <DashboardScreen expenses={expenses} setExpenses={setExpenses} groups={groups} initialMenuOpen={returnToMenu} userName={userName} userColor={userColor} onCreateGroup={() => { setReturnToMenu(false); setCurrentScreen('add_group'); }} onAddBillingMethod={() => { setReturnToMenu(true); setCurrentScreen('payment_setup'); }} onLogout={() => { localStorage.removeItem('userEmail'); setCurrentScreen('login'); }} />}
    </>
  );
}
