"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase, DriverControlWithDriver } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import {
  RankingDriverChart,
  OvertimePerBulanChart,
  OvertimePerPlantChart,
  TotalJamPerDriverChart,
} from "@/components/Charts";
import {
  formatJam,
  getMonthName,
  getCurrentMonthYear,
  getYearOptions,
} from "@/lib/utils";
import { BarChart3, TrendingUp, Clock, Users, Filter } from "lucide-react";

export default function ReportPage() {
  const [data, setData] = useState<DriverControlWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(
    getCurrentMonthYear().year
  );

  const years = getYearOptions();

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  async function fetchData() {
    setLoading(true);
    const { data: rows } = await supabase
      .from("driver_control")
      .select("*, master_driver(*)")
      .gte("tanggal", `${selectedYear}-01-01`)
      .lte("tanggal", `${selectedYear}-12-31`)
      .order("tanggal");
    if (rows) setData(rows as DriverControlWithDriver[]);
    setLoading(false);
  }

  // 1. Ranking driver overtime
  const rankingData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((row) => {
      const name = row.master_driver?.nama_driver || "Unknown";
      map[name] = (map[name] || 0) + (row.overtime_jam || 0);
    });
    return Object.entries(map).map(([name, overtime]) => ({
      name,
      overtime: Math.round(overtime * 100) / 100,
    }));
  }, [data]);

  // 2. Overtime per bulan
  const overtimePerBulan = useMemo(() => {
    const map: Record<
      string,
      { overtime: number; regular: number; month: number }
    > = {};
    for (let m = 1; m <= 12; m++) {
      const key = `${String(m).padStart(2, "0")}`;
      map[key] = { overtime: 0, regular: 0, month: m };
    }
    data.forEach((row) => {
      const month = row.tanggal.substring(5, 7);
      if (row.status_kerja === "Overtime") {
        map[month].overtime += row.overtime_jam || 0;
      } else {
        map[month].regular++;
      }
    });
    return Object.entries(map).map(([, v]) => ({
      bulan: getMonthName(v.month).substring(0, 3),
      overtime: Math.round(v.overtime * 100) / 100,
      regular: v.regular,
    }));
  }, [data]);

  // 3. Overtime per plant
  const overtimePerPlant = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((row) => {
      const plant = row.master_driver?.plant || "Unknown";
      map[plant] = (map[plant] || 0) + (row.overtime_jam || 0);
    });
    return Object.entries(map)
      .map(([plant, overtime]) => ({
        plant,
        overtime: Math.round(overtime * 100) / 100,
      }))
      .sort((a, b) => b.overtime - a.overtime);
  }, [data]);

  // 4. Total jam per driver
  const totalJamPerDriver = useMemo(() => {
    const map: Record<
      string,
      { regular_jam: number; overtime_jam: number }
    > = {};
    data.forEach((row) => {
      const name = row.master_driver?.nama_driver || "Unknown";
      if (!map[name]) map[name] = { regular_jam: 0, overtime_jam: 0 };
      const total = row.total_jam || 0;
      const ot = row.overtime_jam || 0;
      map[name].overtime_jam += ot;
      map[name].regular_jam += total - ot;
    });
    return Object.entries(map).map(([name, v]) => ({
      name,
      regular_jam: Math.round(v.regular_jam * 100) / 100,
      overtime_jam: Math.round(v.overtime_jam * 100) / 100,
    }));
  }, [data]);

  // Summary stats
  const totalOT = data.reduce((a, r) => a + (r.overtime_jam || 0), 0);
  const totalJam = data.reduce((a, r) => a + (r.total_jam || 0), 0);
  const overtimeCount = data.filter((r) => r.status_kerja === "Overtime").length;
  const uniqueDrivers = new Set(data.map((r) => r.driver_id)).size;

  return (
    <div>
      <PageHeader
        title="Laporan & Statistik"
        subtitle="Analisis kehadiran dan overtime driver"
        actions={
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full spinner" />
              <p className="text-sm text-slate-500">Memuat laporan...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Year summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Entri",
                  value: data.length,
                  sub: `tahun ${selectedYear}`,
                  icon: BarChart3,
                  iconColor: "text-blue-600",
                  iconBg: "bg-blue-50",
                },
                {
                  label: "Total Overtime",
                  value: overtimeCount,
                  sub: "hari overtime",
                  icon: TrendingUp,
                  iconColor: "text-indigo-600",
                  iconBg: "bg-indigo-50",
                },
                {
                  label: "Total Jam OT",
                  value: formatJam(totalOT),
                  sub: "akumulasi overtime",
                  icon: Clock,
                  iconColor: "text-orange-600",
                  iconBg: "bg-orange-50",
                },
                {
                  label: "Rata-rata Jam/Hari",
                  value:
                    data.length > 0
                      ? formatJam(
                          Math.round((totalJam / data.length) * 100) / 100
                        )
                      : "-",
                  sub: `dari ${uniqueDrivers} driver`,
                  icon: Users,
                  iconColor: "text-green-600",
                  iconBg: "bg-green-50",
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="bg-white rounded-2xl p-5 shadow-card border border-slate-100"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {card.label}
                        </p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">
                          {card.value}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {card.sub}
                        </p>
                      </div>
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg}`}
                      >
                        <Icon className={`w-5 h-5 ${card.iconColor}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Ranking Driver Overtime */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Ranking Driver Overtime
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Top 10 driver dengan jam overtime terbanyak
                  </p>
                </div>
                <div className="h-64">
                  {rankingData.length > 0 ? (
                    <RankingDriverChart data={rankingData} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">
                      Tidak ada data overtime
                    </div>
                  )}
                </div>
              </div>

              {/* Overtime per Bulan */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Overtime per Bulan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tren jam overtime sepanjang tahun {selectedYear}
                  </p>
                </div>
                <div className="h-64">
                  <OvertimePerBulanChart data={overtimePerBulan} />
                </div>
              </div>

              {/* Overtime per Plant */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Overtime per Plant
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distribusi jam overtime berdasarkan plant
                  </p>
                </div>
                <div className="h-64">
                  {overtimePerPlant.length > 0 ? (
                    <OvertimePerPlantChart data={overtimePerPlant} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">
                      Tidak ada data overtime
                    </div>
                  )}
                </div>
              </div>

              {/* Total Jam per Driver */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Total Jam Kerja per Driver
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Akumulasi jam regular dan overtime per driver
                  </p>
                </div>
                <div className="h-64">
                  {totalJamPerDriver.length > 0 ? (
                    <TotalJamPerDriverChart data={totalJamPerDriver} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">
                      Tidak ada data jam kerja
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Overtime Table Summary */}
            {rankingData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card border border-slate-100">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Ringkasan Overtime Driver
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tahun {selectedYear}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Driver
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Plant
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Hari OT
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Jam OT
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Total Jam
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[...rankingData]
                        .sort((a, b) => b.overtime - a.overtime)
                        .slice(0, 10)
                        .map((driver, idx) => {
                          const driverRows = data.filter(
                            (r) =>
                              r.master_driver?.nama_driver === driver.name
                          );
                          const plant =
                            driverRows[0]?.master_driver?.plant || "-";
                          const otDays = driverRows.filter(
                            (r) => r.status_kerja === "Overtime"
                          ).length;
                          const totalJamDriver = driverRows.reduce(
                            (a, r) => a + (r.total_jam || 0),
                            0
                          );

                          return (
                            <tr
                              key={driver.name}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                    idx === 0
                                      ? "bg-yellow-100 text-yellow-700"
                                      : idx === 1
                                        ? "bg-slate-100 text-slate-600"
                                        : idx === 2
                                          ? "bg-orange-100 text-orange-600"
                                          : "text-slate-500"
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                                {driver.name}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                                  {plant}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-slate-700">
                                {otDays} hari
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">
                                {formatJam(driver.overtime)}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-slate-700">
                                {formatJam(
                                  Math.round(totalJamDriver * 100) / 100
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
