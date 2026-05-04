"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <button 
      onClick={toggleTheme}
      className="border border-foreground px-2 py-1 text-[8px] font-black uppercase hover:bg-foreground hover:text-background transition-colors"
      title="Toggle theme"
    >
      {theme === "light" ? "DARK" : "LIGHT"}
    </button>
  )
}
