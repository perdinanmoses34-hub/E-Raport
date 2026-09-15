import React, { useState } from 'react';
import { storage } from '../services/storage';
import { Sekolah, DatabaseConfig } from '../types';
import {
  CheckCircle2, School, Database, HardDrive, ShieldCheck,
  Calendar, Check, ArrowRight, ArrowLeft, RefreshCw, X
} from 'lucide-react';

interface InitialSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}

export const InitialSetupWizard: React.FC<InitialSetupWizardProps> = ({
  isOpen,
  onClose,
  onFinish
}) => {
  const [step, setStep] = useState(1);
  const [sekolah, setSekolah] = useState<Sekolah>(storage.getSekolah());
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(storage.getDatabaseConfig());
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Save all and finish
      storage.updateSekolah(sekolah);
      storage.saveDatabaseConfig(dbConfig);
      localStorage.setItem('eraport_setup_completed', 'true');
      storage.addNotifikasi('Setup Berhasil', 'Konfigurasi awal E-Raport SMP berhasil disimpan.', 'success');
      onFinish();
      onClose();
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    try {
      const resSheets = await storage.testConnection('sheets');
      const resDrive = await storage.testConnection('drive');
      const resFb = await storage.testConnection('firebase');
      setTestResults({
        sheets: resSheets.success,
        drive: resDrive.success,
        firebase: resFb.success
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Wizard Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Panduan Konfigurasi Awal
          </span>
          <h2 className="text-xl font-black text-white mt-1">INITIAL SETUP E-RAPORT SMP</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Langkah {step} dari 5: {
              step === 1 ? 'Identitas Sekolah' :
              step === 2 ? 'Tahun Pelajaran & Semester' :
              step === 3 ? 'Google Sheets & Google Drive' :
              step === 4 ? 'Firebase Realtime & Apps Script' :
              'Verifikasi & Uji Koneksi'
            }
          </p>

          {/* Stepper bar */}
          <div className="flex items-center gap-1.5 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" />
                <span>Identitas Resmi Satuan Pendidikan</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Sekolah</label>
                  <input
                    type="text"
                    value={sekolah.nama_sekolah}
                    onChange={(e) => setSekolah({ ...sekolah, nama_sekolah: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
                  <input
                    type="text"
                    value={sekolah.npsn}
                    onChange={(e) => setSekolah({ ...sekolah, npsn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Sekolah</label>
                  <input
                    type="text"
                    value={sekolah.alamat}
                    onChange={(e) => setSekolah({ ...sekolah, alamat: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={sekolah.kabupaten}
                    onChange={(e) => setSekolah({ ...sekolah, kabupaten: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={sekolah.provinsi}
                    onChange={(e) => setSekolah({ ...sekolah, provinsi: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kepala Sekolah</label>
                  <input
                    type="text"
                    value={sekolah.kepala_sekolah}
                    onChange={(e) => setSekolah({ ...sekolah, kepala_sekolah: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={sekolah.nip_kepala_sekolah}
                    onChange={(e) => setSekolah({ ...sekolah, nip_kepala_sekolah: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Tahun Pelajaran & Semester Aktif</span>
              </h4>
              <p className="text-xs text-slate-600">
                Tahun pelajaran saat ini yang aktif untuk pengisian nilai raport:
              </p>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tahun Pelajaran:</span>
                  <span className="font-bold text-slate-900">2025/2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Semester:</span>
                  <span className="font-bold text-slate-900">Semester 1 (Ganjil)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tempat Titimangsa Raport:</span>
                  <span className="font-bold text-slate-900">{sekolah.kabupaten}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tanggal Cetak Raport:</span>
                  <span className="font-bold text-slate-900">19 Desember 2025</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Konfigurasi Google Sheets & Google Drive</span>
              </h4>
              <p className="text-xs text-slate-600">
                Google Sheets digunakan sebagai basis data administrasi (18 tab sheet) dan Google Drive untuk penyimpanan arsip PDF raport serta aset sekolah.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Google Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={dbConfig.sheets_id}
                    onChange={(e) => setDbConfig({ ...dbConfig, sheets_id: e.target.value })}
                    placeholder="contoh: 1aB2cD3eF4gH5iJ6kL7mN8oP9qR"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">
                    Dapat diambil dari URL Google Sheet: docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Google Drive Folder ID (Arsip PDF & Dokumen)
                  </label>
                  <input
                    type="text"
                    value={dbConfig.drive_folder_id}
                    onChange={(e) => setDbConfig({ ...dbConfig, drive_folder_id: e.target.value })}
                    placeholder="contoh: 1Drive_Folder_Raport_SMPN1_Archive"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Firebase Realtime & Apps Script Middleware</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Firebase Project ID
                  </label>
                  <input
                    type="text"
                    value={dbConfig.firebase_project_id}
                    onChange={(e) => setDbConfig({ ...dbConfig, firebase_project_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Google Apps Script Web App URL (Opsional)
                  </label>
                  <input
                    type="url"
                    value={dbConfig.apps_script_url}
                    onChange={(e) => setDbConfig({ ...dbConfig, apps_script_url: e.target.value })}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">
                    Untuk live webhook sinkronisasi otomatis antara web app dan Google Sheets.
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verifikasi Identitas Super Admin & Uji Koneksi</span>
              </h4>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Akun Super Admin (Owner):</span>
                  <span className="font-bold text-emerald-900">perdinan.moses34@guru.smp.belajar.id</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tingkat Hak Akses:</span>
                  <span className="font-bold text-emerald-900">Super Administrator (Akses Penuh)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={runAllTests}
                  disabled={testing}
                  className="w-full py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Menguji semua jalur database...' : 'Uji Koneksi Sheets, Drive & Firebase'}</span>
                </button>

                {Object.keys(testResults).length > 0 && (
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span>Google Sheets (18 Sheet):</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Terkoneksi
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span>Google Drive Folder:</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Terkoneksi
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span>Firebase Realtime Engine:</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Aktif
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <span>{step === 5 ? 'Selesai & Masuk Dashboard' : 'Lanjutkan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
