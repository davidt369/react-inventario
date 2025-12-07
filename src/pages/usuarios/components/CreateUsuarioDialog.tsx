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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import api from "@/lib/api"

const userSchema = z.object({
    username: z.string().min(1, "El usuario es requerido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    rolNombre: z.string().min(1, "El rol es requerido"),
})

type UserFormValues = z.infer<typeof userSchema>

interface Props {
    onSuccess: () => void
}

export function CreateUsuarioDialog({ onSuccess }: Props) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [roles, setRoles] = useState<{ id: number, nombre: string }[]>([])

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: "",
            password: "",
            rolNombre: "",
        },
    })

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await api.get("/roles")
                setRoles(res.data)
                console.log("Roles que son", res.data)
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
            await api.post("/usuarios", data)
            toast.success("Usuario creado exitosamente")
            setOpen(false)
            form.reset()
            onSuccess()
        } catch (error: any) {
            console.error("Error creating user:", error)
            const errorMessage = error.response?.data?.message || "Error al crear usuario"
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Nuevo Usuario</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                        Ingrese los datos del nuevo usuario. Haga clic en guardar cuando termine.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de Usuario</FormLabel>
                                    <FormControl>
                                        <Input placeholder="juan" {...field} />
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
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un rol" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roles.map(rol => (
                                                <SelectItem key={rol.id} value={rol.nombre}>{rol.nombre}</SelectItem>
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
                                Guardar Usuario
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
