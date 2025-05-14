import { PixelProgressBar } from "@/components/pixel-progress-bar"
import { RetroBox } from "@/components/retro-box"

export function TasksTab() {
  const tasks = [
    {
      id: 1,
      title: "Find Water Chip",
      progress: 75,
      description: "Locate a replacement water purification chip for Vault 13.",
    },
    {
      id: 2,
      title: "Clear Radroaches",
      progress: 30,
      description: "Eliminate the radroach infestation in the lower levels.",
    },
    {
      id: 3,
      title: "Repair Power Generator",
      progress: 50,
      description: "Fix the malfunctioning power generator in Sector 7.",
    },
    {
      id: 4,
      title: "Scout Wasteland",
      progress: 10,
      description: "Explore the surrounding wasteland for resources and threats.",
    },
    {
      id: 5,
      title: "Trade with Settlers",
      progress: 0,
      description: "Establish trade relations with nearby settlement.",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl uppercase glow-text mb-6">Active Tasks</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => (
          <RetroBox key={task.id}>
            <div className="space-y-3">
              <h2 className="text-xl uppercase glow-text">{task.title}</h2>
              <PixelProgressBar value={task.progress} />
              <p className="text-sm md:text-base">{task.description}</p>
              <div className="text-right text-sm">
                STATUS: {task.progress === 0 ? "NOT STARTED" : task.progress < 100 ? "IN PROGRESS" : "COMPLETED"}
              </div>
            </div>
          </RetroBox>
        ))}
      </div>
    </div>
  )
}
