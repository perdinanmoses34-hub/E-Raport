import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { LogAktivitas, User } from '../types';
import { Activity, Search, Filter, Download, Trash2 } from 'lucide-react';

export const LogAktivitasPage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [logs, setLogs] = useState<LogAktivitas[]>(storage.getLogs());
  const [search, setSearch] = useState('');
  const [filterModul, setFilterModul] = useState('all');

  useEffect(() => {
    const unsub = storage.subscribe(() => setLogs(storage.getLogs()));
    return unsub;
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchSearch =
      l.user_name.toLowerCase().includes(search.toLowerCase()) ||
      l.aktivitas.toLowerCase().includes(search.toLowerCase()) ||
      l.keterangan.toLowerCase().includes(search.toLowerCase());
    const matchModul = filterModul === 'all' || l.modul === filterModul;
    return matchSearch && matchModul;
  });

  const handleExportLogs = () => {
    const headers = ['No', 'Waktu', 'Pengguna', 'Role', 'Aktivitas', 'Modul', 'Keterangan'];
    const rows = filteredLogs.map((l, i) => [
      i + 1,
      l.waktu,
      `"${l.user_name}"`,
      l.role,
      l.aktivitas,
      l.modul,
      `"${l.keterangan.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `LOG_AKTIVITAS_ERAPORT_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Audit Trail & Log Aktivitas</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
              {logs.length} Catatan Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak seluruh aktivitas pengguna (login, input nilai, verifikasi, kunci nilai, cetak raport, ekspor data).
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Log CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aktivitas, pengguna, atau keterangan..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterModul}
            onChange={(e) => setFilterModul(e.target.value)}
            className="w-full sm:w-48 p-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 bg-white focus:border-blue-600"
          >
            <option value="all">Semua Modul</option>
            <option value="Autentikasi">Autentikasi</option>
            <option value="Nilai & Raport">Nilai & Raport</option>
            <option value="Raport">Raport</option>
            <option value="Data Master">Data Master</option>
            <option value="Backup & Restore">Backup & Restore</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-3 px-3 w-10 text-center font-extrabold">No</th>
                <th className="py-3 px-3 font-extrabold w-36">Waktu</th>
                <th className="py-3 px-3 font-extrabold w-44">Pengguna</th>
                <th className="py-3 px-3 font-extrabold w-28">Aktivitas</th>
                <th className="py-3 px-3 font-extrabold w-28">Modul</th>
                <th className="py-3 px-4 font-extrabold">Keterangan Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada catatan aktivitas yang cocok
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.waktu}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block">{log.user_name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{log.role.replace('_', ' ')}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-blue-50 text-blue-700 border border-blue-100">
                        {log.aktivitas}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-600">{log.modul}</td>
                    <td className="py-2.5 px-4 text-slate-700 leading-relaxed">{log.keterangan}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
