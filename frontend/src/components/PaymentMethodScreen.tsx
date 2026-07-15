import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, CreditCard, Building2, ChevronRight, CheckCircle2, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface PaymentMethodScreenProps {
  onNext: () => void;
}

type PaymentOption = 'gcash' | 'maya' | 'bank' | null;

export default function PaymentMethodScreen({ onNext }: PaymentMethodScreenProps) {
  const [selected, setSelected] = useState<PaymentOption>(null);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSelect = (option: PaymentOption) => {
    setSelected(option);
    setInputValue(''); // Reset input when changing option
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setInputValue(value);
    setError('');
  };

  const handleFinishSetup = async () => {
    if (!selected) {
      setError('Please select a payment method.');
      return;
    }
    if (!inputValue.trim()) {
      setError('Please enter your account or reference number.');
      return;
    }

    if (selected === 'gcash' || selected === 'maya') {
      if (!/^09\d{9}$/.test(inputValue)) {
        setError('Invalid mobile number. Must be 11 digits starting with 09.');
        return;
      }
    } else if (selected === 'bank') {
      if (!/^\d{13}$/.test(inputValue)) {
        setError('Invalid account number. Must be exactly 13 digits.');
        return;
      }
    }

    setError('');
    
    try {
      await api.linkPaymentMethod(selected, inputValue);
      onNext();
    } catch (err: any) {
      setError(err.message || 'Failed to link payment method.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3EFE7] via-[#FCECEE] to-[#EFA8B5]/20 dark:from-[#252B2F] dark:via-[#222123] dark:to-[#2F2427] py-12 px-6 flex flex-col items-center justify-center relative">
      {/* Soft background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-leaf-pink/5 via-transparent to-leaf-green/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8 px-4">
          <h2 className="text-2xl font-bold font-sans text-[#13463B] dark:text-white tracking-tight">
            Add GCash, Maya, or a Bank account so settling up is instant.
          </h2>
        </div>

        <div className="relative z-10">
          {/* Layered Paper Stack under the card - explicit lower z-index */}
          <div className="absolute inset-x-6 -bottom-5 top-10 bg-[#13463B] dark:bg-[#1C2125] rounded-3xl shadow-md z-0" />
          <div className="absolute inset-x-6 -bottom-2.5 top-10 bg-[#E5E1D3] dark:bg-[#252B2F] rounded-3xl shadow-md z-0" />

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-[#C8DACF] dark:border-slate-800 relative z-10">
            {/* Notebook decorative binder rings detail */}
            <div className="absolute -top-3 left-0 right-0 flex justify-center gap-8 z-20">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative w-4 h-7 bg-[#13463B] dark:bg-slate-500 rounded-full shadow-md border border-[#0D3028] dark:border-slate-700">
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-black/20 dark:bg-black/40 rounded-full shadow-inner" />
                </div>
              ))}
            </div>

            <div className="space-y-4 mt-4 font-sans">
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, height: 0 }} 
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-start gap-2 text-sm border border-red-200 dark:border-red-800/50 shadow-sm mb-4"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-bold leading-tight mt-0.5">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* GCash Option */}
              <div className={`rounded-2xl border-2 transition-all ${selected === 'gcash' ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-md scale-[1.02]' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'}`}>
                <button
                  onClick={() => handleSelect('gcash')}
                  className="w-full p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selected === 'gcash' ? 'bg-[#007DFE] text-white' : 'bg-slate-100 text-[#577870] dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
                      <Wallet size={24} className="stroke-[2]" />
                    </div>
                    <div className="text-left">
                      <div className={`font-bold text-lg leading-tight ${selected === 'gcash' ? 'text-[#13463B] dark:text-white' : 'text-[#1B5648] dark:text-slate-300'}`}>GCash</div>
                      <div className="text-xs font-medium text-[#316D5F] dark:text-slate-400">e-Wallet</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-slate-400">
                    {selected === 'gcash' ? (
                      <CheckCircle2 size={24} className="text-[#007DFE] dark:text-[#42A5F5]" />
                    ) : (
                      <ChevronRight size={20} className="group-hover:text-[#316D5F] dark:group-hover:text-slate-300" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {selected === 'gcash' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 overflow-hidden"
                    >
                      <label className="block text-xs font-bold text-[#316D5F] dark:text-slate-400 mb-1.5 ml-1">Reference Number / Mobile Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone size={16} className="text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={inputValue}
                          onChange={handleInputChange}
                          maxLength={11}
                          placeholder="09XX XXX XXXX"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[#13463B] dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-slate-400 transition-colors font-medium font-mono text-sm"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Maya Option */}
              <div className={`rounded-2xl border-2 transition-all ${selected === 'maya' ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-md scale-[1.02]' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'}`}>
                <button
                  onClick={() => handleSelect('maya')}
                  className="w-full p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selected === 'maya' ? 'bg-[#000000] text-white dark:bg-white dark:text-black' : 'bg-slate-100 text-[#577870] dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
                      <CreditCard size={24} className="stroke-[2]" />
                    </div>
                    <div className="text-left">
                      <div className={`font-bold text-lg leading-tight ${selected === 'maya' ? 'text-[#13463B] dark:text-white' : 'text-[#1B5648] dark:text-slate-300'}`}>Maya</div>
                      <div className="text-xs font-medium text-[#316D5F] dark:text-slate-400">e-Wallet</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-slate-400">
                    {selected === 'maya' ? (
                      <CheckCircle2 size={24} className="text-[#13463B] dark:text-white" />
                    ) : (
                      <ChevronRight size={20} className="group-hover:text-[#316D5F] dark:group-hover:text-slate-300" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {selected === 'maya' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 overflow-hidden"
                    >
                      <label className="block text-xs font-bold text-[#316D5F] dark:text-slate-400 mb-1.5 ml-1">Reference Number / Mobile Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone size={16} className="text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={inputValue}
                          onChange={handleInputChange}
                          maxLength={11}
                          placeholder="09XX XXX XXXX"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[#13463B] dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-slate-400 transition-colors font-medium font-mono text-sm"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bank Account Option */}
              <div className={`rounded-2xl border-2 transition-all ${selected === 'bank' ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 shadow-md scale-[1.02]' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'}`}>
                <button
                  onClick={() => handleSelect('bank')}
                  className="w-full p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selected === 'bank' ? 'bg-[#008060] text-white' : 'bg-slate-100 text-[#577870] dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
                      <Building2 size={24} className="stroke-[2]" />
                    </div>
                    <div className="text-left">
                      <div className={`font-bold text-lg leading-tight ${selected === 'bank' ? 'text-[#13463B] dark:text-white' : 'text-[#1B5648] dark:text-slate-300'}`}>Bank Account</div>
                      <div className="text-xs font-medium text-[#316D5F] dark:text-slate-400">InstaPay / PESONet</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-slate-400">
                    {selected === 'bank' ? (
                      <CheckCircle2 size={24} className="text-[#008060] dark:text-[#4ADE80]" />
                    ) : (
                      <ChevronRight size={20} className="group-hover:text-[#316D5F] dark:group-hover:text-slate-300" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {selected === 'bank' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 overflow-hidden"
                    >
                      <label className="block text-xs font-bold text-[#316D5F] dark:text-slate-400 mb-1.5 ml-1">Account Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Building2 size={16} className="text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={inputValue}
                          onChange={handleInputChange}
                          maxLength={13}
                          placeholder="XXXX XXXX XXXX X"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[#13463B] dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-800 dark:focus:border-slate-400 transition-colors font-medium font-mono text-sm"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button 
              onClick={handleFinishSetup}
              className="w-full mt-8 bg-[#13463B] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-slate-900 dark:border-white shadow-md hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <span>{selected ? 'Finish Setup' : 'Finish Setup'}</span>
              <ArrowRight size={20} className="stroke-[2.5]" />
            </button>

            <div className="mt-6 text-center">
              <button 
                onClick={onNext}
                className="text-sm font-bold text-[#577870] hover:text-[#1B5648] dark:text-slate-400 dark:hover:text-slate-200 underline decoration-slate-300 dark:decoration-slate-600 hover:decoration-slate-800 dark:hover:decoration-slate-200 underline-offset-4 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
