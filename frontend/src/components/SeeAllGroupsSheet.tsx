import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, Mountain, Search, XIcon } from 'lucide-react'
import type { GroupSummary } from '../pages/HomePage'

type SeeAllGroupsSheetProps = {
  open: boolean
  groups: GroupSummary[]
  onClose: () => void
  onOpenGroup: (group: GroupSummary) => void
}

export function SeeAllGroupsSheet({
  open,
  groups,
  onClose,
  onOpenGroup,
}: SeeAllGroupsSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 bg-[#10201c]/75 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            className="absolute inset-x-0 bottom-0 mx-auto max-w-xl rounded-t-[32px] border-x border-t border-[#428475] bg-[#1A312C] p-5 pb-8 flex flex-col max-h-[85vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="groups-sheet-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 320,
            }}
          >
            <div className="mx-auto mb-5 h-1.5 w-10 shrink-0 rounded-full bg-[#428475]" />
            <div className="mb-6 flex items-start justify-between shrink-0">
              <div>
                <p className="text-sm font-semibold text-[#89D7B7]">
                  Manage tabs
                </p>
                <h2
                  id="groups-sheet-title"
                  className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#FFF4E1]"
                >
                  All Your Listahans
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[#FFF4E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                aria-label="Close sheet"
              >
                <XIcon size={22} />
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#24453d] px-4 py-3 shrink-0 focus-within:ring-2 focus-within:ring-[#89D7B7]">
              <Search size={18} className="text-[#FFF4E1]/50" />
              <input
                type="text"
                placeholder="Search listahans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#FFF4E1] placeholder:text-[#FFF4E1]/45 focus:outline-none"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-10 text-sm text-[#FFF4E1]/60">
                  No listahans found matching "{searchQuery}"
                </div>
              ) : (
                filteredGroups.map((group, index) => {
                  const isOwed = group.netBalance > 0
                  const isNeutral = group.netBalance === 0
                  const GroupIcon = index % 2 === 0 ? Home : Mountain

                  return (
                    <button
                      key={group.id}
                      onClick={() => {
                        onOpenGroup(group)
                        onClose()
                      }}
                      className="w-full text-left rounded-[20px] border border-[#89D7B7]/20 bg-[#24453d] p-4 flex items-center justify-between transition hover:bg-[#345b51] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#386658]">
                          <GroupIcon size={20} className="text-[#89D7B7]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold tracking-[-0.03em] text-[#FFF4E1]">
                            {group.name}
                          </h3>
                          <p className="text-xs text-[#FFF4E1]/60 mt-0.5">
                            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#FFF4E1]/75">
                          {isNeutral ? 'All even' : isOwed ? 'Owed' : 'Owe'}
                        </p>
                        <p
                          className={`text-base font-extrabold tracking-[-0.03em] ${isNeutral ? 'text-[#FFF4E1]' : isOwed ? 'text-[#89D7B7]' : 'text-[#FF5C5C]'}`}
                        >
                          {isNeutral ? '₱0' : `₱${Math.abs(group.netBalance).toLocaleString()}`}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
