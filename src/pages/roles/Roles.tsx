import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import api from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getColumns, type Rol } from "./columns"
import { RolFormDialog } from "./components/RolFormDialog"
import { DeleteRolDialog } from "./components/DeleteRolDialog"

export default function Roles() {
    const [roles, setRoles] = useState<Rol[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedRol, setSelectedRol] = useState<Rol | null>(null)

    // Delete State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [rolToDelete, setRolToDelete] = useState<Rol | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchRoles = async () => {
        setIsLoading(true)
        try {
            const res = await api.get("/roles")
            setRoles(res.data)
        } catch (error) {
            console.error("Error fetching roles", error)
            toast.error("Error al cargar roles")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    const handleCreate = () => {
        setSelectedRol(null)
        setIsFormOpen(true)
    }

    const handleEdit = (rol: Rol) => {
        setSelectedRol(rol)
        setIsFormOpen(true)
    }

    const handleDelete = (rol: Rol) => {
        setRolToDelete(rol)
        setIsDeleteOpen(true)
    }

    const confirmDelete = async () => {
        if (!rolToDelete) return

        setIsDeleting(true)
        try {
            await api.delete(`/roles/${rolToDelete.id}`)
            toast.success("Rol eliminado exitosamente")
            fetchRoles()
            setIsDeleteOpen(false)
        } catch (error) {
            console.error("Error deleting rol", error)
            toast.error("Error al eliminar rol")
        } finally {
            setIsDeleting(false)
        }
    }

    const columns = getColumns(handleEdit, handleDelete)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Gestión de Roles</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Rol
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={roles}
                    filterColumn="nombre"
                    title="Listado de Roles"
                />
            )}

            <RolFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={selectedRol}
                onSuccess={fetchRoles}
            />

            <DeleteRolDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={confirmDelete}
                rol={rolToDelete}
                isLoading={isDeleting}
            />
        </div>
    )
}
