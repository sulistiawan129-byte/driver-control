import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Driver Control - Monitoring Kehadiran & Overtime",
  description:
    "Sistem monitoring kehadiran dan overtime driver operasional perusahaan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-slate-50">
            <div className="min-h-full">{children}</div>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              padding: "0.75rem 1rem",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#f8fafc" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#f8fafc" },
            },
          }}
        />
      </body>
    </html>
  );
}
