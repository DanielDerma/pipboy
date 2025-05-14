"use client"

import { useState, useEffect } from "react"
import { RetroBox } from "@/components/retro-box"
import { X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Store the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent)
      // Show the install button
      setIsVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setIsVisible(false)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", () => {})
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return

    // Show the install prompt
    await installPrompt.prompt()

    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice

    // Reset the install prompt variable
    setInstallPrompt(null)

    // Hide the install button
    if (choiceResult.outcome === "accepted") {
      setIsVisible(false)
    }
  }

  const dismissPrompt = () => {
    setIsVisible(false)
  }

  if (!isVisible || isInstalled) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <RetroBox>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg uppercase glow-text">INSTALL PIP-BOY</h3>
            <button
              onClick={dismissPrompt}
              className="w-8 h-8 border-2 border-[#00ff00] flex items-center justify-center hover:bg-[#00ff00]/20"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-[#00ff00]" />
            </button>
          </div>
          <p className="text-sm">Install the Pip-Boy 3000 on your device for offline access and a better experience.</p>
          <button
            onClick={handleInstallClick}
            className="w-full py-2 border-2 border-[#00ff00] bg-[#00ff00]/20 hover:bg-[#00ff00]/30 text-[#00ff00] uppercase font-bold"
          >
            Install Now
          </button>
        </div>
      </RetroBox>
    </div>
  )
}
