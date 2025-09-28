"use client";

import { ResponsivePie } from "@nivo/pie";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { SalesReport } from "@/types/order";

const SORVETE_COLORS = [
  "#ff9eb8", // Rosa claro (pastel)
  "#ff6b8e", // Rosa médio
  "#ff2e63", // Rosa vibrante
  "#ff87ab", // Rosa suave
];

interface PaymentMethodChartProps {
  data: SalesReport["salesByPaymentMethod"];
}

export function SalesReportPaymentChart({ data }: PaymentMethodChartProps) {
  const paymentMethodData = Object.entries(data)
    .map(([name, value]) => ({ id: name, label: name, value }))
    .filter((item) => item.value > 0);

  return (
    <Card className="rounded-lg border-pink-200 shadow-md">
      <CardHeader>
        <CardTitle>Vendas por Método de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="flex h-[300px] items-center justify-center">
        {paymentMethodData.length > 0 ? (
          <ResponsivePie
            data={paymentMethodData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={SORVETE_COLORS}
            borderWidth={1}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="black"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            enableArcLabels={false} // Rótulos apenas no tooltip
            theme={{
              labels: { text: { fontSize: 14, fill: "#ffffff" } },
              tooltip: {
                container: { background: "#ffffff", color: "#333333" },
              },
            }}
            valueFormat={(value) => formatCurrency(value)}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000",
                    },
                  },
                ],
              },
            ]}
          />
        ) : (
          <p className="text-pink-600">Nenhuma venda registrada</p>
        )}
      </CardContent>
    </Card>
  );
}
