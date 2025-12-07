import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType = "success" | "warning" | "danger" | "info" | "default"

interface BadgeStatusProps {
    status: StatusType
    children: React.ReactNode
    className?: string
}

const statusStyles: Record<StatusType, string> = {
    success: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
    danger: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
    default: ""
}

export function BadgeStatus({ status, children, className }: BadgeStatusProps) {
    return (
        <Badge
            variant={status === "default" ? "default" : "secondary"}
            className={cn(statusStyles[status], className)}
        >
            {children}
        </Badge>
    )
}

// Helper function to determine stock status
export function getStockStatus(current: number, minimum: number): StatusType {
    const percentage = (current / minimum) * 100

    if (current === 0) return "danger"
    if (percentage <= 50) return "danger"
    if (percentage <= 100) return "warning"
    return "success"
}

// Helper function to get stock label
export function getStockLabel(current: number, minimum: number): string {
    const percentage = (current / minimum) * 100

    if (current === 0) return "Sin Stock"
    if (percentage <= 50) return "Crítico"
    if (percentage <= 100) return "Bajo"
    return "Normal"
}
