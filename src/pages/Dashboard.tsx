import { useAuth } from "@/context/AuthContext"
import OperadorDashboard from "./dashboards/OperadorDashboard"
import AdminDashboard from "./dashboards/AdminDashboard"
import SuperadminDashboard from "./dashboards/SuperadminDashboard"
import { Loader2 } from "lucide-react"

export default function Dashboard() {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    const userRole = user.rol.toLowerCase()

    // Render dashboard based on user role
    if (userRole === "operador") {
        return <OperadorDashboard />
    }

    if (userRole === "admin") {
        return <AdminDashboard />
    }

    if (userRole === "superadmin" || userRole === "superadmin") {
        return <SuperadminDashboard />
    }

    // Default fallback
    return <OperadorDashboard />
}
