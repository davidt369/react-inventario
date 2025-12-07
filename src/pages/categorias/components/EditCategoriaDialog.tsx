import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Pencil } from "lucide-react"

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
import api from "@/lib/api"

const formSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    descripcion: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Categoria {
    id: number
    nombre: string
    descripcion: string
}

interface Props {
    categoria: Categoria
    onSuccess: () => void
}

export function EditCategoriaDialog({ categoria, onSuccess }: Props) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: categoria.nombre,
            descripcion: categoria.descripcion || "",
        },
    })

    // Update form default values when categoria changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                nombre: categoria.nombre,
                descripcion: categoria.descripcion || "",
            })
        }
    }, [categoria, open, form])

    async function onSubmit(data: FormValues) {
        setIsLoading(true)
        try {
            await api.patch(`/categorias/${categoria.id}`, data)
            toast.success("Categoría actualizada")
            setOpen(false)
            onSuccess()
        } catch (error: any) {
            console.error("Error updating category:", error)
            toast.error("Error al actualizar categoría")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Categoría</DialogTitle>
                    <DialogDescription>
                        Modifique los datos de la categoría.
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
                                        <Input {...field} />
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
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
