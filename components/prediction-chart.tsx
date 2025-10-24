"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface PredictionChartProps {
  sunnyProb: number
  rainyProb: number
  temperature: number
  humidity: number
  windSpeed: number
}

export function PredictionChart({ sunnyProb, rainyProb, temperature, humidity, windSpeed }: PredictionChartProps) {
  const probabilityData = [
    { name: "Sunny", value: sunnyProb, fill: "#fbbf24" },
    { name: "Rainy", value: rainyProb, fill: "#3b82f6" },
  ]

  const parametersData = [
    { name: "Temperature", value: Math.min(temperature + 50, 100), fill: "#f97316" },
    { name: "Humidity", value: humidity, fill: "#06b6d4" },
    { name: "Wind Speed", value: Math.min(windSpeed, 100), fill: "#8b5cf6" },
  ]

  return (
    <div className="space-y-8">
      {/* Probability Pie Chart */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Weather Probability</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={probabilityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${(value * 100).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {probabilityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Parameters Bar Chart */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Weather Parameters</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={parametersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(value) => {
                if (value > 100) return "100%"
                return `${value.toFixed(1)}%`
              }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
