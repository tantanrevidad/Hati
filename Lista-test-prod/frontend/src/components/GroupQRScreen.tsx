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
        <div className="absolute inset-x-0 -bottom-5 top-10 bg-[#13463B] dark:bg-[#1C2125] rounded-3xl shadow-md z-0" />
        <div className="absolute inset-x-0 -bottom-2.5 top-10 bg-[#E5E1D3] dark:bg-[#252B2F] rounded-3xl shadow-md z-0" />
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border-2 border-[#C8DACF] dark:border-slate-800 text-center relative z-10">
          {/* Notebook decorative binder rings detail */}
          <div className="absolute -top-3 left-0 right-0 flex justify-center gap-8 z-20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative w-4 h-7 bg-[#13463B] dark:bg-slate-500 rounded-full shadow-md border border-[#0D3028] dark:border-slate-700">
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-black/20 dark:bg-black/40 rounded-full shadow-inner" />
              </div>
            ))}
          </div>
          <div className="mt-4 mb-6">
            <h2 className="text-3xl font-black font-sans text-[#13463B] dark:text-white mb-2 tracking-tight">Invite Friends</h2>
            <p className="text-[#316D5F] dark:text-slate-400 text-sm font-medium px-2">Have them scan this QR code or share the link below to join "{groupName}".</p>
            <div className="h-0.5 w-16 bg-leaf-pink mx-auto mt-3 rounded-full" />
          </div>

          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border-2 border-[#C8DACF] dark:border-slate-800 inline-block mb-6 shadow-inner relative group">
            <div className="absolute inset-0 bg-leaf-green/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
            <QRCode 
              value={`https://lista.app/join/${slugifiedName}`} 
              size={200}
              level="H"
              bgColor="transparent"
              fgColor="currentColor"
              className="text-slate-900 dark:text-white transition-transform group-hover:scale-105"
            />
          </div>

          <div className="w-full max-w-[280px] mx-auto space-y-3">
            <button className="w-full bg-[#1B5648] hover:bg-[#13463B] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md">
              <Share size={18} />
              <span>Share Link</span>
            </button>
            <button className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1B5648] dark:text-slate-300 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Copy size={18} />
              <span>Copy Link</span>
            </button>
          </div>

          <button 
            onClick={onNext}
            className="w-full mt-8 bg-[#13463B] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-slate-900 dark:border-white shadow-md hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            <span>Next</span>
            <ArrowRight size={20} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}