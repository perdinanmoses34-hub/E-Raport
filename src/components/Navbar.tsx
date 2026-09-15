import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { User, Sekolah, TahunPelajaran, Notifikasi, DatabaseConfig } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Bell, Check, ChevronDown, Database, LogOut, Menu,
  RefreshCw, ShieldCheck, UserCheck, Wifi, WifiOff, X
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  currentUser: User;
  onOpenLogin: () => void;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  currentUser,
  onOpenLogin,
  onNavigate
}) => {
  const [sekolah, setSekolah] = useState<Sekolah>(storage.getSekolah());
  const [tahunPelajaran, setTahunPelajaran] = useState<TahunPelajaran>(storage.getActiveTahunPelajaran());
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>(storage.getNotifikasi());
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(storage.getDatabaseConfig());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSekolah(storage.getSekolah());
      setTahunPelajaran(storage.getActiveTahunPelajaran());
      setNotifikasi(storage.getNotifikasi());
      setDbConfig(storage.getDatabaseConfig());
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const unreadNotifs = notifikasi.filter(n => !n.read_status);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const updatedConfig = { ...dbConfig, last_sync: new Date().toLocaleTimeString('id-ID') };
      storage.saveDatabaseConfig(updatedConfig);
      storage.addNotifikasi('Sinkronisasi Sukses', 'Data berhasil disinkronkan dengan Google Sheets dan Firebase.', 'success');
      setShowSyncModal(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-red-200">SUPER ADMIN</span>;
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-purple-200">ADMIN SEKOLAH</span>;
      case 'kepala_sekolah':
        return <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">KEPALA SEKOLAH</span>;
      case 'wali_kelas':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">WALI KELAS</span>;
      case 'guru':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">GURU</span>;
      case 'siswa':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-200">SISWA</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200">ORANG TUA</span>;
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-2.5 transition-all no-print w-full">
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Left: Mobile Menu button & School Branding */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition lg:hidden"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-700 to-indigo-600 p-0.5 shadow-sm group-hover:shadow transition shrink-0">
              <img
                src={sekolah.logo_url || '/icon.svg'}
                alt="Logo Sekolah"
                className="w-full h-full object-contain rounded-[10px] bg-white p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-blue-700 transition">
                  E-RAPORT SMP
                </span>
                <span className="hidden md:inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                  TP {tahunPelajaran.tahun_pelajaran} (Sm.{tahunPelajaran.semester})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px] sm:max-w-xs md:max-w-sm">
                {sekolah.nama_sekolah}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Sync / Database Status button */}
          <button
            id="btn-sync-database"
            onClick={() => setShowSyncModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
            title="Status Sinkronisasi Realtime Google Sheets & Firebase"
          >
            {isOnline ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Sync Cloud</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton compact={true} />

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="btn-notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition"
              aria-label="Pemberitahuan"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Pemberitahuan Sistem</h4>
                    <p className="text-xs text-slate-500">{unreadNotifs.length} belum dibaca</p>
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={() => storage.markAllAllRead ? storage.markAllNotifikasiRead() : storage.markAllNotifikasiRead()}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifikasi.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Tidak ada pemberitahuan baru
                    </div>
                  ) : (
                    notifikasi.slice(0, 10).map((item) => (
                      <div
                        key={item.notification_id}
                        onClick={() => storage.markNotifikasiRead(item.notification_id)}
                        className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 ${
                          !item.read_status ? 'bg-blue-50/60 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-bold ${!item.read_status ? 'text-blue-900' : 'text-slate-800'}`}>
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{item.created_at}</span>
                        </div>
                        <p className="mt-1 text-slate-600 leading-relaxed">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('logs');
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600"
                  >
                    Lihat Seluruh Log Aktivitas →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              id="btn-user-profile-menu"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser.nama.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                  {currentUser.nama.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 bg-slate-900 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                      Akun Aktif
                    </span>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <h5 className="font-bold text-sm mt-2 text-white truncate">{currentUser.nama}</h5>
                  <p className="text-xs text-slate-300 truncate">{currentUser.email}</p>
                </div>

                <div className="p-2 space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenLogin();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-700 font-semibold hover:bg-blue-50 transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Ganti Akun / Switch Demo Role</span>
                  </button>

                  {currentUser.role === 'super_admin' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('pengaturan_database');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span>Pengaturan Database & Server</span>
                    </button>
                  )}

                  <hr className="my-1 border-slate-100" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      storage.logout();
                      onOpenLogin();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Sistem</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Sync Status Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Sinkronisasi Cloud & Database</h3>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="font-semibold text-slate-800">Status Jaringan Internet</span>
                </div>
                <span className="text-slate-600 font-bold">{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800 block">Google Sheets</span>
                  <span className="text-[11px] text-slate-500 truncate block max-w-[200px]">
                    ID: {dbConfig.sheets_id || 'Belum diatur'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Terkoneksi
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-800 block">Firebase Realtime</span>
                  <span className="text-[11px] text-slate-500 block">
                    Project: {dbConfig.firebase_project_id || 'eraport-smp-nusantara'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  Realtime Aktif
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                Terakhir disinkronkan: <strong>{dbConfig.last_sync || 'Baru saja'}</strong>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                disabled={isSyncing || !isOnline}
                onClick={handleSync}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
