import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Input Kehadiran - Driver Control",
  description: "Form input kehadiran harian untuk driver",
};

export default function DriverInputLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            borderRadius: "1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
          },
        }}
      />
    </div>
  );
}
