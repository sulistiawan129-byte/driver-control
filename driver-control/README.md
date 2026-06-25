# 🚛 Driver Control

Sistem monitoring kehadiran dan overtime driver operasional perusahaan.

Built with Next.js 15, TypeScript, Tailwind CSS, Supabase, FullCalendar, dan Chart.js.

---

## ✨ Fitur

- **Dashboard** — 4 summary card (Total Driver, Regular, Overtime, Total Jam OT) + tabel riwayat
- **Input Data** — Form catat kehadiran dengan kalkulasi otomatis overtime
- **Kalender** — FullCalendar dengan mode Semua Driver & Per Driver, filter plant
- **Master Driver** — CRUD driver dengan search & pagination
- **Laporan** — 4 chart (Ranking OT, OT per Bulan, OT per Plant, Total Jam per Driver)
- **Responsive** — Mobile & Desktop ready
- **Deploy Ready** — Siap deploy ke Vercel

---

## 🗄️ Setup Database Supabase

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Table master_driver
create table master_driver (
    id uuid primary key default gen_random_uuid(),
    nama_driver varchar(100) not null unique,
    plant varchar(100) not null,
    no_polisi varchar(20),
    created_at timestamptz default now()
);

-- Table driver_control
create table driver_control (
    id uuid primary key default gen_random_uuid(),
    tanggal date not null,
    driver_id uuid not null references master_driver(id) on delete cascade,
    jam_masuk time not null,
    jam_keluar time not null,
    total_jam numeric(5,2),
    overtime_jam numeric(5,2),
    status_kerja varchar(20),
    catatan text,
    created_at timestamptz default now(),
    unique(tanggal, driver_id)
);

-- Enable RLS (optional, for security)
alter table master_driver enable row level security;
alter table driver_control enable row level security;

-- Allow public access (adjust as needed)
create policy "Allow all" on master_driver for all using (true) with check (true);
create policy "Allow all" on driver_control for all using (true) with check (true);
```

---

## 🚀 Cara Menjalankan

### 1. Clone & Install

```bash
git clone <your-repo>
cd driver-control
npm install
```

### 2. Konfigurasi Environment

Copy file `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> Dapatkan URL dan Key dari Supabase Dashboard → Settings → API

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy ke Vercel

### Via Vercel CLI

```bash
npm i -g vercel
vercel
```

### Via GitHub

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

---

## 📐 Logika Overtime

| Kondisi | Status | Keterangan |
|---------|--------|-----------|
| Total Jam ≤ 9.5 | Regular 🟢 | Tidak ada overtime |
| Total Jam > 9.5 | Overtime 🔵 | Overtime = Total - 9.5 |

- Jam normal: 08:00 – 16:30 (8.5 jam)
- Threshold overtime: 9.5 jam
- Status dihitung otomatis, tidak bisa dipilih manual

---

## 📁 Struktur Folder

```
driver-control/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx        # Dashboard utama
│   │   └── input/
│   │       └── page.tsx    # Form input data
│   ├── calendar/
│   │   └── page.tsx        # Halaman kalender
│   ├── drivers/
│   │   └── page.tsx        # Master driver CRUD
│   ├── report/
│   │   └── page.tsx        # Laporan & chart
│   ├── layout.tsx
│   ├── page.tsx            # Redirect ke dashboard
│   └── globals.css
├── components/
│   ├── Sidebar.tsx         # Navigasi sidebar
│   ├── SummaryCard.tsx     # Card statistik
│   ├── DriverForm.tsx      # Form input kehadiran
│   ├── DataTable.tsx       # Tabel data dengan search/sort/pagination
│   ├── CalendarView.tsx    # FullCalendar wrapper
│   ├── Charts.tsx          # Chart.js komponen
│   └── PageHeader.tsx      # Header halaman
├── lib/
│   ├── supabase.ts         # Supabase client & types
│   └── utils.ts            # Helper functions
├── .env.local              # Environment variables (tidak di-commit)
├── .env.example            # Template env
├── vercel.json
└── package.json
```

---

## 🛠️ Tech Stack

- **Next.js 15** — App Router, React 19
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Supabase** — Database & Backend
- **FullCalendar** — Kalender interaktif
- **Chart.js + react-chartjs-2** — Visualisasi data
- **Lucide React** — Icons
- **react-hot-toast** — Notifikasi

---

## 📄 License

MIT
