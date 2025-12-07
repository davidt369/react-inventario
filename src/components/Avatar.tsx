import { useAuth } from "@/context/AuthContext"
import * as Avatar from "@radix-ui/react-avatar"
import { LogOut } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const UserAvatar = () => {
    const { user, logout } = useAuth()

    const getInitial = () => {
        if (!user?.username) return "?"
        return user.username.charAt(0).toUpperCase()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <Avatar.Root className="inline-flex h-9 w-9 select-none items-center justify-center overflow-hidden rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
                    <Avatar.Image
                        className="h-full w-full rounded-[inherit] object-cover"
                        alt={`Avatar de ${user?.username || 'usuario'}`}
                    />
                    <Avatar.Fallback
                        className="text-sm font-medium text-primary"
                        delayMs={600}
                    >
                        {getInitial()}
                    </Avatar.Fallback>
                </Avatar.Root>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.rol}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserAvatar