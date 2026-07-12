import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BanknoteIcon, QrCodeIcon, XIcon } from 'lucide-react'
type SettleSheetProps = {
  open: boolean
  amount: number
  groupName: string
  onClose: () => void
  onComplete: (method: 'QRPH' | 'Cash') => void
}
export function SettleSheet({
  open,
  amount,
  groupName,
  onClose,
  onComplete,
}: SettleSheetProps) {
  const [method, setMethod] = useState<'QRPH' | 'Cash'>('QRPH')
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
            aria-labelledby="settle-title"
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
                  One tap away
                </p>
                <h2
                  id="settle-title"
                  className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#FFF4E1]"
                >
                  Settle your share
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[#FFF4E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                aria-label="Close settlement sheet"
              >
                <XIcon size={22} />
              </button>
            </div>
            <p className="mt-5 text-sm text-[#FFF4E1]/65">
              You’re paying{' '}
              <strong className="text-[#FFF4E1]">
                ₱{Math.abs(amount).toLocaleString()}
              </strong>{' '}
              to {groupName}.
            </p>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => setMethod('QRPH')}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7] ${method === 'QRPH' ? 'border-[#89D7B7] bg-[#24453d]' : 'border-[#428475]'}`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#428475] text-[#FFF4E1]">
                  <QrCodeIcon size={22} />
                </span>
                <span>
                  <span className="block font-bold text-[#FFF4E1]">QRPH</span>
                  <span className="text-xs text-[#FFF4E1]/65">
                    Pay with your linked account
                  </span>
                </span>
              </button>
              <button
                onClick={() => setMethod('Cash')}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7] ${method === 'Cash' ? 'border-[#89D7B7] bg-[#24453d]' : 'border-[#428475]'}`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#428475] text-[#FFF4E1]">
                  <BanknoteIcon size={22} />
                </span>
                <span>
                  <span className="block font-bold text-[#FFF4E1]">Cash</span>
                  <span className="text-xs text-[#FFF4E1]/65">
                    Mark cash handed over
                  </span>
                </span>
              </button>
            </div>

            <button
              onClick={() => onComplete(method)}
              className="mt-5 w-full rounded-2xl bg-[#89D7B7] px-5 py-4 text-sm font-extrabold text-[#1A312C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
            >
              Confirm {method} settlement
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
