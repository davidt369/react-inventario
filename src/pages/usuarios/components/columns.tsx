import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2 } from "lucide-react"
import { EditUsuarioDialog } from "./EditUsuarioDialog"

export interface Usuario {
    id: number
    username: string
    activo: boolean
    rol: {
        id: number
        nombre: string
    }
}

interface ColumnsProps {
    onDelete: (id: number) => void
    onSuccess: () => void
}

export const getColumns = ({ onDelete, onSuccess }: ColumnsProps): ColumnDef<Usuario>[] => [
    {
        accessorKey: "id",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2"
                >
                    ID
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="text-xs sm:text-sm">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "username",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2"
                >
                    Usuario
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                {row.getValue("username")}
            </div>
        ),
    },
    {
        accessorKey: "rol",
        header: "Rol",
        cell: ({ row }) => {
            const rol = row.original.rol
            return (
                <Badge variant="outline" className="capitalize text-xs">
                    {rol.nombre}
                </Badge>
            )
        },
        filterFn: (row, _id, value) => {
            return row.original.rol.nombre === value
        },
    },
    {
        accessorKey: "activo",
        header: "Estado",
        cell: ({ row }) => {
            const activo = row.getValue("activo") as boolean
            return activo ? (
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                    Activo
                </Badge>
            ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                    Inactivo
                </Badge>
            )
        },
        filterFn: (row, _id, value) => {
            if (value === "activo") return row.getValue("activo") === true
            if (value === "inactivo") return row.getValue("activo") === false
            return true
        },
    },
    {
        id: "acciones",
        header: () => <div className="text-right text-xs sm:text-sm">Acciones</div>,
        cell: ({ row }) => {
            const user = row.original
            return (
                <div className="flex justify-end gap-1">
                    <EditUsuarioDialog usuario={user} onSuccess={onSuccess} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDelete(user.id)}
                        disabled={!user.activo}
                    >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    </Button>
                </div>
            )
        },
    },
]
