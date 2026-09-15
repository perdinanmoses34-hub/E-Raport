import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { DatabaseConfig, User } from '../types';
import { APPS_SCRIPT_CODE } from '../services/appsScriptTemplate';
import {
  Database, HardDrive, ShieldCheck, RefreshCw, Check,
  Copy, ExternalLink, Code2, CheckCircle2, AlertCircle, FileSpreadsheet
} from 'lucide-react';

export const PengaturanDatabasePage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [config, setConfig] = useState<DatabaseConfig>(storage.getDatabaseConfig());
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{ [key: string]: { success: boolean; msg: string } }>({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [notif, setNotif] = useState('');

  useEffect(() => {
    const unsub = storage.subscribe(() => setConfig(storage.getDatabaseConfig()));
    return unsub;
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveDatabaseConfig(config);
    setNotif('Konfigurasi database Google Workspace & Firebase berhasil disimpan!');
    setTimeout(() => setNotif(''), 3500);
  };

  const runTest = async (service: 'sheets' | 'drive' | 'firebase') => {
    setTestingService(service);
    try {
      const res = await storage.testConnection(service);
      setTestStatus(prev => ({
        ...prev,
        [service]: { success: res.success, msg: res.message }
      }));
    } finally {
      setTestingService(null);
    }
  };

  const handleCopyAppsScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Konfigurasi Database Cloud & Integrasi
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
            GOOGLE WORKSPACE & FIREBASE
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Pengaturan sinkronisasi basis data 18-tab Google Spreadsheet, Google Drive Folder arsip PDF raport, Google Apps Script middleware, dan Firebase Firestore realtime engine.
        </p>
      </div>

      {notif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      {/* Connection Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Google Sheets */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                18 Tab Sheets
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 mt-3">Google Sheets DB</h3>
            <p className="text-xs text-slate-500 mt-0.5">Database spreadsheet terpusat</p>
            {testStatus.sheets && (
              <p className="mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                {testStatus.sheets.msg}
              </p>
            )}
          </div>
          <button
            disabled={testingService === 'sheets'}
            onClick={() => runTest('sheets')}
            className="mt-4 w-full py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingService === 'sheets' ? 'animate-spin' : ''}`} />
            <span>{testingService === 'sheets' ? 'Menguji...' : 'Uji Koneksi Sheets'}</span>
          </button>
        </div>

        {/* Google Drive */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Drive Storage
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 mt-3">Google Drive Folder</h3>
            <p className="text-xs text-slate-500 mt-0.5">Penyimpanan arsip PDF dan foto siswa</p>
            {testStatus.drive && (
              <p className="mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                {testStatus.drive.msg}
              </p>
            )}
          </div>
          <button
            disabled={testingService === 'drive'}
            onClick={() => runTest('drive')}
            className="mt-4 w-full py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingService === 'drive' ? 'animate-spin' : ''}`} />
            <span>{testingService === 'drive' ? 'Menguji...' : 'Uji Koneksi Drive'}</span>
          </button>
        </div>

        {/* Firebase Realtime */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Firestore Rules
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 mt-3">Firebase Firestore</h3>
            <p className="text-xs text-slate-500 mt-0.5">Realtime sync, RBAC & user security</p>
            {testStatus.firebase && (
              <p className="mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                {testStatus.firebase.msg}
              </p>
            )}
          </div>
          <button
            disabled={testingService === 'firebase'}
            onClick={() => runTest('firebase')}
            className="mt-4 w-full py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingService === 'firebase' ? 'animate-spin' : ''}`} />
            <span>{testingService === 'firebase' ? 'Menguji...' : 'Uji Firebase Realtime'}</span>
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <h3 className="font-extrabold text-sm text-slate-900 mb-1">
          Pengaturan Kredensial Database & Endpoint
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Pastikan ID Spreadsheet dan Folder Drive sudah dibagikan hak akses kepada akun Super Admin.
        </p>

        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Google Spreadsheet ID (Database Utama 18 Sheets)
            </label>
            <input
              type="text"
              value={config.sheets_id}
              onChange={(e) => setConfig({ ...config, sheets_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Contoh: docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Google Drive Folder ID (Penyimpanan Arsip PDF Raport & Aset)
            </label>
            <input
              type="text"
              value={config.drive_folder_id}
              onChange={(e) => setConfig({ ...config, drive_folder_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Google Apps Script Web App Endpoint URL
            </label>
            <input
              type="url"
              value={config.apps_script_url}
              onChange={(e) => setConfig({ ...config, apps_script_url: e.target.value })}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Firebase Project ID
            </label>
            <input
              type="text"
              value={config.firebase_project_id}
              onChange={(e) => setConfig({ ...config, firebase_project_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-98"
          >
            Simpan Konfigurasi Database Cloud
          </button>
        </form>
      </div>

      {/* Apps Script Code Template Viewer */}
      <div className="p-6 rounded-3xl bg-slate-900 text-slate-200 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-sm text-white">Google Apps Script Middleware (Code.gs)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Script perantara untuk sinkronisasi live Google Sheets dan Google Drive
            </p>
          </div>

          <button
            onClick={handleCopyAppsScript}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition active:scale-95 shrink-0"
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Kode Script'}</span>
          </button>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-black/50 border border-slate-800 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto text-blue-200">
          <pre>{APPS_SCRIPT_CODE}</pre>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Panduan: Buka spreadsheet Anda → Ekstensi → Apps Script → Tempel kode di atas → Terapkan sebagai Web App.</span>
          <a
            href="https://script.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Buka Google Apps Script</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
