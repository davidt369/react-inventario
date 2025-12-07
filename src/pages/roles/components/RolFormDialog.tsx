import { useEffect, useState } from "react"
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
import type { Rol } from "../columns"

const formSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData: Rol | null
    onSuccess: () => void
}

export function RolFormDialog({ open, onOpenChange, initialData, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: "",
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                nombre: initialData ? initialData.nombre : "",
            })
        }
    }, [open, initialData, form])

    async function onSubmit(data: FormValues) {
        setIsLoading(true)
        try {
            if (initialData) {
                await api.patch(`/roles/${initialData.id}`, data)
                toast.success("Rol actualizado exitosamente")
            } else {
                await api.post("/roles", data)
                toast.success("Rol creado exitosamente")
            }
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            console.error("Error saving role:", error)
            toast.error("Error al guardar rol")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Rol" : "Crear Nuevo Rol"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Actualice los datos del rol." : "Ingrese el nombre del nuevo rol."}
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
                                        <Input placeholder="ADMIN" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
