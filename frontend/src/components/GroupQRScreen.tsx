import React from 'react';
import { motion } from 'motion/react';
import { Copy, Share, ArrowRight } from 'lucide-react';
import QRCode from 'react-qr-code';

interface GroupQRScreenProps {
  groupName: string;
  onNext: () => void;
}

export default function GroupQRScreen({ groupName, onNext }: GroupQRScreenProps) {
  const slugifiedName = groupName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3EFE7] via-[#FCECEE] to-[#EFA8B5]/20 dark:from-[#252B2F] dark:via-[#222123] dark:to-[#2F2427] py-12 px-6 flex flex-col items-center justify-start overflow-y-auto relative">
      {/* Soft background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-leaf-pink/5 via-transparent to-leaf-green/5 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 mt-4">
        {/* Layered Paper Stack under the card - explicit lower z-index */}
        <div className="absolute inset-x-8 -bottom-3 h-20 bg-leaf-yellow/40 dark:bg-leaf-yellow-dark/30 rounded-3xl rotate-2 shadow-lg z-0" />
        <div className="absolute inset-x-6 -bottom-1 h-20 bg-leaf-pink/50 dark:bg-leaf-pink-dark/30 rounded-3xl -rotate-1 shadow-md z-0" />

        {/* Decorative Tape sticker holding the card - higher z-index */}
        <div className="absolute -top-6 right-12 w-28 h-8 bg-leaf-yellow/40 dark:bg-leaf-yellow-dark/30 backdrop-blur-sm rotate-6 border border-white/20 dark:border-slate-800/20 shadow-sm z-20 flex items-center justify-center">
          <div className="w-full h-full border-x-2 border-dashed border-white/40" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border-2 border-[#C8DACF] dark:border-slate-800 text-center relative overflow-hidden z-10"
        >
          {/* Spiral binder holes at top of page */}
          <div className="absolute top-0 inset-x-0 flex justify-around px-8 -mt-3.5 z-20">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-[#E5E1D3] dark:bg-[#252B2F] border-2 border-[#C8DACF] dark:border-slate-800 shadow-inner" />
                <div className="w-2.5 h-6 bg-slate-300 dark:bg-slate-600 rounded-full -mt-2 border border-slate-400 shadow-sm" />
              </div>
            ))}
          </div>

          <div className="mt-4 mb-6">
            <h2 className="text-3xl font-black font-sans text-[#13463B] dark:text-white mb-2 tracking-tight">Invite Friends</h2>
            <p className="text-[#316D5F] dark:text-slate-400 text-sm font-medium px-2">Have them scan this QR code or share the link below to join "{groupName}".</p>
            <div className="h-0.5 w-16 bg-leaf-pink mx-auto mt-3 rounded-full" />
          </div>

          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border-2 border-[#C8DACF] dark:border-slate-800 inline-block mb-6 shadow-inner relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/20 to-transparent dark:from-transparent pointer-events-none rounded-2xl" />
            
            {/* Mock QR Code Pattern with elegant graphite/ink stamps */}
            <div className="w-44 h-44 bg-white grid p-2 rounded-xl shadow-sm mx-auto">
              <QRCode
                value={`lista.app/join/${slugifiedName || 'new-group'}`}
                size={160}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 160 160`}
                fgColor="#0f172a"
              />
            </div>
          </div>

          <div className="space-y-4 w-full font-sans mb-8">
            <div className="flex gap-2">
              <div className="flex-1 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-850 rounded-xl px-4 py-3 text-sm text-[#1B5648] dark:text-slate-300 font-bold truncate text-left select-all">
                lista.app/join/{slugifiedName || 'new-group'}
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`lista.app/join/${slugifiedName || 'new-group'}`);
                }}
                className="bg-slate-100 hover:bg-[#FCECEE] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1B5648] dark:text-slate-300 px-4 rounded-xl transition-colors flex items-center justify-center border-2 border-[#C8DACF] dark:border-slate-700 shadow-sm active:scale-95"
                title="Copy Link"
              >
                <Copy size={18} className="stroke-[2.5]" />
              </button>
            </div>
            
            <button className="w-full bg-white hover:bg-[#E5F0E9] dark:bg-slate-800/50 dark:hover:bg-slate-800 text-[#1B5648] dark:text-slate-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-[#C8DACF] dark:border-slate-800 shadow-sm">
              <Share size={18} className="stroke-[2.5]" />
              <span>Share via...</span>
            </button>
          </div>

          <button 
            onClick={onNext}
            className="w-full bg-[#13463B] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
