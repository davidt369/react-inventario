import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Notifications } from "@/components/Notifications"
import { ModeToggle } from "@/components/mode-toggle"
import UserAvatar from "@/components/Avatar"

export default function DashboardLayout() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="p-4 flex items-center justify-between border-b">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <span className="font-semibold">Sistema de Inventario</span>
                    </div>
                    <div className="flex items-center gap-2">

                        <Notifications />
                        <ModeToggle />
                        <UserAvatar />
                    </div>

                </div>
                <div className="p-4">
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    )
}
