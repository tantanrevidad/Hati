import React from 'react'
import { ReceiptTextIcon } from 'lucide-react'
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="Lista">
      <div className="grid h-10 w-10 place-items-center rounded-[15px] bg-[#89D7B7] text-[#1A312C] shadow-[0_0_15px_rgba(137,215,183,0.3)]">
        <ReceiptTextIcon size={20} strokeWidth={2.5} />
      </div>
      {!compact && (
        <span className="text-[22px] font-extrabold tracking-[-0.06em] text-[#FFF4E1]">
          Lista
        </span>
      )}
    </div>
  )
}
