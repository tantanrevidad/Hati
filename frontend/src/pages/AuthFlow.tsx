import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRightIcon,
  Building2Icon,
  CheckIcon,
  CreditCardIcon,
  LockKeyholeIcon,
  MailIcon,
  SmartphoneIcon,
  Smile,
  Cat,
  Rabbit,
  Bird,
  Ghost,
  Camera,
  Wallet,
  Landmark,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  User,
  Phone
} from 'lucide-react'
import { BrandMark } from '../components/BrandMark'
import { ReceiptTextIcon } from 'lucide-react'
import { TermsAndPrivacySheet } from '../components/TermsAndPrivacySheet'

type AuthFlowProps = {
  initialStep?: 'login' | 'profile' | 'payment'
  onComplete: () => void
}
type AuthMethod = 'phone' | 'email' | 'google'
type PaymentMethod = 'GCash' | 'Maya' | 'Bank'
const AVATARS = [Smile, Cat, Rabbit, Bird, Ghost]
export function AuthFlow({
  initialStep = 'login',
  onComplete,
}: AuthFlowProps) {
  const [step, setStep] = useState<'splash' | 'login' | 'profile' | 'payment'>(initialStep === 'login' ? 'splash' : initialStep)

  React.useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('login')
      }, 2800)
      return () => clearTimeout(timer)
    }
  }, [step])
  const [loginSubstep, setLoginSubstep] = useState<'method' | 'input'>('method')
  const [method, setMethod] = useState<AuthMethod>('phone')
  const [name, setName] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('GCash')
  const [token, setToken] = useState('')
  const [legalOpen, setLegalOpen] = useState(false)
  const [legalMode, setLegalMode] = useState<'terms' | 'privacy'>('terms')
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
  return (
    <main className="min-h-screen w-full bg-[#1A312C] px-5 py-6 text-[#FFF4E1] sm:grid sm:place-items-center">
      <section className="mx-auto w-full max-w-md">
        {step !== 'splash' && <BrandMark />}
        <AnimatePresence mode="wait">
          {step === 'splash' ? (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-50 grid place-items-center bg-[#1A312C] text-[#FFF4E1]"
            >
              <motion.svg viewBox="0 0 200 80" className="w-64 h-auto">
                <motion.text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ strokeDasharray: 300, strokeDashoffset: 300, fillOpacity: 0 }}
                  animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
                  transition={{
                    strokeDashoffset: { duration: 1.5, ease: "easeInOut" },
                    fillOpacity: { delay: 1.2, duration: 0.5 },
                  }}
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "64px",
                    fontWeight: 600,
                  }}
                >
                  Lista
                </motion.text>
                <motion.path
                  d="M 50 42 Q 100 35 150 40"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="transparent"
                  className="text-[#89D7B7]"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    delay: 1.6,
                    duration: 0.4,
                    ease: "easeOut"
                  }}
                />
              </motion.svg>
            </motion.div>
          ) : step === 'login' ? (
            <motion.div
              key="login"
              initial={{
                opacity: 0,
                x: -14,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: 14,
              }}
              transition={{
                duration: 0.2,
              }}
              className="flex h-full flex-col justify-center pt-8"
            >
              {loginSubstep === 'method' ? (
                <>
                  <div className="flex flex-col items-center justify-center pt-10">
                    <div className="grid h-16 w-16 place-items-center rounded-[20px] bg-[#89D7B7] text-[#1A312C] shadow-[0_0_20px_rgba(137,215,183,0.3)]">
                      <ReceiptTextIcon size={32} strokeWidth={2} />
                    </div>
                    <h1 className="mt-6 text-5xl font-extrabold tracking-[-0.06em]">Lista</h1>
                    <p className="mt-2 text-sm font-bold text-[#89D7B7]">
                      Your tab. settled.
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-16 flex flex-1 flex-col justify-end"
                  >
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => {
                          setMethod('phone')
                          setLoginSubstep('input')
                        }}
                        className="flex items-center justify-center gap-2 rounded-[28px] bg-[#89D7B7] py-4 text-sm font-bold text-[#1A312C] shadow-[0_0_15px_rgba(137,215,183,0.3)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                      >
                        <SmartphoneIcon size={18} /> Continue with Phone
                      </button>
                      <button
                        onClick={() => {
                          setMethod('email')
                          setLoginSubstep('input')
                        }}
                        className="flex items-center justify-center gap-2 rounded-[28px] border border-[#428475] bg-[#24453d]/40 py-4 text-sm font-bold text-[#FFF4E1] transition hover:bg-[#24453d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                      >
                        <MailIcon size={18} /> Continue with Email
                      </button>
                      <button
                        onClick={() => {
                          setMethod('google')
                          setLoginSubstep('input')
                        }}
                        className="flex items-center justify-center gap-2 rounded-[28px] bg-[#FFF4E1] py-4 text-sm font-bold text-[#1A312C] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFF4E1]"
                      >
                        <div className="grid h-4 w-4 place-items-center rounded-full bg-white">
                          <div className="h-2 w-2 rounded-full bg-black/10" />
                        </div>{' '}
                        Continue with Google
                      </button>
                    </div>

                    <p className="mt-8 text-center text-xs leading-5 text-[#FFF4E1]/55">
                      By continuing, you agree to our{' '}
                      <button
                        onClick={() => {
                          setLegalMode('terms')
                          setLegalOpen(true)
                        }}
                        className="font-bold text-[#89D7B7] hover:underline cursor-pointer focus:outline-none"
                      >
                        Terms of Service
                      </button>
                      <br />
                      and{' '}
                      <button
                        onClick={() => {
                          setLegalMode('privacy')
                          setLegalOpen(true)
                        }}
                        className="font-bold text-[#89D7B7] hover:underline cursor-pointer focus:outline-none"
                      >
                        Privacy Policy
                      </button>
                      .
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-2 pb-8">
                      <div className="h-1.5 w-6 rounded-full bg-[#89D7B7]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-[#428475]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-[#428475]" />
                    </div>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-16 rounded-[28px] border border-[#428475] bg-[#24453d] p-5"
                >
                  <button
                    onClick={() => setLoginSubstep('method')}
                    className="mb-4 text-xs font-bold text-[#89D7B7]"
                  >
                    ← Back to methods
                  </button>
                  {method === 'phone' && (
                    <label>
                      <span className="mb-2 block text-sm font-semibold">
                        Mobile number
                      </span>
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder="+63 917 000 0000"
                        className="w-full rounded-2xl border border-[#428475] bg-[#1A312C] px-4 py-3.5 text-[#FFF4E1] placeholder:text-[#FFF4E1]/40 focus:border-[#89D7B7] focus:outline-none"
                      />
                    </label>
                  )}
                  {method === 'email' && (
                    <label>
                      <span className="mb-2 block text-sm font-semibold">
                        Email address
                      </span>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-[#428475] bg-[#1A312C] px-4 py-3.5 text-[#FFF4E1] placeholder:text-[#FFF4E1]/40 focus:border-[#89D7B7] focus:outline-none"
                      />
                    </label>
                  )}
                  {method === 'google' && (
                    <div className="rounded-2xl border border-[#428475] bg-[#1A312C] p-4 text-sm text-[#FFF4E1]/70">
                      Continue securely with your Google account. No real
                      authentication is requested in this prototype.
                    </div>
                  )}
                  <button
                    onClick={() => setStep('profile')}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#89D7B7] px-5 py-4 text-sm font-extrabold text-[#1A312C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                  >
                    {method === 'google' ? 'Continue with Google' : 'Continue'}{' '}
                    <ArrowRightIcon size={17} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : step === 'profile' ? (
            <motion.div
              key="profile"
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
                x: -14,
              }}
              transition={{
                duration: 0.2,
              }}
              className="flex h-full flex-col pt-8"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('login')}
                  className="p-2 text-[#FFF4E1] hover:text-[#89D7B7] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#428475]" />
                  <div className="h-1.5 w-6 rounded-full bg-[#89D7B7]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#428475]" />
                </div>
                <div className="text-sm font-bold text-[#FFF4E1]/70 w-12 text-right">
                  2 of 3
                </div>
              </div>
              <h1 className="mt-8 text-[32px] font-extrabold tracking-[-0.05em] leading-tight">
                Set up your profile
              </h1>
              <p className="mt-3 text-base font-medium text-[#FFF4E1]/70">
                Add a photo and display name so your roommates know it's you.
              </p>

              <div className="mt-10 flex flex-col items-center">
                <div className="relative">
                  <div className="grid h-32 w-32 place-items-center rounded-full border-4 border-[#428475] bg-[#24453d] text-[#89D7B7]">
                    {selectedAvatar !== null ? (
                      (() => {
                        const AvatarIcon = AVATARS[selectedAvatar]
                        return <AvatarIcon size={56} />
                      })()
                    ) : (
                      <User size={56} className="text-[#FFF4E1]/50" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 grid h-10 w-10 place-items-center rounded-full bg-[#89D7B7] text-[#1A312C] shadow-md transition hover:scale-105 active:scale-95">
                    <Camera size={20} />
                  </button>
                </div>

                <p className="mt-8 text-sm font-bold text-[#FFF4E1]/70">
                  Or pick a preset avatar
                </p>

                <div className="mt-4 flex gap-4">
                  {AVATARS.map((Icon, i) => {
                    const isSelected = selectedAvatar === i
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedAvatar(i)}
                        className={`grid h-12 w-12 place-items-center rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7] ${
                          isSelected
                            ? 'bg-[#89D7B7] text-[#1A312C] scale-110 ring-4 ring-[#89D7B7]/30'
                            : 'bg-[#428475] text-[#89D7B7] hover:bg-[#89D7B7] hover:text-[#1A312C] hover:scale-105'
                        }`}
                      >
                        <Icon size={24} />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-12 flex flex-1 flex-col justify-end">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    Display Name
                  </span>
                  <div className="flex items-center rounded-2xl bg-[#428475] focus-within:ring-2 focus-within:ring-[#89D7B7]">
                    <div className="pl-4 pr-2 text-[#FFF4E1]/50">@</div>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      className="w-full bg-transparent py-4 pr-4 text-[#FFF4E1] placeholder:text-[#FFF4E1]/30 focus:outline-none"
                    />
                  </div>
                </label>

                <button
                  onClick={() => setStep('payment')}
                  className="mt-16 flex w-full items-center justify-center gap-2 rounded-[28px] bg-[#89D7B7] py-4 text-sm font-bold text-[#1A312C] shadow-[0_0_15px_rgba(137,215,183,0.3)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                >
                  Continue <ArrowRightIcon size={18} />
                </button>
                <button
                  onClick={() => setStep('payment')}
                  className="mt-6 mb-8 text-sm font-bold text-[#FFF4E1]/70 hover:text-[#FFF4E1]"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="payment"
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
                x: -14,
              }}
              transition={{
                duration: 0.2,
              }}
              className="flex h-full flex-col pt-8"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#428475]" />
                <div className="h-1.5 w-1.5 rounded-full bg-[#428475]" />
                <div className="h-1.5 w-6 rounded-full bg-[#89D7B7]" />
              </div>
              <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#89D7B7]">
                STEP 3 OF 3
              </p>
              <h1 className="mt-2 text-[32px] font-extrabold tracking-[-0.05em] leading-tight">
                Link a payment method
              </h1>
              <p className="mt-3 text-base font-medium text-[#FFF4E1]/70">
                Add GCash, Maya, or a Bank account so settling up is instant.
              </p>

              <div className="mt-8 flex flex-col gap-4">
                <div
                  className={`rounded-[20px] border p-4 transition-all ${payment === 'GCash' ? 'border-[#89D7B7] bg-[#428475]' : 'border-[#428475] bg-[#24453d] cursor-pointer hover:border-[#89D7B7]/50'}`}
                  onClick={() => setPayment('GCash')}
                >
                  <div className="flex items-center gap-4">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${payment === 'GCash' ? 'bg-[#24453d] text-[#89D7B7]' : 'bg-[#1A312C] text-[#FFF4E1]/50'}`}>
                      <Wallet size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">GCash</div>
                      <div className="text-xs font-medium text-[#FFF4E1]/70">e-Wallet</div>
                    </div>
                    {payment === 'GCash' ? (
                      <CheckCircle2 className="text-[#89D7B7]" fill="currentColor" stroke="#428475" size={24} />
                    ) : (
                      <ChevronRight className="text-[#FFF4E1]/50" size={20} />
                    )}
                  </div>
                  <AnimatePresence>
                    {payment === 'GCash' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mb-2 text-xs font-bold text-[#FFF4E1]/90">
                          Reference Number / Mobile Number
                        </div>
                        <div className="flex items-center rounded-xl bg-[#1A312C] p-3 focus-within:ring-2 focus-within:ring-[#89D7B7]">
                          <Phone size={16} className="mr-3 text-[#FFF4E1]/50" />
                          <input
                            type="tel"
                            placeholder="09XX XXX XXXX"
                            className="w-full bg-transparent text-sm text-[#FFF4E1] placeholder:text-[#FFF4E1]/30 focus:outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  className={`rounded-[20px] border p-4 transition-all ${payment === 'Maya' ? 'border-[#89D7B7] bg-[#428475]' : 'border-[#428475] bg-[#24453d] cursor-pointer hover:border-[#89D7B7]/50'}`}
                  onClick={() => setPayment('Maya')}
                >
                  <div className="flex items-center gap-4">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${payment === 'Maya' ? 'bg-[#24453d] text-[#89D7B7]' : 'bg-[#1A312C] text-[#FFF4E1]/50'}`}>
                      <CreditCardIcon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">Maya</div>
                      <div className="text-xs font-medium text-[#FFF4E1]/70">e-Wallet</div>
                    </div>
                    {payment === 'Maya' ? (
                      <CheckCircle2 className="text-[#89D7B7]" fill="currentColor" stroke="#428475" size={24} />
                    ) : (
                      <ChevronRight className="text-[#FFF4E1]/50" size={20} />
                    )}
                  </div>
                  <AnimatePresence>
                    {payment === 'Maya' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mb-2 text-xs font-bold text-[#FFF4E1]/90">
                          Mobile Number
                        </div>
                        <div className="flex items-center rounded-xl bg-[#1A312C] p-3 focus-within:ring-2 focus-within:ring-[#89D7B7]">
                          <Phone size={16} className="mr-3 text-[#FFF4E1]/50" />
                          <input
                            type="tel"
                            placeholder="09XX XXX XXXX"
                            className="w-full bg-transparent text-sm text-[#FFF4E1] placeholder:text-[#FFF4E1]/30 focus:outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  className={`rounded-[20px] border p-4 transition-all ${payment === 'Bank' ? 'border-[#89D7B7] bg-[#428475]' : 'border-[#428475] bg-[#24453d] cursor-pointer hover:border-[#89D7B7]/50'}`}
                  onClick={() => setPayment('Bank')}
                >
                  <div className="flex items-center gap-4">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${payment === 'Bank' ? 'bg-[#24453d] text-[#89D7B7]' : 'bg-[#1A312C] text-[#FFF4E1]/50'}`}>
                      <Landmark size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">Bank Account</div>
                      <div className="text-xs font-medium text-[#FFF4E1]/70">InstaPay / PESONet</div>
                    </div>
                    {payment === 'Bank' ? (
                      <CheckCircle2 className="text-[#89D7B7]" fill="currentColor" stroke="#428475" size={24} />
                    ) : (
                      <ChevronRight className="text-[#FFF4E1]/50" size={20} />
                    )}
                  </div>
                  <AnimatePresence>
                    {payment === 'Bank' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mb-2 text-xs font-bold text-[#FFF4E1]/90">
                          Account Number
                        </div>
                        <div className="flex items-center rounded-xl bg-[#1A312C] p-3 focus-within:ring-2 focus-within:ring-[#89D7B7]">
                          <Building2Icon size={16} className="mr-3 text-[#FFF4E1]/50" />
                          <input
                            type="text"
                            placeholder="0000 0000 0000"
                            className="w-full bg-transparent text-sm text-[#FFF4E1] placeholder:text-[#FFF4E1]/30 focus:outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-8 flex flex-1 flex-col justify-end">
                <button
                  onClick={onComplete}
                  className="flex w-full items-center justify-center gap-2 rounded-[28px] bg-[#89D7B7] py-4 text-sm font-bold text-[#1A312C] shadow-[0_0_15px_rgba(137,215,183,0.3)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                >
                  Finish Setup <ArrowRightIcon size={18} />
                </button>
                <button
                  onClick={onComplete}
                  className="mt-6 mb-8 text-sm font-bold text-[#FFF4E1]/70 hover:text-[#FFF4E1] underline decoration-[#FFF4E1]/30 underline-offset-4"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <TermsAndPrivacySheet
        open={legalOpen}
        mode={legalMode}
        onClose={() => setLegalOpen(false)}
      />
    </main>
  )
}
