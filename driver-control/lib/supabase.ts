import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching database schema
export interface MasterDriver {
  id: string;
  nama_driver: string;
  plant: string;
  no_polisi: string | null;
  created_at: string;
}

export interface DriverControl {
  id: string;
  tanggal: string;
  driver_id: string;
  jam_masuk: string;
  jam_keluar: string;
  total_jam: number | null;
  overtime_jam: number | null;
  status_kerja: string | null;
  catatan: string | null;
  created_at: string;
  master_driver?: MasterDriver;
}

export interface DriverControlWithDriver extends DriverControl {
  master_driver: MasterDriver;
}
