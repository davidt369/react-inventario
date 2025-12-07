import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

interface RoleGuardProps {
    children: React.ReactNode
    allowedRoles: string[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return <div>Cargando...</div> // Or a proper loading spinner
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    const userRole = user.rol?.toLowerCase() || ""

    if (!allowedRoles.includes(userRole)) {
        // Redirect to a safe default dashboard if unauthorized
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}
