import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatCard from "@/components/StatCard"
import { CreateCategoriaDialog } from "./components/CreateCategoriaDialog"
import { EditCategoriaDialog } from "./components/EditCategoriaDialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Trash2, Layers, Package } from "lucide-react"

interface Categoria {
    id: number
    nombre: string
    descripcion: string
}

export default function Categorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [productosCount, setProductosCount] = useState<Record<number, number>>({})
    const [isLoading, setIsLoading] = useState(true)

    const fetchCategorias = async () => {
        setIsLoading(true)
        try {
            const [catRes, prodRes] = await Promise.all([
                api.get("/categorias"),
                api.get("/productos")
            ])
            setCategorias(catRes.data)

            // Count products per category
            const counts: Record<number, number> = {}
            prodRes.data.forEach((prod: any) => {
                if (prod.categoria?.id) {
                    counts[prod.categoria.id] = (counts[prod.categoria.id] || 0) + 1
                }
            })
            setProductosCount(counts)
        } catch (error) {
            console.error("Error fetching categories", error)
            toast.error("Error al cargar categorías")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        const productCount = productosCount[id] || 0
        if (productCount > 0) {
            toast.error(`No se puede eliminar. Hay ${productCount} productos en esta categoría`)
            return
        }

        if (!confirm("¿Está seguro de eliminar esta categoría?")) return

        try {
            await api.delete(`/categorias/${id}`)
            toast.success("Categoría eliminada")
            fetchCategorias()
        } catch (error) {
            console.error("Error deleting category", error)
            toast.error("Error al eliminar categoría")
        }
    }

    useEffect(() => {
        fetchCategorias()
    }, [])

    const totalProductos = Object.values(productosCount).reduce((sum, count) => sum + count, 0)
    const categoriasConProductos = Object.keys(productosCount).length
    const categoriasSinProductos = categorias.length - categoriasConProductos

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
                <CreateCategoriaDialog onSuccess={fetchCategorias} />
            </div>

            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Total Categorías"
                    description="Registradas"
                    value={categorias.length}
                    icon={Layers}
                    colorVariant="default"
                />
                <StatCard
                    title="Con Productos"
                    description="Categorías activas"
                    value={categoriasConProductos}
                    icon={Package}
                    colorVariant="green"
                />
                <StatCard
                    title="Sin Productos"
                    description="Categorías vacías"
                    value={categoriasSinProductos}
                    icon={Package}
                    colorVariant="orange"
                />
                <StatCard
                    title="Total Productos"
                    description="Inventario global"
                    value={totalProductos}
                    icon={Package}
                    colorVariant="blue"
                />
            </div>

            {/* Tabla de Categorías */}
            <Card>
                <CardHeader>
                    <CardTitle>Listado de Categorías ({categorias.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Productos</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : categorias.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No hay categorías registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categorias.map((cat) => (
                                        <TableRow key={cat.id}>
                                            <TableCell>{cat.id}</TableCell>
                                            <TableCell className="font-medium">{cat.nombre}</TableCell>
                                            <TableCell>{cat.descripcion}</TableCell>
                                            <TableCell>
                                                <span className="font-bold">{productosCount[cat.id] || 0}</span> productos
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <EditCategoriaDialog categoria={cat} onSuccess={fetchCategorias} />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(cat.id)}
                                                        disabled={productosCount[cat.id] > 0}
                                                        title={productosCount[cat.id] > 0 ? "No se puede eliminar una categoría con productos" : "Eliminar categoría"}
                                                    >
                                                        <Trash2 className={`h-4 w-4 ${productosCount[cat.id] > 0 ? 'text-gray-300' : 'text-red-500'}`} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
