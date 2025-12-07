import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

  

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative h-9 w-9 overflow-hidden rounded-full transition-all hover:scale-110"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

                {/* Efecto de onda */}
                <span className="absolute inset-0 bg-primary/10 rounded-full scale-0 transition-transform duration-500 group-active:scale-150" />
            </Button>



        </div >
    )
}