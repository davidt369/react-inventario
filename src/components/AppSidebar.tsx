import {
    Home,
    Box,
    Layers,
    Package,
    ArrowLeftRight,
    Building,
    MapPin,
    Users,
    Shield,
    User2,
    Bell,
    LogOut
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Separator } from "@/components/ui/separator"

const menuItems = [
    {
        title: "Panel",
        url: "/dashboard",
        icon: Home,
        roles: ["admin", "operador", "superadmin"]
    },
    {
        title: "Productos",
        url: "/productos",
        icon: Package,
        roles: ["admin", "operador", "superadmin"]
    },
    {
        title: "Movimientos",
        url: "/movimientos",
        icon: ArrowLeftRight,
        roles: ["admin", "operador", "superadmin"]
    },
    {
        title: "Categorías",
        url: "/categorias",
        icon: Layers,
        roles: ["admin", "superadmin"]
    },
    {
        title: "Almacenes",
        url: "/almacenes",
        icon: Building,
        roles: ["admin", "superadmin"]
    },
    {
        title: "Ubicaciones",
        url: "/ubicaciones",
        icon: MapPin,
        roles: ["admin", "superadmin"]
    },
    {
        title: "Alertas",
        url: "/alertas",
        icon: Bell,
        roles: ["admin", "superadmin"]
    },
    {
        title: "Usuarios",
        url: "/usuarios",
        icon: Users,
        roles: ["superadmin"]
    },
    {
        title: "Roles",
        url: "/roles",
        icon: Shield,
        roles: ["superadmin"]
    },
    {
        title: "Proveedores",
        url: "/proveedores",
        icon: User2,
        roles: ["admin", "superadmin"]
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

    // Filtrar items según el rol del usuario
    const filteredItems = menuItems.filter(item =>
        item.roles.includes(user?.rol?.toLowerCase() || "")
    )

    return (
        <Sidebar>
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <Box className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-semibold">Inventario</h1>
                        <span className="text-xs text-muted-foreground">
                            {user?.username} • {user?.rol?.toUpperCase()}
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <Separator />

            <SidebarContent className="px-2 py-4">
                <SidebarMenu>
                    {filteredItems.map((item) => {
                        const isActive = location.pathname === item.url
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                >
                                    <Link
                                        to={item.url}
                                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            <Separator />

            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}