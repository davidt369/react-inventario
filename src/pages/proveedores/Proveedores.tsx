"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Users, Package } from "lucide-react"
import { toast } from "sonner"

import api from "@/lib/api"
import { DataTable } from "@/components/ui/data-table"
import StatCard from "@/components/StatCard"
import { ProveedorDialog } from "./components/ProveedorDialog"
import { getColumns, type Proveedor } from "./components/columns"
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

export default function Proveedores() {
    const { user } = useAuth()
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [productosCount, setProductosCount] = useState<Record<number, number>>({})

    // State for CRUD
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [proveedorToEdit, setProveedorToEdit] = useState<Proveedor | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null)

    const fetchProveedores = async () => {
        try {
            const [provRes, prodRes] = await Promise.all([
                api.get("/proveedores"),
                api.get("/productos")
            ])
            setProveedores(provRes.data)

            const counts: Record<number, number> = {}
            prodRes.data.forEach((prod: any) => {
                if (prod.proveedor?.id) {
                    counts[prod.proveedor.id] = (counts[prod.proveedor.id] || 0) + 1
                }
            })
            setProductosCount(counts)
        } catch (error) {
            console.error("Error fetching suppliers", error)
            toast.error("Error al cargar proveedores")
        }
    }

    useEffect(() => {
        fetchProveedores()
    }, [])

    const handleEdit = (prov: Proveedor) => {
        setProveedorToEdit(prov)
        setIsDialogOpen(true)
    }

    const handleDelete = (prov: Proveedor) => {
        const count = productosCount[prov.id] || 0
        if (count > 0) {
            toast.error(`No se puede eliminar. Hay ${count} productos de este proveedor`)
            return
        }
        setProveedorToDelete(prov)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!proveedorToDelete) return
        try {
            await api.delete(`/proveedores/${proveedorToDelete.id}`)
            toast.success("Proveedor eliminado exitosamente")
            fetchProveedores()
        } catch (error) {
            console.error("Error deleting supplier", error)
            toast.error("Error al eliminar proveedor")
        } finally {
            setIsDeleteDialogOpen(false)
            setProveedorToDelete(null)
        }
    }

    const totalProveedores = proveedores.length
    const proveedoresActivos = Object.keys(productosCount).length
    const proveedoresSinProductos = proveedores.length - proveedoresActivos

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
                    <h1 className="text-2xl font-bold tracking-tight">Gestión de Proveedores</h1>
                    <p className="text-sm text-muted-foreground">Listado de proveedores registrados</p>
                </div>
                {['admin', 'superadmin'].includes(user?.rol || '') && (
                    <ProveedorDialog
                        onSuccess={fetchProveedores}
                        open={isDialogOpen}
                        onOpenChange={(open) => {
                            setIsDialogOpen(open)
                            if (!open) setProveedorToEdit(null)
                        }}
                        proveedorToEdit={proveedorToEdit}
                    />
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Proveedores"
                    description="Registrados en el sistema"
                    value={totalProveedores}
                    icon={Users}
                    colorVariant="blue"
                />
                <StatCard
                    title="Con Productos"
                    description="Proveedores activos"
                    value={proveedoresActivos}
                    icon={Package}
                    colorVariant="green"
                />
                <StatCard
                    title="Sin Productos"
                    description="Proveedores inactivos"
                    value={proveedoresSinProductos}
                    icon={Package}
                />
            </div>

            {/* Tabla */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Listado de Proveedores</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        title={`Proveedores (${proveedores.length})`}
                        columns={columns}
                        data={proveedores}
                        exportFilename="proveedores.csv"
                    />
                </CardContent>
            </Card>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto borrará permanentemente al proveedor del sistema.
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
