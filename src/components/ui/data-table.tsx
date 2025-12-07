"use client"

import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table"
import { Download, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DataTableProps<TData, TValue> {
    title?: string
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filterColumn?: string
    filterOptions?: { label: string; value: string }[]
    exportFilename?: string
}

export function DataTable<TData, TValue>({
    title = "Tabla de datos",
    columns,
    data,
    filterColumn,
    filterOptions,
    exportFilename = "datos.csv",
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })

    const exportToCSV = () => {
        const headers = table.getVisibleLeafColumns().map((col) => col.id)
        const rows = table.getFilteredRowModel().rows.map((row) =>
            headers.map((header) => {
                const cellValue = row.getValue(header)
                return typeof cellValue === "string" ? `"${cellValue}"` : cellValue
            })
        )

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

        const link = document.createElement("a")
        link.setAttribute("href", encodeURI(csvContent))
        link.setAttribute("download", exportFilename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                        {table.getFilteredRowModel().rows.length} activos
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Filtros y acciones */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-col sm:flex-row flex-1 gap-2">
                        <Input
                            placeholder="Buscar..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full sm:max-w-xs text-sm"
                        />
                        {filterColumn && filterOptions && table.getColumn(filterColumn) && (
                            <Select
                                value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? "all"}
                                onValueChange={(val) =>
                                    table.getColumn(filterColumn)?.setFilterValue(val === "all" ? "" : val)
                                }
                            >
                                <SelectTrigger className="w-full sm:w-36 text-sm">
                                    <SelectValue placeholder="Filtrar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {filterOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={exportToCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Settings2 className="h-4 w-4 mr-2" />
                                    Columnas
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {table
                                    .getAllColumns()
                                    .filter((col) => col.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
                                            className="text-sm capitalize"
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Tabla */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((group) => (
                                <TableRow key={group.id}>
                                    {group.headers.map((header) => (
                                        <TableHead key={header.id} className="text-xs py-2">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-xs py-2">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={table.getAllColumns().length} className="h-20 text-center text-sm text-muted-foreground">
                                        Sin resultados
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{table.getFilteredRowModel().rows.length} resultado(s)</span>
                    <Pagination className="w-auto">
                        <PaginationContent className="gap-1">
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => table.previousPage()}
                                    aria-disabled={!table.getCanPreviousPage()}
                                    className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            <span className="px-2">
                                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                            </span>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => table.nextPage()}
                                    aria-disabled={!table.getCanNextPage()}
                                    className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </CardContent>
        </Card>
    )
}