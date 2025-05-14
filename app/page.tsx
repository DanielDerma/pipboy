"use client"

import { useState } from "react"
import { PipBoyLayout } from "@/components/pip-boy-layout"
import { StatsTab } from "@/components/stats-tab"
import { InventoryTab } from "@/components/inventory-tab"
import { TaskPanel } from "@/components/task-panel"
import { CharacterPanel } from "@/components/character-panel"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"tasks" | "stats" | "inventory">("tasks")

  return (
    <PipBoyLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl uppercase glow-text mb-6">Task Management</h1>
          <TaskPanel />
        </div>
      )}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <CharacterPanel />
          <StatsTab />
        </div>
      )}
      {activeTab === "inventory" && <InventoryTab />}
    </PipBoyLayout>
  )
}
