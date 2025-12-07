import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
    Loader2,
    Plus,
    Check,
    ChevronsUpDown,
    Inbox,
    LogOut,
    Package,
    Warehouse
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import api from "@/lib/api"
import type { Movimiento } from "./columns"

// Removed z.coerce to ensure strict type compatibility with react-hook-form defaultValue types
const formSchema = z.object({
    tipo: z.enum(["ENTRADA", "SALIDA"]),
    productoId: z.number().min(1, "Seleccione un producto"),
    almacenId: z.number().min(1, "Seleccione un almacén"),
    cantidad: z.number().min(1, "La cantidad debe ser mayor a 0"),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
    onSuccess: () => void
    movimientoToEdit?: Movimiento | null
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
}

export function MovimientoDialog({ onSuccess, movimientoToEdit, open: controlledOpen, onOpenChange: setControlledOpen, trigger }: Props) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen

    // Helper to call both internal and external state setters
    const setOpen = (newOpen: boolean) => {
        setInternalOpen(newOpen)
        if (setControlledOpen) setControlledOpen(newOpen)
    }

    const [openProducto, setOpenProducto] = useState(false)
    const [openAlmacen, setOpenAlmacen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [productos, setProductos] = useState<{ id: number; nombre: string; stockActual: number }[]>([])
    const [almacenes, setAlmacenes] = useState<{ id: number; nombre: string }[]>([])

    const isEditing = !!movimientoToEdit

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tipo: "ENTRADA",
            productoId: 0,
            almacenId: 0,
            cantidad: 1,
        },
    })

    // Update form when editing
    useEffect(() => {
        if (movimientoToEdit) {
            form.reset({
                tipo: movimientoToEdit.tipo,
                productoId: movimientoToEdit.producto.id,
                almacenId: movimientoToEdit.almacen.id,
                cantidad: movimientoToEdit.cantidad,
            })
        } else {
            form.reset({
                tipo: "ENTRADA",
                productoId: 0,
                almacenId: 0,
                cantidad: 1,
            })
        }
    }, [movimientoToEdit, form, open])

    const fetchFormData = async () => {
        try {
            const [prodRes, almRes] = await Promise.all([
                api.get("/productos"),
                api.get("/almacenes"),
            ])
            setProductos(prodRes.data)
            setAlmacenes(almRes.data)
        } catch (error) {
            console.error("Error fetching form data", error)
            toast.error("Error al cargar datos del formulario")
        }
    }

    useEffect(() => {
        if (open) {
            fetchFormData()
        }
    }, [open])

    const selectedProduct = productos.find(
        (p) => p.id === form.watch("productoId")
    )
    const currentTipo = form.watch("tipo")

    async function onSubmit(data: FormValues) {
        // Validación adicional de stock para SALIDA
        if (data.tipo === "SALIDA" && selectedProduct) {
            if (data.cantidad > selectedProduct.stockActual) {
                // simple check for new movements
                if (!isEditing) {
                    form.setError("cantidad", {
                        type: "manual",
                        message: `Stock insuficiente. Disponible: ${selectedProduct.stockActual}`,
                    })
                    return
                }
            }
        }

        setIsLoading(true)
        try {
            if (isEditing && movimientoToEdit) {
                await api.patch(`/movimientos/${movimientoToEdit.id}`, {
                    productoId: data.productoId,
                    almacenId: data.almacenId,
                    tipo: data.tipo,
                    cantidad: data.cantidad,
                })
                toast.success("Movimiento actualizado exitosamente")
            } else {
                await api.post("/movimientos", {
                    productoId: data.productoId,
                    almacenId: data.almacenId,
                    tipo: data.tipo,
                    cantidad: data.cantidad,
                })
                toast.success(`${data.tipo === "ENTRADA" ? "Entrada" : "Salida"} registrada exitosamente`)
            }

            setOpen(false)
            form.reset()
            onSuccess()
        } catch (error: any) {
            console.error("Error saving movement", error)
            toast.error(error.response?.data?.message || "Error al guardar movimiento")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            ) : (
                !isEditing && (
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Movimiento
                        </Button>
                    </DialogTrigger>
                )
            )}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Movimiento" : "Registrar Movimiento"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Modifique los detalles del movimiento" : "Registre una entrada o salida de inventario"}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="tipo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Movimiento</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ENTRADA">
                                                <div className="flex items-center">
                                                    <Inbox className="mr-2 h-4 w-4 text-green-500" />
                                                    <span>Entrada</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="SALIDA">
                                                <div className="flex items-center">
                                                    <LogOut className="mr-2 h-4 w-4 text-orange-500" />
                                                    <span>Salida</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="productoId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Producto</FormLabel>
                                    <Popover open={openProducto} onOpenChange={setOpenProducto}>
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
                                                        ? productos.find(
                                                            (product) => product.id === field.value
                                                        )?.nombre
                                                        : "Seleccione un producto"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar producto..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontró el producto.</CommandEmpty>
                                                    <CommandGroup>
                                                        {productos.map((product) => (
                                                            <CommandItem
                                                                value={product.nombre}
                                                                key={product.id}
                                                                onSelect={() => {
                                                                    form.setValue("productoId", product.id)
                                                                    setOpenProducto(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        product.id === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{product.nombre}</span>
                                                                    <span className="text-xs text-muted-foreground">Stock: {product.stockActual}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {selectedProduct && (
                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                            <Package className="h-3 w-3" />
                                            Stock actual: <span className="font-bold">{selectedProduct.stockActual}</span>
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="almacenId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Almacén</FormLabel>
                                    <Popover open={openAlmacen} onOpenChange={setOpenAlmacen}>
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
                                                        ? almacenes.find(
                                                            (almacen) => almacen.id === field.value
                                                        )?.nombre
                                                        : "Seleccione un almacén"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar almacén..." />
                                                <CommandList>
                                                    <CommandEmpty>No se encontró el almacén.</CommandEmpty>
                                                    <CommandGroup>
                                                        {almacenes.map((almacen) => (
                                                            <CommandItem
                                                                value={almacen.nombre}
                                                                key={almacen.id}
                                                                onSelect={() => {
                                                                    form.setValue("almacenId", almacen.id)
                                                                    setOpenAlmacen(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        almacen.id === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    <Warehouse className="h-4 w-4 text-muted-foreground" />
                                                                    {almacen.nombre}
                                                                </div>
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

                        <FormField
                            control={form.control}
                            name="cantidad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cantidad</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" {...field} value={field.value} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                                    </FormControl>
                                    {!isEditing && currentTipo === "SALIDA" && selectedProduct && (field.value as number) > selectedProduct.stockActual && (
                                        <p className="text-sm text-red-600 mt-1">
                                            ⚠️ La cantidad excede el stock disponible
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Guardar Cambios" : "Registrar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
