"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Plus, Award, Loader2, AlertCircle, Trash2 } from "lucide-react"
import { rewardsDB, type Reward, userDB, type User } from "@/lib/db-service"
import { notificationService } from "@/lib/notification-service"
import { RewardForm } from "@/components/reward-form"
import { RetroModal } from "@/components/retro-modal"
import { useUser } from "@/hooks/useUser"

export function RewardsList() {
  const { updateUser } = useUser()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load rewards and user data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [rewardsData, userData] = await Promise.all([
          rewardsDB.getAll(),
          userDB.get()
        ])
        
        if (!userData) {
          // Initialize user if not exists
          const newUser = await userDB.initialize()
          setUser(newUser)
        } else {
          setUser(userData)
        }
        
        setRewards(rewardsData)
        setError(null)
      } catch (err) {
        console.error("Failed to load data:", err)
        setError("Failed to load data. Please try again.")
        notificationService.error("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleRedeemReward = async (reward: Reward) => {
    if (!user) return
    
    if (user.caps >= reward.cost) {
      try {
        // Disable the redeem button immediately to prevent double-clicks
        const updatedReward = {
          ...reward,
          redemptionCount: reward.redemptionCount + 1,
          updatedAt: Date.now()
        }

        // Update user caps
        const updatedUser = {
          ...user,
          caps: user.caps - reward.cost,
          updatedAt: Date.now()
        }

        // Update local state first to prevent UI lag
        setUser(updatedUser)
        setRewards((prev) => prev.map((r) => (r.id === reward.id ? updatedReward : r)))
        setSelectedReward(reward)

        // Then update the database
        await Promise.all([
          rewardsDB.update(updatedReward),
          updateUser(updatedUser)
        ])

        notificationService.success(`Redeemed: ${reward.name}!`)

        // Reset selected reward after a delay
        setTimeout(() => {
          setSelectedReward(null)
        }, 2000)
      } catch (err) {
        console.error("Failed to redeem reward:", err)
        // Revert local state on error
        setUser(user)
        setRewards((prev) => prev.map((r) => (r.id === reward.id ? reward : r)))
        notificationService.error("Failed to redeem reward")
      }
    } else {
      notificationService.warning("Not enough CAPS to redeem this reward")
    }
  }

  const handleDeleteReward = async () => {
    if (!selectedReward) return

    try {
      setIsDeleting(true)
      await rewardsDB.delete(selectedReward.id)

      // Update local state
      setRewards((prev) => prev.filter((r) => r.id !== selectedReward.id))
      setIsDeleteModalOpen(false)
      notificationService.success("Reward deleted successfully")
    } catch (err) {
      console.error("Failed to delete reward:", err)
      notificationService.error("Failed to delete reward")
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteModal = (reward: Reward) => {
    setSelectedReward(reward)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl uppercase glow-text">Personal Rewards</h2>
        <div className="text-lg glow-text">CAPS: {user?.caps || 0}</div>
      </div>

      <div className="space-y-1 text-sm mb-4">
        <p>Create and redeem rewards for completing tasks.</p>
        <p>Rewards cost CAPS but provide real-world benefits!</p>
      </div>

      {selectedReward && (
        <div className="border-2 border-[#00ff00] bg-[#00ff00]/20 p-3 text-center mb-4 task-flash">
          <span className="text-lg glow-text">Redeemed: {selectedReward.name}!</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-[#00ff00]/50 bg-[#0b3d0b]/30 rounded-sm">
          <Loader2 className="w-10 h-10 mb-2 text-[#00ff00]/70 animate-spin" />
          <p>Loading rewards...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-[#ff6b6b]/50 bg-[#0b3d0b]/30 rounded-sm">
          <AlertCircle className="w-10 h-10 mb-2 text-[#ff6b6b]/70" />
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
          >
            Retry
          </button>
        </div>
      ) : rewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-[#00ff00]/50 bg-[#0b3d0b]/30 rounded-sm">
          <Award className="w-10 h-10 mb-2 text-[#00ff00]/70" />
          <p>No rewards created yet.</p>
          <p className="text-sm text-[#00ff00]/70 mt-1">Create your first reward to start redeeming!</p>
        </div>
      ) : (
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
                    <h3 className="text-lg glow-text">{reward.name}</h3>
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={!user || user.caps < reward.cost}
                      className={cn(
                        "py-1 px-3 border-2 border-[#00ff00] rounded-sm uppercase text-sm",
                        user && user.caps >= reward.cost
                          ? "bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
                          : "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed",
                      )}
                    >
                      Redeem
                    </button>

                    <button
                      onClick={() => openDeleteModal(reward)}
                      className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-[#00ff00]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsFormOpen(true)}
          className="py-2 px-4 border-2 border-[#00ff00] rounded-sm bg-[#00ff00]/20 hover:bg-[#00ff00]/30 uppercase flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Reward</span>
        </button>
      </div>

      {/* Reward Form Modal */}
      <RewardForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      {/* Delete Confirmation Modal */}
      <RetroModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Reward">
        <div className="space-y-4">
          <p>
            Are you sure you want to delete <span className="font-bold">{selectedReward?.name}</span>?
          </p>
          <p className="text-sm text-[#00ff00]/70">This action cannot be undone.</p>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteReward}
              disabled={isDeleting}
              className={cn(
                "py-2 px-4 border-2 border-[#ff6b6b] rounded-sm uppercase text-sm text-[#ff6b6b] flex items-center justify-center gap-2",
                isDeleting ? "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed" : "bg-[#ff6b6b]/20 hover:bg-[#ff6b6b]/30",
              )}
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </RetroModal>
    </div>
  )
}
