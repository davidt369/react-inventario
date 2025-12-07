import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatCard from "@/components/StatCard"
import { CreateAlmacenDialog } from "./components/CreateAlmacenDialog"
import { EditAlmacenDialog } from "./components/EditAlmacenDialog"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Trash2, Warehouse, MapPin, Package } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"

interface Almacen {
    id: number
    nombre: string
    direccion: string
}

export default function Almacenes() {
    const [almacenes, setAlmacenes] = useState<Almacen[]>([])
    const [ubicacionesCount, setUbicacionesCount] = useState<Record<number, number>>({})
    const [isLoading, setIsLoading] = useState(true)

    const fetchAlmacenes = async () => {
        setIsLoading(true)
        try {
            const [almRes, ubicRes] = await Promise.all([
                api.get("/almacenes"),
                api.get("/ubicaciones")
            ])
            setAlmacenes(almRes.data)

            // Count ubicaciones per almacen
            const counts: Record<number, number> = {}
            ubicRes.data.forEach((ubic: any) => {
                if (ubic.almacen?.id) {
                    counts[ubic.almacen.id] = (counts[ubic.almacen.id] || 0) + 1
                }
            })
            setUbicacionesCount(counts)
        } catch (error) {
            console.error("Error fetching warehouses", error)
            toast.error("Error al cargar almacenes")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        const ubicCount = ubicacionesCount[id] || 0
        if (ubicCount > 0) {
            toast.error(`No se puede eliminar. Hay ${ubicCount} ubicaciones en este almacén`)
            return
        }

        if (!confirm("¿Está seguro de eliminar este almacén?")) return

        try {
            await api.delete(`/almacenes/${id}`)
            toast.success("Almacén eliminado")
            fetchAlmacenes()
        } catch (error) {
            console.error("Error deleting warehouse", error)
            toast.error("Error al eliminar almacén")
        }
    }

    useEffect(() => {
        fetchAlmacenes()
    }, [])

    const totalUbicaciones = Object.values(ubicacionesCount).reduce((sum, count) => sum + count, 0)
    const almacenesConUbicaciones = Object.keys(ubicacionesCount).length
    const almacenesSinUbicaciones = almacenes.length - almacenesConUbicaciones

    const columns: ColumnDef<Almacen>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <div className="text-xs sm:text-sm">{row.getValue("id")}</div>,
        },
        {
            accessorKey: "nombre",
            header: "Nombre",
            cell: ({ row }) => <div className="font-medium text-xs sm:text-sm">{row.getValue("nombre")}</div>,
        },
        {
            accessorKey: "direccion",
            header: "Dirección",
            cell: ({ row }) => <div className="text-xs sm:text-sm text-gray-500">{row.getValue("direccion")}</div>,
        },
        {
            id: "ubicaciones",
            header: "Ubicaciones",
            cell: ({ row }) => (
                <span className="font-bold text-xs sm:text-sm">
                    {ubicacionesCount[row.original.id] || 0} ubicaciones
                </span>
            ),
        },
        {
            id: "acciones",
            header: () => <div className="text-right text-xs sm:text-sm">Acciones</div>,
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex justify-end gap-1">
                        <EditAlmacenDialog almacen={item} onSuccess={fetchAlmacenes} />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            disabled={ubicacionesCount[item.id] > 0}
                            title={ubicacionesCount[item.id] > 0 ? "No se puede eliminar un almacén con ubicaciones" : "Eliminar almacén"}
                        >
                            <Trash2 className={`h-4 w-4 ${ubicacionesCount[item.id] > 0 ? 'text-gray-300' : 'text-red-500'}`} />
                        </Button>
                    </div>
                )
            },
        },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Cargando almacenes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Gestión de Almacenes</h1>
                <CreateAlmacenDialog onSuccess={fetchAlmacenes} />
            </div>

            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Total Almacenes"
                    description="Registrados"
                    value={almacenes.length}
                    icon={Warehouse}
                    colorVariant="default"
                />
                <StatCard
                    title="Con Ubicaciones"
                    description="Almacenes activos"
                    value={almacenesConUbicaciones}
                    icon={MapPin}
                    colorVariant="green"
                />
                <StatCard
                    title="Sin Ubicaciones"
                    description="Almacenes vacíos"
                    value={almacenesSinUbicaciones}
                    icon={MapPin}
                    colorVariant="orange"
                />
                <StatCard
                    title="Total Ubicaciones"
                    description="Capacidad global"
                    value={totalUbicaciones}
                    icon={Package}
                    colorVariant="blue"
                />
            </div>

            {/* Tabla de Almacenes */}
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Listado de Almacenes ({almacenes.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-6 pt-0">
                    <DataTable
                        columns={columns}
                        data={almacenes}
                        filterColumn="nombre"
                        exportFilename="almacenes.csv"
                    />
                </CardContent>
            </Card>
        </div>
    )
}
