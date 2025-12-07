"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft } from "lucide-react"
import { toast } from "sonner"

import api from "@/lib/api"
import { DataTable } from "@/components/ui/data-table"
import StatCard from "@/components/StatCard"
import { MovimientoFilters, type MovimientoFilters as MovimientoFiltersType } from "@/components/movimientos/MovimientoFilters"
import { MovimientoDialog } from "./components/MovimientoDialog"
import { getColumns } from "./components/columns"
import type { Movimiento } from "./components/columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function Movimientos() {
    const { user } = useAuth()
    const [movimientos, setMovimientos] = useState<Movimiento[]>([])
    const [filteredMovimientos, setFilteredMovimientos] = useState<Movimiento[]>([])

    // State for CRUD
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [movimientoToEdit, setMovimientoToEdit] = useState<Movimiento | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [movimientoToDelete, setMovimientoToDelete] = useState<Movimiento | null>(null)

    const fetchMovimientos = async () => {
        try {
            const res = await api.get("/movimientos")
            setMovimientos(res.data)
            setFilteredMovimientos(res.data)
        } catch (error) {
            console.error("Error fetching movements", error)
            toast.error("Error al cargar movimientos")
        }
    }

    useEffect(() => {
        fetchMovimientos()
    }, [])

    const handleFilterChange = (filters: MovimientoFiltersType) => {
        let filtered = [...movimientos]

        if (filters.tipo) filtered = filtered.filter((m) => m.tipo === filters.tipo)
        if (filters.productoId) filtered = filtered.filter((m) => m.producto.id.toString() === filters.productoId)
        if (filters.almacenId) filtered = filtered.filter((m) => m.almacen.id.toString() === filters.almacenId)
        if (filters.fechaInicio) filtered = filtered.filter((m) => new Date(m.fecha) >= new Date(filters.fechaInicio))
        if (filters.fechaFin) {
            const endDate = new Date(filters.fechaFin)
            endDate.setHours(23, 59, 59, 999)
            filtered = filtered.filter((m) => new Date(m.fecha) <= endDate)
        }

        setFilteredMovimientos(filtered)
    }

    const handleEdit = (mov: Movimiento) => {
        setMovimientoToEdit(mov)
        setIsDialogOpen(true)
    }

    const handleDelete = (mov: Movimiento) => {
        setMovimientoToDelete(mov)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!movimientoToDelete) return
        try {
            await api.delete(`/movimientos/${movimientoToDelete.id}`)
            toast.success("Movimiento eliminado exitosamente")
            fetchMovimientos()
        } catch (error) {
            console.error("Error deleting movement", error)
            toast.error("Error al eliminar movimiento")
        } finally {
            setIsDeleteDialogOpen(false)
            setMovimientoToDelete(null)
        }
    }

    const totalMovimientos = movimientos.length
    const entradas = movimientos.filter((m) => m.tipo === "ENTRADA").length
    const salidas = movimientos.filter((m) => m.tipo === "SALIDA").length

    const columns = getColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        userRole: user?.rol
    })

    return (
        <div className="container mx-auto p-4 max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestión de Movimientos</h1>
                    <p className="text-sm text-muted-foreground">Registro de entradas y salidas de inventario</p>
                </div>
                {['admin', 'superadmin', 'operador'].includes(user?.rol || '') && (
                    <MovimientoDialog
                        onSuccess={fetchMovimientos}
                        open={isDialogOpen}
                        onOpenChange={(open) => {
                            setIsDialogOpen(open)
                            if (!open) setMovimientoToEdit(null)
                        }}
                        movimientoToEdit={movimientoToEdit}
                    />
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Movimientos"
                    description="Registrados en el sistema"
                    value={totalMovimientos}
                    icon={ArrowRightLeft}
                    colorVariant="blue"
                />
                <StatCard
                    title="Entradas"
                    description="Ingresos de inventario"
                    value={entradas}
                    icon={ArrowDownToLine}
                    colorVariant="green"
                />
                <StatCard
                    title="Salidas"
                    description="Egresos de inventario"
                    value={salidas}
                    icon={ArrowUpFromLine}
                    colorVariant="red"
                />
            </div>

            {/* Filtros + Tabla */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Historial de Movimientos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filtros */}
                    <MovimientoFilters onFilterChange={handleFilterChange} />

                    {/* Tabla */}
                    <DataTable
                        title={`Movimientos (${filteredMovimientos.length})`}
                        columns={columns}
                        data={filteredMovimientos}
                        exportFilename="movimientos.csv"
                    />
                </CardContent>
            </Card>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto borrará permanentemente la orden de movimiento
                            y revertirá los cambios de stock en el inventario.
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