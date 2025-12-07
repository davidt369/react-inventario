import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatCard from "@/components/StatCard"
import { CreateUsuarioDialog } from "./components/CreateUsuarioDialog"
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
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import api from "@/lib/api"
import { toast } from "sonner"
import { Users, UserCheck, UserX, ShieldCheck } from "lucide-react"
import { getColumns } from "./components/columns"
import type { Usuario } from "./components/columns"

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<number | null>(null)

    const fetchUsuarios = async () => {
        setIsLoading(true)
        try {
            const res = await api.get("/usuarios")
            setUsuarios(res.data)
        } catch (error) {
            console.error("Error fetching users", error)
            toast.error("Error al cargar usuarios")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        setUserToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!userToDelete) return

        try {
            await api.delete(`/usuarios/${userToDelete}`)
            toast.success("Usuario desactivado")
            fetchUsuarios()
        } catch (error) {
            console.error("Error deleting user", error)
            toast.error("Error al desactivar usuario")
        } finally {
            setDeleteDialogOpen(false)
            setUserToDelete(null)
        }
    }

    useEffect(() => {
        fetchUsuarios()
    }, [])

    const usuariosActivos = usuarios.filter(u => u.activo).length
    const usuariosInactivos = usuarios.filter(u => !u.activo).length
    const porRol = usuarios.reduce((acc, u) => {
        const rol = u.rol.nombre
        acc[rol] = (acc[rol] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const columns = getColumns({
        onDelete: handleDelete,
        onSuccess: fetchUsuarios
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-sm text-muted-foreground">Cargando usuarios...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3 sm:space-y-4 p-2 sm:p-0">
            {/* Header - Mobile optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-bold">Gestión de Usuarios</h1>
                <CreateUsuarioDialog onSuccess={fetchUsuarios} />
            </div>

            {/* Estadísticas - Mobile first grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total"
                    description="Usuarios registrados"
                    value={usuarios.length}
                    icon={Users}
                    colorVariant="blue"
                />
                <StatCard
                    title="Activos"
                    description="Usuarios habilitados"
                    value={usuariosActivos}
                    icon={UserCheck}
                    colorVariant="green"
                />
                <StatCard
                    title="Inactivos"
                    description="Usuarios deshabilitados"
                    value={usuariosInactivos}
                    icon={UserX}
                    colorVariant="red"
                />
                <StatCard
                    title="Roles"
                    description="Tipos de rol"
                    value={Object.keys(porRol).length}
                    icon={ShieldCheck}
                    colorVariant="purple"
                />
            </div>


            {/* Distribución por Rol - Mobile optimized */}
            {Object.keys(porRol).length > 0 && (
                <Card>
                    <CardHeader className="p-3 sm:p-6">
                        <CardTitle className="text-sm sm:text-base">Distribución por Rol</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {Object.entries(porRol).map(([rol, count]) => (
                                <div key={rol} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                                    <span className="font-medium capitalize text-xs sm:text-sm">{rol}</span>
                                    <Badge variant="secondary" className="text-xs">{count} usuarios</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabla de Usuarios - Mobile optimized */}

            <DataTable
                title={`Listado de Usuarios (${usuarios.length})`}
                columns={columns}
                data={usuarios}
                filterColumn="activo"
                filterOptions={[
                    { label: "Activos", value: "activo" },
                    { label: "Inactivos", value: "inactivo" },
                ]}
                exportFilename="usuarios.csv"
            />

            {/* AlertDialog para confirmar eliminación */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base sm:text-lg">¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs sm:text-sm">
                            Esta acción desactivará el usuario. El usuario no podrá iniciar sesión hasta que sea reactivado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                        >
                            Desactivar Usuario
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

