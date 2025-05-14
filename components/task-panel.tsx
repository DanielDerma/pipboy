"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { HabitsTab } from "@/components/habits-tab"
import { DailiesTab } from "@/components/dailies-tab"
import { TodosTab } from "@/components/todos-tab"
import { RetroBox } from "@/components/retro-box"

type TaskTab = "habits" | "dailies" | "todos"

export function TaskPanel() {
  const [activeTab, setActiveTab] = useState<TaskTab>("habits")

  return (
    <div className="space-y-4">
      <div className="flex justify-around border-b-2 border-[#00ff00]/70 pb-2">
        {(["habits", "dailies", "todos"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "uppercase py-1 px-3 border-2 border-[#00ff00] rounded-sm transition-all text-sm md:text-base",
              activeTab === tab
                ? "bg-[#00ff00] text-[#0b3d0b] font-bold"
                : "bg-transparent hover:bg-[#00ff00]/20 glow-text",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <RetroBox>
        <div className="min-h-[300px]">
          {activeTab === "habits" && <HabitsTab />}
          {activeTab === "dailies" && <DailiesTab />}
          {activeTab === "todos" && <TodosTab />}
        </div>
      </RetroBox>
    </div>
  )
}
