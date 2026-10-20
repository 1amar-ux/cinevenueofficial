import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Clock,
  Send,
  RefreshCw,
  Shield,
  Film,
  Calendar,
  AlertTriangle,
  Sliders,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  MapPin,
  Save,
  Play
} from "lucide-react";
import apiClient from "../../services/apiClient";

interface ReminderInterval {
  id: string;
  label: string;
  minutes: number;
  enabled: boolean;
}

interface ReminderSettings {
  movieRemindersEnabled: boolean;
  eventRemindersEnabled: boolean;
  intervals: ReminderInterval[];
  templates: {
    movie: { title: string; body: string };
    event: { title: string; body: string };
  };
  updatedAt: string;
  updatedBy: string;
}

interface ReminderLog {
  id: string;
  bookingId: string;
  type: "MOVIE" | "EVENT";
  title: string;
  venueName: string;
  recipient: string;
  interval: string;
  channel: string;
  status: "SCHEDULED" | "DELIVERED" | "CANCELLED" | "SKIPPED";
  scheduledFor: string;
  dispatchedAt?: string;
  details?: string;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  movieRemindersEnabled: true,
  eventRemindersEnabled: true,
  intervals: [
    { id: "24h", label: "24 Hours Before", minutes: 1440, enabled: true },
    { id: "3h", label: "3 Hours Before", minutes: 180, enabled: true },
    { id: "1h", label: "1 Hour Before", minutes: 60, enabled: true },
    { id: "15m", label: "15 Minutes Before", minutes: 15, enabled: true }
  ],
  templates: {
    movie: {
      title: "Your Movie Starts in {timeRemaining}!",
      body: "Your movie \"{movieTitle}\" starts in {timeRemaining} at {theatreName}! Open CineVenue to view your ticket and get directions."
    },
    event: {
      title: "Your Event Starts in {timeRemaining}!",
      body: "Your event \"{eventTitle}\" starts soon at {venueName}! Check your ticket and venue location on CineVenue."
    }
  },
  updatedAt: new Date().toISOString(),
  updatedBy: "Super Admin"
};

