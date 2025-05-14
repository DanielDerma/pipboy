"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import LoginMockup from "./login-mockup"
import LoginMockupMobile from "./login-mockup-mobile"
import LoginMockupDesktop from "./login-mockup-desktop"

export default function LoginMockupPreview() {
  const [activeView, setActiveView] = useState<"default" | "mobile" | "desktop">("default")

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Pip-Boy Login Mockups</h1>

        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setActiveView("default")}
            className={cn(
              "px-4 py-2 rounded",
              activeView === "default" ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600",
            )}
          >
            Standard
          </button>
          <button
            onClick={() => setActiveView("mobile")}
            className={cn(
              "px-4 py-2 rounded",
              activeView === "mobile" ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600",
            )}
          >
            Mobile
          </button>
          <button
            onClick={() => setActiveView("desktop")}
            className={cn(
              "px-4 py-2 rounded",
              activeView === "desktop" ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600",
            )}
          >
            Desktop
          </button>
        </div>

        <div className="border-4 border-gray-700 rounded-lg overflow-hidden">
          <div className="relative" style={{ height: "80vh" }}>
            {activeView === "default" && <LoginMockup />}
            {activeView === "mobile" && <LoginMockupMobile />}
            {activeView === "desktop" && <LoginMockupDesktop />}
          </div>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>These are visual mockups only. No actual authentication functionality is implemented.</p>
        </div>
      </div>
    </div>
  )
}
