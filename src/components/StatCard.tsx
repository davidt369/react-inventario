
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    description: string
    value: number | string
    icon: LucideIcon
    colorVariant?: "blue" | "green" | "orange" | "red" | "purple" | "default"
    badge?: string
    progress?: number // 0-100
    loading?: boolean
    onClick?: () => void
    className?: string
    tooltip?: string
}

export default function StatCard({
    title,
    description,
    value,
    icon: Icon,
    colorVariant = "default",
    badge,
    progress,
    loading = false,
    onClick,
    className,
    tooltip,
}: StatCardProps) {
    const colorMap = {
        blue: {
            bg: "bg-blue-50 dark:bg-blue-950/30",
            iconBg: "bg-blue-100 dark:bg-blue-900/50",
            iconText: "text-blue-600 dark:text-blue-400",
            border: "border-blue-100 dark:border-blue-900/50",
            hover: "hover:border-blue-200 dark:hover:border-blue-800",
            progressBg: "bg-blue-600",
        },
        green: {
            bg: "bg-green-50 dark:bg-green-950/30",
            iconBg: "bg-green-100 dark:bg-green-900/50",
            iconText: "text-green-600 dark:text-green-400",
            border: "border-green-100 dark:border-green-900/50",
            hover: "hover:border-green-200 dark:hover:border-green-800",
            progressBg: "bg-green-600",
        },
        orange: {
            bg: "bg-orange-50 dark:bg-orange-950/30",
            iconBg: "bg-orange-100 dark:bg-orange-900/50",
            iconText: "text-orange-600 dark:text-orange-400",
            border: "border-orange-100 dark:border-orange-900/50",
            hover: "hover:border-orange-200 dark:hover:border-orange-800",
            progressBg: "bg-orange-600",
        },
        red: {
            bg: "bg-red-50 dark:bg-red-950/30",
            iconBg: "bg-red-100 dark:bg-red-900/50",
            iconText: "text-red-600 dark:text-red-400",
            border: "border-red-100 dark:border-red-900/50",
            hover: "hover:border-red-200 dark:hover:border-red-800",
            progressBg: "bg-red-600",
        },
        purple: {
            bg: "bg-purple-50 dark:bg-purple-950/30",
            iconBg: "bg-purple-100 dark:bg-purple-900/50",
            iconText: "text-purple-600 dark:text-purple-400",
            border: "border-purple-100 dark:border-purple-900/50",
            hover: "hover:border-purple-200 dark:hover:border-purple-800",
            progressBg: "bg-purple-600",
        },
        default: {
            bg: "bg-muted/50",
            iconBg: "bg-muted",
            iconText: "text-foreground",
            border: "border-border",
            hover: "hover:border-muted-foreground/20",
            progressBg: "bg-primary",
        },
    }

    const colors = colorMap[colorVariant] || colorMap.default

    if (loading) {
        return (
            <Card className={cn("animate-pulse", className)}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-32" />
                        <div className="h-3 bg-muted rounded w-24" />
                    </div>
                    <div className="h-10 w-10 bg-muted rounded-lg" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="h-10 bg-muted rounded w-20" />
                    <div className="h-3 bg-muted rounded w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card
                        className={cn(
                            "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                            colors.border,
                            colors.hover,
                            onClick && "cursor-pointer",
                            className
                        )}
                        onClick={onClick}
                    >
                        {/* Fondo animado sutil */}
                        <div className={cn("absolute inset-0 opacity-0 hover:opacity-10 transition-opacity", colors.bg)} />

                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                            <div className="space-y-1 flex-1">
                                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                                <p className="text-xs text-muted-foreground">{description}</p>
                            </div>
                            <div className={cn("p-2.5 rounded-lg shrink-0 animate-pulse-once", colors.iconBg, colors.iconText)}>
                                <Icon className="h-5 w-5" />
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>

                            {/* Barra de progreso opcional */}
                            {progress !== undefined && (
                                <div className="w-full bg-muted rounded-full h-1.5">
                                    <div
                                        className={cn("h-1.5 rounded-full transition-all", colors.progressBg)}
                                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                    />
                                </div>
                            )}

                            {/* Badge con icono y texto */}
                            {badge && (
                                <Badge variant="secondary" className="text-xs">
                                    {badge}
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                {tooltip && <TooltipContent side="bottom">{tooltip}</TooltipContent>}
            </Tooltip>
        </TooltipProvider>
    )
}