import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDashboardStats, useProductStats, useTrendStats } from "@/hooks/useStats"
import { AlertCircle, Package, TrendingUp, Users, Shield, Activity, DollarSign, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { LineChart } from "@/components/charts/LineChart"

export default function SuperadminDashboard() {
    const navigate = useNavigate()
    const { stats } = useDashboardStats()
    const { stats: productStats } = useProductStats()
    const { trendData } = useTrendStats()

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Dashboard Ejecutivo
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Visión global del sistema y métricas clave de rendimiento.
                    </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
            </div>

            {/* Métricas Ejecutivas Principales */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Productos"
                    value={productStats?.total || stats?.totalProductos || 0}
                    icon={Package}
                    description="Items registrados en catálogo"
                    className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow"
                />
                <StatCard
                    title="Movimientos Mes"
                    value={stats?.movimientosDelMes || 0}
                    icon={TrendingUp}
                    description="Operaciones realizadas"
                    className="border-t-4 border-t-green-500 shadow-sm hover:shadow-md transition-shadow"
                />
                <StatCard
                    title="Alertas Activas"
                    value={stats?.alertasActivas || 0}
                    icon={AlertCircle}
                    description="Incidencias pendientes"
                    className="border-t-4 border-t-red-500 shadow-sm hover:shadow-md transition-shadow"
                />
                <StatCard
                    title="Usuarios Activos"
                    value={stats?.usuariosActivos || 0}
                    icon={Users}
                    description="Con acceso al sistema"
                    className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow"
                />
            </div>

            {/* Gráficos y Métricas Secundarias */}
            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Tendencias del Sistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <LineChart
                            title=""
                            data={trendData}
                            xKey="mes"
                            lines={[
                                { key: "productos", name: "Productos", color: "#8b5cf6" },
                                { key: "movimientos", name: "Movimientos", color: "#3b82f6" },
                                { key: "alertas", name: "Alertas", color: "#ef4444" }
                            ]}
                            height={350}
                        />
                    </CardContent>
                </Card>

                <div className="md:col-span-3 space-y-6">
                    {/* Tarjetas de Resumen Financiero/Operativo */}
                    <Card className="hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                suma del stock de todos los productos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats?.stockTotal || "0"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Valor estimado total de activos
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-green-500/50 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Eficiencia Operativa
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                94%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Tasa de resolución de alertas
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-blue-500/50 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Actividad Diaria Promedio
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {((stats?.movimientosDelMes || 0) / 30).toFixed(0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Movimientos por día (aprox.)
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Accesos Rápidos de Gestión */}
            <Card className="bg-muted/30 border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5" />
                        Centro de Control
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-3 hover:bg-background hover:border-primary hover:text-primary transition-all group"
                            onClick={() => navigate("/usuarios")}
                        >
                            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="font-medium">Gestión Usuarios</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto py-6 flex flex-col gap-3 hover:bg-background hover:border-purple-500 hover:text-purple-600 transition-all group"
                            onClick={() => navigate("/roles")}
                        >
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                                <Shield className="h-6 w-6" />
                            </div>
                            <span className="font-medium">Gestión Roles</span>
                        </Button>

                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
