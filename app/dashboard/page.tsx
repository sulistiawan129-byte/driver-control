"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, DriverControlWithDriver } from "@/lib/supabase";
import SummaryCard from "@/components/SummaryCard";
import DataTable from "@/components/DataTable";
import PageHeader from "@/components/PageHeader";
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatJam, getCurrentMonthYear, getMonthName } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<DriverControlWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDriver, setTotalDriver] = useState(0);
  const [totalRegular, setTotalRegular] = useState(0);
  const [totalOvertime, setTotalOvertime] = useState(0);
  const [totalJamOvertime, setTotalJamOvertime] = useState(0);

  const { month, year } = getCurrentMonthYear();

  const fetchAll = useCallback(async () => {
    setLoading(true);

    // Fetch semua data driver_control
    const { data: rows } = await supabase
      .from("driver_control")
      .select("*, master_driver(*)")
      .order("tanggal", { ascending: false })
      .limit(100);

    if (rows) {
      setData(rows as DriverControlWithDriver[]);
    }

    // Fetch total driver
    const { count: driverCount } = await supabase
      .from("master_driver")
      .select("*", { count: "exact", head: true });

    setTotalDriver(driverCount ?? 0);

    // Fetch data bulan ini
    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = `${year}-${String(month).padStart(2, "0")}-31`;

    const { data: monthData } = await supabase
      .from("driver_control")
      .select("status_kerja, overtime_jam")
      .gte("tanggal", firstDay)
      .lte("tanggal", lastDay);

    if (monthData) {
      setTotalRegular(monthData.filter((r) => r.status_kerja === "Regular").length);
      setTotalOvertime(monthData.filter((r) => r.status_kerja === "Overtime").length);
      setTotalJamOvertime(
        Math.round(
          monthData.reduce((acc, r) => acc + (r.overtime_jam ?? 0), 0) * 100
        ) / 100
      );
    }

    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    fetchAll();

    // Auto refresh setiap 30 detik
    const interval = setInterval(fetchAll, 30000);

    // Refresh saat balik ke tab ini
    window.addEventListener("focus", fetchAll);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchAll);
    };
  }, [fetchAll]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus data kehadiran ini?")) return;
    const { error } = await supabase
      .from("driver_control")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Gagal menghapus data");
    } else {
      toast.success("Data berhasil dihapus");
      fetchAll();
    }
  }

  function handleEdit(row: DriverControlWithDriver) {
    window.location.href = `/dashboard/input?edit=${row.id}`;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Monitoring bulan ${getMonthName(month)} ${year}`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={fetchAll}
              className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              href="/dashboard/input"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Input Data
            </Link>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Driver"
            value={totalDriver}
            subtitle="Driver aktif terdaftar"
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <SummaryCard
            title="Regular Bulan Ini"
            value={totalRegular}
            subtitle={`${getMonthName(month)} ${year}`}
            icon={CheckCircle2}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <SummaryCard
            title="Overtime Bulan Ini"
            value={totalOvertime}
            subtitle={`${getMonthName(month)} ${year}`}
            icon={TrendingUp}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <SummaryCard
            title="Total Jam OT"
            value={formatJam(totalJamOvertime)}
            subtitle={`${getMonthName(month)} ${year}`}
            icon={Clock}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
        </div>

        {/* History Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">
              Riwayat Kehadiran
            </h2>
            <span className="text-xs text-slate-500">
              {data.length} data terbaru
            </span>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-12 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full spinner" />
                <p className="text-sm text-slate-500">Memuat data...</p>
              </div>
            </div>
          ) : (
            <DataTable
              data={data}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
