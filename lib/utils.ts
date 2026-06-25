import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse time string "HH:MM" into minutes from midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculate total working hours between jam_masuk and jam_keluar
 * Returns total hours as decimal (e.g. 8.5)
 */
export function calculateTotalJam(
  jam_masuk: string,
  jam_keluar: string
): number {
  const masukMinutes = timeToMinutes(jam_masuk);
  const keluar = jam_keluar;
  const keluarMinutes = timeToMinutes(keluar);

  // Handle overnight shifts
  let diffMinutes = keluarMinutes - masukMinutes;
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  return Math.round((diffMinutes / 60) * 100) / 100;
}

/**
 * Calculate overtime jam
 * Normal = 8.5 jam (08:00 - 16:30)
 * Regular: total_jam <= 9.5
 * Overtime: total_jam > 9.5
 * Overtime jam = total_jam - 9.5 (if overtime)
 */
export function calculateOvertime(totalJam: number): {
  overtime_jam: number;
  status_kerja: "Regular" | "Overtime";
} {
  const OVERTIME_THRESHOLD = 9.5;

  if (totalJam > OVERTIME_THRESHOLD) {
    const overtime_jam =
      Math.round((totalJam - OVERTIME_THRESHOLD) * 100) / 100;
    return { overtime_jam, status_kerja: "Overtime" };
  }

  return { overtime_jam: 0, status_kerja: "Regular" };
}

/**
 * Format decimal hours to display string e.g. 8.5 -> "8j 30m"
 */
export function formatJam(jam: number): string {
  if (!jam && jam !== 0) return "-";
  const hours = Math.floor(jam);
  const minutes = Math.round((jam - hours) * 60);
  if (minutes === 0) return `${hours}j`;
  return `${hours}j ${minutes}m`;
}

/**
 * Format date string to locale display
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format time "HH:MM:SS" to "HH:MM"
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return "-";
  return timeStr.substring(0, 5);
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(month: number): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month - 1] || "";
}

/**
 * Get current month and year
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

/**
 * Generate years array for select
 */
export function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    years.push(y);
  }
  return years;
}

/**
 * Get status badge color class
 */
export function getStatusColor(status: string | null): string {
  if (status === "Overtime")
    return "bg-blue-100 text-blue-700 border border-blue-200";
  if (status === "Regular")
    return "bg-green-100 text-green-700 border border-green-200";
  return "bg-gray-100 text-gray-600 border border-gray-200";
}
