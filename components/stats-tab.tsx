import { PixelProgressBar } from "@/components/pixel-progress-bar"
import { RetroBox } from "@/components/retro-box"

export function StatsTab() {
  const stats = [
    { name: "STRENGTH", value: 7, max: 10 },
    { name: "PERCEPTION", value: 5, max: 10 },
    { name: "ENDURANCE", value: 6, max: 10 },
    { name: "CHARISMA", value: 4, max: 10 },
    { name: "INTELLIGENCE", value: 8, max: 10 },
    { name: "AGILITY", value: 6, max: 10 },
    { name: "LUCK", value: 5, max: 10 },
  ]

  

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl uppercase glow-text mb-6">Character Stats</h1>

      <RetroBox>
        <h2 className="text-xl uppercase glow-text mb-4">S.P.E.C.I.A.L</h2>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.name} className="space-y-1">
              <div className="flex justify-between">
                <span>{stat.name}</span>
                <span>
                  {stat.value}/{stat.max}
                </span>
              </div>
              <PixelProgressBar value={(stat.value / stat.max) * 100} />
            </div>
          ))}
        </div>
      </RetroBox>


    </div>
  )
}
