"use client";

import { useEffect, useState } from "react";
import { supabase, MasterDriver } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Users,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatDate } from "@/lib/utils";

const DEFAULT_FORM = {
  nama_driver: "",
  plant: "",
  no_polisi: "",
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<MasterDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDriver, setEditDriver] = useState<MasterDriver | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("master_driver")
      .select("*")
      .order("nama_driver");
    if (!error && data) setDrivers(data);
    setLoading(false);
  }

  function openAdd() {
    setEditDriver(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  }

  function openEdit(driver: MasterDriver) {
    setEditDriver(driver);
    setForm({
      nama_driver: driver.nama_driver,
      plant: driver.plant,
      no_polisi: driver.no_polisi || "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditDriver(null);
    setForm(DEFAULT_FORM);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama_driver.trim() || !form.plant.trim()) {
      toast.error("Nama driver dan plant wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nama_driver: form.nama_driver.trim(),
        plant: form.plant.trim(),
        no_polisi: form.no_polisi.trim() || null,
      };
      if (editDriver) {
        const { error } = await supabase
          .from("master_driver")
          .update(payload)
          .eq("id", editDriver.id);
        if (error) throw error;
        toast.success("Driver berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from("master_driver")
          .insert(payload);
        if (error) {
          if (error.code === "23505") {
            toast.error("Nama driver sudah terdaftar");
          } else throw error;
          return;
        }
        toast.success("Driver berhasil ditambahkan");
      }
      closeModal();
      fetchDrivers();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus driver "${name}"? Data kehadiran terkait juga akan terhapus.`)) return;
    const { error } = await supabase.from("master_driver").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus driver");
    } else {
      toast.success("Driver berhasil dihapus");
      fetchDrivers();
    }
  }

  // Get unique plants for stats
  const plants = [...new Set(drivers.map((d) => d.plant))];

  // Filter & paginate
  const filtered = drivers.filter(
    (d) =>
      d.nama_driver.toLowerCase().includes(search.toLowerCase()) ||
      d.plant.toLowerCase().includes(search.toLowerCase()) ||
      (d.no_polisi || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Master Driver"
        subtitle={`${drivers.length} driver terdaftar di ${plants.length} plant`}
        actions={
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Driver
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Plant summary */}
        {plants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {plants.map((plant) => {
              const count = drivers.filter((d) => d.plant === plant).length;
              return (
                <div
                  key={plant}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-card"
                >
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-700">
                    {plant}
                  </span>
                  <span className="text-xs text-slate-400">({count})</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari driver, plant, no. polisi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full bg-slate-50"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full spinner" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Nama Driver
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Plant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        No. Polisi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Terdaftar
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginated.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-sm text-slate-400"
                        >
                          {search
                            ? "Tidak ada driver yang cocok"
                            : "Belum ada driver terdaftar"}
                        </td>
                      </tr>
                    ) : (
                      paginated.map((driver, idx) => (
                        <tr
                          key={driver.id}
                          className={cn(
                            "hover:bg-slate-50 transition-colors",
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          )}
                        >
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {(page - 1) * PAGE_SIZE + idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-blue-600">
                                  {driver.nama_driver[0].toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-slate-800">
                                {driver.nama_driver}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              {driver.plant}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                            {driver.no_polisi || (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {formatDate(driver.created_at.split("T")[0])}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEdit(driver)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(driver.id, driver.nama_driver)
                                }
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
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
              {filtered.length > PAGE_SIZE && (
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filtered.length)} dari{" "}
                    {filtered.length} driver
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">
                {editDriver ? "Edit Driver" : "Tambah Driver Baru"}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nama Driver <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nama_driver}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nama_driver: e.target.value }))
                  }
                  required
                  placeholder="Masukkan nama driver"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Plant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.plant}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, plant: e.target.value }))
                  }
                  required
                  placeholder="Nama plant / lokasi"
                  list="plant-suggestions"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <datalist id="plant-suggestions">
                  {plants.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  No. Polisi
                </label>
                <input
                  type="text"
                  value={form.no_polisi}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, no_polisi: e.target.value }))
                  }
                  placeholder="Contoh: B 1234 ABC (opsional)"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Menyimpan..." : editDriver ? "Perbarui" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
