"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { RetroBox } from "@/components/retro-box"
import { ChromeIcon as Google } from "lucide-react"

export default function LoginMockupMobile() {
  const [isLoading, setIsLoading] = useState(false)
  const [bootSequence, setBootSequence] = useState(true)
  const [bootText, setBootText] = useState<string[]>([])

  // Simulate boot sequence
  useEffect(() => {
    if (!bootSequence) return

    const bootMessages = ["VAULT-TEC INDUSTRIES", "INITIALIZING...", "LOADING MODULES...", "PIP-BOY 3000 READY."]

    let index = 0
    const interval = setInterval(() => {
      if (index < bootMessages.length) {
        setBootText((prev) => [...prev, bootMessages[index]])
        index++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setBootSequence(false)
        }, 1000)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [bootSequence])

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

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
        {bootSequence ? (
          <div className="w-full max-w-md h-64 border-2 border-[#00ff00] bg-[#0b3d0b]/50 p-4 overflow-hidden">
            <div className="font-mono text-[#00ff00] text-sm space-y-2">
              {bootText.map((text, index) => (
                <div key={index} className={index === bootText.length - 1 ? "terminal-flicker" : ""}>
                  {text}
                </div>
              ))}
              {bootText.length < 4 && <div className="h-4 w-3 bg-[#00ff00] animate-pulse inline-block"></div>}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-3xl uppercase glow-text mb-1">PIP-BOY 3000</h1>
              <div className="text-xs uppercase">VAULT-TEC INDUSTRIES</div>
            </div>

            <RetroBox>
              <div className="p-4 space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="text-lg uppercase glow-text">LOGIN REQUIRED</h2>
                  <p className="text-xs">SIGN IN TO CONTINUE</p>
                </div>

                <div className="flex justify-center">
                  <div className="w-16 h-16 border-2 border-[#00ff00] rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#0b3d0b]/80"></div>
                    <div className="text-2xl font-bold glow-text relative z-10">?</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className={cn(
                      "w-full py-2 border-2 border-[#00ff00] rounded-sm",
                      "flex items-center justify-center gap-2",
                      "transition-colors duration-200",
                      isLoading
                        ? "bg-[#00ff00]/10 cursor-not-allowed"
                        : "bg-[#00ff00]/20 hover:bg-[#00ff00]/30 cursor-pointer",
                    )}
                  >
                    <Google className="w-4 h-4" />
                    <span className="font-bold uppercase text-sm">{isLoading ? "SIGNING IN..." : "GOOGLE LOGIN"}</span>
                  </button>

                  {isLoading && (
                    <div className="h-2 border-2 border-[#00ff00] bg-[#0b3d0b]/50 relative overflow-hidden">
                      <div className="h-full bg-[#00ff00] absolute top-0 left-0 loading-bar"></div>
                      <div className="absolute inset-0 pixel-overlay"></div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-center opacity-70">
                  <p>AUTHORIZED ACCESS ONLY</p>
                </div>
              </div>
            </RetroBox>

            <div className="mt-4 text-center text-xs">
              <p className="glow-text">© 2077 VAULT-TEC</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