export default function BookingRemindersAdminModule() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [searchLog, setSearchLog] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "MOVIE" | "EVENT">("ALL");

  const fetchSettingsAndLogs = async () => {
    setLoading(true);
    try {
      const [resSettings, resLogs] = await Promise.all([
        apiClient.get("/notifications/reminders/settings"),
        apiClient.get("/notifications/reminders/logs?limit=50")
      ]);
      if (resSettings.data?.data) {
        setSettings(resSettings.data.data);
      }
      if (resLogs.data?.data) {
        setLogs(resLogs.data.data);
      }
    } catch (err) {
      console.warn("Could not load backend reminder settings, using local store:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndLogs();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await apiClient.put("/notifications/reminders/settings", settings);
      if (res.data?.data) {
        setSettings(res.data.data);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save reminder settings. Please verify admin privileges.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestDispatch = async (type: "MOVIE" | "EVENT") => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiClient.post("/notifications/reminders/test-dispatch", {
        type,
        title: type === "MOVIE" ? "Devara: Part 1" : "CineVenue Live Gala",
        venueName: type === "MOVIE" ? "PVR Nexus, Kukatpally" : "LB Stadium, Hyderabad",
        recipient: "admin@cinevenue.com"
      });
      if (res.data?.success) {
        setTestResult(`✓ Test ${type} reminder dispatched: "${res.data.data.notification.body}"`);
        fetchSettingsAndLogs();
      }
    } catch (err: any) {
      setTestResult("Test dispatch failed: " + (err.response?.data?.message || err.message));
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 6000);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType !== "ALL" && log.type !== filterType) return false;
    if (
      searchLog &&
      !log.title.toLowerCase().includes(searchLog.toLowerCase()) &&
      !log.bookingId.toLowerCase().includes(searchLog.toLowerCase()) &&
      !log.venueName.toLowerCase().includes(searchLog.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-white max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Enterprise Automation Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                Active & Synced
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Booking Reminders & Smart Location Dispatch
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Automated multi-interval notifications (24h, 3h, 1h, 15m) with verified venue GPS navigation for movies & events.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettingsAndLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Refresh logs & settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#D4AF37]/20 disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-black" />
            ) : (
              <Save className="w-4 h-4 text-black" />
            )}
            <span>{saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Grid: Master Toggles & Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Master Controls */}
        <div className="bg-white dark:bg-[#12131A] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-white/10">
            <Sliders className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Category Automation Switches
            </h3>
          </div>

          <div className="space-y-4">
            {/* Movie Reminders Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white block">
                    Movie Ticket Reminders
                  </span>
                  <span className="text-xs text-gray-500 dark:text-white/50 block">
                    Dispatch pre-show alerts & theatre GPS navigation
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.movieRemindersEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, movieRemindersEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
              </label>
            </div>

            {/* Event Reminders Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white block">
                    Event Pass Reminders
                  </span>
                  <span className="text-xs text-gray-500 dark:text-white/50 block">
                    Dispatch event passes & venue entrance coordinates
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.eventRemindersEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, eventRemindersEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
              </label>
            </div>
          </div>

          {/* Test Buttons */}
          <div className="pt-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-2">
              Instant Diagnostic Triggers
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTestDispatch("MOVIE")}
                disabled={testing}
                className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Movie Reminder</span>
              </button>
              <button
                type="button"
                onClick={() => handleTestDispatch("EVENT")}
                disabled={testing}
                className="py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Event Reminder</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Timing Schedule Intervals */}
        <div className="bg-white dark:bg-[#12131A] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-white/10">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Configurable Timing Schedule
            </h3>
          </div>

          <div className="space-y-3">
            {settings.intervals.map((interval, idx) => (
              <div
                key={interval.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-[#D4AF37] font-mono text-xs font-black flex items-center justify-center">
                    {interval.id}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      {interval.label}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-white/40 font-mono block">
                      {interval.minutes} minutes before start time
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={interval.minutes}
                    onChange={(e) => {
                      const updated = [...settings.intervals];
                      updated[idx].minutes = Math.max(1, parseInt(e.target.value) || 1);
                      setSettings({ ...settings, intervals: updated });
                    }}
                    className="w-20 px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-center text-gray-900 dark:text-white"
                  />
                  <input
                    type="checkbox"
                    checked={interval.enabled}
                    onChange={(e) => {
                      const updated = [...settings.intervals];
                      updated[idx].enabled = e.target.checked;
                      setSettings({ ...settings, intervals: updated });
                    }}
                    className="w-4 h-4 text-[#D4AF37] rounded accent-[#D4AF37] cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card 3: Notification Template Manager */}
      <div className="bg-white dark:bg-[#12131A] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-white/10">
          <FileText className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            Notification Templates & Content
          </h3>
        </div>

        <p className="text-xs text-gray-500 dark:text-white/50">
          Available tokens: <code className="text-[#D4AF37] bg-white/5 px-1 py-0.5 rounded">{"{movieTitle}"}</code>, <code className="text-[#D4AF37] bg-white/5 px-1 py-0.5 rounded">{"{eventTitle}"}</code>, <code className="text-[#D4AF37] bg-white/5 px-1 py-0.5 rounded">{"{theatreName}"}</code>, <code className="text-[#D4AF37] bg-white/5 px-1 py-0.5 rounded">{"{venueName}"}</code>, <code className="text-[#D4AF37] bg-white/5 px-1 py-0.5 rounded">{"{timeRemaining}"}</code>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Movie Template */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-mono">
              🎬 Movie Reminder Template
            </span>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 block">Title</label>
              <input
                type="text"
                value={settings.templates.movie.title}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    templates: {
                      ...settings.templates,
                      movie: { ...settings.templates.movie, title: e.target.value }
                    }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 block">Body</label>
              <textarea
                rows={3}
                value={settings.templates.movie.body}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    templates: {
                      ...settings.templates,
                      movie: { ...settings.templates.movie, body: e.target.value }
                    }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white font-medium resize-none"
              />
            </div>
          </div>

          {/* Event Template */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block font-mono">
              🎟️ Event Pass Reminder Template
            </span>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 block">Title</label>
              <input
                type="text"
                value={settings.templates.event.title}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    templates: {
                      ...settings.templates,
                      event: { ...settings.templates.event, title: e.target.value }
                    }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 block">Body</label>
              <textarea
                rows={3}
                value={settings.templates.event.body}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    templates: {
                      ...settings.templates,
                      event: { ...settings.templates.event, body: e.target.value }
                    }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white font-medium resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Scheduling & Delivery Status Logs */}
      <div className="bg-white dark:bg-[#12131A] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Notification Scheduling & Delivery Status Logs
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by title, ID, venue..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white w-48 sm:w-64"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs text-gray-900 dark:text-white"
            >
              <option value="ALL">All Types</option>
              <option value="MOVIE">Movies Only</option>
              <option value="EVENT">Events Only</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Title & Venue</th>
                <th className="py-2.5 px-3">Interval</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-white/40">
                    No reminder logs found matching filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-white">
                      {log.bookingId}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                          log.type === "MOVIE"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        }`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-gray-900 dark:text-white block">{log.title}</span>
                      <span className="text-[10px] text-gray-500 dark:text-white/50 block">{log.venueName}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#D4AF37] font-bold">
                      {log.interval}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-white/70">
                      {log.recipient}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === "DELIVERED"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : log.status === "SCHEDULED"
                            ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {log.status === "DELIVERED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : log.status === "CANCELLED" ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-white/40 font-mono text-[10px]">
                      {new Date(log.dispatchedAt || log.scheduledFor).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
