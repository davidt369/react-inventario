
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Ubicacion {
    id: number
    nombre: string
    descripcion: string
    almacen: {
        id: number
        nombre: string
    }
}

interface ColumnsProps {
    onEdit: (ubicacion: Ubicacion) => void
    onDelete: (id: number) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Ubicacion>[] => [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ row }) => <div className="font-medium">{row.getValue("nombre")}</div>,
    },
    {
        accessorKey: "descripcion",
        header: "Descripción",
    },
    {
        accessorKey: "almacen.nombre",
        header: "Almacén",
        cell: ({ row }) => {
            const almacenName = row.original.almacen?.nombre || "Sin almacén"
            return <Badge variant="outline">{almacenName}</Badge>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const ubicacion = row.original

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
                        <DropdownMenuItem onClick={() => onEdit(ubicacion)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(ubicacion.id)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
