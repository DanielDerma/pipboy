"use client"

import { useState, useEffect } from "react"
import { PipBoyLayout } from "@/components/pip-boy-layout"
import { StatsTab } from "@/components/stats-tab"
import { InventoryTab } from "@/components/inventory-tab"
import { TaskPanel } from "@/components/task-panel"
import { CharacterPanel } from "@/components/character-panel"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { OfflineIndicator } from "@/components/offline-indicator"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"tasks" | "stats" | "inventory">("tasks")

  // Check URL parameters for initial tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get("tab")
    if (tabParam && ["tasks", "stats", "inventory"].includes(tabParam)) {
      setActiveTab(tabParam as "tasks" | "stats" | "inventory")
    }
  }, [])

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("tab", activeTab)
    window.history.replaceState({}, "", url.toString())
  }, [activeTab])

  return (
    <>
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
      <PWAInstallPrompt />
      <OfflineIndicator />
    </>
  )
}
