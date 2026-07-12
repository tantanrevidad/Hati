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
function getInitialEntries(groupId: string): Entry[] {
  if (groupId === 'bahay-604' || groupId === 'dorm-404') {
    return [
      {
        id: 'e1',
        date: 'Today',
        title: 'Electricity · July',
        person: 'Mika Santos',
        amount: 1680,
        state: 'Pending confirmation',
        type: 'expense',
        splits: [
          { from: 'AR', to: 'MS', amount: 560 },
          { from: 'JC', to: 'MS', amount: 560 },
        ],
      },
      {
        id: 'e2',
        date: 'Jul 06',
        title: 'Fiber internet',
        person: 'Jules Cruz',
        amount: 1200,
        state: 'Offline — will sync',
        type: 'expense',
        splits: [
          { from: 'MS', to: 'JC', amount: 600 },
        ],
      },
      {
        id: 'e3',
        date: 'Jul 02',
        title: 'Kitchen restock',
        person: 'You',
        amount: 1860,
        state: 'Confirmed',
        type: 'expense',
        splits: [
          { from: 'MS', to: 'AR', amount: 620 },
          { from: 'JC', to: 'AR', amount: 620 },
        ],
      },
    ]
  }
  if (groupId === 'baguio-trip') {
    return [
      {
        id: 'e1',
        date: 'Jul 10',
        title: 'Gasoline',
        person: 'EF',
        amount: 750,
        state: 'Confirmed',
        type: 'expense',
        splits: [
          { from: 'AR', to: 'EF', amount: 250 },
          { from: 'TD', to: 'EF', amount: 250 },
        ],
      },
    ]
  }
  return []
}
export function GroupPage({ group, onBack, onBalanceChanged, onExpenseAdded, onSettled }: GroupPageProps) {
  const [groupExpenses, setGroupExpenses] = useState<Entry[]>(() =>
    getInitialEntries(group.id),
  )
  const [expanded, setExpanded] = useState<string | null>('e1')
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [settleOpen, setSettleOpen] = useState(false)
  const [notice, setNotice] = useState('')
  
  // Calculate dynamic balances
  let youOwe = 0
  let youAreOwed = 0
  groupExpenses.forEach((entry) => {
    entry.splits.forEach((split) => {
      if (entry.type === 'settlement') {
        if (split.from === 'AR') {
          youOwe -= split.amount
        } else if (split.to === 'AR') {
          youAreOwed -= split.amount
        }
      } else {
        if (split.from === 'AR') {
          youOwe += split.amount
        } else if (split.to === 'AR') {
          youAreOwed += split.amount
        }
      }
    })
  })
  youOwe = Math.max(0, youOwe)
  youAreOwed = Math.max(0, youAreOwed)
  const netBalance = youAreOwed - youOwe
  useEffect(() => {
    onBalanceChanged(netBalance)
  }, [netBalance, onBalanceChanged])
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
                            {entry.splits.map((split) => (
                              <div
                                key={`${split.from}-${split.to}`}
                                className="flex items-center justify-between py-2 text-sm"
                              >
                                <span className="font-bold">
                                  {split.from}{' '}
                                  <span className="mx-1 text-[#89D7B7]">→</span>{' '}
                                  {split.to}
                                </span>
                                <span>₱{split.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#428475] bg-[#1A312C]/95 px-5 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl gap-3">
          <button
            disabled={youOwe === 0}
            onClick={() => setSettleOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#89D7B7] px-4 py-4 text-sm font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <WalletCardsIcon size={18} />
            Settle
          </button>
          <button
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
        onSave={(expense) => {
          onExpenseAdded(expense)
          setExpenseOpen(false)
          let participants = group.members.map((m) => m.initials)
          if (expense.mentions.length > 0 && !expense.mentions.includes('@All')) {
            const mentionedInitials = expense.mentions.map((m) => {
              const namePart = m.replace('@', '').toLowerCase()
              const match = group.members.find(
                (member) =>
                  member.initials.toLowerCase() === namePart ||
                  member.id.toLowerCase() === namePart,
              )
              return match ? match.initials : namePart.toUpperCase()
            })
            participants = [
              'AR',
              ...mentionedInitials.filter((init) => init !== 'AR'),
            ]
          }
          const splitAmount = Math.round(expense.amount / participants.length)
          const splits: Split[] = participants
            .filter((p) => p !== 'AR')
            .map((p) => ({
              from: p,
              to: 'AR',
              amount: splitAmount,
            }))
          const newEntry: Entry = {
            id: `expense-${Date.now()}`,
            date: 'Today',
            title: expense.description,
            person: 'You',
            amount: expense.amount,
            state: 'Pending confirmation',
            type: 'expense',
            splits,
          }
          setGroupExpenses((prev) => [newEntry, ...prev])
          setNotice(
            `₱${expense.amount.toLocaleString()} added — pending confirmation`,
          )
        }}
      />
      <SettleSheet
        open={settleOpen}
        amount={youOwe}
        groupName={group.name}
        onClose={() => setSettleOpen(false)}
        onComplete={(method) => {
          setSettleOpen(false)
          const settlementEntry: Entry = {
            id: `settle-${Date.now()}`,
            date: 'Today',
            title: `Settled via ${method}`,
            person: 'You',
            amount: youOwe,
            state: 'Pending confirmation',
            type: 'settlement',
            splits: [
              { from: 'AR', to: 'Group', amount: youOwe }
            ]
          }
          setGroupExpenses((prev) => [settlementEntry, ...prev])
          setNotice(`${method} settlement recorded — pending confirmation`)
          onSettled(youOwe, method)
        }}
      />
    </main>
  )
}
