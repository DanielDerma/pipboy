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

  const skills = [
    { name: "Small Guns", value: 65 },
    { name: "Big Guns", value: 30 },
    { name: "Energy Weapons", value: 45 },
    { name: "Unarmed", value: 55 },
    { name: "Melee Weapons", value: 40 },
    { name: "Throwing", value: 35 },
    { name: "First Aid", value: 70 },
    { name: "Doctor", value: 50 },
    { name: "Sneak", value: 60 },
    { name: "Lockpick", value: 75 },
    { name: "Science", value: 80 },
    { name: "Repair", value: 65 },
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

      <RetroBox>
        <h2 className="text-xl uppercase glow-text mb-4">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div key={skill.name} className="space-y-1">
              <div className="flex justify-between">
                <span>{skill.name}</span>
                <span>{skill.value}%</span>
              </div>
              <PixelProgressBar value={skill.value} />
            </div>
          ))}
        </div>
      </RetroBox>
    </div>
  )
}
