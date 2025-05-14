"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"

import { RetroBox } from "@/components/retro-box"

type InventoryItem = {
  id: number
  name: string
  quantity: number
  weight: number
  value: number
  category: "weapon" | "apparel" | "aid" | "misc" | "junk"
}

export function InventoryTab() {
  const [activeCategory, setActiveCategory] = useState<InventoryItem["category"]>("weapon")

  const inventoryItems: InventoryItem[] = [
    { id: 1, name: "10mm Pistol", quantity: 1, weight: 3, value: 250, category: "weapon" },
    { id: 2, name: "Combat Shotgun", quantity: 1, weight: 10, value: 800, category: "weapon" },
    { id: 3, name: "Laser Rifle", quantity: 1, weight: 8, value: 1200, category: "weapon" },
    { id: 4, name: "Vault 101 Jumpsuit", quantity: 1, weight: 2, value: 100, category: "apparel" },
    { id: 5, name: "Combat Armor", quantity: 1, weight: 15, value: 950, category: "apparel" },
    { id: 6, name: "Stimpak", quantity: 12, weight: 0.1, value: 75, category: "aid" },
    { id: 7, name: "RadAway", quantity: 5, weight: 0.1, value: 120, category: "aid" },
    { id: 8, name: "Nuka-Cola", quantity: 8, weight: 0.2, value: 20, category: "aid" },
    { id: 9, name: "Bottle Caps", quantity: 347, weight: 0, value: 347, category: "misc" },
    { id: 10, name: "Pre-War Money", quantity: 25, weight: 0, value: 125, category: "misc" },
    { id: 11, name: "Scrap Metal", quantity: 15, weight: 0.5, value: 10, category: "junk" },
    { id: 12, name: "Sensor Module", quantity: 3, weight: 0.5, value: 50, category: "junk" },
  ]

  const filteredItems = inventoryItems.filter((item) => item.category === activeCategory)

  const totalWeight = inventoryItems.reduce((sum, item) => sum + item.weight * item.quantity, 0)
  const maxWeight = 200

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl uppercase glow-text mb-6">Inventory</h1>

      <div className="flex justify-between items-center">
        <div className="glow-text">
          TOTAL WEIGHT: {totalWeight.toFixed(1)}/{maxWeight}
        </div>
        <div className="glow-text">
          CAPS: {inventoryItems.find((item) => item.name === "Bottle Caps")?.quantity || 0}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["weapon", "apparel", "aid", "misc", "junk"] as const).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "uppercase py-1 px-3 border-2 border-[#00ff00] rounded-md transition-all",
              activeCategory === category
                ? "bg-[#00ff00] text-[#0b3d0b] font-bold"
                : "bg-transparent hover:bg-[#00ff00]/20 glow-text",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <RetroBox>
        <div className="grid grid-cols-12 gap-2 text-sm md:text-base font-bold mb-2 uppercase">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-center">QTY</div>
          <div className="col-span-2 text-center">WG</div>
          <div className="col-span-3 text-right">Value</div>
        </div>

        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 py-2 border-b border-[#00ff00]/30 hover:bg-[#00ff00]/10 cursor-pointer"
            >
              <div className="col-span-5">{item.name}</div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-center">{(item.weight * item.quantity).toFixed(1)}</div>
              <div className="col-span-3 text-right">{item.value * item.quantity}</div>
            </div>
          ))}
        </div>
      </RetroBox>
    </div>
  )
}
