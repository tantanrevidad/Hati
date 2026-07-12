import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PieChartIcon,
  PlusIcon,
  ReceiptTextIcon,
  WalletCardsIcon,
} from 'lucide-react'
import { ExpenseSheet } from '../components/ExpenseSheet'
import { SettleSheet } from '../components/SettleSheet'
import { StatusPill } from '../components/StatusPill'
import type { GroupSummary } from './HomePage'
import { api } from '../api'
import { formatActivityDate } from '../utils/date'

type GroupPageProps = {
  key?: string
  group: GroupSummary
  onBack: () => void
  onBalanceChanged: (newBalance: number) => void
  onExpenseAdded: (expense: {
    amount: number
    category: string
    description: string
    mentions: string[]
  }) => void
  onSettled: (amount: number, method: string) => void
}

type Split = {
  from: string
  to: string
  amount: number
}

type Entry = {
  id: string
  date: string
  title: string
  person: string
  amount: number
  state: 'Offline — will sync' | 'Pending confirmation' | 'Confirmed'
  type?: 'expense' | 'settlement'
  splits: Split[]
}

export function GroupPage({ group, onBack, onBalanceChanged, onExpenseAdded, onSettled }: GroupPageProps) {
  const [groupExpenses, setGroupExpenses] = useState<Entry[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [settleOpen, setSettleOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [youOwe, setYouOwe] = useState(0)
  const [youAreOwed, setYouAreOwed] = useState(0)
  const [netBalance, setNetBalance] = useState(0)
  const [creditors, setCreditors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem('lista-user') || '{}')

  const loadGroupDetails = async () => {
    setLoading(true)
    try {
      // 1. Fetch activities
      const acts = await api.getActivities(group.id)
      
      const formattedEntries: Entry[] = acts.map((act: any) => ({
        id: act.id,
        date: formatActivityDate(new Date(act.date)),
        title: act.title,
        person: act.person,
        amount: act.amount,
        state: act.state,
        type: act.type,
        splits: act.splits
      }))
      setGroupExpenses(formattedEntries)
      if (formattedEntries.length > 0 && !expanded) {
        setExpanded(formattedEntries[0].id)
      }

      // 2. Fetch ledger
      const ledger = await api.getLedger(group.id)
      let currentOwe = 0
      let currentOwed = 0
      const myCreditors: string[] = []

      ledger.debts.forEach((debt: any) => {
        if (debt.fromUserId === currentUser.id) {
          currentOwe += debt.amount / 100
          if (!myCreditors.includes(debt.toUserId)) {
            myCreditors.push(debt.toUserId)
          }
        } else if (debt.toUserId === currentUser.id) {
          currentOwed += debt.amount / 100
        }
      })

      setYouOwe(currentOwe)
      setYouAreOwed(currentOwed)
      setCreditors(myCreditors)
      
      const currentNet = currentOwed - currentOwe
      setNetBalance(currentNet)
      onBalanceChanged(currentNet)
    } catch (err) {
      console.error('Failed to load group details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroupDetails()
  }, [group.id])

  const dateGroups = groupExpenses.reduce<Record<string, Entry[]>>(
    (accumulator, entry) => {
      accumulator[entry.date] = [...(accumulator[entry.date] ?? []), entry]
      return accumulator
    },
    {},
  )

  const total = youAreOwed + youOwe
  const circumference = 2 * Math.PI * 39
  const greenStroke = total > 0 ? (youAreOwed / total) * circumference : 0
  const dashArray = `${greenStroke} ${circumference}`
  const backgroundStroke = total === 0 ? '#428475' : '#D9867B'

  return (
    <main className="min-h-screen w-full bg-[#1A312C] pb-28 text-[#FFF4E1]">
      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
        <header className="grid grid-cols-[40px_1fr_40px] items-center">
          <button
            onClick={onBack}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#428475] text-[#FFF4E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
            aria-label="Back to dashboard"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#89D7B7]">
              Listahan
            </p>
            <h1 className="mt-0.5 text-xl font-extrabold tracking-[-0.04em]">
              {group.name}
            </h1>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-[#428475] text-[#FFF4E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
            aria-label="Group details"
          >
            •••
          </button>
        </header>

        {notice && (
          <motion.div
            initial={{
              opacity: 0,
              y: -5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-5 rounded-2xl border border-[#89D7B7] bg-[#24453d] px-4 py-3 text-sm font-semibold"
          >
            {notice}
          </motion.div>
        )}

        {loading && groupExpenses.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-[#FFF4E1]/60">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#89D7B7] border-t-transparent" />
            <p className="mt-4 text-sm font-semibold">Loading ledger...</p>
          </div>
        ) : (
          <>
            <section
              className="mt-8 grid grid-cols-2 gap-3"
              aria-label="Your balances"
            >
              <div className="rounded-[24px] border border-[#428475] bg-[#24453d] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#FFF4E1]/55">
                  You are owed
                </p>
                <p className="mt-3 text-2xl font-extrabold tracking-[-0.05em] text-[#89D7B7]">
                  ₱{youAreOwed.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#FFF4E1]/60">
                  {youAreOwed > 0 ? 'from roommates' : 'no active balances'}
                </p>
              </div>
              <div className="rounded-[24px] border border-[#428475] bg-[#24453d] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#FFF4E1]/55">
                  You owe
                </p>
                <p className="mt-3 text-2xl font-extrabold tracking-[-0.05em] text-[#D9867B]">
                  ₱{youOwe.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#FFF4E1]/60">
                  {youOwe > 0 ? 'across bills' : 'no active debts'}
                </p>
              </div>
            </section>

            <section
              className="mt-5 rounded-[28px] border border-[#428475] bg-[#24453d] p-5"
              aria-labelledby="balance-total"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#FFF4E1]/65">
                    Total balance
                  </p>
                  <h2
                    id="balance-total"
                    className="mt-1 text-3xl font-extrabold tracking-[-0.055em]"
                  >
                    {netBalance > 0 ? (
                      <>
                        ₱{netBalance.toLocaleString()}{' '}
                        <span className="text-base text-[#89D7B7]">in your favor</span>
                      </>
                    ) : netBalance < 0 ? (
                      <>
                        ₱{Math.abs(netBalance).toLocaleString()}{' '}
                        <span className="text-base text-[#D9867B]">you owe</span>
                      </>
                    ) : (
                      <>
                        ₱0{' '}
                        <span className="text-base text-[#FFF4E1]/60">all even</span>
                      </>
                    )}
                  </h2>
                </div>
                <PieChartIcon className="text-[#89D7B7]" size={25} />
              </div>
              <div className="mt-6 flex items-center gap-6">
                <div
                  className="relative h-28 w-28 shrink-0"
                  role="img"
                  aria-label={`Balance pie chart: ${
                    total > 0 ? Math.round((youAreOwed / total) * 100) : 0
                  } percent owed to you, ${
                    total > 0 ? Math.round((youOwe / total) * 100) : 0
                  } percent you owe`}
                >
                  <svg viewBox="0 0 100 100" className="-rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="39"
                      fill="none"
                      stroke={backgroundStroke}
                      strokeWidth="18"
                    />
                    {total > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="39"
                        fill="none"
                        stroke="#89D7B7"
                        strokeWidth="18"
                        strokeDasharray={dashArray}
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center text-[11px] font-bold leading-4">
                    Net
                    <br />
                    balance
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#89D7B7]" />
                    Owed to you <strong className="ml-auto">₱{youAreOwed.toLocaleString()}</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D9867B]" />
                    You owe <strong className="ml-auto">₱{youOwe.toLocaleString()}</strong>
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-8" aria-labelledby="timeline-title">
              <h2
                id="timeline-title"
                className="mb-4 text-lg font-extrabold tracking-[-0.03em]"
              >
                Activity
              </h2>
              {groupExpenses.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[#428475] p-10 text-center text-[#FFF4E1]/50">
                  <p className="font-semibold">No expenses posted yet</p>
                  <p className="mt-1 text-xs">Click "Pa Lista" to log the first expense.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(dateGroups).map(([date, groupedEntries]) => (
                    <div key={date}>
                      <div className="mb-2 flex items-center gap-3">
                        <span className="rounded-full bg-[#428475] px-3 py-1 text-xs font-bold">
                          {date}
                        </span>
                        <span className="h-px flex-1 bg-[#428475]" />
                      </div>
                      <div className="overflow-hidden rounded-[24px] border border-[#428475] bg-[#24453d]">
                        {(groupedEntries as Entry[]).map((entry) => (
                          <div
                            key={entry.id}
                            className="border-b border-[#428475] last:border-b-0"
                          >
                            <button
                              onClick={() =>
                                setExpanded((current) =>
                                  current === entry.id ? null : entry.id,
                                )
                              }
                              className="flex w-full items-center gap-3 px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#89D7B7]"
                            >
                              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#428475]">
                                <ReceiptTextIcon size={19} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold">
                                  {entry.title}
                                </span>
                                <span className="mt-0.5 block text-xs text-[#FFF4E1]/60">
                                  Paid by {entry.person} · ₱
                                  {entry.amount.toLocaleString()}
                                </span>
                              </span>
                              {expanded === entry.id ? (
                                <ChevronUpIcon size={18} />
                              ) : (
                                <ChevronDownIcon size={18} />
                              )}
                            </button>
                            {expanded === entry.id && (
                              <div className="px-4 pb-4">
                                <div className="rounded-2xl bg-[#1A312C] p-3">
                                  <div className="mb-3">
                                    <StatusPill state={entry.state} />
                                  </div>
                                  {entry.splits && entry.splits.length > 0 ? (
                                    entry.splits.map((split, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between py-2 text-sm"
                                      >
                                        <span className="font-bold">
                                          {split.from}{' '}
                                          <span className="mx-1 text-[#89D7B7]">→</span>{' '}
                                          {split.to}
                                        </span>
                                        <span>₱{split.amount.toLocaleString()}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-[#FFF4E1]/50">No splits recorded</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#428475] bg-[#1A312C]/95 px-5 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl gap-3">
          <button
            disabled={youOwe === 0 || loading}
            onClick={() => setSettleOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#89D7B7] px-4 py-4 text-sm font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <WalletCardsIcon size={18} />
            Settle
          </button>
          <button
            disabled={loading}
            onClick={() => setExpenseOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#89D7B7] px-4 py-4 text-sm font-extrabold text-[#1A312C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
          >
            <PlusIcon size={18} />
            Pa Lista
          </button>
        </div>
      </div>

      <ExpenseSheet
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        onSave={async (expense) => {
          setExpenseOpen(false)
          setNotice('Adding expense...')
          try {
            await api.createExpense(group.id, expense)
            onExpenseAdded(expense)
            await loadGroupDetails()
            setNotice(`₱${expense.amount.toLocaleString()} added successfully!`)
          } catch (err: any) {
            setNotice(`Failed to add expense: ${err.message}`)
          }
        }}
      />

      <SettleSheet
        open={settleOpen}
        amount={youOwe}
        groupName={group.name}
        onClose={() => setSettleOpen(false)}
        onComplete={async (method) => {
          setNotice(`Initiating ${method} settlement...`)
          try {
            await api.settleDebt(group.id, youOwe, method, creditors)
            onSettled(youOwe, method)
            await loadGroupDetails()
            setNotice(`${method} settlement completed successfully!`)
            setSettleOpen(false)
          } catch (err: any) {
            setNotice(`Settlement failed: ${err.message}`)
            throw err
          }
        }}
      />
    </main>
  )
}
