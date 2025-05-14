"use client"

import { useState } from "react"
import { PixelProgressBar } from "@/components/pixel-progress-bar"
import { RetroBox } from "@/components/retro-box"
import { cn } from "@/lib/utils"

interface PipBoySidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
}

export function PipBoySidebar({ isCollapsed, toggleSidebar }: PipBoySidebarProps) {
  // Player stats
  const [playerStats, setPlayerStats] = useState({
    level: 15,
    currentXP: 2750,
    maxXP: 4000,
    currentHP: 85,
    maxHP: 120,
    gold: 347,
  })

  // Calculate XP percentage
  const xpPercentage = (playerStats.currentXP / playerStats.maxXP) * 100
  const hpPercentage = (playerStats.currentHP / playerStats.maxHP) * 100

  return (
    <div
      className={cn(
        "h-full border-r-2 border-[#00ff00] bg-[#0b3d0b] transition-all duration-300 overflow-hidden",
        isCollapsed ? "w-12" : "w-64",
      )}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="w-full h-10 border-b-2 border-[#00ff00] flex items-center justify-center hover:bg-[#00ff00]/20"
      >
        <div className="w-4 h-4 border-t-2 border-r-2 border-[#00ff00] transform rotate-45"></div>
      </button>

      {/* Sidebar content */}
      <div className="p-3 space-y-6">
        {/* Player avatar */}
        <div className={cn("flex flex-col items-center", isCollapsed ? "hidden" : "")}>
          <div className="w-24 h-24 border-2 border-[#00ff00] rounded-full flex items-center justify-center mb-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#0b3d0b]/80"></div>
            <div className="text-4xl font-bold glow-text relative z-10">15</div>
          </div>
          <div className="text-center glow-text text-lg">VAULT 101</div>
        </div>

        {/* Level indicator (visible when collapsed) */}
        <div className={cn("flex flex-col items-center", isCollapsed ? "" : "hidden")}>
          <div className="w-8 h-8 border-2 border-[#00ff00] rounded-full flex items-center justify-center">
            <div className="text-sm font-bold glow-text">15</div>
          </div>
        </div>

        {/* Stats */}
        <div className={cn("space-y-4", isCollapsed ? "hidden" : "")}>
          <RetroBox>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm glow-text">LEVEL</span>
                <span className="text-sm">{playerStats.level}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>XP</span>
                  <span>
                    {playerStats.currentXP}/{playerStats.maxXP}
                  </span>
                </div>
                <PixelProgressBar value={xpPercentage} />
              </div>
            </div>
          </RetroBox>

          <RetroBox>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm glow-text">HEALTH</span>
                <span className="text-sm">
                  {playerStats.currentHP}/{playerStats.maxHP}
                </span>
              </div>
              <PixelProgressBar value={hpPercentage} />
            </div>
          </RetroBox>

          <RetroBox>
            <div className="flex justify-between items-center">
              <span className="text-sm glow-text">GOLD</span>
              <span className="text-sm">{playerStats.gold}</span>
            </div>
          </RetroBox>
        </div>

        {/* Vertical indicators for collapsed state */}
        <div className={cn("space-y-6 flex flex-col items-center", isCollapsed ? "" : "hidden")}>
          {/* XP mini bar */}
          <div className="w-4 h-16 border-2 border-[#00ff00] bg-[#0b3d0b]/50 relative">
            <div className="absolute bottom-0 left-0 right-0 bg-[#00ff00]" style={{ height: `${xpPercentage}%` }}></div>
          </div>

          {/* HP mini bar */}
          <div className="w-4 h-16 border-2 border-[#00ff00] bg-[#0b3d0b]/50 relative">
            <div className="absolute bottom-0 left-0 right-0 bg-[#00ff00]" style={{ height: `${hpPercentage}%` }}></div>
          </div>

          {/* Gold indicator */}
          <div className="w-8 h-8 border-2 border-[#00ff00] flex items-center justify-center">
            <span className="text-xs">$</span>
          </div>
        </div>
      </div>
    </div>
  )
}
