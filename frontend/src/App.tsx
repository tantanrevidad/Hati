import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from './api'
import { AuthFlow } from './pages/AuthFlow'
import { GroupPage } from './pages/GroupPage'
import { HomePage, type GroupSummary } from './pages/HomePage'
import { ThemeToggle } from './components/ThemeToggle'
import { useScreenInit } from './useScreenInit.js'
import { formatActivityDate } from './utils/date'

type Screen = 'auth' | 'home' | 'group'
type Theme = 'dark' | 'light'

export function App() {
  const screenInit = useScreenInit()
  const initialScreen = screenInit.screen as Screen | undefined
  
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('lista-token')
  })
  
  const [screen, setScreen] = useState<Screen>(() => {
    if (initialScreen) return initialScreen
    if (typeof window !== 'undefined' && window.localStorage.getItem('lista-token')) {
      return 'home'
    }
    return 'auth'
  })

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    return window.localStorage.getItem('lista-theme') === 'light'
      ? 'light'
      : 'dark'
  })

  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [authStep, setAuthStep] = useState<'login' | 'profile' | 'payment'>(() => {
    return screenInit.authStep === 'profile' ? 'profile' : 'login'
  })

  const [activities, setActivities] = useState<import('./pages/HomePage').Activity[]>([])

  useEffect(() => {
    if (screen !== 'home' || !token) return
    
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const colors = ['#89D7B7', '#DCA953', '#B7C9C1', '#D9B36C']
    const getGroupColor = (id: string) => {
      let hash = 0
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash)
      }
      return colors[Math.abs(hash) % colors.length]
    }

    const loadDashboard = async () => {
      setLoading(true)
      try {
        const result = await api.getGroups()
        const mapped = result.map((g: any) => ({
          id: g.id,
          name: g.name,
          members: g.members.map((m: any) => ({
            id: m.id,
            initials: getInitials(m.displayName)
          })),
          netBalance: g.netBalance / 100, // convert centavos to pesos
          status: g.status === 'active' ? 'Confirmed' : 'Archived',
          color: getGroupColor(g.id)
        }))
        setGroups(mapped)

        // Resolve group for deep linking
        if (screenInit.groupId && !selectedGroup) {
          const matchedGroup = mapped.find((g: any) => g.id === screenInit.groupId)
          if (matchedGroup) {
            setSelectedGroup(matchedGroup)
            setScreen('group')
          }
        }

        // Fetch all activities
        const allActivities: any[] = []
        for (const g of result) {
          try {
            const acts = await api.getActivities(g.id)
            acts.forEach((act: any) => {
              allActivities.push({
                ...act,
                groupName: g.name,
              })
            })
          } catch (actErr) {
            console.error(`Error loading activities for group ${g.id}:`, actErr)
          }
        }

        allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        const mappedActivities = allActivities.map((act) => ({
          id: act.id,
          group: act.groupName,
          title: act.title,
          amount: act.amount,
          by: act.person,
          time: formatActivityDate(new Date(act.date)),
          state: act.state,
          initials: act.person.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        }))
        setActivities(mappedActivities)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [screen, token, screenInit.groupId, selectedGroup])

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
    try {
      const created = await api.createGroup('New house list')
      const colors = ['#89D7B7', '#DCA953', '#B7C9C1', '#D9B36C']
      const getGroupColor = (id: string) => {
        let hash = 0
        for (let i = 0; i < id.length; i++) {
          hash = id.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
      }
      const user = JSON.parse(localStorage.getItem('lista-user') || '{}')
      const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      
      const mapped: GroupSummary = {
        id: created.id,
        name: created.name,
        members: [{ id: user.id, initials: getInitials(user.displayName || 'You') }],
        netBalance: 0,
        status: 'Confirmed',
        color: getGroupColor(created.id)
      }

      setGroups((current) => [mapped, ...current])
      setSelectedGroup(mapped)
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
        initials: getInitials(user.displayName || 'You'),
      }
      setActivities((current) => [newActivity, ...current])
    } catch (err) {
      console.error('Failed to create group:', err)
    }
  }

  const joinListahan = async (reference: string) => {
    try {
      const joined = await api.joinGroup(reference)
      const colors = ['#89D7B7', '#DCA953', '#B7C9C1', '#D9B36C']
      const getGroupColor = (id: string) => {
        let hash = 0
        for (let i = 0; i < id.length; i++) {
          hash = id.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
      }
      const user = JSON.parse(localStorage.getItem('lista-user') || '{}')
      const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      
      const mapped: GroupSummary = {
        id: joined.id,
        name: joined.name,
        members: [{ id: user.id, initials: getInitials(user.displayName || 'You') }],
        netBalance: 0,
        status: 'Confirmed',
        color: getGroupColor(joined.id)
      }
      setGroups((current) => [mapped, ...current])
      
      const now = new Date()
      const newActivity: import('./pages/HomePage').Activity = {
        id: `act-join-${joined.id}`,
        group: joined.name,
        title: `You joined "${joined.name}"`,
        amount: 0,
        by: 'You',
        time: formatActivityDate(now),
        state: 'Confirmed',
        initials: getInitials(user.displayName || 'You'),
      }
      setActivities((current) => [newActivity, ...current])
      
      // Select the joined group and navigate to it
      setSelectedGroup(mapped)
      setScreen('group')
    } catch (err) {
      console.error('Failed to join group:', err)
    }
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
                setToken(localStorage.getItem('lista-token'))
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
                  const user = JSON.parse(localStorage.getItem('lista-user') || '{}')
                  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  const newActivity: import('./pages/HomePage').Activity = {
                    id: `act-exp-${Date.now()}`,
                    group: selectedGroup.name,
                    title: `You added ₱${expense.amount.toLocaleString()} for "${expense.description}"`,
                    amount: expense.amount,
                    by: user.displayName || 'You',
                    time: formatActivityDate(now),
                    state: 'Pending confirmation',
                    initials: getInitials(user.displayName || 'You'),
                  }
                  setActivities((current) => [newActivity, ...current])
                })
              }}
              onSettled={(amount, method) => {
                const now = new Date()
                const user = JSON.parse(localStorage.getItem('lista-user') || '{}')
                const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                const newActivity: import('./pages/HomePage').Activity = {
                  id: `act-settle-${Date.now()}`,
                  group: selectedGroup.name,
                  title: `You settled ₱${amount.toLocaleString()} via ${method}`,
                  amount,
                  by: user.displayName || 'You',
                  time: formatActivityDate(now),
                  state: 'Pending confirmation',
                  initials: getInitials(user.displayName || 'You'),
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
