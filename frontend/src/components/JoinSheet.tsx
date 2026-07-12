import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LinkIcon, QrCodeIcon, XIcon } from 'lucide-react'
type JoinSheetProps = {
  open: boolean
  onClose: () => void
  onJoin: (reference: string) => void
}
export function JoinSheet({ open, onClose, onJoin }: JoinSheetProps) {
  const [method, setMethod] = useState<'qr' | 'link'>('qr')
  const [reference, setReference] = useState('')
  const submit = () => {
    onJoin(reference || 'Bahay sa Taft')
    setReference('')
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
            aria-labelledby="join-title"
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
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[#89D7B7]">
                  Share the load
                </p>
                <h2
                  id="join-title"
                  className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#FFF4E1]"
                >
                  Join a Listahan
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[#FFF4E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                aria-label="Close join sheet"
              >
                <XIcon size={22} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-2xl bg-[#24453d] p-1">
              <button
                onClick={() => setMethod('qr')}
                className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${method === 'qr' ? 'bg-[#428475] text-[#FFF4E1]' : 'text-[#FFF4E1]/65'}`}
              >
                <QrCodeIcon className="mr-1.5 inline" size={16} /> QR code
              </button>
              <button
                onClick={() => setMethod('link')}
                className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${method === 'link' ? 'bg-[#428475] text-[#FFF4E1]' : 'text-[#FFF4E1]/65'}`}
              >
                <LinkIcon className="mr-1.5 inline" size={16} /> Invite link
              </button>
            </div>

            {method === 'qr' ? (
              <button
                onClick={() => setReference('QR · Bahay sa Taft')}
                className="flex w-full flex-col items-center rounded-3xl border border-dashed border-[#89D7B7] bg-[#24453d] px-5 py-7 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
              >
                <div className="grid h-20 w-20 place-items-center rounded-xl bg-[#FFF4E1] text-[#1A312C]">
                  <QrCodeIcon size={48} />
                </div>
                <span className="mt-4 text-sm font-bold text-[#FFF4E1]">
                  Tap to simulate scanning an invite
                </span>
                <span className="mt-1 text-xs text-[#FFF4E1]/65">
                  Your camera stays private
                </span>
              </button>
            ) : (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#FFF4E1]">
                  Invite link or group code
                </span>
                <input
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  placeholder="lista.app/join/..."
                  className="w-full rounded-2xl border border-[#428475] bg-[#24453d] px-4 py-3.5 text-[#FFF4E1] placeholder:text-[#FFF4E1]/40 focus:border-[#89D7B7] focus:outline-none"
                />
              </label>
            )}

            <button
              onClick={submit}
              className="mt-5 w-full rounded-2xl bg-[#89D7B7] px-5 py-4 text-sm font-extrabold text-[#1A312C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
            >
              Join Listahan
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
