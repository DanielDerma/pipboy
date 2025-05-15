"use client"

import { useState, useEffect } from "react"
import { PipBoyLayout } from "@/components/pip-boy-layout"
import { StatsTab } from "@/components/stats-tab"
import { InventoryTab } from "@/components/inventory-tab"
import { TaskPanel } from "@/components/task-panel"
import { CharacterPanel } from "@/components/character-panel"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { OfflineIndicator } from "@/components/offline-indicator"
import { StoreTab } from "@/components/store-tab"
import { DatabaseInitializer } from "@/components/db-initializer"
import { NotificationToast } from "@/components/notification-toast"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"tasks" | "stats" | "inventory" | "store">("tasks")
  const [dbInitialized, setDbInitialized] = useState(false)

  // Check URL parameters for initial tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get("tab")
    if (tabParam && ["tasks", "stats", "inventory", "store"].includes(tabParam)) {
      setActiveTab(tabParam as "tasks" | "stats" | "inventory" | "store")
    }
  }, [])

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("tab", activeTab)
    window.history.replaceState({}, "", url.toString())
  }, [activeTab])

  // Function to handle database initialization completion
  const handleDbInitialized = () => {
    setDbInitialized(true)
    console.log("Database initialization complete, app is ready")
  }

  return (
    <>
      <DatabaseInitializer />
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
        {activeTab === "store" && <StoreTab />}
      </PipBoyLayout>
      <PWAInstallPrompt />
      <OfflineIndicator />
      <NotificationToast />
    </>
  )
}
