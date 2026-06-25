"use client";

import { useEffect, useState } from "react";
import { supabase, DriverControlWithDriver, MasterDriver } from "@/lib/supabase";
import CalendarView from "@/components/CalendarView";
import PageHeader from "@/components/PageHeader";
import { Filter, Users, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [data, setData] = useState<DriverControlWithDriver[]>([]);
  const [drivers, setDrivers] = useState<MasterDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [mode, setMode] = useState<"all" | "per-driver">("all");

  const plants = [...new Set(drivers.map((d) => d.plant))].sort();

  useEffect(() => {
    Promise.all([fetchData(), fetchDrivers()]);
  }, []);

  useEffect(() => {
    if (mode === "all") {
      setSelectedDriver("");
    }
  }, [mode]);

  async function fetchData() {
    setLoading(true);
    const { data: rows } = await supabase
      .from("driver_control")
      .select("*, master_driver(*)")
      .order("tanggal", { ascending: false });
    if (rows) setData(rows as DriverControlWithDriver[]);
    setLoading(false);
  }

  async function fetchDrivers() {
    const { data: rows } = await supabase
      .from("master_driver")
      .select("*")
      .order("nama_driver");
    if (rows) setDrivers(rows);
  }

  return (
    <div>
      <PageHeader
        title="Kalender Kehadiran"
        subtitle="Visualisasi jadwal kerja driver"
      />

      <div className="p-6 space-y-5">
        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Mode toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Mode:
              </span>
              <div className="flex bg-slate-100 rounded-xl p-0.5">
                <button
                  onClick={() => setMode("all")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    mode === "all"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Semua Driver
                </button>
                <button
                  onClick={() => setMode("per-driver")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    mode === "per-driver"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  Per Driver
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />

              {/* Plant filter */}
              <select
                value={selectedPlant}
                onChange={(e) => {
                  setSelectedPlant(e.target.value);
                  setSelectedDriver("");
                }}
                className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              >
                <option value="">Semua Plant</option>
                {plants.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              {/* Driver filter (visible in per-driver mode) */}
              {mode === "per-driver" && (
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                >
                  <option value="">Semua Driver</option>
                  {drivers
                    .filter((d) => !selectedPlant || d.plant === selectedPlant)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama_driver}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full spinner" />
              <p className="text-sm text-slate-500">Memuat kalender...</p>
            </div>
          </div>
        ) : (
          <CalendarView
            data={data}
            drivers={drivers}
            selectedDriverId={selectedDriver}
            selectedPlant={selectedPlant}
          />
        )}

        {/* Stats below calendar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Data",
              value: data.length,
              color: "text-slate-800",
            },
            {
              label: "Regular",
              value: data.filter((d) => d.status_kerja === "Regular").length,
              color: "text-green-700",
            },
            {
              label: "Overtime",
              value: data.filter((d) => d.status_kerja === "Overtime").length,
              color: "text-blue-700",
            },
            {
              label: "Driver Aktif",
              value: drivers.length,
              color: "text-indigo-700",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-100 shadow-card px-4 py-3"
            >
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              <p className={cn("text-xl font-bold mt-0.5", stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
