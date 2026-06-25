"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DriverForm from "@/components/DriverForm";
import PageHeader from "@/components/PageHeader";
import { supabase, DriverControl } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function InputPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  const [editData, setEditData] = useState<DriverControl | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      setLoading(true);
      supabase
        .from("driver_control")
        .select("*")
        .eq("id", editId)
        .single()
        .then(({ data }) => {
          if (data) setEditData(data as DriverControl);
          setLoading(false);
        });
    }
  }, [editId]);

  function handleSuccess() {
    if (editId) {
      router.push("/dashboard");
    }
  }

  function handleCancel() {
    router.push("/dashboard");
  }

  return (
    <div>
      <PageHeader
        title={editId ? "Edit Data Kehadiran" : "Input Data Kehadiran"}
        subtitle={
          editId
            ? "Perbarui data kehadiran driver"
            : "Catat jam masuk dan keluar driver"
        }
        actions={
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        }
      />

      <div className="p-6">
        <div className="max-w-3xl">
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
            <div className="mb-5 pb-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">
                {editId ? "Edit Data" : "Form Input Kehadiran"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Status kerja (Regular/Overtime) dihitung otomatis berdasarkan
                jam kerja.
              </p>
            </div>

            {loading ? (
              <div className="py-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full spinner" />
              </div>
            ) : (
              <DriverForm
                editData={editId ? editData : null}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            )}
          </div>

          {/* Info box */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-blue-700 mb-2">
              Aturan Overtime
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
              <div>
                <p className="font-medium text-slate-700">Jam Normal</p>
                <p>08:00 – 16:30 (8.5 jam)</p>
              </div>
              <div>
                <p className="font-medium text-slate-700">Ambang Overtime</p>
                <p>Total jam &gt; 9.5 jam</p>
              </div>
              <div>
                <p className="font-medium text-slate-700">
                  Status Regular 🟢
                </p>
                <p>Total jam ≤ 9.5 jam</p>
              </div>
              <div>
                <p className="font-medium text-slate-700">
                  Status Overtime 🔵
                </p>
                <p>Total jam &gt; 9.5 jam</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InputPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full spinner" />
        </div>
      }
    >
      <InputPageContent />
    </Suspense>
  );
}
