import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Rol } from "../columns"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    rol: Rol | null
    isLoading?: boolean
}

export function DeleteRolDialog({ open, onOpenChange, onConfirm, rol, isLoading }: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el rol
                        <span className="font-semibold text-foreground"> "{rol?.nombre}" </span>
                        y podría afectar a los usuarios asignados a este rol.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            onConfirm()
                        }}
                        disabled={isLoading}
                        className="bg-red-600 focus:ring-red-600 hover:bg-red-700"
                    >
                        {isLoading ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
