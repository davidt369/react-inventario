import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <FileQuestion className="h-20 w-20 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-4xl font-bold">404</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xl font-semibold mb-2">Página no encontrada</p>
                    <p className="text-muted-foreground">
                        Lo sentimos, la página que buscas no existe o ha sido movida.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button onClick={() => navigate("/")} size="lg">
                        Volver al Inicio
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
