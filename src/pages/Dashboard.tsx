import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
    const { user } = useAuth()

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Bienvenido
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{user?.username}</div>
                        <p className="text-xs text-muted-foreground">
                            {user?.rol}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Resumen General</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="p-4 text-center text-muted-foreground">
                            Seleccione una opción del menú lateral para comenzar.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
