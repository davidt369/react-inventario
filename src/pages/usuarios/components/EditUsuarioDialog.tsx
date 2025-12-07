import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { toast } from "sonner"
import { Pencil, Loader2 } from "lucide-react"

const userSchema = z.object({
    username: z.string().min(1, "El usuario es requerido"),
    password: z.string().optional().refine(val => !val || val.length >= 6, {
        message: "La contraseña debe tener al menos 6 caracteres si se proporciona",
    }),
    rolNombre: z.string().min(1, "El rol es requerido"), // Changed to match the backend expectation/DTO
})

type UserFormValues = z.infer<typeof userSchema>

interface Usuario {
    id: number
    username: string
    activo: boolean
    rol: {
        id: number
        nombre: string
    }
}

interface EditUsuarioDialogProps {
    usuario: Usuario
    onSuccess: () => void
}

export function EditUsuarioDialog({ usuario, onSuccess }: EditUsuarioDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([])

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: usuario.username,
            password: "",
            rolNombre: usuario.rol.nombre,
        },
    })

    // Reset form when dialog opens or user changes
    useEffect(() => {
        if (open) {
            form.reset({
                username: usuario.username,
                password: "",
                rolNombre: usuario.rol.nombre,
            })
        }
    }, [open, usuario, form])

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await api.get("/roles")
                setRoles(res.data)
            } catch (error) {
                console.error("Failed to fetch roles", error)
                toast.error("Error al cargar roles")
            }
        }
        if (open) {
            fetchRoles()
        }
    }, [open])

    async function onSubmit(data: UserFormValues) {
        setIsLoading(true)
        try {
            const updateData: any = {
                username: data.username,
                rolNombre: data.rolNombre,
            }

            // Only include password if provided
            if (data.password) {
                updateData.password = data.password
            }

            await api.patch(`/usuarios/${usuario.id}`, updateData)
            toast.success("Usuario actualizado exitosamente")
            setOpen(false)
            onSuccess()
        } catch (error: any) {
            console.error("Error updating user", error)
            toast.error(error.response?.data?.message || "Error al actualizar usuario")
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
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del usuario. Deja la contraseña vacía si no deseas cambiarla.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Usuario</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva Contraseña (opcional)</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Dejar vacío para mantener" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="rolNombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value} // ensure controlled value
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un rol" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roles.map((rol) => (
                                                <SelectItem key={rol.id} value={rol.nombre}>
                                                    {rol.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
