import {
    Home,
    Inbox,
    User2,
    Users,
    Box,
    Layers,
    MapPin,
    ArrowLeftRight,
    LogOut,
    Shield,
    Bell
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        roles: ["admin", "user", "superadmin"],
    },
    {
        title: "Usuarios",
        url: "/usuarios",
        icon: Users,
        roles: ["admin", "superadmin"],
    },
    {
        title: "Roles",
        url: "/roles",
        icon: Shield,
        roles: ["superadmin"],
    },
    {
        title: "Categorías",
        url: "/categorias",
        icon: Layers,
        roles: ["admin", "user", "superadmin"],
    },
    {
        title: "Productos",
        url: "/productos",
        icon: Box,
        roles: ["admin", "user", "superadmin"],
    },
    {
        title: "Almacenes",
        url: "/almacenes",
        icon: Inbox,
        roles: ["admin", "superadmin"],
    },
    {
        title: "Ubicaciones",
        url: "/ubicaciones",
        icon: MapPin,
        roles: ["admin", "superadmin"],
    },
    {
        title: "Movimientos",
        url: "/movimientos",
        icon: ArrowLeftRight,
        roles: ["admin", "user", "superadmin"],
    },
    {
        title: "Alertas",
        url: "/alertas",
        icon: Bell,
        roles: ["admin", "user", "superadmin"],
    },
    {
        title: "Proveedores",
        url: "/proveedores",
        icon: User2,
        roles: ["admin", "superadmin"],
    },
]

export function AppSidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const filteredItems = items.filter(item => {
        if (!user) return false
        // Basic role check - adjust logic if role names differ exactly
        // Assuming user.rol is a string like "admin" or "user"
        const userRole = user.rol.toLowerCase()
        return item.roles.includes(userRole)
    })


    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Inventario</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout}>
                            <LogOut />
                            <span>Cerrar Sesión</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
