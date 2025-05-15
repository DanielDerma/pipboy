"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { RetroBox } from "@/components/retro-box"

interface RetroModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function RetroModal({ isOpen, onClose, title, children, className }: RetroModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div ref={modalRef} className={cn("w-full max-w-md terminal-flicker", className)}>
        <RetroBox>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl uppercase glow-text">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 border-2 border-[#00ff00] flex items-center justify-center hover:bg-[#00ff00]/20"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-[#00ff00]" />
              </button>
            </div>
            <div className="space-y-4">{children}</div>
          </div>
        </RetroBox>
      </div>
    </div>
  )
}
