"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { RetroBox } from "@/components/retro-box"
import { RewardsList } from "@/components/rewards-list"
import { StoreInterface } from "@/components/store-interface"

export function StoreTab() {
  const [activeSection, setActiveSection] = useState<"rewards" | "store">("rewards")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl uppercase glow-text mb-6">Wasteland Store</h1>

      <div className="flex justify-around border-b-2 border-[#00ff00]/70 pb-2 mb-6">
        {(["rewards", "store"] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={cn(
              "uppercase py-1 px-3 border-2 border-[#00ff00] rounded-sm transition-all text-sm md:text-base",
              activeSection === section
                ? "bg-[#00ff00] text-[#0b3d0b] font-bold"
                : "bg-transparent hover:bg-[#00ff00]/20 glow-text",
            )}
          >
            {section === "rewards" ? "Rewards List" : "Store"}
          </button>
        ))}
      </div>

      <RetroBox>
        <div className="min-h-[400px]">
          {activeSection === "rewards" && <RewardsList />}
          {activeSection === "store" && <StoreInterface />}
        </div>
      </RetroBox>
    </div>
  )
}
