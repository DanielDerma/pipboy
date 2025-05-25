'use client';

import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';

// Assuming vt323.variable is globally available if needed,
// or passed via context if it were truly dynamic.
// For this component, we mainly care about toggling 'font-mono'.
// The base classes like 'h-full' and the font variable class (e.g., __variable_b4e394)
// are assumed to be set on the body tag in app/layout.tsx.

export function ThemedBody({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    // Start with the classes already on the body from the layout
    // and remove any theme-specific font classes we might have added.
    const body = document.body;
    const existingClasses = body.className.split(' ').filter(
      cn => cn !== 'font-mono'
    ).join(' ');

    let newClasses = existingClasses;

    if (theme === 'pipboy') {
      if (!newClasses.includes('font-mono')) {
        newClasses += ' font-mono';
      }
    }
    // No specific class needed for 'modern' theme's font,
    // as it's handled by 'html.modern body' in globals.css
    // and the absence of 'font-mono' on the body.

    body.className = newClasses.trim();

  }, [theme]);

  return <>{children}</>;
}
