import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CameraIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  XIcon,
} from 'lucide-react'
type ExpenseSheetProps = {
  open: boolean
  onClose: () => void
  onSave: (expense: {
    amount: number
    category: string
    description: string
    mentions: string[]
  }) => void
}
const categories = ['Rent', 'Utilities', 'Groceries', 'Other']
export function ExpenseSheet({ open, onClose, onSave }: ExpenseSheetProps) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Groceries')
  const [description, setDescription] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const simulateScan = () => {
    setIsScanning(true)
    window.setTimeout(() => {
      setAmount('1280')
      setCategory('Groceries')
      setDescription('Saturday market run @Mika @Jules')
      setIsScanning(false)
      setScanComplete(true)
    }, 900)
  }
  const submit = () => {
    if (!amount || !description.trim()) return
    onSave({
      amount: Number(amount),
      category,
      description,
      mentions: description.match(/@\w+/g) ?? [],
    })
    setAmount('')
    setDescription('')
    setScanComplete(false)
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 bg-[#10201c]/75 px-4"
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
          <motion.section
            className="absolute inset-x-0 bottom-0 mx-auto max-w-xl rounded-t-[32px] border-x border-t border-[#428475] bg-[#1A312C] p-5 pb-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-title"
            initial={{
              y: '100%',
            }}
            animate={{
              y: 0,
            }}
            exit={{
              y: '100%',
            }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 320,
            }}
          >
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-[#428475]" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[#89D7B7]">
                  Fast entry
                </p>
                <h2
                  id="expense-title"
                  className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#FFF4E1]"
                >
                  Pa Lista
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[#FFF4E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                aria-label="Close expense entry"
              >
                <XIcon size={22} />
              </button>
            </div>

            <button
              onClick={simulateScan}
              disabled={isScanning}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#89D7B7] bg-[#24453d] px-4 py-3 text-sm font-bold text-[#FFF4E1] disabled:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
            >
              {isScanning ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFF4E1] border-t-transparent" />
              ) : scanComplete ? (
                <CheckCircle2Icon size={18} />
              ) : (
                <CameraIcon size={18} />
              )}
              {isScanning
                ? 'Reading invoice…'
                : scanComplete
                  ? 'Invoice details added'
                  : 'Scan invoice'}
            </button>

            <div className="mt-5 grid grid-cols-[1fr_1.1fr] gap-3">
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#FFF4E1]">
                  Amount
                </span>
                <span className="flex items-center rounded-2xl border border-[#428475] bg-[#24453d] px-3 focus-within:border-[#89D7B7]">
                  <span className="font-bold text-[#89D7B7]">₱</span>
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value.replace(/[^\d.]/g, ''))
                    }
                    placeholder="0.00"
                    className="min-w-0 w-full bg-transparent px-2 py-3.5 text-xl font-extrabold text-[#FFF4E1] placeholder:text-[#FFF4E1]/40 focus:outline-none"
                  />
                </span>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-[#FFF4E1]">
                  Category
                </span>
                <span className="relative block">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full appearance-none rounded-2xl border border-[#428475] bg-[#24453d] px-4 py-4 text-sm font-bold text-[#FFF4E1] focus:border-[#89D7B7] focus:outline-none"
                  >
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute right-3 top-4 text-[#FFF4E1]"
                    size={18}
                  />
                </span>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-[#FFF4E1]">
                What was this for?
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Type @ to tag a roommate…"
                rows={3}
                className="w-full resize-none rounded-2xl border border-[#428475] bg-[#24453d] px-4 py-3 text-[#FFF4E1] placeholder:text-[#FFF4E1]/40 focus:border-[#89D7B7] focus:outline-none"
              />
            </label>
            <div
              className="mt-2 flex flex-wrap gap-2"
              aria-label="Mention suggestions"
            >
              {['@Mika', '@Jules', '@All'].map((member) => (
                <button
                  key={member}
                  onClick={() =>
                    setDescription(
                      (current) => `${current}${current ? ' ' : ''}${member}`,
                    )
                  }
                  className="rounded-full bg-[#428475] px-3 py-1.5 text-xs font-bold text-[#FFF4E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                >
                  {member}
                </button>
              ))}
            </div>

            <button
              disabled={!amount || !description.trim()}
              onClick={submit}
              className="mt-5 w-full rounded-2xl bg-[#89D7B7] px-5 py-4 text-sm font-extrabold text-[#1A312C] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
            >
              Add to list
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
