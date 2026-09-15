import React, { useState } from 'react';
import { storage } from '../services/storage';
import { User } from '../types';
import { HardDriveDownload, Download, Upload, RefreshCw, AlertTriangle, CheckCircle2, Check } from 'lucide-react';

export const BackupRestorePage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [notif, setNotif] = useState('');

  const handleExportJSON = () => {
    const dataStr = storage.exportDatabaseJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BACKUP_ERAPORT_SMP_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    storage.addLog('EXPORT DATABASE', 'Backup & Restore', 'Mengunduh file arsip backup JSON seluruh database');
    setNotif('File backup JSON berhasil diunduh ke perangkat Anda!');
    setTimeout(() => setNotif(''), 3500);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importDatabaseJSON(content);
      if (success) {
        setNotif('Database berhasil dipulihkan dari file backup!');
      } else {
        alert('Gagal memulihkan database. Format file tidak valid.');
      }
      setTimeout(() => setNotif(''), 3500);
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke setelan awal demo? Data yang telah diubah akan ditimpa.')) {
      storage.resetToDemoData();
      setNotif('Seluruh data berhasil direset ke setelan awal demo.');
      setTimeout(() => setNotif(''), 3500);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Backup & Pemulihan Database</h1>
        <p className="text-xs text-slate-500 mt-1">
          Amankan seluruh basis data E-Raport (siswa, nilai, rombel, profil, guru) atau pulihkan dari file cadangan sebelumnya.
        </p>
      </div>

      {notif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Cadangkan Database (Backup)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Unduh seluruh entitas data (Sekolah, Siswa, Guru, Kelas, Mapel, Nilai, Pelengkap Raport, Log Aktivitas) dalam format berkas JSON terenkripsi lokal.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Cadangan JSON Sekarang</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Pulihkan Database (Restore)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Unggah berkas cadangan JSON yang telah disimpan sebelumnya untuk memulihkan seluruh struktur dan catatan nilai raport.
            </p>
          </div>

          <div className="mt-6">
            <label className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Pilih Berkas JSON Cadangan</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset to Demo */}
      <div className="p-6 rounded-3xl bg-red-50/70 border border-red-200 text-red-950">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <h3 className="font-extrabold text-sm text-red-900">Setel Ulang Data ke Standar Demo</h3>
            <p className="text-xs text-red-700 mt-0.5">
              Tindakan ini akan mengembalikan data sekolah, siswa, guru, kelas, dan nilai kembali ke setelan awal demo SMP.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleResetDemo}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Data Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
