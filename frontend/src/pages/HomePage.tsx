import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
  PlusIcon,
  ScanLineIcon,
  Home,
  Mountain,
  ShoppingCart,
  Zap,
  User,
  QrCode
} from 'lucide-react'
import { BrandMark } from '../components/BrandMark'
import { JoinSheet } from '../components/JoinSheet'
import { StatusPill } from '../components/StatusPill'
import { SeeAllGroupsSheet } from '../components/SeeAllGroupsSheet'
import { ViewAllActivitySheet } from '../components/ViewAllActivitySheet'
export type GroupSummary = {
  id: string
  name: string
  members: { initials: string; id: string }[]
  netBalance: number
  status: 'Offline — will sync' | 'Pending confirmation' | 'Confirmed'
  color: string
}
export type Activity = {
  id: string
  group: string
  title: string
  amount: number
  by: string
  time: string
  state: 'Offline — will sync' | 'Pending confirmation' | 'Confirmed'
  initials: string
}
type HomePageProps = {
  groups: GroupSummary[]
  activity: Activity[]
  loading: boolean
  onOpenGroup: (group: GroupSummary) => void
  onCreate: () => void
  onJoin: (reference: string) => void
  onOpenProfile: () => void
}
export function HomePage({
  groups,
  activity,
  loading,
  onOpenGroup,
  onCreate,
  onJoin,
  onOpenProfile,
}: HomePageProps) {
  const [joinOpen, setJoinOpen] = useState(false)
  const [groupsOpen, setGroupsOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  return (
    <main className="min-h-screen w-full bg-[#1A312C] pb-12 text-[#FFF4E1]">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#FFF4E1]/70">
              Welcome back
            </p>
            <h1 className="mt-1 text-[32px] font-extrabold tracking-[-0.055em] sm:text-4xl">
              Hey, Tedd <span className="inline-block origin-bottom-right rotate-[-10deg]">👋</span>
            </h1>
          </div>
          <button
            aria-label="Open profile"
            onClick={onOpenProfile}
            className="grid h-12 w-12 place-items-center rounded-full border border-[#89D7B7] bg-[#428475] text-[#89D7B7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
          >
            <User size={24} />
          </button>
        </header>

        <section className="mt-8 flex gap-3">
          <button
            onClick={onCreate}
            className="flex flex-1 items-center justify-center gap-2 rounded-[28px] bg-[#89D7B7] px-4 py-4 text-sm font-extrabold text-[#1A312C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7] shadow-[0_0_15px_rgba(137,215,183,0.3)]"
          >
            <PlusIcon size={18} />
            Create a Listahan
          </button>
          <button
            onClick={() => setJoinOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-[28px] border border-[#FFF4E1]/80 px-4 py-4 text-sm font-extrabold text-[#FFF4E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
          >
            <QrCode size={18} />
            Join a Listahan
          </button>
        </section>

        <section className="mt-10" aria-labelledby="listahan-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="listahan-heading"
              className="text-lg font-extrabold tracking-[-0.03em]"
            >
              Your Listahans
            </h2>
            <button
              onClick={() => setGroupsOpen(true)}
              className="text-sm font-bold text-[#89D7B7]"
            >
              See all
            </button>
          </div>
          {loading ? (
            <div className="flex h-44 items-center justify-center rounded-[28px] border border-[#428475] bg-[#24453d] text-sm text-[#FFF4E1]/70">
              Loading your shared lists…
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group, index) => {
                const isOwed = group.netBalance > 0
                const isNeutral = group.netBalance === 0
                const GroupIcon = index % 2 === 0 ? Home : Mountain
                return (
                  <motion.button
                    key={group.id}
                    onClick={() => onOpenGroup(group)}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.06,
                    }}
                    className="rounded-[20px] border border-[#89D7B7]/30 bg-[#477E6D] p-5 text-left flex flex-col justify-between h-36 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#386658]">
                        <GroupIcon size={20} className="text-[#89D7B7]" />
                      </div>
                      <h3 className="text-lg font-extrabold tracking-[-0.035em]">
                        {group.name}
                      </h3>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex -space-x-2">
                        {group.members.slice(0, 2).map((member, i) => (
                          <div
                            key={member.id}
                            className={`h-8 w-8 rounded-full border-2 border-[#477E6D] ${i === 0 ? 'bg-[#89D7B7] text-[#1A312C] z-20' : 'bg-[#FFF4E1] text-[#1A312C] z-10'} grid place-items-center text-[10px] font-bold`}
                          >
                            {member.initials}
                          </div>
                        ))}
                        {group.members.length > 2 && (
                          <div className="h-8 w-8 rounded-full border-2 border-[#477E6D] bg-[#1A312C] text-[#FFF4E1] grid place-items-center text-[10px] font-bold z-0">
                            +{group.members.length - 2}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#FFF4E1]/80">
                          {isNeutral ? 'All even' : isOwed ? 'You are owed' : 'You owe'}
                        </p>
                        <p
                          className={`text-2xl font-extrabold tracking-[-0.04em] ${isNeutral ? 'text-[#FFF4E1]' : isOwed ? 'text-[#89D7B7]' : 'text-[#FF5C5C]'}`}
                        >
                          {isNeutral ? '₱0' : `₱${Math.abs(group.netBalance).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </section>

        <section className="mt-10" aria-labelledby="activity-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="activity-heading"
              className="text-lg font-extrabold tracking-[-0.03em]"
            >
              Activity
            </h2>
            <button
              onClick={() => setActivityOpen(true)}
              className="text-sm font-bold text-[#89D7B7]"
            >
              View all
            </button>
          </div>
          <div className="flex flex-col gap-6">
            {activity.map((item, index) => {
              const ActivityIcon = index === 0 ? ShoppingCart : index === 1 ? Zap : Home
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[#428475]/30">
                    <ActivityIcon size={20} className="text-[#89D7B7]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#FFF4E1]">{item.title}</p>
                    <p className="mt-0.5 text-xs font-medium text-[#FFF4E1]/60">
                      {item.time}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusPill state={item.state} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
      <JoinSheet
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoin={(reference) => {
          onJoin(reference)
          setJoinOpen(false)
        }}
      />
      <SeeAllGroupsSheet
        open={groupsOpen}
        groups={groups}
        onClose={() => setGroupsOpen(false)}
        onOpenGroup={onOpenGroup}
      />
      <ViewAllActivitySheet
        open={activityOpen}
        activity={activity}
        onClose={() => setActivityOpen(false)}
      />
    </main>
  )
}
