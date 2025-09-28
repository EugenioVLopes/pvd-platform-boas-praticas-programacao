"use client";

import { ResponsiveBar } from "@nivo/bar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { SalesReport } from "@/types/order";

const SORVETE_COLORS = [
  "#ff9eb8", // Rosa claro (pastel)
  "#ff6b8e", // Rosa médio
  "#ff2e63", // Rosa vibrante
  "#ff87ab", // Rosa suave
];

interface HourlySalesChartProps {
  data: SalesReport["salesByHour"];
}

export function SalesReportHourlyChart({ data }: HourlySalesChartProps) {
  const hourlyData = Object.entries(data)
    .map(([hour, value]) => ({
      hour: `${hour}:00`,
      "Vendas (R$)": value,
    }))
    .filter((item) => item["Vendas (R$)"] > 0);

  return (
    <Card className="rounded-lg border-pink-200 shadow-md">
      <CardHeader>
        <CardTitle>Vendas por Hora</CardTitle>
      </CardHeader>
      <CardContent className="flex h-[300px] items-center justify-center">
        {hourlyData.length > 0 ? (
          <ResponsiveBar
            data={hourlyData}
            keys={["Vendas (R$)"]}
            indexBy="hour"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            colors={SORVETE_COLORS}
            borderColor={{
              from: "color",
              modifiers: [["darker", 1.6]],
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Hora",
              legendPosition: "middle",
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Vendas (R$)",
              legendPosition: "middle",
              legendOffset: -40,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
              from: "color",
              modifiers: [["darker", 1.6]],
            }}
            theme={{
              axis: {
                ticks: { text: { fill: "#333333", fontSize: 12 } },
              },
              labels: { text: { fontSize: 12, fill: "#333333" } },
              tooltip: {
                container: { background: "#ffffff", color: "#333333" },
              },
            }}
            valueFormat={(value) => formatCurrency(value)}
          />
        ) : (
          <p className="text-pink-600">Nenhuma venda registrada</p>
        )}
      </CardContent>
    </Card>
  );
}
