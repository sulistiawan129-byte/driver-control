"use client";

import { useEffect, useState } from "react";
import { supabase, MasterDriver } from "@/lib/supabase";
import {
  calculateTotalJam,
  calculateOvertime,
  formatJam,
} from "@/lib/utils";
import { Truck, Clock, CheckCircle2, ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "select" | "form" | "success";

export default function DriverInputPage() {
  const [step, setStep] = useState<Step>("select");
  const [drivers, setDrivers] = useState<MasterDriver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<MasterDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [jamMasuk, setJamMasuk] = useState("08:00");
  const [jamKeluar, setJamKeluar] = useState("16:30");
  const [catatan, setCatatan] = useState("");

  // Preview kalkulasi
  let preview = null;
  try {
    const total = calculateTotalJam(jamMasuk, jamKeluar);
    const { overtime_jam, status_kerja } = calculateOvertime(total);
    preview = { total, overtime: overtime_jam, status: status_kerja };
  } catch {
    preview = null;
  }

  useEffect(() => {
    supabase
      .from("master_driver")
      .select("*")
      .order("nama_driver")
      .then(({ data }) => {
        if (data) setDrivers(data);
        setLoading(false);
      });
  }, []);

  async function handleSubmit() {
    if (!selectedDriver) return;
    setSubmitting(true);
    setError("");

    try {
      const totalJam = calculateTotalJam(jamMasuk, jamKeluar);
      const { overtime_jam, status_kerja } = calculateOvertime(totalJam);

      const { error: err } = await supabase.from("driver_control").insert({
        tanggal: today,
        driver_id: selectedDriver.id,
        jam_masuk: jamMasuk + ":00",
        jam_keluar: jamKeluar + ":00",
        total_jam: totalJam,
        overtime_jam,
        status_kerja,
        catatan: catatan || null,
      });

      if (err) {
        if (err.code === "23505") {
          setError("Data hari ini untuk kamu sudah tercatat sebelumnya.");
        } else {
          setError("Gagal menyimpan. Silakan coba lagi.");
        }
        return;
      }

      setStep("success");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setStep("select");
    setSelectedDriver(null);
    setJamMasuk("08:00");
    setJamKeluar("16:30");
    setCatatan("");
    setError("");
  }

  const todayLabel = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex flex-col">

      {/* Header */}
      <div className="px-5 pt-10 pb-6 text-center">
        <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-white text-2xl font-bold tracking-wide">DRIVER CONTROL</h1>
        <p className="text-blue-200 text-sm mt-1">Input Kehadiran Harian</p>
        <div className="mt-3 inline-block bg-white/10 rounded-full px-4 py-1.5">
          <p className="text-white text-xs font-medium">{todayLabel}</p>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 bg-white rounded-t-3xl px-5 pt-7 pb-10">

        {/* STEP 1: Pilih Driver */}
        {step === "select" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">Halo! Siapa kamu?</h2>
              <p className="text-sm text-slate-500">Pilih nama kamu dari daftar di bawah</p>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Memuat daftar driver...</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {drivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => {
                      setSelectedDriver(driver);
                      setStep("form");
                    }}
                    className="w-full flex items-center gap-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl px-4 py-4 transition-all text-left active:scale-98"
                  >
                    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold text-lg">
                        {driver.nama_driver[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{driver.nama_driver}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{driver.plant} {driver.no_polisi ? `· ${driver.no_polisi}` : ""}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Form Input */}
        {step === "form" && selectedDriver && (
          <div className="space-y-5">
            {/* Driver terpilih */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">
                  {selectedDriver.nama_driver[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">{selectedDriver.nama_driver}</p>
                <p className="text-xs text-slate-500">{selectedDriver.plant}</p>
              </div>
              <button
                onClick={() => setStep("select")}
                className="text-xs text-blue-600 font-semibold bg-blue-100 px-2.5 py-1 rounded-lg"
              >
                Ganti
              </button>
            </div>

            {/* Tanggal */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Tanggal</p>
              <p className="text-sm font-bold text-slate-800">{todayLabel}</p>
            </div>

            {/* Jam Masuk */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Jam Masuk
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="time"
                  value={jamMasuk}
                  onChange={(e) => setJamMasuk(e.target.value)}
                  className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-2xl pl-12 pr-4 py-4 text-lg font-bold text-slate-800 focus:outline-none bg-white transition-colors"
                />
              </div>
            </div>

            {/* Jam Keluar */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Jam Keluar
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="time"
                  value={jamKeluar}
                  onChange={(e) => setJamKeluar(e.target.value)}
                  className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-2xl pl-12 pr-4 py-4 text-lg font-bold text-slate-800 focus:outline-none bg-white transition-colors"
                />
              </div>
            </div>

            {/* Preview Kalkulasi */}
            {preview && (
              <div className={cn(
                "rounded-2xl p-4 border-2",
                preview.status === "Overtime"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-green-50 border-green-200"
              )}>
                <p className="text-xs font-bold uppercase tracking-wide mb-3 text-slate-500">
                  Kalkulasi Otomatis
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Jam</p>
                    <p className="text-base font-bold text-slate-800">{formatJam(preview.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Overtime</p>
                    <p className="text-base font-bold text-blue-600">
                      {preview.overtime > 0 ? formatJam(preview.overtime) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <span className={cn(
                      "inline-block text-xs font-bold px-2 py-1 rounded-full",
                      preview.status === "Overtime"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    )}>
                      {preview.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Catatan */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Catatan <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={3}
                placeholder="Tambahkan catatan jika ada..."
                className="w-full border-2 border-slate-200 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:outline-none bg-white resize-none transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-base py-4 rounded-2xl transition-colors shadow-lg shadow-blue-200"
            >
              {submitting ? "Menyimpan..." : "Simpan Kehadiran"}
            </button>
          </div>
        )}

        {/* STEP 3: Sukses */}
        {step === "success" && selectedDriver && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-5">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">Kehadiran Tercatat!</h2>
              <p className="text-slate-500 text-sm mt-1">Data kamu berhasil disimpan</p>
            </div>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Driver</span>
                <span className="text-sm font-bold text-slate-800">{selectedDriver.nama_driver}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Tanggal</span>
                <span className="text-sm font-semibold text-slate-700">{todayLabel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Jam Masuk</span>
                <span className="text-sm font-semibold text-slate-700">{jamMasuk}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Jam Keluar</span>
                <span className="text-sm font-semibold text-slate-700">{jamKeluar}</span>
              </div>
              {preview && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Total Jam</span>
                    <span className="text-sm font-bold text-slate-800">{formatJam(preview.total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Status</span>
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-full",
                      preview.status === "Overtime"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    )}>
                      {preview.status}
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleReset}
              className="w-full border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl transition-colors"
            >
              Input Driver Lain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
