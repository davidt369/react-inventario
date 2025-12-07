import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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
import api from "@/lib/api"
import type { Ubicacion } from "./columns"

const formSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    descripcion: z.string().optional(),
    almacenId: z.coerce.number().min(1, "Seleccione un almacén"),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
    onSuccess: () => void
    ubicacionToEdit?: Ubicacion | null
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CreateUbicacionDialog({ onSuccess, ubicacionToEdit, open: controlledOpen, onOpenChange }: Props) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [almacenes, setAlmacenes] = useState<{ id: number, nombre: string }[]>([])

    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? onOpenChange! : setInternalOpen

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: "",
            descripcion: "",
            almacenId: 0,
        },
    })

    // Reset form when ubicacionToEdit changes or dialog opens
    useEffect(() => {
        if (open) {
            if (ubicacionToEdit) {
                form.reset({
                    nombre: ubicacionToEdit.nombre,
                    descripcion: ubicacionToEdit.descripcion,
                    almacenId: ubicacionToEdit.almacen?.id || 0,
                })
            } else {
                form.reset({
                    nombre: "",
                    descripcion: "",
                    almacenId: 0,
                })
            }
        }
    }, [ubicacionToEdit, open, form])

    // Fetch Almacenes
    useEffect(() => {
        const fetchAlmacenes = async () => {
            try {
                const res = await api.get("/almacenes")
                setAlmacenes(res.data)
            } catch (error) {
                console.error("Failed to fetch warehouses", error)
            }
        }
        if (open) {
            fetchAlmacenes()
        }
    }, [open])

    async function onSubmit(data: FormValues) {
        setIsLoading(true)
        try {
            if (ubicacionToEdit) {
                await api.patch(`/ubicaciones/${ubicacionToEdit.id}`, data)
                toast.success("Ubicación actualizada exitosamente")
            } else {
                await api.post("/ubicaciones", data)
                toast.success("Ubicación creada exitosamente")
            }
            setOpen(false)
            form.reset()
            onSuccess()
        } catch (error: any) {
            console.error("Error saving location:", error)
            toast.error(ubicacionToEdit ? "Error al actualizar ubicación" : "Error al crear ubicación")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button>Nueva Ubicación</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{ubicacionToEdit ? "Editar Ubicación" : "Crear Nueva Ubicación"}</DialogTitle>
                    <DialogDescription>
                        {ubicacionToEdit ? "Modifique los datos de la ubicación." : "Ingrese los datos de la ubicación y asigne un almacén."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Estante 1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Zona A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="almacenId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Almacén</FormLabel>
                                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""} defaultValue={field.value ? field.value.toString() : ""}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un almacén" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {almacenes.map(alm => (
                                                <SelectItem key={alm.id} value={alm.id.toString()}>{alm.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {ubicacionToEdit ? "Actualizar" : "Guardar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
