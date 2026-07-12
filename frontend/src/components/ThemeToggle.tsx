import React from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
type ThemeToggleProps = {
  theme: 'dark' | 'light'
  onToggle: () => void
}
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isLight = theme === 'light'
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed right-5 top-5 z-50 grid h-10 w-10 place-items-center rounded-full border border-[#428475] bg-[#24453d] text-[#FFF4E1] shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#89D7B7]"
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
    >
      {isLight ? <MoonIcon size={18} /> : <SunIcon size={18} />}
    </button>
  )
}
