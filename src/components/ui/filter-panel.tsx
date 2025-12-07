import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface FilterPanelProps {
    title?: string
    children: React.ReactNode
    onClear?: () => void
    showClear?: boolean
}

export function FilterPanel({ title = "Filtros", children, onClear, showClear = true }: FilterPanelProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                {showClear && onClear && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="h-8 px-2 text-xs"
                    >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    )
}
