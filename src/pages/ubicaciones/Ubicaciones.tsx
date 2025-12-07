import { useEffect, useState } from "react"
import { MapPin, Warehouse, Boxes } from "lucide-react"
import { toast } from "sonner"

import api from "@/lib/api"
import { DataTable } from "@/components/ui/data-table"
import StatCard from "@/components/StatCard"
import { CreateUbicacionDialog } from "./components/CreateUbicacionDialog"
import { getColumns } from "./components/columns"
import type { Ubicacion } from "./components/columns"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Ubicaciones() {
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedUbicacion, setSelectedUbicacion] = useState<Ubicacion | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<number | null>(null)

    const fetchUbicaciones = async () => {
        try {
            const res = await api.get("/ubicaciones")
            setUbicaciones(res.data)
        } catch (error) {
            console.error("Error fetching locations", error)
            toast.error("Error al cargar ubicaciones")
        }
    }

    useEffect(() => {
        fetchUbicaciones()
    }, [])

    const handleEdit = (ubicacion: Ubicacion) => {
        setSelectedUbicacion(ubicacion)
        setEditDialogOpen(true)
    }

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return

        try {
            await api.delete(`/ubicaciones/${itemToDelete}`)
            toast.success("Ubicación eliminada")
            fetchUbicaciones()
        } catch (error) {
            console.error("Error deleting location", error)
            toast.error("Error al eliminar ubicación")
        } finally {
            setDeleteDialogOpen(false)
            setItemToDelete(null)
        }
    }

    const ubicacionesPorAlmacen = ubicaciones.reduce((acc, ubic) => {
        const almacenNombre = ubic.almacen?.nombre || "Sin almacén"
        acc[almacenNombre] = (acc[almacenNombre] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const almacenesUnicos = Object.keys(ubicacionesPorAlmacen).length

    const columns = getColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
    })

    return (
        <div className="space-y-6 p-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Gestión de Ubicaciones</h1>
                <CreateUbicacionDialog onSuccess={fetchUbicaciones} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Ubicaciones"
                    description="Registros activos"
                    value={ubicaciones.length}
                    icon={MapPin}
                    colorVariant="blue"
                />
                <StatCard
                    title="Almacenes Activos"
                    description="Con ubicaciones asignadas"
                    value={almacenesUnicos}
                    icon={Warehouse}
                    colorVariant="green"
                />
                <StatCard
                    title="Promedio"
                    description="Ubicaciones por almacén"
                    value={almacenesUnicos > 0 ? Math.round(ubicaciones.length / almacenesUnicos) : 0}
                    icon={Boxes}
                    colorVariant="orange"
                />
            </div>

            <DataTable
                title={`Listado de Ubicaciones (${ubicaciones.length})`}
                columns={columns}
                data={ubicaciones}
                filterColumn="nombre"
                exportFilename="ubicaciones.csv"
            />

            {/* Dialogo de Edición */}
            <CreateUbicacionDialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open)
                    if (!open) setSelectedUbicacion(null)
                }}
                ubicacionToEdit={selectedUbicacion}
                onSuccess={() => {
                    fetchUbicaciones()
                    setEditDialogOpen(false)
                    setSelectedUbicacion(null)
                }}
            />

            {/* Dialogo de Confirmación de Eliminación */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la ubicación.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
