"use client";

import type { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardHeaderProps {
  dateRange: DateRange;
  reportType: "daily" | "weekly" | "monthly";
  onDateRangeChange: (range: DateRange) => void;
  onReportTypeChange: (value: "daily" | "weekly" | "monthly") => void;
}

export function SalesReportHeader({
  dateRange,
  reportType,
  onDateRangeChange,
  onReportTypeChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-black">
          Dashboard de Vendas
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <DateRangePicker
          value={dateRange}
          onChange={(range) =>
            range && range.from && range.to && onDateRangeChange(range)
          }
          className="w-full rounded-lg bg-white shadow-sm md:w-auto"
        />
        <Select value={reportType} onValueChange={onReportTypeChange}>
          <SelectTrigger className="w-[140px] border-pink-300 bg-white">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="border-pink-300 bg-white">
            <SelectItem value="daily" className="">
              Diário
            </SelectItem>
            <SelectItem value="weekly" className="">
              Semanal
            </SelectItem>
            <SelectItem value="monthly" className="">
              Mensal
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
