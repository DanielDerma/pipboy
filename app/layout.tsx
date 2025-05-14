import type React from "react"
import type { Metadata } from "next"
import { VT323 } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
})

export const metadata: Metadata = {
  title: "Pip-Boy Interface",
  description: "A Fallout-inspired Pip-Boy interface",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${vt323.variable} font-mono h-full`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
