import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, ShoppingCart, Zap, Search, XIcon } from 'lucide-react'
import { StatusPill } from './StatusPill'
import type { Activity } from '../pages/HomePage'

type ViewAllActivitySheetProps = {
  open: boolean
  activity: Activity[]
  onClose: () => void
}

export function ViewAllActivitySheet({
  open,
  activity,
  onClose,
}: ViewAllActivitySheetProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredActivity = activity.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.by.toLowerCase().includes(searchQuery.toLowerCase())
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
            aria-labelledby="activity-sheet-title"
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
                  Timeline
                </p>
                <h2
                  id="activity-sheet-title"
                  className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#FFF4E1]"
                >
                  Full Activity Feed
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
                placeholder="Search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#FFF4E1] placeholder:text-[#FFF4E1]/45 focus:outline-none"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6">
              {filteredActivity.length === 0 ? (
                <div className="text-center py-10 text-sm text-[#FFF4E1]/60">
                  No activity items found matching "{searchQuery}"
                </div>
              ) : (
                filteredActivity.map((item, index) => {
                  const ActivityIcon =
                    index % 3 === 0
                      ? ShoppingCart
                      : index % 3 === 1
                      ? Zap
                      : Home

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border-b border-[#428475]/10 pb-4 last:border-0"
                    >
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[#428475]/30">
                        <ActivityIcon size={20} className="text-[#89D7B7]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#FFF4E1] break-words">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#89D7B7] uppercase tracking-wider">
                          {item.group}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-[#FFF4E1]/60">
                          {item.time}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <StatusPill state={item.state} />
                      </div>
                    </div>
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
