"use client";

import { useState, useMemo } from "react";
import { DriverControlWithDriver } from "@/lib/supabase";
import {
  formatDate,
  formatTime,
  formatJam,
  getStatusColor,
} from "@/lib/utils";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps {
  data: DriverControlWithDriver[];
  onEdit: (row: DriverControlWithDriver) => void;
  onDelete: (id: string) => void;
}

type SortKey = keyof DriverControlWithDriver | "driver_name" | "plant";
type SortDir = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function DataTable({ data, onEdit, onDelete }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("tanggal");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(
      (row) =>
        row.master_driver?.nama_driver?.toLowerCase().includes(q) ||
        row.master_driver?.plant?.toLowerCase().includes(q) ||
        row.tanggal?.includes(q) ||
        row.status_kerja?.toLowerCase().includes(q) ||
        row.catatan?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortKey === "driver_name") {
        av = a.master_driver?.nama_driver || "";
        bv = b.master_driver?.nama_driver || "";
      } else if (sortKey === "plant") {
        av = a.master_driver?.plant || "";
        bv = b.master_driver?.plant || "";
      } else {
        av = (a[sortKey as keyof DriverControlWithDriver] as string | number) || "";
        bv = (b[sortKey as keyof DriverControlWithDriver] as string | number) || "";
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col)
      return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
    );
  }

  const ThBtn = ({
    col,
    children,
  }: {
    col: SortKey;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(col)}
      className="flex items-center gap-1 font-semibold text-xs text-slate-600 uppercase tracking-wide hover:text-blue-700 transition-colors whitespace-nowrap"
    >
      {children}
      <SortIcon col={col} />
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100">
      {/* Table Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari driver, plant, status..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-slate-50"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span>data</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-3 text-left">
                <ThBtn col="tanggal">Tanggal</ThBtn>
              </th>
              <th className="px-4 py-3 text-left">
                <ThBtn col="driver_name">Driver</ThBtn>
              </th>
              <th className="px-4 py-3 text-left">
                <ThBtn col="plant">Plant</ThBtn>
              </th>
              <th className="px-4 py-3 text-left">
                <ThBtn col="jam_masuk">Jam Masuk</ThBtn>
              </th>
              <th className="px-4 py-3 text-left">
                <ThBtn col="jam_keluar">Jam Keluar</ThBtn>
              </th>
              <th className="px-4 py-3 text-left">
                <ThBtn col="total_jam">Total Jam</ThBtn>
              </th>
              <th className="px-4 py-3 text-left">
                <ThBtn col="overtime_jam">OT Jam</ThBtn>
              </th>
              <th className="px-4 py-3 text-left">
                <ThBtn col="status_kerja">Status</ThBtn>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Catatan
                </span>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Aksi
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-12 text-center text-sm text-slate-400"
                >
                  {search
                    ? "Tidak ada data yang cocok dengan pencarian"
                    : "Belum ada data kehadiran"}
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-slate-50 transition-colors",
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  )}
                >
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                    {formatDate(row.tanggal)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">
                      {row.master_driver?.nama_driver}
                    </p>
                    <p className="text-xs text-slate-400">
                      {row.master_driver?.no_polisi || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {row.master_driver?.plant}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-mono">
                    {formatTime(row.jam_masuk)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-mono">
                    {formatTime(row.jam_keluar)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                    {formatJam(row.total_jam || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                    {row.overtime_jam && row.overtime_jam > 0
                      ? formatJam(row.overtime_jam)
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        getStatusColor(row.status_kerja)
                      )}
                    >
                      {row.status_kerja || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-[150px] truncate">
                    {row.catatan || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(row)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, sorted.length)}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-slate-700">{sorted.length}</span>{" "}
            data
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - page) <= 1
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                  acc.push("...");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="text-xs text-slate-400 px-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors",
                      page === p
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
