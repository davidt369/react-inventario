"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import api from "@/lib/api"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface Alerta {
    id: number
    producto: {
        id: number
        nombre: string
        stockActual: number
        stockMinimo: number
    }
    mensaje: string
    fechaCreacion: string
    resuelta: boolean
}

export function Notifications() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [alertas, setAlertas] = useState<Alerta[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [count, setCount] = useState(0)

    const knownIdsRef = useRef<Set<number>>(new Set())
    const firstLoadRef = useRef(true)

    const fetchAlertas = async () => {
        setIsLoading(true)
        try {
            const res = await api.get("/alertas")
            const pending = res.data.filter((a: Alerta) => !a.resuelta)

            if (!firstLoadRef.current) {
                pending.forEach((alerta: Alerta) => {
                    if (!knownIdsRef.current.has(alerta.id)) {
                        toast.custom((t) => (
                            <Alert variant="destructive" className="w-full shadow-lg bg-card text-card-foreground border-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle className="mb-2 flex items-center justify-between">
                                    <span>Alerta de Stock</span>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                        Stock: {alerta.producto.stockActual}
                                    </Badge>
                                </AlertTitle>
                                <AlertDescription>
                                    <p className="mb-3 font-medium">{alerta.producto.nombre}</p>
                                    <p className="mb-4 text-sm">{alerta.mensaje}</p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                navigate("/alertas")
                                                toast.dismiss(t)
                                            }}
                                        >
                                            Ver Detalles
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={async () => {
                                                try {
                                                    await api.patch(`/alertas/${alerta.id}/resolver`)
                                                    toast.dismiss(t)
                                                    fetchAlertas()
                                                    toast.success("Alerta resuelta")
                                                } catch (error) {
                                                    console.error("Error resolving", error)
                                                }
                                            }}
                                        >
                                            Resolver
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ), { duration: Infinity })
                    }
                })
            }

            const currentIds = new Set<number>(pending.map((a: Alerta) => a.id))
            knownIdsRef.current = currentIds

            setAlertas(pending)
            setCount(pending.length)
            firstLoadRef.current = false
        } catch (error) {
            console.error("Error fetching notifications", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAlertas()
        const interval = setInterval(fetchAlertas, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleResolve = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await api.patch(`/alertas/${id}/resolver`)
            toast.success("Alerta marcada como resuelta")
            fetchAlertas()
        } catch (error) {
            console.error("Error resolving notification", error)
            toast.error("Error al resolver")
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.round(diffMs / 60000)
        const diffHours = Math.round(diffMs / 3600000)
        const diffDays = Math.round(diffMs / 86400000)

        if (diffMins < 60) return `Hace ${diffMins} min`
        if (diffHours < 24) return `Hace ${diffHours} h`
        return `Hace ${diffDays} d`
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {count > 0 && (
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                            {count > 9 ? "9+" : count}
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 pb-2">
                    <h4 className="font-semibold leading-none">Notificaciones</h4>
                    {count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {count} pendientes
                        </Badge>
                    )}
                </div>
                <Separator className="my-2" />
                <ScrollArea className="h-[300px]">
                    {isLoading && alertas.length === 0 ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : alertas.length === 0 ? (
                        <div className="text-center p-4 text-sm text-muted-foreground">
                            No hay notificaciones nuevas
                        </div>
                    ) : (
                        <div className="grid gap-1">
                            {alertas.map((alerta) => (
                                <div
                                    key={alerta.id}
                                    className="flex items-start gap-2 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        setOpen(false)
                                        navigate("/alertas")
                                    }}
                                >
                                    <div className="h-2 w-2 mt-2 rounded-full bg-destructive flex-shrink-0" />
                                    <div className="grid gap-1 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium leading-none">
                                                {alerta.producto.nombre}
                                            </p>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(alerta.fechaCreacion)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {alerta.mensaje}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline">
                                                Stock: {alerta.producto.stockActual}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 ml-auto hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300"
                                                onClick={(e) => handleResolve(alerta.id, e)}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Resolver
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <Separator />
                <div className="p-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-center text-sm"
                        onClick={() => {
                            setOpen(false)
                            navigate("/alertas")
                        }}
                    >
                        Ver todas las alertas
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}