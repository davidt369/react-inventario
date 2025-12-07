"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { ProductDialog } from "./components/ProductDialog"
import { ProductCard } from "@/components/productos/ProductCard"
import { ProductFilters, type ProductFilters as ProductFiltersType } from "@/components/productos/ProductFilters"
import { Button } from "@/components/ui/button"
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
import api from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Trash2, Plus, Package, SearchX } from "lucide-react"

interface Producto {
    id: number
    nombre: string
    descripcion: string
    stockActual: number
    stockMinimo: number
    categoria?: { id: number; nombre: string }
    proveedor?: { id: number; nombre: string }
}

export default function Productos() {
    const { user } = useAuth()
    const [productos, setProductos] = useState<Producto[]>([])
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
    const [isLoading, setIsLoading] = useState(true)

    /* Dialogs */
    const [dialogOpen, setDialogOpen] = useState(false)
    const [productToEdit, setProductToEdit] = useState<Producto | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<number | null>(null)

    /* Fetch */
    const fetchProductos = async () => {
        setIsLoading(true)
        try {
            const res = await api.get("/productos")
            setProductos(res.data)
            setFilteredProductos(res.data)
        } catch {
            toast.error("Error al cargar productos")
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => { fetchProductos() }, [])

    /* CRUD handlers */
    const handleCreate = () => { setProductToEdit(null); setDialogOpen(true) }
    const handleEdit = (p: Producto) => { setProductToEdit(p); setDialogOpen(true) }
    const handleDelete = (id: number) => { setProductToDelete(id); setDeleteDialogOpen(true) }

    const confirmDelete = async () => {
        if (!productToDelete) return
        try {
            await api.delete(`/productos/${productToDelete}`)
            toast.success("Producto eliminado")
            fetchProductos()
        } catch {
            toast.error("Error al eliminar")
        } finally {
            setDeleteDialogOpen(false)
            setProductToDelete(null)
        }
    }

    /* Filters */
    const handleFilterChange = (f: ProductFiltersType) => {
        let filtered = [...productos]
        if (f.search) filtered = filtered.filter(p => p.nombre.toLowerCase().includes(f.search.toLowerCase()))
        if (f.categoriaId) filtered = filtered.filter(p => p.categoria?.id.toString() === f.categoriaId)
        if (f.proveedorId) filtered = filtered.filter(p => p.proveedor?.id.toString() === f.proveedorId)
        if (f.stockBajo) {
            if (f.stockBajo === "sin-stock") filtered = filtered.filter(p => p.stockActual === 0)
            if (f.stockBajo === "critico") filtered = filtered.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo * 0.5)
            if (f.stockBajo === "bajo") filtered = filtered.filter(p => p.stockActual > 0 && p.stockActual <= p.stockMinimo)
        }
        setFilteredProductos(filtered)
    }

    return (
        <div className="container mx-auto p-4 max-w-7xl animate-in fade-in duration-500 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Gestiona tus productos y existencias
                    </p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="w-full md:w-auto shadow-md hover:shadow-lg transition-all"
                    disabled={user?.rol === 'operador'}
                    style={{ display: user?.rol === 'operador' ? 'none' : 'flex' }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                </Button>
            </div>

            {/* Filtros siempre visibles */}

            <ProductFilters onFilterChange={handleFilterChange} />


            {/* Grid de productos */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Cargando inventario...</p>
                </div>
            ) : filteredProductos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/10">
                    <div className="bg-muted/30 p-4 rounded-full mb-4">
                        <SearchX className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No se encontraron productos</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                        No hay productos que coincidan con los filtros seleccionados.
                    </p>
                    <Button
                        variant="link"
                        onClick={() => handleFilterChange({ search: "", categoriaId: "", proveedorId: "", stockBajo: "" })}
                        className="mt-2"
                    >
                        Limpiar filtros
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProductos.map(p => (
                        <div key={p.id} className="relative group">
                            <ProductCard
                                producto={p}
                                onClick={user?.rol === 'operador' ? undefined : () => handleEdit(p)}
                                className={user?.rol === 'operador' ? "cursor-default" : "cursor-pointer"}
                            />
                            {user?.rol !== 'operador' && (
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(p.id)
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Dialogs */}
            <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchProductos} productToEdit={productToEdit} />
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}