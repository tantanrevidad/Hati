import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XIcon, ShieldCheck, FileText } from 'lucide-react'

type TermsAndPrivacySheetProps = {
  open: boolean
  mode: 'terms' | 'privacy'
  onClose: () => void
}

export function TermsAndPrivacySheet({
  open,
  mode,
  onClose,
}: TermsAndPrivacySheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#10201c]/75 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            className="absolute inset-x-0 bottom-0 mx-auto max-w-xl rounded-t-[32px] border-x border-t border-[#428475] bg-[#1A312C] p-5 pb-8 flex flex-col max-h-[85vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-sheet-title"
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
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#386658] text-[#89D7B7]">
                  {mode === 'terms' ? <FileText size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#89D7B7] uppercase tracking-wider">
                    Legal Agreement
                  </p>
                  <h2
                    id="legal-sheet-title"
                    className="text-xl font-extrabold tracking-[-0.04em] text-[#FFF4E1]"
                  >
                    {mode === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[#FFF4E1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
                aria-label="Close"
              >
                <XIcon size={22} />
              </button>
            </div>

            {/* Content Scrollable area */}
            <div className="flex-1 overflow-y-auto pr-1 text-sm text-[#FFF4E1]/80 space-y-5 leading-relaxed">
              {mode === 'terms' ? (
                <>
                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">1. Agreement to Terms</h3>
                    <p>
                      Welcome to Lista. By accessing or using our mobile application, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">2. Purpose & Use</h3>
                    <p>
                      Lista is a shared ledger utility designed to track informal groups, household balances, and shared tabs. It does not handle direct financial transactions, banking, or real money processing. All payment configurations are simulated and for reference only.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">3. User Accounts & Identity</h3>
                    <p>
                      You are responsible for protecting your account credentials. You agree to provide accurate names, avatars, and payment configuration references (e.g., GCash, Maya details) so members of your shared groups can identify you accurately.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">4. Acceptable Conduct</h3>
                    <p>
                      You agree not to create fraudulent expenses, harass roommates, or use the application to coordinate illegal transactions. The group administrators reserve the right to settle or manage list members.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">5. Disclaimer of Warranties</h3>
                    <p>
                      Lista is provided "as is" and "as available". We do not warrant that the calculations are 100% error-free or that the cloud synchronization will be uninterrupted. Use of the app is at your own risk.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">6. Limitation of Liability</h3>
                    <p>
                      In no event shall Lista or its developers be liable for any dispute, financial losses, or disagreements arising between you and other users of the app.
                    </p>
                  </section>

                  <p className="text-xs text-[#FFF4E1]/50 border-t border-[#428475]/20 pt-4">
                    Last updated: July 13, 2026
                  </p>
                </>
              ) : (
                <>
                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">1. Information We Collect</h3>
                    <p>
                      We collect minimal information to enable your shared ledger functionality:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                      <li><strong>Profile Information:</strong> Name, phone/email identifiers, and avatar options.</li>
                      <li><strong>Payment Configurations:</strong> Selected payout references (e.g., GCash, Maya, Bank information) shared strictly with your group members.</li>
                      <li><strong>Group Activities:</strong> Ledgers, tabs, bills, and expense transaction histories.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">2. How We Use Information</h3>
                    <p>
                      We use this data solely to populate group ledgers, balance calculations, and notify members of new activities. We do not sell your personal data or target advertising based on your expenses.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">3. Sharing With Roommates</h3>
                    <p>
                      By joining a shared Listahan, your name, profile icon, payment handles, and the details of expenses you log will be visible to all current and future members of that group.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">4. Data Security</h3>
                    <p>
                      We use standard industry methods to transmit and store ledger records securely. However, please remember that no transmission method over the internet is completely bulletproof.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-extrabold text-[#FFF4E1] mb-2">5. Your Choices</h3>
                    <p>
                      You can edit your display name and payment preferences at any time by accessing your Profile settings in the app dashboard.
                    </p>
                  </section>

                  <p className="text-xs text-[#FFF4E1]/50 border-t border-[#428475]/20 pt-4">
                    Last updated: July 13, 2026
                  </p>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-[#89D7B7] py-3.5 text-sm font-extrabold text-[#1A312C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7] transition active:scale-95"
            >
              Close
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
