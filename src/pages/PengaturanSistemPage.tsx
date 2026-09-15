import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Sekolah, GradingConfig, User, UserRole, Kelas, MataPelajaran } from '../types';
import {
  Sliders, School, Save, Check, ShieldCheck, RefreshCw,
  UserPlus, Users, KeyRound, Edit2, Trash2, X, AlertCircle,
  CheckCircle2, Lock, UserCheck, ShieldAlert
} from 'lucide-react';

export const PengaturanSistemPage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'format' | 'users' | 'owner'>('format');
  const [sekolah, setSekolah] = useState<Sekolah>(storage.getSekolah());
  const [grading, setGrading] = useState<GradingConfig>(storage.getGradingConfig());
  const [usersList, setUsersList] = useState<User[]>(storage.getUsers());
  const [kelasList, setKelasList] = useState<Kelas[]>(storage.getKelas());
  const [mapelList, setMapelList] = useState<MataPelajaran[]>(storage.getMataPelajaran());
  const [notif, setNotif] = useState('');

  // User modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<{
    nama: string;
    username: string;
    email: string;
    role: UserRole;
    password?: string;
    kelas_id?: string;
    status: 'aktif' | 'nonaktif';
  }>({
    nama: '',
    username: '',
    email: '',
    role: 'wali_kelas',
    password: '',
    kelas_id: kelasList[0]?.kelas_id || 'KLS-VII-A',
    status: 'aktif'
  });

  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSekolah(storage.getSekolah());
      setGrading(storage.getGradingConfig());
      setUsersList(storage.getUsers());
      setKelasList(storage.getKelas());
      setMapelList(storage.getMataPelajaran());
    });
    return unsub;
  }, []);

  const totalBobot =
    grading.bobot_tugas +
    grading.bobot_uts +
    grading.bobot_uas +
    grading.bobot_praktik +
    grading.bobot_proyek;

  const handleSaveSekolah = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateSekolah(sekolah);
    setNotif('Profil dan identitas sekolah berhasil disimpan!');
    setTimeout(() => setNotif(''), 3000);
  };

  const handleSaveGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalBobot !== 100) {
      alert(`Peringatan: Total bobot nilai saat ini adalah ${totalBobot}%. Disarankan agar total berjumlah tepat 100%.`);
    }
    storage.saveGradingConfig(grading);
    setNotif('Pengaturan bobot dan rentang predikat nilai berhasil disimpan!');
    setTimeout(() => setNotif(''), 3000);
  };

  // User Management
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      nama: '',
      username: '',
      email: '',
      role: 'wali_kelas',
      password: '',
      kelas_id: kelasList[0]?.kelas_id || 'KLS-VII-A',
      status: 'aktif'
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      nama: user.nama,
      username: user.username,
      email: user.email,
      role: user.role,
      password: '',
      kelas_id: user.kelas_id || kelasList[0]?.kelas_id || '',
      status: user.status
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    if (user.user_id === currentUser.user_id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif.');
      return;
    }
    if (window.confirm(`Hapus akun ${user.nama} (${user.role})?`)) {
      storage.deleteUser(user.user_id);
      setNotif(`Akun ${user.nama} berhasil dihapus.`);
      setTimeout(() => setNotif(''), 3000);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.nama || !userFormData.username || !userFormData.email) {
      alert('Nama, Username, dan Email wajib diisi.');
      return;
    }

    const payload: User = {
      user_id: editingUser ? editingUser.user_id : 'USR-' + Date.now().toString().slice(-6),
      username: userFormData.username.trim().toLowerCase(),
      nama: userFormData.nama.trim(),
      email: userFormData.email.trim().toLowerCase(),
      role: userFormData.role,
      status: userFormData.status,
      kelas_id: userFormData.role === 'wali_kelas' ? userFormData.kelas_id : undefined,
      created_at: editingUser ? editingUser.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    storage.saveUser(payload);
    setShowUserModal(false);
    setNotif(`Akun ${payload.nama} (${payload.role.replace('_', ' ')}) berhasil disimpan.`);
    setTimeout(() => setNotif(''), 3000);
  };

  // Filter out any super_admin from school accounts list
  const schoolUsers = usersList.filter(u => u.role !== 'super_admin');
  const filteredUsers = schoolUsers.filter(u => {
    if (filterRole === 'all') return true;
    return u.role === filterRole;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Pengaturan Format & Akun Sekolah
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan bobot kurikulum merdeka, profil sekolah, dan pembuatan akun Kepala Sekolah & Wali Kelas.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('format')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'format' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Format & Bobot
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Akun Sekolah ({schoolUsers.length})</span>
          </button>
          {currentUser.role === 'super_admin' && (
            <button
              onClick={() => setActiveTab('owner')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'owner' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Kendali Owner</span>
            </button>
          )}
        </div>
      </div>

      {notif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* TAB 1: FORMAT & BOBOT */}
      {activeTab === 'format' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grading Weights Form */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Bobot Komponen Penilaian</h3>
                <p className="text-xs text-slate-500">Persentase perhitungan Nilai Akhir (NA)</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                totalBobot === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                Total: {totalBobot}%
              </span>
            </div>

            <form onSubmit={handleSaveGrading} className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <label className="font-semibold text-slate-700">Tugas & Formatif</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grading.bobot_tugas}
                    onChange={(e) => setGrading({ ...grading, bobot_tugas: Number(e.target.value) })}
                    className="w-16 p-1.5 rounded-lg border border-slate-300 text-center font-bold"
                  />
                  <span className="font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <label className="font-semibold text-slate-700">Ulangan Tengah Semester (UTS)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grading.bobot_uts}
                    onChange={(e) => setGrading({ ...grading, bobot_uts: Number(e.target.value) })}
                    className="w-16 p-1.5 rounded-lg border border-slate-300 text-center font-bold"
                  />
                  <span className="font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <label className="font-semibold text-slate-700">Ulangan Akhir Semester (UAS / PAS)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grading.bobot_uas}
                    onChange={(e) => setGrading({ ...grading, bobot_uas: Number(e.target.value) })}
                    className="w-16 p-1.5 rounded-lg border border-slate-300 text-center font-bold"
                  />
                  <span className="font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <label className="font-semibold text-slate-700">Kinerja Praktik</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grading.bobot_praktik}
                    onChange={(e) => setGrading({ ...grading, bobot_praktik: Number(e.target.value) })}
                    className="w-16 p-1.5 rounded-lg border border-slate-300 text-center font-bold"
                  />
                  <span className="font-bold text-slate-400">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <label className="font-semibold text-slate-700">Proyek Pembelajaran</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grading.bobot_proyek}
                    onChange={(e) => setGrading({ ...grading, bobot_proyek: Number(e.target.value) })}
                    className="w-16 p-1.5 rounded-lg border border-slate-300 text-center font-bold"
                  />
                  <span className="font-bold text-slate-400">%</span>
                </div>
              </div>

              {/* Predikat Thresholds */}
              <div className="pt-3 border-t border-slate-200">
                <label className="font-bold text-slate-800 block mb-2">Batas Nilai Minimum Rentang Predikat</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-blue-50/50 border border-blue-100">
                    <span className="font-bold text-blue-900 block text-[10px]">Predikat A (Sangat Baik)</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-slate-500">≥</span>
                      <input
                        type="number"
                        value={grading.rentang_a_min}
                        onChange={(e) => setGrading({ ...grading, rentang_a_min: Number(e.target.value) })}
                        className="w-14 p-1 rounded border border-blue-200 font-bold text-center"
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="font-bold text-emerald-900 block text-[10px]">Predikat B (Baik)</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-slate-500">≥</span>
                      <input
                        type="number"
                        value={grading.rentang_b_min}
                        onChange={(e) => setGrading({ ...grading, rentang_b_min: Number(e.target.value) })}
                        className="w-14 p-1 rounded border border-emerald-200 font-bold text-center"
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-100">
                    <span className="font-bold text-amber-900 block text-[10px]">Predikat C (Cukup)</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-slate-500">≥</span>
                      <input
                        type="number"
                        value={grading.rentang_c_min}
                        onChange={(e) => setGrading({ ...grading, rentang_c_min: Number(e.target.value) })}
                        className="w-14 p-1 rounded border border-amber-200 font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-98"
              >
                Simpan Bobot & Skala Penilaian
              </button>
            </form>
          </div>

          {/* School Profile Form */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Identitas Sekolah</h3>
              <p className="text-xs text-slate-500">Data resmi yang dicetak pada Kop Raport A4</p>
            </div>

            <form onSubmit={handleSaveSekolah} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Satuan Pendidikan</label>
                <input
                  type="text"
                  value={sekolah.nama_sekolah}
                  onChange={(e) => setSekolah({ ...sekolah, nama_sekolah: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
                  <input
                    type="text"
                    value={sekolah.npsn}
                    onChange={(e) => setSekolah({ ...sekolah, npsn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Akreditasi</label>
                  <input
                    type="text"
                    value={sekolah.akreditasi}
                    onChange={(e) => setSekolah({ ...sekolah, akreditasi: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  value={sekolah.alamat}
                  onChange={(e) => setSekolah({ ...sekolah, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={sekolah.kabupaten}
                    onChange={(e) => setSekolah({ ...sekolah, kabupaten: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={sekolah.provinsi}
                    onChange={(e) => setSekolah({ ...sekolah, provinsi: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={sekolah.kepala_sekolah}
                    onChange={(e) => setSekolah({ ...sekolah, kepala_sekolah: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={sekolah.nip_kepala_sekolah}
                    onChange={(e) => setSekolah({ ...sekolah, nip_kepala_sekolah: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow transition active:scale-98"
              >
                Simpan Identitas Sekolah
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN AKUN SEKOLAH */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Kelola Akun Kepala Sekolah, Wali Kelas & Guru
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin sekolah dapat membuat akun baru dan menentukan peran serta kelas pengampu masing-masing.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
              >
                <option value="all">Semua Peran ({schoolUsers.length})</option>
                <option value="admin">Admin Sekolah</option>
                <option value="kepala_sekolah">Kepala Sekolah</option>
                <option value="wali_kelas">Wali Kelas</option>
                <option value="guru">Guru Mata Pelajaran</option>
              </select>

              <button
                onClick={handleOpenAddUser}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition active:scale-95 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Buat Akun Baru</span>
              </button>
            </div>
          </div>

          {/* Table of Users */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Lengkap & Email</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Tugas / Rombel</th>
                    <th className="py-3 px-4 text-center w-24">Status</th>
                    <th className="py-3 px-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Belum ada akun terdaftar untuk kategori ini
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr key={user.user_id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{user.nama}</span>
                          <span className="text-[11px] text-slate-400">{user.email}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                          {user.username}
                        </td>
                        <td className="py-3 px-4">
                          {user.role === 'admin' && (
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-purple-200">
                              ADMIN SEKOLAH
                            </span>
                          )}
                          {user.role === 'kepala_sekolah' && (
                            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                              KEPALA SEKOLAH
                            </span>
                          )}
                          {user.role === 'wali_kelas' && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                              WALI KELAS
                            </span>
                          )}
                          {user.role === 'guru' && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                              GURU MAPEL
                            </span>
                          )}
                          {user.role === 'siswa' && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                              SISWA
                            </span>
                          )}
                          {user.role === 'orang_tua' && (
                            <span className="bg-slate-100 text-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-slate-200">
                              ORANG TUA
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {user.role === 'wali_kelas' ? (
                            <span className="font-semibold text-emerald-700">
                              Wali Kelas {user.kelas_id ? user.kelas_id.replace('KLS-', '') : 'VII-A'}
                            </span>
                          ) : user.role === 'kepala_sekolah' ? (
                            <span className="font-medium text-slate-500">Pimpinan Satuan</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            Aktif
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                              title="Edit Akun"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KENDALI BALIK LAYAR OWNER */}
      {activeTab === 'owner' && currentUser.role === 'super_admin' && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Portal Kendali Balik Layar (Owner Mode)
                </h3>
                <p className="text-xs text-slate-400">
                  Panel tersembunyi untuk pemeliharaan sistem, diagnosa runtime, dan audit lisensi.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
              Super Admin Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1">Total Pengguna Terdaftar</span>
              <span className="text-2xl font-black text-white">{usersList.length} Akun</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1">Sekolah Aktif</span>
              <span className="text-base font-bold text-amber-300 truncate block">{sekolah.nama_sekolah}</span>
              <span className="text-[10px] text-slate-400">NPSN: {sekolah.npsn}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1">Status Storage Engine</span>
              <span className="text-emerald-400 font-bold block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                IndexedDB & Local Storage Siap
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80">
            <h4 className="font-bold text-xs text-amber-400 mb-2">Tindakan Khusus Pengembang</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Reset semua data ke konfigurasi demo awal? Tindakan ini akan mengembalikan data default.')) {
                    storage.resetToDemoData();
                    alert('Data berhasil di-reset ke status awal.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition"
              >
                Reset Database ke Demo Awal
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([storage.exportDatabaseJSON()], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `backup_master_eraport_${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                }}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
              >
                Ekspor Master Database JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER MODAL: ADD / EDIT ACCOUNT */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {editingUser ? 'Perbarui Akun Pengguna' : 'Buat Akun Pengguna Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Peran Akun (Role)
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white"
                >
                  <option value="kepala_sekolah">Kepala Sekolah (Mengesahkan Raport)</option>
                  <option value="wali_kelas">Wali Kelas (Kelola Siswa, Absen & Cetak Raport)</option>
                  <option value="guru">Guru Mata Pelajaran (Input Nilai & Capaian)</option>
                  <option value="admin">Admin Sekolah Tambahan</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={userFormData.nama}
                  onChange={(e) => setUserFormData({ ...userFormData, nama: e.target.value })}
                  placeholder="contoh: Drs. H. Ahmad Sudrajat, M.M."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    placeholder="nama.singkat"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Email Akun
                  </label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="nama@guru.smp.belajar.id"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              {userFormData.role === 'wali_kelas' && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <label className="block font-bold text-emerald-900 mb-1">
                    Kelas yang Diampu (Wali Kelas)
                  </label>
                  <select
                    value={userFormData.kelas_id}
                    onChange={(e) => setUserFormData({ ...userFormData, kelas_id: e.target.value })}
                    className="w-full p-2 rounded-xl border border-emerald-300 font-bold text-xs bg-white text-emerald-950"
                  >
                    {kelasList.map(k => (
                      <option key={k.kelas_id} value={k.kelas_id}>
                        Kelas {k.nama_kelas} (Tingkat {k.tingkat})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
