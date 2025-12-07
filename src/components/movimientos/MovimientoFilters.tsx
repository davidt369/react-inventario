"use client"

import { useState, useEffect } from "react"
import { FilterPanel } from "@/components/ui/filter-panel"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"

interface Producto {
    id: number
    nombre: string
}

interface Almacen {
    id: number
    nombre: string
}

interface MovimientoFiltersProps {
    onFilterChange: (filters: MovimientoFilters) => void
}

export interface MovimientoFilters {
    tipo: string
    productoId: string
    almacenId: string
    fechaInicio: string
    fechaFin: string
}

export function MovimientoFilters({ onFilterChange }: MovimientoFiltersProps) {
    const [productos, setProductos] = useState<Producto[]>([])
    const [almacenes, setAlmacenes] = useState<Almacen[]>([])
    const [filters, setFilters] = useState<MovimientoFilters>({
        tipo: "",
        productoId: "",
        almacenId: "",
        fechaInicio: "",
        fechaFin: ""
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, almRes] = await Promise.all([
                    api.get("/productos"),
                    api.get("/almacenes")
                ])
                setProductos(prodRes.data)
                setAlmacenes(almRes.data)
            } catch (error) {
                console.error("Error fetching filter data", error)
            }
        }
        fetchData()
    }, [])

    const handleFilterChange = (key: keyof MovimientoFilters, value: string) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const handleClear = () => {
        const clearedFilters: MovimientoFilters = {
            tipo: "",
            productoId: "",
            almacenId: "",
            fechaInicio: "",
            fechaFin: ""
        }
        setFilters(clearedFilters)
        onFilterChange(clearedFilters)
    }

    return (
        <FilterPanel onClear={handleClear}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Movimiento */}
                <div>
                    <Label htmlFor="tipo">Tipo de Movimiento</Label>
                    <Select
                        value={filters.tipo || "ALL"}
                        onValueChange={(value) => handleFilterChange("tipo", value === "ALL" ? "" : value)}
                    >
                        <SelectTrigger id="tipo" className="w-full">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="ENTRADA">Entradas</SelectItem>
                            <SelectItem value="SALIDA">Salidas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Producto */}
                <div>
                    <Label htmlFor="producto">Producto</Label>
                    <Select
                        value={filters.productoId || "ALL"}
                        onValueChange={(value) => handleFilterChange("productoId", value === "ALL" ? "" : value)}
                    >
                        <SelectTrigger id="producto" className="w-full">
                            <SelectValue placeholder="Todos los productos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {productos.map((prod) => (
                                <SelectItem key={prod.id} value={prod.id.toString()}>
                                    {prod.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Almacén */}
                <div>
                    <Label htmlFor="almacen">Almacén</Label>
                    <Select
                        value={filters.almacenId || "ALL"}
                        onValueChange={(value) => handleFilterChange("almacenId", value === "ALL" ? "" : value)}
                    >
                        <SelectTrigger id="almacen" className="w-full">
                            <SelectValue placeholder="Todos los almacenes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            {almacenes.map((alm) => (
                                <SelectItem key={alm.id} value={alm.id.toString()}>
                                    {alm.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Fecha Inicio */}
                <div>
                    <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                    <Input
                        id="fechaInicio"
                        type="date"
                        value={filters.fechaInicio}
                        onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Fecha Fin */}
                <div>
                    <Label htmlFor="fechaFin">Fecha Fin</Label>
                    <Input
                        id="fechaFin"
                        type="date"
                        value={filters.fechaFin}
                        onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>
        </FilterPanel>
    )
}