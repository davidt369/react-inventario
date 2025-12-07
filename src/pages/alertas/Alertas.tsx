import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BadgeStatus, getStockStatus, getStockLabel } from "@/components/ui/badge-status"
import { FilterPanel } from "@/components/ui/filter-panel"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import api from "@/lib/api"
import { toast } from "sonner"
import { Loader2, AlertCircle, CheckCircle, ArrowDownToLine } from "lucide-react"
import { useNavigate } from "react-router-dom"

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
    resuelta: boolean
}

export default function Alertas() {
    const navigate = useNavigate()
    const [alertas, setAlertas] = useState<Alerta[]>([])
    const [filteredAlertas, setFilteredAlertas] = useState<Alerta[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [estadoFilter, setEstadoFilter] = useState("")

    const fetchAlertas = async () => {
        setIsLoading(true)
        try {
            const res = await api.get("/alertas")
            setAlertas(res.data)
            setFilteredAlertas(res.data)
        } catch (error) {
            console.error("Error fetching alerts", error)
            toast.error("Error al cargar alertas")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResolve = async (id: number) => {
        try {
            // Try to use the resolve endpoint if it exists
            await api.patch(`/alertas/${id}/resolver`)
            toast.success("Alerta marcada como resuelta")
            fetchAlertas()
        } catch (error) {
            // Fallback: delete the alert
            try {
                await api.delete(`/alertas/${id}`)
                toast.success("Alerta eliminada")
                fetchAlertas()
            } catch (deleteError) {
                console.error("Error resolving alert", deleteError)
                toast.error("Error al resolver alerta")
            }
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de eliminar esta alerta?")) return

        try {
            await api.delete(`/alertas/${id}`)
            toast.success("Alerta eliminada")
            fetchAlertas()
        } catch (error) {
            console.error("Error deleting alert", error)
            toast.error("Error al eliminar alerta")
        }
    }

    const handleFilterChange = (estado: string) => {
        setEstadoFilter(estado)
        if (estado === "") {
            setFilteredAlertas(alertas)
        } else if (estado === "pendiente") {
            setFilteredAlertas(alertas.filter(a => !a.resuelta))
        } else if (estado === "resuelta") {
            setFilteredAlertas(alertas.filter(a => a.resuelta))
        }
    }

    const handleClear = () => {
        setEstadoFilter("")
        setFilteredAlertas(alertas)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    useEffect(() => {
        fetchAlertas()
    }, [])

    const pendingCount = alertas.filter(a => !a.resuelta).length
    const resolvedCount = alertas.filter(a => a.resuelta).length

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Gestión de Alertas</h1>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{alertas.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resueltas</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
                <div className="lg:col-span-1">
                    <FilterPanel onClear={handleClear}>
                        <div>
                            <Label htmlFor="estado">Estado</Label>
                            <Select
                                value={estadoFilter || "ALL"}
                                onValueChange={(value) => handleFilterChange(value === "ALL" ? "" : value)}
                            >
                                <SelectTrigger id="estado">
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todas</SelectItem>
                                    <SelectItem value="pendiente">Pendientes</SelectItem>
                                    <SelectItem value="resuelta">Resueltas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </FilterPanel>
                </div>

                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Lista de Alertas ({filteredAlertas.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : filteredAlertas.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    ✅ No hay alertas {estadoFilter === "pendiente" ? "pendientes" : estadoFilter === "resuelta" ? "resueltas" : ""}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredAlertas.map((alerta) => (
                                        <div
                                            key={alerta.id}
                                            className={`p-4 border rounded-lg ${alerta.resuelta
                                                ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                                                : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {alerta.resuelta ? (
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        ) : (
                                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                                        )}
                                                        <h3 className="font-semibold">{alerta.producto.nombre}</h3>
                                                        <BadgeStatus
                                                            status={getStockStatus(alerta.producto.stockActual, alerta.producto.stockMinimo)}
                                                        >
                                                            {getStockLabel(alerta.producto.stockActual, alerta.producto.stockMinimo)}
                                                        </BadgeStatus>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {alerta.mensaje}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span>
                                                            Stock Actual: <span className="font-bold">{alerta.producto.stockActual}</span>
                                                        </span>
                                                        <span>
                                                            Stock Mínimo: <span className="font-bold">{alerta.producto.stockMinimo}</span>
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {formatDate(alerta.fechaCreacion)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {!alerta.resuelta && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => navigate("/movimientos")}
                                                            >
                                                                <ArrowDownToLine className="mr-1 h-4 w-4" />
                                                                Registrar Entrada
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleResolve(alerta.id)}
                                                            >
                                                                <CheckCircle className="mr-1 h-4 w-4" />
                                                                Marcar Resuelta
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(alerta.id)}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
