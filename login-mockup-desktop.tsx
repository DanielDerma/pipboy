"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { RetroBox } from "@/components/retro-box"
import { ChromeIcon as Google, Lock, Terminal } from "lucide-react"

export default function LoginMockupDesktop() {
  const [isLoading, setIsLoading] = useState(false)
  const [bootSequence, setBootSequence] = useState(true)
  const [bootText, setBootText] = useState<string[]>([])
  const [terminalLines, setTerminalLines] = useState<string[]>([])

  // Simulate boot sequence
  useEffect(() => {
    if (!bootSequence) return

    const bootMessages = [
      "VAULT-TEC INDUSTRIES (C) 2077-2077",
      "INITIALIZING BOOT SEQUENCE...",
      "LOADING SYSTEM MODULES...",
      "CHECKING MEMORY INTEGRITY... OK",
      "ESTABLISHING SECURE CONNECTION... OK",
      "INITIALIZING PIP-BOY 3000... OK",
      "LOADING USER AUTHENTICATION MODULE...",
      "READY.",
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < bootMessages.length) {
        setBootText((prev) => [...prev, bootMessages[index]])
        index++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setBootSequence(false)
          simulateTerminal()
        }, 1000)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [bootSequence])

  // Simulate terminal activity in the background
  const simulateTerminal = () => {
    const terminalText = [
      "> SCANNING NETWORK...",
      "> CHECKING AUTHENTICATION SERVERS...",
      "> SECURE CONNECTION ESTABLISHED",
      "> WAITING FOR USER AUTHENTICATION...",
      "> SYSTEM READY",
      "> _",
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < terminalText.length) {
        setTerminalLines((prev) => [...prev, terminalText[index]])
        index++
      } else {
        clearInterval(interval)
      }
    }, 1500)

    return () => clearInterval(interval)
  }

  // Simulate loading when button is clicked
  const handleSignIn = () => {
    setIsLoading(true)
    // This is just for the mockup - no actual authentication happens
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
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

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="border-b-2 border-[#00ff00] p-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl uppercase glow-text">PIP-BOY 3000</div>
            <div className="text-sm glow-text">VAULT-TEC INDUSTRIES</div>
          </div>
        </header>

        {bootSequence ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl h-96 border-2 border-[#00ff00] bg-[#0b3d0b]/50 p-4 overflow-hidden">
              <div className="font-mono text-[#00ff00] text-base space-y-2">
                {bootText.map((text, index) => (
                  <div key={index} className={index === bootText.length - 1 ? "terminal-flicker" : ""}>
                    {text}
                  </div>
                ))}
                {bootText.length < 8 && <div className="h-4 w-3 bg-[#00ff00] animate-pulse inline-block"></div>}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Login Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <RetroBox>
                  <div className="p-6 space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl uppercase glow-text">AUTHENTICATION REQUIRED</h2>
                      <p className="text-sm">PLEASE SIGN IN TO ACCESS YOUR PIP-BOY</p>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-24 h-24 border-2 border-[#00ff00] rounded-full flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#0b3d0b]/80"></div>
                        <div className="text-4xl font-bold glow-text relative z-10">?</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="w-4 h-4" />
                        <span>SECURE AUTHENTICATION PROTOCOL</span>
                      </div>

                      <button
                        onClick={handleSignIn}
                        disabled={isLoading}
                        className={cn(
                          "w-full py-3 border-2 border-[#00ff00] rounded-sm",
                          "flex items-center justify-center gap-3",
                          "transition-colors duration-200",
                          isLoading
                            ? "bg-[#00ff00]/10 cursor-not-allowed"
                            : "bg-[#00ff00]/20 hover:bg-[#00ff00]/30 cursor-pointer",
                        )}
                      >
                        <Google className="w-5 h-5" />
                        <span className="font-bold uppercase">
                          {isLoading ? "AUTHENTICATING..." : "SIGN IN WITH GOOGLE"}
                        </span>
                      </button>

                      {isLoading && (
                        <div className="h-2 border-2 border-[#00ff00] bg-[#0b3d0b]/50 relative overflow-hidden">
                          <div className="h-full bg-[#00ff00] absolute top-0 left-0 loading-bar"></div>
                          <div className="absolute inset-0 pixel-overlay"></div>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-center opacity-70">
                      <p>AUTHORIZED PERSONNEL ONLY</p>
                      <p>VAULT-TEC SECURITY PROTOCOLS ACTIVE</p>
                    </div>
                  </div>
                </RetroBox>
              </div>
            </div>

            {/* Terminal */}
            <div className="hidden md:flex items-center justify-center">
              <RetroBox>
                <div className="p-4 w-full h-96 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <Terminal className="w-4 h-4" />
                    <span className="uppercase">Terminal Output</span>
                  </div>
                  <div className="font-mono text-[#00ff00] text-sm space-y-2 h-full overflow-auto">
                    {terminalLines.map((line, index) => (
                      <div key={index} className={index === terminalLines.length - 1 ? "terminal-flicker" : ""}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </RetroBox>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t-2 border-[#00ff00] p-2 flex justify-between items-center text-sm">
          <div className="glow-text">STATUS: AWAITING AUTHENTICATION</div>
          <div className="glow-text">
            {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
          </div>
        </footer>
      </div>
    </div>
  )
}
