'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Only show the theme switcher after mounting to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-2">
        <p className="text-sm mb-2">Theme:</p>
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            disabled={true}
            size="sm"
            className="w-full justify-start"
          >
            Pip-Boy
          </Button>
          <Button
            variant="outline"
            disabled={true}
            size="sm"
            className="w-full justify-start"
          >
            Modern
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2">
      <p className="text-sm mb-2">Theme:</p>
      <div className="flex flex-col space-y-2">
        <Button
          variant={theme === 'pipboy' ? 'default' : 'outline'}
          onClick={() => setTheme('pipboy')}
          disabled={theme === 'pipboy'}
          size="sm"
          className="w-full justify-start"
        >
          Pip-Boy
        </Button>
        <Button
          variant={theme === 'modern' ? 'default' : 'outline'}
          onClick={() => setTheme('modern')}
          disabled={theme === 'modern'}
          size="sm"
          className="w-full justify-start"
        >
          Modern
        </Button>
      </div>
    </div>
  )
}
