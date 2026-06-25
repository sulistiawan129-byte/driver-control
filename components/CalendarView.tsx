"use client";

import { useEffect, useRef, useCallback } from "react";
import { DriverControlWithDriver, MasterDriver } from "@/lib/supabase";
import { formatTime, formatJam } from "@/lib/utils";

interface CalendarViewProps {
  data: DriverControlWithDriver[];
  drivers: MasterDriver[];
  selectedDriverId: string;
  selectedPlant: string;
}

interface CalendarEvent {
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    driver: string;
    plant: string;
    jam_masuk: string;
    jam_keluar: string;
    total_jam: number;
    overtime_jam: number;
    status: string;
    catatan: string;
  };
}

export default function CalendarView({
  data,
  selectedDriverId,
  selectedPlant,
}: CalendarViewProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarInstance = useRef<any>(null);

  const buildEvents = useCallback((): CalendarEvent[] => {
    let filtered = data;
    if (selectedDriverId) {
      filtered = filtered.filter((d) => d.driver_id === selectedDriverId);
    }
    if (selectedPlant) {
      filtered = filtered.filter(
        (d) => d.master_driver?.plant === selectedPlant
      );
    }

    // Group by date for "all driver" mode
    if (!selectedDriverId) {
      const byDate: Record<
        string,
        { regular: number; overtime: number; total: number }
      > = {};
      filtered.forEach((row) => {
        if (!byDate[row.tanggal])
          byDate[row.tanggal] = { regular: 0, overtime: 0, total: 0 };
        if (row.status_kerja === "Overtime") {
          byDate[row.tanggal].overtime++;
        } else {
          byDate[row.tanggal].regular++;
        }
        byDate[row.tanggal].total++;
      });

      const events: CalendarEvent[] = [];
      Object.entries(byDate).forEach(([date, counts]) => {
        if (counts.regular > 0) {
          events.push({
            title: `✓ ${counts.regular} Regular`,
            start: date,
            backgroundColor: "#22c55e",
            borderColor: "#16a34a",
            textColor: "#ffffff",
            extendedProps: {
              driver: "Multiple",
              plant: "",
              jam_masuk: "",
              jam_keluar: "",
              total_jam: 0,
              overtime_jam: 0,
              status: "Regular",
              catatan: `${counts.regular} driver regular`,
            },
          });
        }
        if (counts.overtime > 0) {
          events.push({
            title: `⏰ ${counts.overtime} Overtime`,
            start: date,
            backgroundColor: "#3b82f6",
            borderColor: "#2563eb",
            textColor: "#ffffff",
            extendedProps: {
              driver: "Multiple",
              plant: "",
              jam_masuk: "",
              jam_keluar: "",
              total_jam: 0,
              overtime_jam: 0,
              status: "Overtime",
              catatan: `${counts.overtime} driver overtime`,
            },
          });
        }
      });
      return events;
    }

    // Per driver mode
    return filtered.map((row) => ({
      title:
        row.status_kerja === "Overtime"
          ? `⏰ OT ${formatJam(row.overtime_jam || 0)}`
          : `✓ ${formatTime(row.jam_masuk)}–${formatTime(row.jam_keluar)}`,
      start: row.tanggal,
      backgroundColor:
        row.status_kerja === "Overtime" ? "#3b82f6" : "#22c55e",
      borderColor: row.status_kerja === "Overtime" ? "#2563eb" : "#16a34a",
      textColor: "#ffffff",
      extendedProps: {
        driver: row.master_driver?.nama_driver || "",
        plant: row.master_driver?.plant || "",
        jam_masuk: row.jam_masuk,
        jam_keluar: row.jam_keluar,
        total_jam: row.total_jam || 0,
        overtime_jam: row.overtime_jam || 0,
        status: row.status_kerja || "",
        catatan: row.catatan || "",
      },
    }));
  }, [data, selectedDriverId, selectedPlant]);

  useEffect(() => {
    if (!calendarRef.current) return;

    // Dynamically import FullCalendar to avoid SSR issues
    const loadCalendar = async () => {
      const { Calendar } = await import("@fullcalendar/core");
      const dayGridPlugin = (await import("@fullcalendar/daygrid")).default;
      const interactionPlugin = (await import("@fullcalendar/interaction"))
        .default;

      if (calendarInstance.current) {
        calendarInstance.current.destroy();
      }

      const calendar = new Calendar(calendarRef.current!, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: "dayGridMonth",
        locale: "id",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        },
        buttonText: {
          today: "Hari Ini",
          month: "Bulan",
          week: "Minggu",
        },
        events: buildEvents(),
        height: "auto",
        eventClick: (info) => {
          const props = info.event.extendedProps;
          if (props.driver !== "Multiple") {
            alert(
              `Driver: ${props.driver}\nPlant: ${props.plant}\nMasuk: ${formatTime(props.jam_masuk)}\nKeluar: ${formatTime(props.jam_keluar)}\nTotal: ${formatJam(props.total_jam)}\nOvertime: ${formatJam(props.overtime_jam)}\nStatus: ${props.status}\nCatatan: ${props.catatan || "-"}`
            );
          }
        },
        dayCellClassNames: "hover:bg-blue-50 transition-colors cursor-pointer",
        eventDisplay: "block",
        dayMaxEvents: 3,
      });

      calendar.render();
      calendarInstance.current = calendar;
    };

    loadCalendar();

    return () => {
      if (calendarInstance.current) {
        calendarInstance.current.destroy();
        calendarInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update events when data/filters change
  useEffect(() => {
    if (calendarInstance.current) {
      calendarInstance.current.removeAllEvents();
      calendarInstance.current.addEventSource(buildEvents());
    }
  }, [buildEvents]);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
      <div ref={calendarRef} />
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-xs text-slate-600 font-medium">Regular</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-xs text-slate-600 font-medium">Overtime</span>
        </div>
      </div>
    </div>
  );
}
