import { Card, CardContent } from "@/components/ui/card"
import { BadgeStatus, getStockStatus, getStockLabel } from "@/components/ui/badge-status"
import {
    Package,
    Folder,
    Truck,
    ArrowUp,
    ArrowDown
} from "lucide-react"

interface Producto {
    id: number
    nombre: string
    descripcion: string
    stockActual: number
    stockMinimo: number
    categoria?: { nombre: string }
    proveedor?: { nombre: string }
}

interface ProductCardProps {
    producto: Producto
    onClick?: () => void
    className?: string
}

export function ProductCard({ producto, onClick, className }: ProductCardProps) {
    const status = getStockStatus(producto.stockActual, producto.stockMinimo)
    const label = getStockLabel(producto.stockActual, producto.stockMinimo)
    const percentage = (producto.stockActual / producto.stockMinimo) * 100
    const isLow = percentage < 100

    return (
        <Card
            className={`cursor-pointer hover:shadow-md transition-shadow rounded-lg ${className}`}
            onClick={onClick}
            title={`Ver detalles de ${producto.nombre}`}
        >
            <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-base">{producto.nombre}</h3>
                    </div>
                    <BadgeStatus status={status}>{label}</BadgeStatus>
                </div>

                {/* Descripción */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {producto.descripcion}
                </p>

                {/* Stock */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stock</span>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">{producto.stockActual}</span>
                        <span className="text-muted-foreground">/ {producto.stockMinimo}</span>
                        {isLow ? (
                            <ArrowDown className="h-4 w-4 text-red-500" />
                        ) : (
                            <ArrowUp className="h-4 w-4 text-green-500" />
                        )}
                    </div>
                </div>

                {/* Barra de progreso */}
                <div
                    className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"
                    title={`${percentage.toFixed(0)}% del mínimo`}
                >
                    <div
                        className={`h-2 rounded-full transition-all ${status === "success" ? "bg-green-600" :
                            status === "warning" ? "bg-yellow-600" :
                                "bg-red-600"
                            }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>

                {/* Categoría y proveedor */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {producto.categoria && (
                        <div className="flex items-center gap-1">
                            <Folder className="h-4 w-4" />
                            <span>{producto.categoria.nombre}</span>
                        </div>
                    )}
                    {producto.proveedor && (
                        <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            <span>{producto.proveedor.nombre}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}