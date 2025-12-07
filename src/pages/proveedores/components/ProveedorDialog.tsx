import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import api from "@/lib/api"
import type { Proveedor } from "./columns"


const formSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    contacto: z.string().optional(),
    telefono: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
    onSuccess: () => void
    proveedorToEdit?: Proveedor | null
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
}

export function ProveedorDialog({ onSuccess, proveedorToEdit, open: controlledOpen, onOpenChange: setControlledOpen, trigger }: Props) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen

    // Helper to call both internal and external state setters
    const setOpen = (newOpen: boolean) => {
        setInternalOpen(newOpen)
        if (setControlledOpen) setControlledOpen(newOpen)
    }

    const [isLoading, setIsLoading] = useState(false)
    const isEditing = !!proveedorToEdit

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: "",
            contacto: "",
            telefono: "",
        },
    })

    useEffect(() => {
        if (proveedorToEdit) {
            form.reset({
                nombre: proveedorToEdit.nombre,
                contacto: proveedorToEdit.contacto,
                telefono: proveedorToEdit.telefono,
            })
        } else {
            form.reset({
                nombre: "",
                contacto: "",
                telefono: "",
            })
        }
    }, [proveedorToEdit, form, open])

    async function onSubmit(data: FormValues) {
        setIsLoading(true)
        try {
            if (isEditing && proveedorToEdit) {
                await api.patch(`/proveedores/${proveedorToEdit.id}`, data)
                toast.success("Proveedor actualizado exitosamente")
            } else {
                await api.post("/proveedores", data)
                toast.success("Proveedor creado exitosamente")
            }
            setOpen(false)
            form.reset()
            onSuccess()
        } catch (error: any) {
            console.error("Error saving supplier:", error)
            toast.error("Error al guardar proveedor")
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
                        <Button>Nuevo Proveedor</Button>
                    </DialogTrigger>
                )
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Proveedor" : "Crear Nuevo Proveedor"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Modifique los datos del proveedor." : "Ingrese los datos del nuevo proveedor."}
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
                                        <Input placeholder="Proveedor S.A." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contacto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contacto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Juan Pérez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="telefono"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input placeholder="12345678" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Guardar Cambios" : "Guardar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
