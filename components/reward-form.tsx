"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { RetroFormField } from "@/components/retro-form-field"
import { RetroModal } from "@/components/retro-modal"
import { cn } from "@/lib/utils"
import { rewardsDB, type Reward } from "@/lib/db-service"
import { notificationService } from "@/lib/notification-service"

interface RewardFormProps {
  isOpen: boolean
  onClose: () => void
}

export function RewardForm({ isOpen, onClose }: RewardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    cost: number
    redemptionCount: number
    xpValue: number
  }>({
    name: "",
    description: "",
    cost: 50,
    redemptionCount: 0,
    xpValue: 0, // This is required by the BaseTask interface but not used for rewards
  })

  const [errors, setErrors] = useState<{
    name?: string
    cost?: string
  }>({})

  const validateForm = (): boolean => {
    const newErrors: { name?: string; cost?: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "Reward name is required"
    }

    if (formData.cost <= 0) {
      newErrors.cost = "Cost must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      // Create new reward in the database
      const newReward = await rewardsDB.add({
        name: formData.name,
        description: formData.description,
        cost: formData.cost,
        redemptionCount: formData.redemptionCount,
        xpValue: 0, // Not used for rewards but required by the interface
      })

      // Notify success
      notificationService.success("Reward created successfully")

      // Reset form
      setFormData({
        name: "",
        description: "",
        cost: 50,
        redemptionCount: 0,
        xpValue: 0,
      })

      onClose()
    } catch (error) {
      console.error("Failed to create reward:", error)
      notificationService.error("Failed to create reward. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RetroModal isOpen={isOpen} onClose={onClose} title="Create New Reward">
      <form onSubmit={handleSubmit} className="space-y-4">
        <RetroFormField
          id="reward-name"
          label="Reward Name"
          value={formData.name}
          onChange={(value) => {
            setFormData({ ...formData, name: value })
            if (errors.name) setErrors({ ...errors, name: undefined })
          }}
          placeholder="Enter reward name"
          required
          className={errors.name ? "border-[#ff6b6b]" : ""}
        />
        {errors.name && <p className="text-xs text-[#ff6b6b] -mt-3">{errors.name}</p>}

        <RetroFormField
          id="reward-description"
          label="Description"
          type="textarea"
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="Enter a description (optional)"
        />

        <div className="grid grid-cols-2 gap-4">
          <RetroFormField
            id="reward-cost"
            label="Cost (CAPS)"
            type="number"
            value={formData.cost}
            onChange={(value) => {
              setFormData({ ...formData, cost: value })
              if (errors.cost) setErrors({ ...errors, cost: undefined })
            }}
            min={1}
            max={1000}
            required
            className={errors.cost ? "border-[#ff6b6b]" : ""}
          />
          {errors.cost && <p className="text-xs text-[#ff6b6b] col-span-2 -mt-3">{errors.cost}</p>}

          <RetroFormField
            id="reward-redemption-count"
            label="Times Redeemed"
            type="number"
            value={formData.redemptionCount}
            onChange={(value) => setFormData({ ...formData, redemptionCount: value })}
            min={0}
            max={100}
          />
        </div>

        <div className="border-2 border-[#00ff00]/30 bg-[#00ff00]/10 p-3 rounded-sm">
          <p className="text-sm">
            Rewards are personal incentives you can redeem with CAPS earned from completing tasks.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm flex items-center justify-center gap-2",
              isSubmitting ? "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed" : "bg-[#00ff00]/20 hover:bg-[#00ff00]/30",
            )}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Reward
          </button>
        </div>
      </form>
    </RetroModal>
  )
}
