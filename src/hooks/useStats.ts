import { useEffect, useState } from "react"
import api from "@/lib/api"
import { toast } from "sonner"

interface DashboardStats {
    totalProductos: number
    movimientosDelMes: number
    alertasActivas: number
    usuariosActivos: number
    stockTotal: number
}

interface ProductStats {
    total: number
    conStockBajo: number
    sinStock: number
}

interface MovementStats {
    totalEntradas: number
    totalSalidas: number
    hoy: number
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/reportes/dashboard")
                setStats(res.data)
            } catch (error) {
                console.error("Error fetching dashboard stats", error)
                // Fallback to individual endpoints if dashboard endpoint doesn't exist
                try {
                    const [productos, alertas] = await Promise.all([
                        api.get("/productos"),
                        api.get("/alertas")
                    ])
                    setStats({
                        totalProductos: productos.data.length,
                        movimientosDelMes: 0,
                        alertasActivas: alertas.data.filter((a: any) => !a.resuelta).length,
                        usuariosActivos: 0,
                        stockTotal: 0
                    })
                } catch (fallbackError) {
                    toast.error("Error al cargar estadísticas")
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [])

    return { stats, isLoading }
}

export function useProductStats() {
    const [stats, setStats] = useState<ProductStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Now fetching from the real endpoint
                const res = await api.get("/reportes/productos")
                setStats(res.data)
            } catch (error) {
                console.error("Error fetching product stats", error)
                toast.error("Error al cargar estadísticas de productos")
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [])

    return { stats, isLoading }
}

export function useMovementStats(period: "hoy" | "semana" | "mes" = "hoy") {
    const [stats, setStats] = useState<MovementStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Now fetching from the real endpoint
                const res = await api.get(`/reportes/movimientos?periodo=${period}`)
                setStats(res.data)
            } catch (error) {
                console.error("Error fetching movement stats", error)
                toast.error("Error al cargar estadísticas de movimientos")
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [period])

    return { stats, isLoading }
}

interface TrendData {
    mes: string
    productos: number
    movimientos: number
    alertas: number
    entradas: number
    salidas: number
}

export function useTrendStats() {
    const [trendData, setTrendData] = useState<TrendData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                // Fetch all raw data needed for trends
                const [movimientosRes, alertasRes, productosRes] = await Promise.all([
                    api.get("/movimientos"),
                    api.get("/alertas"),
                    api.get("/productos")
                ])

                const movimientos = movimientosRes.data
                const alertas = alertasRes.data
                const productos = productosRes.data

                // Initialize last 6 months
                const months: TrendData[] = []
                for (let i = 5; i >= 0; i--) {
                    const d = new Date()
                    d.setMonth(d.getMonth() - i)
                    const monthName = d.toLocaleString('es-ES', { month: 'short' })
                    const monthKey = d.getMonth()
                    const yearKey = d.getFullYear()

                    // Filter data for this month
                    const movsInMonth = movimientos.filter((m: any) => {
                        const date = new Date(m.fecha)
                        return date.getMonth() === monthKey && date.getFullYear() === yearKey
                    })

                    const entradas = movsInMonth.filter((m: any) => m.tipo === "ENTRADA").length
                    const salidas = movsInMonth.filter((m: any) => m.tipo === "SALIDA").length

                    // For products and alerts, we'll just show current total as a "trend" baseline 
                    // or ideally we need creation dates. Assuming we don't have historical snapshots, 
                    // we might just show variability in movements properly, and projected/static for others
                    // BUT for "Alertas", we can check creation date if available.
                    const alertasInMonth = alertas.filter((a: any) => {
                        const date = new Date(a.fechaCreacion)
                        return date.getMonth() === monthKey && date.getFullYear() === yearKey
                    }).length

                    // Product growth is hard without creation date, maybe skip or just show total
                    // Let's assume proportional growth or just flat for now if no date
                    // If product has createdAt (usually standard in DB), we use it.
                    // Assuming product has 'createdAt' or 'fechaCreacion'. defaulting to current count if not.
                    const productosInMonth = productos.filter((p: any) => {
                        if (!p.fechaCreacion) return true // If no date, count all (fallback)
                        const date = new Date(p.fechaCreacion)
                        return date <= new Date(yearKey, monthKey + 1, 0) // Existed by end of month
                    }).length

                    months.push({
                        mes: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                        productos: productosInMonth,
                        movimientos: movsInMonth.length,
                        alertas: alertasInMonth,
                        entradas,
                        salidas
                    })
                }

                setTrendData(months)
            } catch (error) {
                console.error("Error calculating trends", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTrends()
    }, [])

    return { trendData, isLoading }
}
