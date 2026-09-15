import React, { useState } from 'react';
import { storage } from '../services/storage';
import { User, UserRole } from '../types';
import {
  Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle,
  Sparkles, CheckCircle2, UserCheck, X
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const users = storage.getUsers();
  const sekolah = storage.getSekolah();

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Masukkan username atau email Anda.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Find matching user by email or username
      const clean = identifier.trim().toLowerCase();
      const user = users.find(
        u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
      );

      if (user) {
        storage.setCurrentUser(user);
        onLoginSuccess(user);
        onClose();
      } else {
        // If not found, provide helpful guidance or allow super admin email directly
        if (clean === 'perdinan.moses34@guru.smp.belajar.id' || clean === 'perdinan.moses34') {
          const superAdmin = users.find(u => u.role === 'super_admin') || users[0];
          storage.setCurrentUser(superAdmin);
          onLoginSuccess(superAdmin);
          onClose();
        } else {
          setErrorMsg('Kredensial tidak ditemukan. Silakan gunakan salah satu Akun Demo di bawah atau periksa penulisan.');
        }
      }
    }, 600);
  };

  const handleQuickLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user = users.find(u => u.role === role) || users[0];
      storage.setCurrentUser(user);
      onLoginSuccess(user);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header with School Crest */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 mx-auto shadow-xl ring-4 ring-blue-500/20 mb-3">
            <img
              src={sekolah.logo_url || '/icon.svg'}
              alt="Logo E-Raport"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-xl font-black tracking-tight text-white">E-RAPORT SMP</h2>
          <p className="text-xs text-blue-200 font-medium mt-0.5">{sekolah.nama_sekolah}</p>
          <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/30">
            Sistem Autentikasi Terpadu & Terverifikasi
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username / Email Akun Belajar.id
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="contoh: nama@guru.smp.belajar.id"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 placeholder:text-slate-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Fitur reset kata sandi terintegrasi dengan Google Workspace SSO sekolah.')}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Ingat sesi saya di perangkat ini</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-98 disabled:opacity-50"
            >
              {isLoading ? 'Memeriksa Kredensial...' : 'Masuk ke Sistem E-Raport'}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pilih Cepat Role Pengujian (1-Click Login):</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                onClick={() => handleQuickLogin('super_admin')}
                className="p-2 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-800 text-left transition"
              >
                <span className="font-bold block">Super Admin (Owner)</span>
                <span className="text-[10px] text-red-600 truncate block">perdinan.moses34</span>
              </button>

              <button
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 text-left transition"
              >
                <span className="font-bold block">Admin Kurikulum</span>
                <span className="text-[10px] text-purple-600 truncate block">admin.kurikulum</span>
              </button>

              <button
                onClick={() => handleQuickLogin('wali_kelas')}
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-left transition"
              >
                <span className="font-bold block">Wali Kelas VII-A</span>
                <span className="text-[10px] text-emerald-600 truncate block">siti.nurhaliza</span>
              </button>

              <button
                onClick={() => handleQuickLogin('guru')}
                className="p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-left transition"
              >
                <span className="font-bold block">Guru Mapel (IPA)</span>
                <span className="text-[10px] text-blue-600 truncate block">rahmat.hidayat</span>
              </button>

              <button
                onClick={() => handleQuickLogin('siswa')}
                className="p-2 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 text-left transition"
              >
                <span className="font-bold block">Siswa (Ahmad Rizki)</span>
                <span className="text-[10px] text-amber-600 truncate block">NISN: 0089123456</span>
              </button>

              <button
                onClick={() => handleQuickLogin('orang_tua')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition"
              >
                <span className="font-bold block">Orang Tua / Wali</span>
                <span className="text-[10px] text-slate-600 truncate block">bambang.pratama</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
