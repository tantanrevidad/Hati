import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api, mockActivities, mockGroups } from './api'
import { AuthFlow } from './pages/AuthFlow'
import { GroupPage } from './pages/GroupPage'
import { HomePage, type GroupSummary } from './pages/HomePage'
import { ThemeToggle } from './components/ThemeToggle'
import { useScreenInit } from './useScreenInit.js'
import { formatActivityDate, getMockDate } from './utils/date'
type Screen = 'auth' | 'home' | 'group'
type Theme = 'dark' | 'light'
export function App() {
  const screenInit = useScreenInit()
  const initialScreen = screenInit.screen as Screen | undefined
  const [screen, setScreen] = useState<Screen>(initialScreen ?? 'auth')
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    return window.localStorage.getItem('lista-theme') === 'light'
      ? 'light'
      : 'dark'
  })
  const [groups, setGroups] = useState<GroupSummary[]>(
    initialScreen === 'group' ? mockGroups : [],
  )
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(
    () => {
      if (!screenInit.groupId) return null
      return mockGroups.find((group) => group.id === screenInit.groupId) ?? null
    },
  )
  const [loading, setLoading] = useState(false)
  const [authStep, setAuthStep] = useState<'login' | 'profile' | 'payment'>(() => {
    return screenInit.authStep === 'profile' ? 'profile' : 'login'
  })
  const [activities, setActivities] = useState<import('./pages/HomePage').Activity[]>(() =>
    mockActivities.map((act) => ({
      ...act,
      time: formatActivityDate(getMockDate(act.time)),
    }))
  )
  useEffect(() => {
    if (screen !== 'home' || groups.length) return
    setLoading(true)
    api
      .getGroups()
      .then((result) => setGroups(result))
      .finally(() => setLoading(false))
  }, [groups.length, screen])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('lista-theme', theme)
  }, [theme])
  const openHome = () => setScreen('home')
  const updateGroupBalance = (groupId: string, newBalance: number) => {
    setGroups((current) =>
      current.map((g) => (g.id === groupId ? { ...g, netBalance: newBalance } : g)),
    )
    setSelectedGroup((current) =>
      current && current.id === groupId
        ? { ...current, netBalance: newBalance }
        : current,
    )
  }
  const createListahan = async () => {
    const created = await api.createGroup('New house list')
    setGroups((current) => [created, ...current])
    setSelectedGroup(created)
    setScreen('group')

    const now = new Date()
    const newActivity: import('./pages/HomePage').Activity = {
      id: `act-group-${created.id}`,
      group: created.name,
      title: `You created a new Listahan: "${created.name}"`,
      amount: 0,
      by: 'You',
      time: formatActivityDate(now),
      state: 'Confirmed',
      initials: 'Y',
    }
    setActivities((current) => [newActivity, ...current])
  }
  const joinListahan = async (reference: string) => {
    const joined = await api.joinGroup(reference)
    setGroups((current) => [joined, ...current])

    const now = new Date()
    const newActivity: import('./pages/HomePage').Activity = {
      id: `act-join-${joined.id}`,
      group: joined.name,
      title: `You joined "${joined.name}"`,
      amount: 0,
      by: 'You',
      time: formatActivityDate(now),
      state: 'Confirmed',
      initials: 'Y',
    }
    setActivities((current) => [newActivity, ...current])
  }
  return (
    <>
      <ThemeToggle
        theme={theme}
        onToggle={() =>
          setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
        }
      />
      <AnimatePresence mode="wait">
        {screen === 'auth' && (
          <motion.div
            key="auth"
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.18,
            }}
          >
            <AuthFlow
              initialStep={authStep}
              onComplete={() => {
                setAuthStep('login')
                openHome()
              }}
            />
          </motion.div>
        )}
        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <HomePage
              groups={groups}
              activity={activities}
              loading={loading}
              onOpenGroup={(group) => {
                setSelectedGroup(group)
                setScreen('group')
              }}
              onCreate={createListahan}
              onJoin={joinListahan}
              onOpenProfile={() => {
                setAuthStep('profile')
                setScreen('auth')
              }}
            />
          </motion.div>
        )}
        {screen === 'group' && selectedGroup && (
          <motion.div
            key="group"
            initial={{
              opacity: 0,
              x: 14,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: 14,
            }}
          >
            <GroupPage
              key={selectedGroup.id}
              group={selectedGroup}
              onBack={openHome}
              onBalanceChanged={(newBalance) => {
                updateGroupBalance(selectedGroup.id, newBalance)
              }}
              onExpenseAdded={(expense) => {
                api.createExpense(selectedGroup.id, expense).then(() => {
                  const now = new Date()
                  const newActivity: import('./pages/HomePage').Activity = {
                    id: `act-exp-${Date.now()}`,
                    group: selectedGroup.name,
                    title: `You added ₱${expense.amount.toLocaleString()} for "${expense.description}"`,
                    amount: expense.amount,
                    by: 'You',
                    time: formatActivityDate(now),
                    state: 'Pending confirmation',
                    initials: 'Y',
                  }
                  setActivities((current) => [newActivity, ...current])
                })
              }}
              onSettled={(amount, method) => {
                const now = new Date()
                const newActivity: import('./pages/HomePage').Activity = {
                  id: `act-settle-${Date.now()}`,
                  group: selectedGroup.name,
                  title: `You settled ₱${amount.toLocaleString()} via ${method}`,
                  amount,
                  by: 'You',
                  time: formatActivityDate(now),
                  state: 'Pending confirmation',
                  initials: 'Y',
                }
                setActivities((current) => [newActivity, ...current])
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
