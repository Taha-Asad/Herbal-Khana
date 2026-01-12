// components/admin/dashboard/RevenueChart.tsx
"use client";

import React from "react";
import { ChartDataPoint } from "@/types/admin";

interface RevenueChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

export default function RevenueChart({
  data,
  loading = false,
}: RevenueChartProps) {
  if (loading) {
    return <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const minRevenue = 0;
  const range = maxRevenue - minRevenue || 1;

  const getBarHeight = (value: number): number => {
    return ((value - minRevenue) / range) * 100;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
  };

  // Show every nth label based on data length
  const labelInterval = Math.ceil(data.length / 7);

  return (
    <div className="space-y-4">
      {/* Y-axis labels and chart */}
      <div className="flex gap-4">
        {/* Y-axis */}
        <div className="flex flex-col justify-between text-xs text-gray-500 py-2">
          <span>{formatCurrency(maxRevenue)}</span>
          <span>{formatCurrency(maxRevenue / 2)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="flex-1 flex items-end gap-1 h-48">
          {data.map((point) => (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center gap-1 group"
            >
              <div className="relative w-full">
                {/* Tooltip */}
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 
                  bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 
                  transition-opacity pointer-events-none whitespace-nowrap z-10"
                >
                  <div className="font-medium">
                    PKR {point.revenue.toLocaleString()}
                  </div>
                  <div className="text-gray-400">{point.orders} orders</div>
                </div>

                {/* Bar */}
                <div
                  className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-sm 
                    transition-all duration-300 hover:from-amber-600 hover:to-amber-500 
                    min-h-[2px]"
                  style={{ height: `${getBarHeight(point.revenue)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1 ml-12 text-xs text-gray-500">
        {data.map((point, index) => (
          <div key={point.date} className="flex-1 text-center">
            {index % labelInterval === 0 ? formatDate(point.date) : ""}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-amber-500 to-amber-400" />
          <span className="text-gray-600">Revenue</span>
        </div>
      </div>
    </div>
  );
}
