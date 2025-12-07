import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownToLine, ArrowUpFromLine, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Movimiento {
    id: number
    tipo: "ENTRADA" | "SALIDA"
    cantidad: number
    fecha: string
    producto: {
        id: number
        nombre: string
        stockActual: number
    }
    almacen: {
        id: number
        nombre: string
    }
}

interface GetColumnsProps {
    onEdit: (movimiento: Movimiento) => void
    onDelete: (movimiento: Movimiento) => void
    userRole?: string
}

export const getColumns = ({ onEdit, onDelete, userRole }: GetColumnsProps): ColumnDef<Movimiento>[] => [
    {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ row }) => {
            const tipo = row.getValue("tipo") as string
            return (
                <Badge
                    variant={tipo === "ENTRADA" ? "default" : "secondary"}
                    className={
                        tipo === "ENTRADA"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                >
                    {tipo === "ENTRADA" ? (
                        <>
                            <ArrowDownToLine className="mr-1 h-3 w-3" /> Entrada
                        </>
                    ) : (
                        <>
                            <ArrowUpFromLine className="mr-1 h-3 w-3" /> Salida
                        </>
                    )}
                </Badge>
            )
        },
    },
    {
        accessorKey: "producto.nombre",
        header: "Producto",
        cell: ({ row }) => <span className="font-medium">{row.original.producto.nombre}</span>,
    },
    {
        accessorKey: "almacen.nombre",
        header: "Almacén",
        cell: ({ row }) => row.original.almacen.nombre,
    },
    {
        accessorKey: "cantidad",
        header: "Cantidad",
        cell: ({ row }) => <span className="font-bold">{row.getValue("cantidad")}</span>,
    },
    {
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ row }) => {
            const date = new Date(row.getValue("fecha"))
            return date.toLocaleString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const movimiento = row.original

            // Allow actions for 'operador', 'admin', and 'superadmin'
            if (!['admin', 'superadmin', 'operador'].includes(userRole || '')) return null

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
                        <DropdownMenuItem onClick={() => onEdit(movimiento)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(movimiento)} className="text-red-600 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
