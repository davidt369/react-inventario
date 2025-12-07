"use client"

import { useState, useEffect } from "react"
import { FilterPanel } from "@/components/ui/filter-panel"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Folder, Truck, PackageCheck } from "lucide-react"
import api from "@/lib/api"

interface Categoria { id: number; nombre: string }
interface Proveedor { id: number; nombre: string }

export interface ProductFilters {
    search: string
    categoriaId: string
    proveedorId: string
    stockBajo: string
}

interface ProductFiltersProps {
    onFilterChange: (filters: ProductFilters) => void
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [filters, setFilters] = useState<ProductFilters>({
        search: "",
        categoriaId: "",
        proveedorId: "",
        stockBajo: "",
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, provRes] = await Promise.all([
                    api.get("/categorias"),
                    api.get("/proveedores"),
                ])
                setCategorias(catRes.data)
                setProveedores(provRes.data)
            } catch (error) {
                console.error("Error fetching filter data", error)
            }
        }
        fetchData()
    }, [])

    const handleFilterChange = (key: keyof ProductFilters, value: string) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const handleClear = () => {
        const cleared: ProductFilters = { search: "", categoriaId: "", proveedorId: "", stockBajo: "" }
        setFilters(cleared)
        onFilterChange(cleared)
    }

    return (
        <FilterPanel onClear={handleClear}>
            {/* 1 columna SIEMPRE → cada control ocupa 100 % */}
            <div className="grid grid-cols-2 gap-4 ">
                {/* Buscar */}
                <div className="space-y-2">
                    <Label htmlFor="search" className="flex items-center gap-2">
                        <Search className="size-4 text-muted-foreground" />
                        Buscar
                    </Label>
                    <Input
                        id="search"
                        placeholder="Nombre del producto..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                    <Label htmlFor="categoria" className="flex items-center gap-2">
                        <Folder className="size-4 text-muted-foreground" />
                        Categoría
                    </Label>
                    <Select
                        value={filters.categoriaId || "all"}
                        onValueChange={(v) => handleFilterChange("categoriaId", v === "all" ? "" : v)}
                    >
                        <SelectTrigger id="categoria" className="w-full">
                            <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {categorias.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                    {c.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Proveedor */}
                <div className="space-y-2">
                    <Label htmlFor="proveedor" className="flex items-center gap-2">
                        <Truck className="size-4 text-muted-foreground" />
                        Proveedor
                    </Label>
                    <Select
                        value={filters.proveedorId || "all"}
                        onValueChange={(v) => handleFilterChange("proveedorId", v === "all" ? "" : v)}
                    >
                        <SelectTrigger id="proveedor" className="w-full">
                            <SelectValue placeholder="Todos los proveedores" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {proveedores.map((p) => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Estado de Stock */}
                <div className="space-y-2">
                    <Label htmlFor="stock" className="flex items-center gap-2">
                        <PackageCheck className="size-4 text-muted-foreground" />
                        Estado de Stock
                    </Label>
                    <Select
                        value={filters.stockBajo || "all"}
                        onValueChange={(v) => handleFilterChange("stockBajo", v === "all" ? "" : v)}
                    >
                        <SelectTrigger id="stock" className="w-full">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="bajo">Stock Bajo</SelectItem>
                            <SelectItem value="critico">Crítico</SelectItem>
                            <SelectItem value="sin-stock">Sin Stock</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </FilterPanel>
    )
}