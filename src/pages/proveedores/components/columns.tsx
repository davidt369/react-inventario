import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown } from "lucide-react"

export type Proveedor = {
    id: number
    nombre: string
    contacto: string
    telefono: string
    productosCount?: number // Optional since it might be derived or joined
}

interface ColumnsProps {
    onEdit: (proveedor: Proveedor) => void
    onDelete: (proveedor: Proveedor) => void
    userRole?: string
}

export const getColumns = ({ onEdit, onDelete, userRole }: ColumnsProps): ColumnDef<Proveedor>[] => [
    {
        accessorKey: "nombre",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nombre
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "contacto",
        header: "Contacto",
    },
    {
        accessorKey: "telefono",
        header: "Teléfono",
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const proveedor = row.original

            // Allow actions for 'admin' and 'superadmin'
            if (!['admin', 'superadmin'].includes(userRole || '')) return null

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(proveedor)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(proveedor)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
