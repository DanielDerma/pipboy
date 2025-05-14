import type { ReactNode } from "react"

interface RetroBoxProps {
  children: ReactNode
}

export function RetroBox({ children }: RetroBoxProps) {
  return (
    <div className="border-2 border-[#00ff00] bg-[#0b3d0b]/50 p-4 rounded-sm relative">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00ff00] -translate-x-1 -translate-y-1"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00ff00] translate-x-1 -translate-y-1"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00ff00] -translate-x-1 translate-y-1"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00ff00] translate-x-1 translate-y-1"></div>

      {children}
    </div>
  )
}
