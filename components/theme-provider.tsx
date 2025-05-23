'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider themes={['pipboy', 'modern']} defaultTheme='pipboy' enableSystem={false} {...props}>{children}</NextThemesProvider>
}
