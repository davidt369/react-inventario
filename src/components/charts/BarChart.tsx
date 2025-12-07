import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface BarChartProps {
    data: any[]
    xKey: string
    bars: {
        key: string
        name: string
        color: string
    }[]
    title?: string
    height?: number
}

export function BarChart({ data, xKey, bars, title, height = 300 }: BarChartProps) {
    return (
        <Card>
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <RechartsBarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {bars.map((bar) => (
                            <Bar
                                key={bar.key}
                                dataKey={bar.key}
                                name={bar.name}
                                fill={bar.color}
                            />
                        ))}
                    </RechartsBarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
