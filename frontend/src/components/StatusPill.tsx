import React from 'react'
type StatusPillProps = {
  state: 'Offline — will sync' | 'Pending confirmation' | 'Confirmed'
}
export function StatusPill({ state }: StatusPillProps) {
  let colors = ''
  if (state === 'Confirmed') {
    colors = 'border-[#428475] text-[#89D7B7]'
  } else if (state === 'Offline — will sync') {
    colors = 'border-[#DCA953] text-[#DCA953]'
  } else {
    colors = 'border-[#FFF4E1]/30 text-[#FFF4E1]/80'
  }

  return (
    <span className={`inline-flex items-center rounded-full border bg-transparent px-3 py-1 text-[11px] font-bold ${colors}`}>
      {state}
    </span>
  )
}
