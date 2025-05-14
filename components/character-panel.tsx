import type React from "react"
import { cn } from "@/lib/utils"
import { RetroBox } from "@/components/retro-box"
import {
  Shield,
  Sword,
  FlaskRoundIcon as Flask,
  HardHatIcon as Helmet,
  DockIcon as Boots,
  Gem,
  BellRingIcon as Ring,
  Scroll,
  Heart,
} from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  icon: React.ElementType
  equipped: boolean
  slot: string
}

export function CharacterPanel() {
  // Sample inventory items
  const inventoryItems: InventoryItem[] = [
    { id: "sword", name: "Laser Sword", icon: Sword, equipped: true, slot: "weapon" },
    { id: "shield", name: "Energy Shield", icon: Shield, equipped: true, slot: "offhand" },
    { id: "helmet", name: "Combat Helmet", icon: Helmet, equipped: true, slot: "head" },
    { id: "boots", name: "Vault-Tec Boots", icon: Boots, equipped: true, slot: "feet" },
    { id: "potion", name: "Healing Potion", icon: Flask, equipped: false, slot: "consumable" },
    { id: "gem", name: "Power Crystal", icon: Gem, equipped: false, slot: "trinket" },
    { id: "ring", name: "Rad Ring", icon: Ring, equipped: true, slot: "finger" },
    { id: "scroll", name: "Tech Manual", icon: Scroll, equipped: false, slot: "consumable" },
    { id: "heart", name: "Stimpak", icon: Heart, equipped: false, slot: "consumable" },
  ]

  // Filter equipped items
  const equippedItems = inventoryItems.filter((item) => item.equipped)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl uppercase glow-text">Character Equipment</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Character Avatar */}
        <div className="md:col-span-1">
          <RetroBox>
            <div className="flex flex-col items-center space-y-4 p-2">
              <h3 className="text-lg uppercase glow-text">Vault Dweller</h3>

              {/* Character Silhouette */}
              <div className="relative w-48 h-64 border-2 border-[#00ff00] bg-[#0b3d0b]/70 rounded-sm overflow-hidden">
                {/* Scanline effect */}
                <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none"></div>

                {/* Character silhouette */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 160" className="w-32 h-48 fill-[#00ff00]/80 stroke-[#00ff00] stroke-1">
                    {/* Head */}
                    <circle cx="50" cy="30" r="20" />

                    {/* Body */}
                    <rect x="35" y="50" width="30" height="50" rx="5" />

                    {/* Arms */}
                    <rect x="15" y="55" width="20" height="10" rx="5" />
                    <rect x="65" y="55" width="20" height="10" rx="5" />

                    {/* Legs */}
                    <rect x="35" y="100" width="12" height="40" rx="3" />
                    <rect x="53" y="100" width="12" height="40" rx="3" />
                  </svg>
                </div>

                {/* Equipment indicators */}
                {equippedItems.map((item) => {
                  // Position indicators based on slot
                  let position = ""
                  switch (item.slot) {
                    case "head":
                      position = "top-4 left-1/2 transform -translate-x-1/2"
                      break
                    case "weapon":
                      position = "top-1/3 left-2"
                      break
                    case "offhand":
                      position = "top-1/3 right-2"
                      break
                    case "feet":
                      position = "bottom-4 left-1/2 transform -translate-x-1/2"
                      break
                    case "finger":
                      position = "bottom-1/3 right-4"
                      break
                    default:
                      return null
                  }

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "absolute w-6 h-6 flex items-center justify-center",
                        "border border-[#00ff00] rounded-full bg-[#0b3d0b]",
                        "glow-text pulse-glow",
                        position,
                      )}
                      title={item.name}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                  )
                })}
              </div>

              <div className="text-sm text-center">
                <p>LVL 15 HUMAN</p>
                <p>VAULT 101</p>
              </div>
            </div>
          </RetroBox>
        </div>

        {/* Inventory Grid */}
        <div className="md:col-span-2">
          <RetroBox>
            <div className="p-2 space-y-4">
              <h3 className="text-lg uppercase glow-text">Inventory</h3>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {inventoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "aspect-square border-2 border-[#00ff00] rounded-sm",
                      "flex flex-col items-center justify-center p-2",
                      "hover:bg-[#00ff00]/20 cursor-pointer transition-colors",
                      "relative overflow-hidden",
                      item.equipped ? "bg-[#00ff00]/20" : "bg-[#0b3d0b]/50",
                    )}
                    title={item.name}
                  >
                    {/* Scanline effect */}
                    <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none"></div>

                    {/* Item icon */}
                    <div className="w-8 h-8 flex items-center justify-center mb-1">
                      <item.icon
                        className={cn("w-6 h-6", item.equipped ? "text-[#00ff00] glow-text" : "text-[#00ff00]/70")}
                      />
                    </div>

                    {/* Item name */}
                    <div className="text-xs text-center truncate w-full">{item.name}</div>

                    {/* Equipped indicator */}
                    {item.equipped && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00ff00] pulse-glow"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-xs text-[#00ff00]/70 mt-2">
                Equipped items are highlighted. Click to equip/unequip.
              </div>
            </div>
          </RetroBox>
        </div>
      </div>
    </div>
  )
}
