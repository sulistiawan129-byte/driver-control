"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const CHART_COLORS = {
  blue: "rgba(59, 130, 246, 0.85)",
  blueBorder: "#2563eb",
  green: "rgba(34, 197, 94, 0.85)",
  greenBorder: "#16a34a",
  indigo: "rgba(99, 102, 241, 0.85)",
  orange: "rgba(249, 115, 22, 0.85)",
  purple: "rgba(168, 85, 247, 0.85)",
};

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        font: { family: "Inter", size: 12, weight: 500 },
        color: "#475569",
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: "#1e293b",
      titleFont: { family: "Inter", size: 12, weight: 600 },
      bodyFont: { family: "Inter", size: 12 },
      padding: 12,
      cornerRadius: 10,
      titleColor: "#f8fafc",
      bodyColor: "#cbd5e1",
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { family: "Inter", size: 11 },
        color: "#94a3b8",
      },
    },
    y: {
      grid: { color: "#f1f5f9" },
      ticks: {
        font: { family: "Inter", size: 11 },
        color: "#94a3b8",
      },
    },
  },
};

// 1. Ranking Driver Overtime
export function RankingDriverChart({
  data,
}: {
  data: { name: string; overtime: number }[];
}) {
  const sorted = [...data].sort((a, b) => b.overtime - a.overtime).slice(0, 10);

  const chartData = {
    labels: sorted.map((d) => d.name),
    datasets: [
      {
        label: "Overtime (jam)",
        data: sorted.map((d) => d.overtime),
        backgroundColor: sorted.map((_, i) =>
          i === 0
            ? "#2563eb"
            : i === 1
              ? "#3b82f6"
              : i === 2
                ? "#60a5fa"
                : "rgba(59,130,246,0.5)"
        ),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  return (
    <Bar
      data={chartData}
      options={{
        ...defaultOptions,
        indexAxis: "y" as const,
        plugins: {
          ...defaultOptions.plugins,
          legend: { display: false },
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${(ctx.parsed.x ?? 0).toFixed(2)} jam`,
            },
          },
        },
        scales: {
          x: {
            ...defaultOptions.scales.x,
            grid: { color: "#f1f5f9" },
          },
          y: {
            ...defaultOptions.scales.y,
            grid: { display: false },
            ticks: {
              ...defaultOptions.scales.y.ticks,
              font: { family: "Inter", size: 11 },
            },
          },
        },
      }}
    />
  );
}

// 2. Overtime per Bulan (Line chart)
export function OvertimePerBulanChart({
  data,
}: {
  data: { bulan: string; overtime: number; regular: number }[];
}) {
  const chartData = {
    labels: data.map((d) => d.bulan),
    datasets: [
      {
        label: "Overtime (jam)",
        data: data.map((d) => d.overtime),
        borderColor: CHART_COLORS.blueBorder,
        backgroundColor: "rgba(59,130,246,0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.blueBorder,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: "Regular (hari)",
        data: data.map((d) => d.regular),
        borderColor: CHART_COLORS.greenBorder,
        backgroundColor: "rgba(34,197,94,0.08)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.greenBorder,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  return (
    <Line
      data={chartData}
      options={{
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(2)}`,
            },
          },
        },
      }}
    />
  );
}

// 3. Overtime per Plant (Doughnut)
export function OvertimePerPlantChart({
  data,
}: {
  data: { plant: string; overtime: number }[];
}) {
  const chartData = {
    labels: data.map((d) => d.plant),
    datasets: [
      {
        data: data.map((d) => d.overtime),
        backgroundColor: [
          "#3b82f6",
          "#22c55e",
          "#f59e0b",
          "#8b5cf6",
          "#ef4444",
          "#06b6d4",
          "#f97316",
          "#ec4899",
        ],
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 6,
      },
    ],
  };

  return (
    <Doughnut
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "right" as const,
            labels: {
              font: { family: "Inter", size: 12 },
              color: "#475569",
              padding: 16,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: "#1e293b",
            titleFont: { family: "Inter", size: 12 },
            bodyFont: { family: "Inter", size: 12 },
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.label}: ${(ctx.parsed as number).toFixed(2)} jam`,
            },
          },
        },
      }}
    />
  );
}

// 4. Total Jam Kerja per Driver (Stacked Bar)
export function TotalJamPerDriverChart({
  data,
}: {
  data: { name: string; regular_jam: number; overtime_jam: number }[];
}) {
  const sorted = [...data]
    .sort((a, b) => b.regular_jam + b.overtime_jam - (a.regular_jam + a.overtime_jam))
    .slice(0, 12);

  const chartData = {
    labels: sorted.map((d) => d.name),
    datasets: [
      {
        label: "Regular (jam)",
        data: sorted.map((d) => d.regular_jam),
        backgroundColor: CHART_COLORS.green,
        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 6, bottomRight: 6 },
        borderSkipped: false,
      },
      {
        label: "Overtime (jam)",
        data: sorted.map((d) => d.overtime_jam),
        backgroundColor: CHART_COLORS.blue,
        borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
        borderSkipped: false,
      },
    ],
  };

  return (
    <Bar
      data={chartData}
      options={{
        ...defaultOptions,
        scales: {
          ...defaultOptions.scales,
          x: { ...defaultOptions.scales.x, stacked: true },
          y: { ...defaultOptions.scales.y, stacked: true },
        },
        plugins: {
          ...defaultOptions.plugins,
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(2)} jam`,
            },
          },
        },
      }}
    />
  );
}
