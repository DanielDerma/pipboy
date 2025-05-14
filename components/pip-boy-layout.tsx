"use client"

import { useState, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { PipBoySidebar } from "@/components/pip-boy-sidebar"
import { LoadingScreen } from "@/components/loading-screen"

interface PipBoyLayoutProps {
  children: ReactNode
  activeTab: "tasks" | "stats" | "inventory"
  setActiveTab: (tab: "tasks" | "stats" | "inventory") => void
}

export function PipBoyLayout({ children, activeTab, setActiveTab }: PipBoyLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [content, setContent] = useState<ReactNode>(children)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Handle initial CRT power-on effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Handle tab changes with loading screen
  useEffect(() => {
    if (isInitialLoad) {
      setContent(children)
      return
    }

    const getLoadingMessage = () => {
      switch (activeTab) {
        case "tasks":
          return "LOADING TASK DATA"
        case "stats":
          return "LOADING STAT DATA"
        case "inventory":
          return "LOADING INVENTORY DATA"
        default:
          return "LOADING DATA"
      }
    }

    setLoadingMessage(getLoadingMessage())
    setIsLoading(true)

    // Store the children that were passed when loading started
    const currentChildren = children

    // After loading completes, update the content
    const timer = setTimeout(() => {
      setContent(currentChildren)
    }, 1000)

    return () => clearTimeout(timer)
  }, [activeTab, children, isInitialLoad])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0b3d0b] text-[#00ff00] font-mono">
      {/* Global screen effects */}
      <div className="horizontal-scanlines"></div>
      <div className="moving-scanline"></div>
      <div className="screen-noise"></div>

      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-scanlines opacity-15"></div>

      {/* CRT glow effect */}
      <div className="absolute inset-0 pointer-events-none z-40 crt-glow"></div>

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none z-30 vignette"></div>

      {/* Loading screen */}
      <LoadingScreen isLoading={isLoading} onLoadingComplete={handleLoadingComplete} message={loadingMessage} />

      <div className={`relative z-10 h-full flex flex-col ${isInitialLoad ? "crt-on" : ""}`}>
        {/* Top navigation bar */}
        <nav className="border-b-2 border-[#00ff00] p-2 md:p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 text-center text-xl md:text-2xl glow-text">PIP-BOY 3000</div>
            <div className="hidden md:block text-sm glow-text">VAULT-TEC INDUSTRIES</div>
          </div>

          <div className="flex justify-around mt-4">
            {["tasks", "stats", "inventory"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "tasks" | "stats" | "inventory")}
                className={cn(
                  "uppercase text-lg md:text-xl py-2 px-4 border-2 border-[#00ff00] rounded-t-md transition-all",
                  activeTab === tab
                    ? "bg-[#00ff00] text-[#0b3d0b] font-bold"
                    : "bg-transparent hover:bg-[#00ff00]/20 glow-text",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {/* Main content area with sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <PipBoySidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
          </div>

          {/* Main content area */}
          <main className="flex-1 overflow-auto p-4 md:p-6 retro-terminal">{content}</main>
        </div>

        {/* Bottom status bar */}
        <footer className="border-t-2 border-[#00ff00] p-2 flex justify-between items-center text-sm">
          <div className="glow-text">HP 120/120</div>
          <div className="glow-text">RAD 0</div>
          <div className="glow-text">
            {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
          </div>
        </footer>
      </div>
    </div>
  )
}
