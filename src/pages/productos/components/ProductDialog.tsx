

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

const formSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    descripcion: z.string().optional(),
    stockActual: z.coerce.number().min(0, "Stock actual debe ser mayor o igual a 0"),
    stockMinimo: z.coerce.number().min(0, "Stock mínimo debe ser mayor o igual a 0"),
    categoria: z.coerce.number().min(1, "Seleccione una categoría"),
    proveedor: z.coerce.number().min(1, "Seleccione un proveedor"),
})

type FormValues = z.infer<typeof formSchema>

interface Producto {
    id: number
    nombre: string
    descripcion: string
    stockActual: number
    stockMinimo: number
    categoria?: {
        id: number
        nombre: string
    }
    proveedor?: {
        id: number
        nombre: string
    }
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    productToEdit?: Producto | null
}

export function ProductDialog({ open, onOpenChange, onSuccess, productToEdit }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [categorias, setCategorias] = useState<{ id: number, nombre: string }[]>([])
    const [proveedores, setProveedores] = useState<{ id: number, nombre: string }[]>([])
    const [categoriaOpen, setCategoriaOpen] = useState(false)
    const [proveedorOpen, setProveedorOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            nombre: "",
            descripcion: "",
            stockActual: 0,
            stockMinimo: 0,
            categoria: 0,
            proveedor: 0,
        },
    })

    // Cargar datos iniciales (categorías y proveedores)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, provRes] = await Promise.all([
                    api.get("/categorias"),
                    api.get("/proveedores")
                ])
                setCategorias(catRes.data)
                setProveedores(provRes.data)
            } catch (error) {
                console.error("Error loading form data", error)
                toast.error("Error al cargar categorías o proveedores")
            }
        }
        fetchData()
    }, [])

    // Resetear formulario al cambiar productToEdit
    useEffect(() => {
        if (productToEdit) {
            form.reset({
                nombre: productToEdit.nombre,
                descripcion: productToEdit.descripcion,
                stockActual: productToEdit.stockActual,
                stockMinimo: productToEdit.stockMinimo,
                categoria: productToEdit.categoria?.id || 0,
                proveedor: productToEdit.proveedor?.id || 0,
            })
        } else {
            form.reset({
                nombre: "",
                descripcion: "",
                stockActual: 0,
                stockMinimo: 0,
                categoria: 0,
                proveedor: 0,
            })
        }
    }, [productToEdit, form])

    async function onSubmit(data: FormValues) {
        setIsLoading(true)
        try {
            if (productToEdit) {
                await api.patch(`/productos/${productToEdit.id}`, data)
                toast.success("Producto actualizado exitosamente")
            } else {
                await api.post("/productos", data)
                toast.success("Producto creado exitosamente")
            }
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            console.error("Error saving product:", error)
            toast.error("Error al guardar producto")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{productToEdit ? "Editar Producto" : "Crear Nuevo Producto"}</DialogTitle>
                    <DialogDescription>
                        {productToEdit ? "Modifique los datos del producto." : "Ingrese los datos del nuevo producto."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField<FormValues>
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre del producto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField<FormValues>
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descripción del producto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Combobox Categoría */}
                            <FormField<FormValues>
                                control={form.control}
                                name="categoria"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Categoría</FormLabel>
                                        <Popover open={categoriaOpen} onOpenChange={setCategoriaOpen} modal={true}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? categorias.find(
                                                                (c) => c.id === field.value
                                                            )?.nombre
                                                            : "Seleccione categoría"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar categoría..." />
                                                    <CommandList>
                                                        <CommandEmpty>No encontrada.</CommandEmpty>
                                                        <CommandGroup>
                                                            {categorias.map((categoria) => (
                                                                <CommandItem
                                                                    value={categoria.id.toString()}
                                                                    keywords={[categoria.nombre]}
                                                                    key={categoria.id}
                                                                    onSelect={() => {
                                                                        form.setValue("categoria", categoria.id)
                                                                        setCategoriaOpen(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            categoria.id === field.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {categoria.nombre}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Combobox Proveedor */}
                            <FormField<FormValues>
                                control={form.control}
                                name="proveedor"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Proveedor</FormLabel>
                                        <Popover open={proveedorOpen} onOpenChange={setProveedorOpen} modal={true}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? proveedores.find(
                                                                (p) => p.id === field.value
                                                            )?.nombre
                                                            : "Seleccione proveedor"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar proveedor..." />
                                                    <CommandList>
                                                        <CommandEmpty>No encontrado.</CommandEmpty>
                                                        <CommandGroup>
                                                            {proveedores.map((proveedor) => (
                                                                <CommandItem
                                                                    value={proveedor.id.toString()}
                                                                    keywords={[proveedor.nombre]}
                                                                    key={proveedor.id}
                                                                    onSelect={() => {
                                                                        form.setValue("proveedor", proveedor.id)
                                                                        setProveedorOpen(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            proveedor.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {proveedor.nombre}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField<FormValues>
                                control={form.control}
                                name="stockActual"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock Actual</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField<FormValues>
                                control={form.control}
                                name="stockMinimo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock Mínimo</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
