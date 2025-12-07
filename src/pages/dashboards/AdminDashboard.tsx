import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDashboardStats, useProductStats, useMovementStats, useTrendStats } from "@/hooks/useStats"
import { AlertCircle, Package, TrendingUp, Lightbulb,  CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { LineChart } from "@/components/charts/LineChart"

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { stats,  } = useDashboardStats()
    const { stats: productStats} = useProductStats()
    const { stats: movementStats } = useMovementStats("mes")
    const { trendData, } = useTrendStats()

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
                    <p className="text-muted-foreground">Gestión y control de inventario</p>
                </div>
                <div className="p-2 bg-secondary rounded-lg">
                    <Package className="h-6 w-6 text-primary" />
                </div>
            </div>

            {/* Métricas Clave */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Productos"
                    value={productStats?.total || stats?.totalProductos || 0}
                    icon={Package}
                    description="En el catálogo"
                />
                <StatCard
                    title="Movimientos Mes"
                    value={stats?.movimientosDelMes || 0}
                    icon={TrendingUp}
                    description="Flujo de inventario"
                />
                <StatCard
                    title="Alertas Activas"
                    value={stats?.alertasActivas || 0}
                    icon={AlertCircle}
                    description="Requieren atención"
                    className={stats?.alertasActivas ? "border-red-200 dark:border-red-800" : ""}
                />
                <StatCard
                    title="Productos Críticos"
                    value={productStats?.conStockBajo || 0}
                    icon={AlertCircle}
                    description="Stock bajo o nulo"
                    className={productStats?.conStockBajo ? "border-orange-200 dark:border-orange-800" : ""}
                />
            </div>

            {/* Layout Principal */}
            <div className="grid gap-6 md:grid-cols-7">
                {/* Gráfico de Tendencias */}
                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Flujo de Movimientos (Últimos 6 Meses)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <LineChart
                            title=""
                            data={trendData}
                            xKey="mes"
                            lines={[
                                { key: "entradas", name: "Entradas", color: "#10b981" },
                                { key: "salidas", name: "Salidas", color: "#ef4444" }
                            ]}
                            height={300}
                        />
                    </CardContent>
                </Card>

                {/* Columna Derecha: Recomendaciones y Resumen */}
                <div className="md:col-span-3 space-y-6">
                    {/* Recomendaciones */}
                    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-400">
                                <Lightbulb className="h-5 w-5" />
                                Recomendaciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {productStats?.conStockBajo && productStats.conStockBajo > 0 ? (
                                    <div className="flex flex-col gap-2 p-3 bg-white dark:bg-card rounded-lg border shadow-sm">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-sm">Stock Bajo Detectado</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {productStats.conStockBajo} productos requieren reabastecimiento.
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary" className="w-full h-8" onClick={() => navigate("/productos")}>
                                            Ver Inventario
                                        </Button>
                                    </div>
                                ) : null}

                                {productStats?.sinStock && productStats.sinStock > 0 ? (
                                    <div className="flex flex-col gap-2 p-3 bg-white dark:bg-card rounded-lg border shadow-sm">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-sm">Productos Agotados</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {productStats.sinStock} productos sin stock.
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="w-full h-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" onClick={() => navigate("/productos")}>
                                            Gestionar
                                        </Button>
                                    </div>
                                ) : null}

                                {(!productStats?.conStockBajo && !productStats?.sinStock) && (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <p className="text-sm"><CheckCircle /> Inventario en estado óptimo</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resumen Simplificado */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Resumen del Mes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Entradas</span>
                                <span className="font-bold text-green-600">+{movementStats?.totalEntradas || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Salidas</span>
                                <span className="font-bold text-red-600">-{movementStats?.totalSalidas || 0}</span>
                            </div>
                            <div className="h-px bg-border my-2" />
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span>Balance Neto</span>
                                <span className={(movementStats?.totalEntradas || 0) - (movementStats?.totalSalidas || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                                    {(movementStats?.totalEntradas || 0) - (movementStats?.totalSalidas || 0)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5" onClick={() => navigate("/productos")}>
                    <Package className="h-5 w-5" />
                    <span className="font-normal">Productos</span>
                </Button>


                <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 hover:border-red-500/50 hover:bg-red-500/5" onClick={() => navigate("/alertas")}>
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-normal">Alertas</span>
                </Button>
            </div>
        </div>
    )
}
