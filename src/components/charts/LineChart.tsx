import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface LineChartProps {
    data: any[]
    xKey: string
    lines: {
        key: string
        name: string
        color: string
    }[]
    title?: string
    height?: number
}

export function LineChart({ data, xKey, lines, title, height = 300 }: LineChartProps) {
    return (
        <Card>
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <RechartsLineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {lines.map((line) => (
                            <Line
                                key={line.key}
                                type="monotone"
                                dataKey={line.key}
                                name={line.name}
                                stroke={line.color}
                                strokeWidth={2}
                            />
                        ))}
                    </RechartsLineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
