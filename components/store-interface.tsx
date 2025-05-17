"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ShoppingCart, Info, AlertCircle } from "lucide-react"
import { userDB, type User } from "@/lib/db-service"
import { useUser } from "@/hooks/useUser"

type ItemCategory = "weapon" | "apparel" | "aid" | "misc" | "ammo"

interface StoreItem {
  id: number
  name: string
  price: number
  category: ItemCategory
  description: string
  icon?: string
  rarity?: "common" | "uncommon" | "rare" | "legendary"
}

export function StoreInterface() {
  const { updateUser } = useUser()
  const [activeCategory, setActiveCategory] = useState<ItemCategory>("weapon")
  const [user, setUser] = useState<User | null>(null)
  const [purchaseMessage, setPurchaseMessage] = useState<{ item: string; success: boolean } | null>(null)
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null)

  // Load user data from database
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await userDB.get()
        if (!userData) {
          // Initialize user if not exists
          const newUser = await userDB.initialize()
          setUser(newUser)
        } else {
          setUser(userData)
        }
      } catch (err) {
        console.error("Failed to load user data:", err)
      }
    }

    loadUser()
  }, [])

  const storeItems: StoreItem[] = [
    // Weapons
    {
      id: 1,
      name: "10mm Pistol",
      price: 85,
      category: "weapon",
      description: "Standard sidearm with decent stopping power.",
      rarity: "common",
    },
    {
      id: 2,
      name: "Combat Shotgun",
      price: 175,
      category: "weapon",
      description: "Effective short-range weapon with spread damage.",
      rarity: "uncommon",
    },
    {
      id: 3,
      name: "Laser Rifle",
      price: 320,
      category: "weapon",
      description: "High-tech energy weapon with precision aim.",
      rarity: "rare",
    },
    {
      id: 4,
      name: "Plasma Pistol",
      price: 250,
      category: "weapon",
      description: "Compact energy weapon that fires superheated plasma.",
      rarity: "rare",
    },
    {
      id: 5,
      name: "Fat Man",
      price: 1200,
      category: "weapon",
      description: "Mini-nuke launcher. Handle with extreme caution!",
      rarity: "legendary",
    },
    {
      id: 6,
      name: "Ripper",
      price: 230,
      category: "weapon",
      description: "Handheld chainsaw for close combat situations.",
      rarity: "uncommon",
    },

    // Apparel
    {
      id: 7,
      name: "Vault 101 Jumpsuit",
      price: 50,
      category: "apparel",
      description: "Standard issue vault jumpsuit. Comfortable and durable.",
      rarity: "common",
    },
    {
      id: 8,
      name: "Combat Armor",
      price: 180,
      category: "apparel",
      description: "Provides excellent protection against physical damage.",
      rarity: "uncommon",
    },
    {
      id: 9,
      name: "Power Armor",
      price: 800,
      category: "apparel",
      description: "Heavy-duty powered armor suit for maximum protection.",
      rarity: "legendary",
    },
    {
      id: 10,
      name: "Stealth Boy",
      price: 300,
      category: "apparel",
      description: "Wearable device that generates a modulating field to transmit reflected light.",
      rarity: "rare",
    },
    {
      id: 11,
      name: "Radiation Suit",
      price: 120,
      category: "apparel",
      description: "Full-body suit that provides protection against radiation.",
      rarity: "uncommon",
    },

    // Aid
    {
      id: 12,
      name: "Stimpak",
      price: 25,
      category: "aid",
      description: "Instantly restores a portion of your health.",
      rarity: "common",
    },
    {
      id: 13,
      name: "RadAway",
      price: 30,
      category: "aid",
      description: "Reduces radiation poisoning when consumed.",
      rarity: "common",
    },
    {
      id: 14,
      name: "Med-X",
      price: 40,
      category: "aid",
      description: "Temporarily increases damage resistance.",
      rarity: "uncommon",
    },
    {
      id: 15,
      name: "Mentats",
      price: 45,
      category: "aid",
      description: "Temporarily boosts intelligence and perception.",
      rarity: "uncommon",
    },
    {
      id: 16,
      name: "Nuka-Cola Quantum",
      price: 60,
      category: "aid",
      description: "Rare variant of Nuka-Cola that restores health and action points.",
      rarity: "rare",
    },

    // Misc
    {
      id: 17,
      name: "Bobby Pin",
      price: 5,
      category: "misc",
      description: "Used for picking locks. Breaks easily.",
      rarity: "common",
    },
    {
      id: 18,
      name: "Pre-War Money",
      price: 10,
      category: "misc",
      description: "Old world currency. Collectors value these.",
      rarity: "common",
    },
    {
      id: 19,
      name: "Sensor Module",
      price: 35,
      category: "misc",
      description: "Used in crafting various electronic devices.",
      rarity: "uncommon",
    },
    {
      id: 20,
      name: "Vault-Tec Bobblehead",
      price: 100,
      category: "misc",
      description: "Collectible figurine that permanently increases a stat.",
      rarity: "rare",
    },

    // Ammo
    {
      id: 21,
      name: "10mm Rounds (50)",
      price: 25,
      category: "ammo",
      description: "Standard ammunition for 10mm pistols and SMGs.",
      rarity: "common",
    },
    {
      id: 22,
      name: "Shotgun Shells (25)",
      price: 30,
      category: "ammo",
      description: "Shells for shotguns. Effective at close range.",
      rarity: "common",
    },
    {
      id: 23,
      name: "Energy Cells (40)",
      price: 40,
      category: "ammo",
      description: "Power source for energy weapons.",
      rarity: "uncommon",
    },
    {
      id: 24,
      name: "Mini Nuke",
      price: 250,
      category: "ammo",
      description: "Ammunition for the Fat Man launcher. Extremely destructive.",
      rarity: "legendary",
    },
    {
      id: 25,
      name: "Plasma Cartridge (30)",
      price: 45,
      category: "ammo",
      description: "Ammunition for plasma-based weapons.",
      rarity: "uncommon",
    },
  ]

  const filteredItems = storeItems.filter((item) => item.category === activeCategory)

  const handlePurchase = async (item: StoreItem) => {
    if (!user) return

    if (user.caps >= item.price) {
      try {
        // Update user caps
        const updatedUser = {
          ...user,
          caps: user.caps - item.price
        }

        await updateUser(updatedUser)
        setUser(updatedUser)
        setPurchaseMessage({ item: item.name, success: true })
      } catch (err) {
        console.error("Failed to purchase item:", err)
        setPurchaseMessage({ item: item.name, success: false })
      }
    } else {
      setPurchaseMessage({ item: item.name, success: false })
    }

    setTimeout(() => {
      setPurchaseMessage(null)
    }, 2000)
  }

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "common":
        return "text-[#00ff00]"
      case "uncommon":
        return "text-[#00ffff]"
      case "rare":
        return "text-[#0088ff]"
      case "legendary":
        return "text-[#ff00ff]"
      default:
        return "text-[#00ff00]"
    }
  }

  const getItemIcon = (item: StoreItem) => {
    // This would ideally use actual icons, but for now we'll use placeholder shapes
    const iconStyle = "w-10 h-10 border-2 border-current flex items-center justify-center"

    switch (item.category) {
      case "weapon":
        return <div className={cn(iconStyle, getRarityColor(item.rarity))}>W</div>
      case "apparel":
        return <div className={cn(iconStyle, getRarityColor(item.rarity))}>A</div>
      case "aid":
        return <div className={cn(iconStyle, getRarityColor(item.rarity))}>+</div>
      case "misc":
        return <div className={cn(iconStyle, getRarityColor(item.rarity))}>?</div>
      case "ammo":
        return <div className={cn(iconStyle, getRarityColor(item.rarity))}>•</div>
      default:
        return <div className={cn(iconStyle, getRarityColor(item.rarity))}>?</div>
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl uppercase glow-text">Wasteland Trading Post</h2>
        <div className="text-lg glow-text">CAPS: {user?.caps || 0}</div>
      </div>

      {purchaseMessage && (
        <div
          className={cn(
            "border-2 p-3 text-center mb-4 task-flash",
            purchaseMessage.success ? "border-[#00ff00] bg-[#00ff00]/20" : "border-[#ff0000] bg-[#ff0000]/20",
          )}
        >
          <span className="text-lg glow-text">
            {purchaseMessage.success
              ? `Purchased: ${purchaseMessage.item}!`
              : `Not enough CAPS for ${purchaseMessage.item}!`}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {(["weapon", "apparel", "aid", "misc", "ammo"] as const).map((category) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="border-2 border-[#00ff00] bg-[#0b3d0b]/70 p-3 hover:bg-[#00ff00]/10 transition-colors"
          >
            <div className="flex gap-3">
              {getItemIcon(item)}

              <div className="flex-1">
                <h3 className={cn("text-lg font-bold", getRarityColor(item.rarity))}>{item.name}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={cn("px-1.5 py-0.5 rounded border border-current uppercase", getRarityColor(item.rarity))}
                  >
                    {item.category}
                  </span>
                  <span className="opacity-70">{item.rarity}</span>
                </div>
                <p className="text-sm mt-1 text-[#00ff00]/80 line-clamp-2">{item.description}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <div className="text-sm">
                <span className="opacity-70">Price: </span>
                <span className="glow-text">{item.price} CAPS</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                >
                  <Info className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!user || user.caps < item.price}
                  className={cn(
                    "py-1 px-3 border-2 border-[#00ff00] rounded-sm uppercase text-sm flex items-center gap-1",
                    user && user.caps >= item.price
                      ? "bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
                      : "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed",
                  )}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="w-10 h-10 mb-2 text-[#00ff00]/70" />
          <p>No items available in this category.</p>
          <p className="text-sm text-[#00ff00]/70">Check back later for restocked inventory.</p>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="border-2 border-[#00ff00] bg-[#0b3d0b] p-4 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className={cn("text-xl font-bold", getRarityColor(selectedItem.rarity))}>{selectedItem.name}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 border-2 border-[#00ff00] flex items-center justify-center hover:bg-[#00ff00]/20"
              >
                X
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              {getItemIcon(selectedItem)}

              <div>
                <div className="flex items-center gap-2 text-xs mb-2">
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded border border-current uppercase",
                      getRarityColor(selectedItem.rarity),
                    )}
                  >
                    {selectedItem.category}
                  </span>
                  <span className="opacity-70 capitalize">{selectedItem.rarity}</span>
                </div>

                <div className="text-sm">
                  <span className="opacity-70">Price: </span>
                  <span className="glow-text">{selectedItem.price} CAPS</span>
                </div>
              </div>
            </div>

            <p className="text-sm mb-6">{selectedItem.description}</p>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  handlePurchase(selectedItem)
                  setSelectedItem(null)
                }}
                disabled={!user || user.caps < selectedItem.price}
                className={cn(
                  "py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm flex items-center gap-2",
                  user && user.caps >= selectedItem.price
                    ? "bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
                    : "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed",
                )}
              >
                <ShoppingCart className="w-4 h-4" />
                Purchase Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
