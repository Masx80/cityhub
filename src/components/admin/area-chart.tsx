"use client"

import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface AreaChartProps {
  title: string
  data: any[]
  xKey: string
  yKey: string
  timeRanges?: string[]
}

export default function AreaChart({ title, data, xKey, yKey, timeRanges = ["7d", "30d", "90d"] }: AreaChartProps) {
  const { theme } = useTheme()
  const chartRef = useRef<HTMLDivElement>(null)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <Select defaultValue={timeRanges[1]}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={timeRanges[1]} />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pl-2">
        <div ref={chartRef} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey={xKey} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
                  borderColor: theme === "dark" ? "#2d2d2d" : "#e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#f97316" }}
                fillOpacity={1}
                fill="url(#colorGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
