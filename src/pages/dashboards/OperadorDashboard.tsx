import { useEffect, useState } from "react"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BadgeStatus, getStockStatus, getStockLabel } from "@/components/ui/badge-status"
import { useDashboardStats, useMovementStats, useProductStats } from "@/hooks/useStats"
import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, Package, TrendingUp, Clock, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

interface Alerta {
    id: number
    producto: {
        id: number
        nombre: string
        stockActual: number
        stockMinimo: number
    }
    mensaje: string
    fechaCreacion: string
}

interface Movimiento {
    id: number
    tipo: string
    cantidad: number
    producto: {
        nombre: string
    }
    almacen: {
        nombre: string
    }
    fecha: string
}

export default function OperadorDashboard() {
    const navigate = useNavigate()
    const { stats } = useDashboardStats()
    const { stats: movementStats } = useMovementStats("hoy")
    const { stats: productStats } = useProductStats()
    const [alertas, setAlertas] = useState<Alerta[]>([])
    const [movimientos, setMovimientos] = useState<Movimiento[]>([])
    const [loadingAlertas, setLoadingAlertas] = useState(true)
    const [loadingMovimientos, setLoadingMovimientos] = useState(true)

    useEffect(() => {
        const fetchAlertas = async () => {
            try {
                const res = await api.get("/alertas")
                // Filter only pending alerts and take top 3
                const pendingAlertas = res.data.filter((a: any) => !a.resuelta).slice(0, 3)
                setAlertas(pendingAlertas)
            } catch (error) {
                console.error("Error fetching alerts", error)
            } finally {
                setLoadingAlertas(false)
            }
        }

        const fetchMovimientos = async () => {
            try {
                const res = await api.get("/movimientos")
                // Get last 5 movements
                setMovimientos(res.data.slice(0, 5))
            } catch (error) {
                console.error("Error fetching movements", error)
            } finally {
                setLoadingMovimientos(false)
            }
        }

        fetchAlertas()
        fetchMovimientos()
    }, [])

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Operador</h1>
                    <p className="text-muted-foreground">Panel de control diario</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
            </div>

            {/* Alertas Críticas */}
            <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        Alertas Pendientes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingAlertas ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                        </div>
                    ) : alertas.length === 0 ? (
                        <div className="flex flex-col items-center py-4 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-8 w-8 mb-2 opacity-80" />
                            <p className="font-medium">Todo bajo control</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {alertas.map((alerta) => (
                                <div
                                    key={alerta.id}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-card rounded-lg border shadow-sm group hover:border-red-300 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium flex items-center gap-2">
                                            {alerta.producto.nombre}
                                            <BadgeStatus status={getStockStatus(alerta.producto.stockActual, alerta.producto.stockMinimo)}>
                                                {getStockLabel(alerta.producto.stockActual, alerta.producto.stockMinimo)}
                                            </BadgeStatus>
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Stock actual: <span className="font-bold">{alerta.producto.stockActual}</span> / Mínimo: {alerta.producto.stockMinimo}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigate("/movimientos")}
                                        className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                    >
                                        Abastecer
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="ghost"
                                className="w-full text-sm text-muted-foreground hover:text-foreground h-auto py-2"
                                onClick={() => navigate("/alertas")}
                            >
                                Ver todas las alertas
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resumen del Día */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Entradas Hoy"
                    value={movementStats?.totalEntradas || 0}
                    icon={ArrowDownToLine}
                    description="Registros de entrada"
                    className="border-l-4 border-l-green-500"
                />
                <StatCard
                    title="Salidas Hoy"
                    value={movementStats?.totalSalidas || 0}
                    icon={ArrowUpFromLine}
                    description="Registros de salida"
                    className="border-l-4 border-l-orange-500"
                />
                <StatCard
                    title="Total Productos"
                    value={productStats?.total || stats?.totalProductos || 0}
                    icon={Package}
                    description="En el sistema"
                    className="border-l-4 border-l-blue-500"
                />
                <StatCard
                    title="Stock Crítico"
                    value={stats?.alertasActivas || 0}
                    icon={AlertCircle}
                    description="Atención prioritaria"
                    className="border-l-4 border-l-red-500"
                />
            </div>

            {/* Acciones Rápidas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        ⚡ Acciones Rápidas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Button
                            className="h-24 text-lg font-normal shadow-sm hover:shadow-md transition-all flex flex-col gap-2"
                            onClick={() => navigate("/movimientos")}
                        >
                            <ArrowDownToLine className="h-8 w-8" />
                            Registrar Entrada
                        </Button>
                        <Button
                            className="h-24 text-lg font-normal shadow-sm hover:shadow-md transition-all flex flex-col gap-2"
                            variant="secondary"
                            onClick={() => navigate("/movimientos")}
                        >
                            <ArrowUpFromLine className="h-8 w-8" />
                            Registrar Salida
                        </Button>
                        <Button
                            className="h-24 text-lg font-normal shadow-sm hover:shadow-md transition-all flex flex-col gap-2"
                            variant="outline"
                            onClick={() => navigate("/productos")}
                        >
                            <Package className="h-8 w-8" />
                            Consultar Inventario
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Actividad Reciente */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Actividad Reciente
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingMovimientos ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : movimientos.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8 border-dashed border-2 rounded-lg">
                            No hay movimientos recientes hoy
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {movimientos.map((mov) => (
                                <div
                                    key={mov.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${mov.tipo === "ENTRADA" ? "bg-green-100 dark:bg-green-900/20" : "bg-orange-100 dark:bg-orange-900/20"}`}>
                                            {mov.tipo === "ENTRADA" ? (
                                                <ArrowDownToLine className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <ArrowUpFromLine className="h-5 w-5 text-orange-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-base">
                                                {mov.tipo === "ENTRADA" ? "Entrada" : "Salida"} de {mov.cantidad} unidades
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Package className="h-3 w-3" />
                                                <span>{mov.producto.nombre}</span>
                                                <span>•</span>
                                                <span>{mov.almacen.nombre}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-medium font-mono text-sm bg-muted px-2 py-1 rounded">
                                            {formatTime(mov.fecha)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
