"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Plus, Award } from "lucide-react"

type Reward = {
  id: number
  title: string
  cost: number
  redemptionCount: number
  description?: string
}

export function RewardsList() {
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      title: "Watch a Movie",
      cost: 50,
      redemptionCount: 3,
      description: "Take a break and enjoy a film of your choice.",
    },
    {
      id: 2,
      title: "Gaming Session",
      cost: 75,
      redemptionCount: 2,
      description: "One hour of uninterrupted gaming time.",
    },
    {
      id: 3,
      title: "Special Meal",
      cost: 100,
      redemptionCount: 1,
      description: "Treat yourself to your favorite meal.",
    },
    {
      id: 4,
      title: "Sleep In",
      cost: 150,
      redemptionCount: 0,
      description: "Sleep in an extra hour in the morning.",
    },
    {
      id: 5,
      title: "Buy a Book",
      cost: 200,
      redemptionCount: 0,
      description: "Purchase that book you've been wanting.",
    },
  ])

  const [playerGold, setPlayerGold] = useState(347)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)

  const handleRedeemReward = (reward: Reward) => {
    if (playerGold >= reward.cost) {
      setPlayerGold((prev) => prev - reward.cost)
      setRewards((prev) => prev.map((r) => (r.id === reward.id ? { ...r, redemptionCount: r.redemptionCount + 1 } : r)))
      setSelectedReward(reward)

      // Reset selected reward after a delay
      setTimeout(() => {
        setSelectedReward(null)
      }, 2000)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl uppercase glow-text">Personal Rewards</h2>
        <div className="text-lg glow-text">CAPS: {playerGold}</div>
      </div>

      <div className="space-y-1 text-sm mb-4">
        <p>Create and redeem rewards for completing tasks.</p>
        <p>Rewards cost CAPS but provide real-world benefits!</p>
      </div>

      {selectedReward && (
        <div className="border-2 border-[#00ff00] bg-[#00ff00]/20 p-3 text-center mb-4 task-flash">
          <span className="text-lg glow-text">Redeemed: {selectedReward.title}!</span>
        </div>
      )}

      <div className="space-y-3">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="border-2 border-[#00ff00] bg-[#0b3d0b]/70 p-3 hover:bg-[#00ff00]/10 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#00ff00]" />
                  <h3 className="text-lg glow-text">{reward.title}</h3>
                </div>
                {reward.description && <p className="text-sm ml-7 text-[#00ff00]/80">{reward.description}</p>}
              </div>

              <div className="flex items-center gap-4 ml-7 md:ml-0">
                <div className="text-sm">
                  <span className="opacity-70">Redeemed: </span>
                  <span className="glow-text">{reward.redemptionCount}×</span>
                </div>

                <div className="text-sm">
                  <span className="opacity-70">Cost: </span>
                  <span className="glow-text">{reward.cost} CAPS</span>
                </div>

                <button
                  onClick={() => handleRedeemReward(reward)}
                  disabled={playerGold < reward.cost}
                  className={cn(
                    "py-1 px-3 border-2 border-[#00ff00] rounded-sm uppercase text-sm",
                    playerGold >= reward.cost
                      ? "bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
                      : "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed",
                  )}
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button className="py-2 px-4 border-2 border-[#00ff00] rounded-sm bg-[#00ff00]/20 hover:bg-[#00ff00]/30 uppercase flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add New Reward</span>
        </button>
      </div>
    </div>
  )
}
