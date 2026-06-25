"use client";

import { useState, useEffect } from "react";
import { supabase, MasterDriver, DriverControl } from "@/lib/supabase";
import {
  calculateTotalJam,
  calculateOvertime,
  formatJam,
} from "@/lib/utils";
import toast from "react-hot-toast";
import { Save, RotateCcw, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DriverFormProps {
  editData?: DriverControl | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DEFAULT_FORM = {
  tanggal: new Date().toISOString().split("T")[0],
  driver_id: "",
  jam_masuk: "08:00",
  jam_keluar: "16:30",
  catatan: "",
};

export default function DriverForm({
  editData,
  onSuccess,
  onCancel,
}: DriverFormProps) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [drivers, setDrivers] = useState<MasterDriver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<MasterDriver | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    total: number;
    overtime: number;
    status: string;
  } | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (editData) {
      setForm({
        tanggal: editData.tanggal,
        driver_id: editData.driver_id,
        jam_masuk: editData.jam_masuk.substring(0, 5),
        jam_keluar: editData.jam_keluar.substring(0, 5),
        catatan: editData.catatan || "",
      });
    }
  }, [editData]);

  useEffect(() => {
    if (form.driver_id && drivers.length > 0) {
      const found = drivers.find((d) => d.id === form.driver_id);
      setSelectedDriver(found || null);
    } else {
      setSelectedDriver(null);
    }
  }, [form.driver_id, drivers]);

  useEffect(() => {
    if (form.jam_masuk && form.jam_keluar) {
      try {
        const total = calculateTotalJam(form.jam_masuk, form.jam_keluar);
        const { overtime_jam, status_kerja } = calculateOvertime(total);
        setPreview({ total, overtime: overtime_jam, status: status_kerja });
      } catch {
        setPreview(null);
      }
    }
  }, [form.jam_masuk, form.jam_keluar]);

  async function fetchDrivers() {
    const { data } = await supabase
      .from("master_driver")
      .select("*")
      .order("nama_driver");
    if (data) setDrivers(data);
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleReset() {
    setForm(DEFAULT_FORM);
    setSelectedDriver(null);
    setPreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.driver_id) {
      toast.error("Pilih driver terlebih dahulu");
      return;
    }
    if (!form.jam_masuk || !form.jam_keluar) {
      toast.error("Jam masuk dan keluar harus diisi");
      return;
    }

    setLoading(true);
    try {
      const totalJam = calculateTotalJam(form.jam_masuk, form.jam_keluar);
      const { overtime_jam, status_kerja } = calculateOvertime(totalJam);

      const payload = {
        tanggal: form.tanggal,
        driver_id: form.driver_id,
        jam_masuk: form.jam_masuk + ":00",
        jam_keluar: form.jam_keluar + ":00",
        total_jam: totalJam,
        overtime_jam,
        status_kerja,
        catatan: form.catatan || null,
      };

      if (editData) {
        const { error } = await supabase
          .from("driver_control")
          .update(payload)
          .eq("id", editData.id);
        if (error) throw error;
        toast.success("Data berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from("driver_control")
          .insert(payload);
        if (error) {
          if (error.code === "23505") {
            toast.error("Data untuk driver & tanggal ini sudah ada");
          } else {
            throw error;
          }
          return;
        }
        toast.success("Data berhasil disimpan");
        handleReset();
      }

      onSuccess?.();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tanggal */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800"
          />
        </div>

        {/* Driver */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Driver <span className="text-red-500">*</span>
          </label>
          <select
            name="driver_id"
            value={form.driver_id}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800"
          >
            <option value="">-- Pilih Driver --</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama_driver}
              </option>
            ))}
          </select>
        </div>

        {/* Plant (Auto-fill) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Plant
          </label>
          <input
            type="text"
            value={selectedDriver?.plant || ""}
            readOnly
            placeholder="Otomatis terisi saat driver dipilih"
            className="w-full border border-slate-100 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
          />
        </div>

        {/* No. Polisi (Auto-fill) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            No. Polisi
          </label>
          <input
            type="text"
            value={selectedDriver?.no_polisi || ""}
            readOnly
            placeholder="Otomatis terisi saat driver dipilih"
            className="w-full border border-slate-100 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
          />
        </div>

        {/* Jam Masuk */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Jam Masuk <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="time"
              name="jam_masuk"
              value={form.jam_masuk}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Normal: 08:00</p>
        </div>

        {/* Jam Keluar */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Jam Keluar <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="time"
              name="jam_keluar"
              value={form.jam_keluar}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Normal: 16:30</p>
        </div>
      </div>

      {/* Catatan */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Catatan
        </label>
        <textarea
          name="catatan"
          value={form.catatan}
          onChange={handleChange}
          rows={3}
          placeholder="Tambahkan catatan (opsional)..."
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800 resize-none"
        />
      </div>

      {/* Preview Kalkulasi */}
      {preview && (
        <div
          className={cn(
            "rounded-xl p-4 border",
            preview.status === "Overtime"
              ? "bg-blue-50 border-blue-200"
              : "bg-green-50 border-green-200"
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle
              className={cn(
                "w-4 h-4",
                preview.status === "Overtime"
                  ? "text-blue-600"
                  : "text-green-600"
              )}
            />
            <p className="text-sm font-semibold text-slate-700">
              Preview Kalkulasi
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Total Jam</p>
              <p className="text-sm font-bold text-slate-800">
                {formatJam(preview.total)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Overtime</p>
              <p className="text-sm font-bold text-slate-800">
                {preview.overtime > 0 ? formatJam(preview.overtime) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Status</p>
              <span
                className={cn(
                  "inline-block text-xs font-semibold px-2 py-0.5 rounded-full",
                  preview.status === "Overtime"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                )}
              >
                {preview.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          {loading ? "Menyimpan..." : editData ? "Perbarui" : "Simpan"}
        </button>
        <button
          type="button"
          onClick={editData ? onCancel : handleReset}
          className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {editData ? "Batal" : "Reset"}
        </button>
      </div>
    </form>
  );
}
