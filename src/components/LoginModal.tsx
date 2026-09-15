import React, { useState } from 'react';
import { storage } from '../services/storage';
import { User, UserRole } from '../types';
import {
  Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle,
  Sparkles, CheckCircle2, UserCheck, X, School, Building2,
  KeyRound, UserPlus, LogIn, ArrowRight
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
  const [authMode, setAuthMode] = useState<'login' | 'register_sekolah'>('login');

  // Login form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register school states
  const [regNamaSekolah, setRegNamaSekolah] = useState('');
  const [regNpsn, setRegNpsn] = useState('');
  const [regKabupaten, setRegKabupaten] = useState('');
  const [regNamaAdmin, setRegNamaAdmin] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Owner secret prompt state
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerKey, setOwnerKey] = useState('');
  const [ownerError, setOwnerError] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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
      const clean = identifier.trim().toLowerCase();
      const user = users.find(
        u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
      );

      if (user) {
        storage.setCurrentUser(user);
        onLoginSuccess(user);
        onClose();
      } else {
        setErrorMsg('Akun tidak ditemukan. Silakan periksa kembali username/email atau pilih salah satu akun sekolah di bawah.');
      }
    }, 450);
  };

  const handleRegisterSchool = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regNamaSekolah.trim() || !regNpsn.trim() || !regNamaAdmin.trim() || !regUsername.trim() || !regEmail.trim()) {
      setErrorMsg('Mohon lengkapi seluruh kolom formulir pendaftaran sekolah.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      try {
        const newAdmin = storage.registerNewSchool({
          nama_sekolah: regNamaSekolah.trim(),
          npsn: regNpsn.trim(),
          kabupaten: regKabupaten.trim() || 'Kabupaten / Kota',
          nama_admin: regNamaAdmin.trim(),
          username: regUsername.trim(),
          email: regEmail.trim(),
          password: regPassword
        });

        setSuccessMsg(`Sekolah ${regNamaSekolah} berhasil didaftarkan! Masuk sebagai Admin Sekolah...`);
        setTimeout(() => {
          onLoginSuccess(newAdmin);
          onClose();
        }, 800);
      } catch (err) {
        setErrorMsg('Terjadi kesalahan saat mendaftarkan sekolah. Silakan coba kembali.');
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
    }, 350);
  };

  const handleOwnerAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerError('');
    const loggedInOwner = storage.loginOwner(ownerKey);
    if (loggedInOwner) {
      setShowOwnerModal(false);
      onLoginSuccess(loggedInOwner);
      onClose();
    } else {
      setOwnerError('Kunci Master tidak valid. Akses ditolak.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header with School Crest */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-5 sm:p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white p-1.5 mx-auto shadow-xl ring-4 ring-blue-500/20 mb-2.5">
            <img
              src={sekolah.logo_url || '/icon.svg'}
              alt="Logo E-Raport"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">E-RAPORT SMP</h2>
          <p className="text-xs text-blue-200 font-medium mt-0.5 truncate max-w-xs mx-auto">
            {sekolah.nama_sekolah}
          </p>
          <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/30">
            Sistem Autentikasi Kurikulum Merdeka
          </div>
        </div>

        {/* Tab Switcher: Masuk vs Daftar Sekolah Baru */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              authMode === 'login'
                ? 'border-blue-600 bg-white text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Sistem</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register_sekolah');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              authMode === 'register_sekolah'
                ? 'border-blue-600 bg-white text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Daftar Sekolah Baru</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN TO SCHOOL */}
          {authMode === 'login' ? (
            <>
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
                      placeholder="contoh: admin.kurikulum atau nama@guru.smp.belajar.id"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 placeholder:text-slate-400 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <span className="text-[11px] text-slate-400">
                      Default: bebas / terdaftar
                    </span>
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

              {/* Quick Demo Switcher - PUBLIC DEMO (NO SUPERADMIN) */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pilih Cepat Akun Sekolah (1-Click Login):</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    onClick={() => handleQuickLogin('admin')}
                    className="p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 text-left transition"
                  >
                    <span className="font-bold block">Admin Sekolah</span>
                    <span className="text-[10px] text-purple-700 truncate block">admin.kurikulum</span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('kepala_sekolah')}
                    className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 text-left transition"
                  >
                    <span className="font-bold block">Kepala Sekolah</span>
                    <span className="text-[10px] text-indigo-700 truncate block">kepala.sekolah</span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('wali_kelas')}
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-left transition"
                  >
                    <span className="font-bold block">Wali Kelas VII-A</span>
                    <span className="text-[10px] text-emerald-700 truncate block">siti.nurhaliza</span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('guru')}
                    className="p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 text-left transition"
                  >
                    <span className="font-bold block">Guru Mapel (IPA)</span>
                    <span className="text-[10px] text-blue-700 truncate block">rahmat.hidayat</span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('siswa')}
                    className="p-2 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 text-left transition"
                  >
                    <span className="font-bold block">Siswa (Ahmad Rizki)</span>
                    <span className="text-[10px] text-amber-700 truncate block">NISN: 0089123456</span>
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
            </>
          ) : (
            /* TAB 2: REGISTER NEW SCHOOL & CREATE ADMIN */
            <form onSubmit={handleRegisterSchool} className="space-y-3.5">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-[11px] text-blue-900">
                <span className="font-bold block mb-0.5">Alur Pembuatan Akun Sekolah:</span>
                Masing-masing sekolah mendaftarkan sekolahnya sendiri dengan akun <strong>Admin Sekolah</strong>. Selanjutnya Admin Sekolah dapat membuatkan akun untuk <strong>Kepala Sekolah</strong>, <strong>Wali Kelas</strong>, dan <strong>Guru</strong> di menu pengaturan.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    value={regNamaSekolah}
                    onChange={(e) => setRegNamaSekolah(e.target.value)}
                    placeholder="contoh: SMP Negeri 2 Cendekia"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NPSN Sekolah
                  </label>
                  <input
                    type="text"
                    value={regNpsn}
                    onChange={(e) => setRegNpsn(e.target.value)}
                    placeholder="8 digit NPSN"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kabupaten / Kota Sekolah
                </label>
                <input
                  type="text"
                  value={regKabupaten}
                  onChange={(e) => setRegKabupaten(e.target.value)}
                  placeholder="contoh: Kota Bandung"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="block text-xs font-bold text-purple-900 mb-2">
                  Kredensial Admin Sekolah:
                </span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nama Lengkap Admin
                    </label>
                    <input
                      type="text"
                      value={regNamaAdmin}
                      onChange={(e) => setRegNamaAdmin(e.target.value)}
                      placeholder="contoh: Hendra Wijaya, S.Kom."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Username Admin
                      </label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="admin.smp2"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email Resmi Admin
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="admin@smp2.sch.id"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Kata Sandi Admin
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-98 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Mendaftarkan Sekolah...' : 'Daftarkan Sekolah & Masuk sebagai Admin'}</span>
              </button>
            </form>
          )}

          {/* Discreet Owner / Developer Access Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>E-Raport SMP v2.4</span>
            <button
              type="button"
              onClick={() => {
                setShowOwnerModal(true);
                setOwnerError('');
              }}
              className="text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
            >
              <KeyRound className="w-3 h-3" />
              <span>Akses Kendali Balik Layar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secret Owner Master Key Prompt Modal */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 text-white p-6 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="font-bold text-sm text-white">Portal Kendali Balik Layar</h4>
              </div>
              <button
                onClick={() => setShowOwnerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Akses khusus Developer / Owner Sistem untuk pemantauan sistem dan konfigurasi global. Masukkan Kunci Master Owner:
            </p>

            {ownerError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-300">
                {ownerError}
              </div>
            )}

            <form onSubmit={handleOwnerAccess} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={ownerKey}
                  onChange={(e) => setOwnerKey(e.target.value)}
                  placeholder="Kunci Master Owner"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                  autoFocus
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Kunci: owner2025
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOwnerModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition"
                >
                  Buka Kendali
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
