interface PixelProgressBarProps {
  value: number
  max?: number
}

export function PixelProgressBar({ value, max = 100 }: PixelProgressBarProps) {
  const percentage = (Math.min(Math.max(0, value), max) / max) * 100

  return (
    <div className="h-4 md:h-5 border-2 border-[#00ff00] bg-[#0b3d0b]/50 relative overflow-hidden">
      <div className="h-full bg-[#00ff00] absolute top-0 left-0 pixel-progress" style={{ width: `${percentage}%` }} />

      {/* Pixel overlay */}
      <div className="absolute inset-0 pixel-overlay"></div>
    </div>
  )
}
