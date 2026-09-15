import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { User, Sekolah, TahunPelajaran, Siswa, Guru, Kelas, MataPelajaran, Nilai, Raport, LogAktivitas } from '../types';
import {
  Users, GraduationCap, School, BookOpen, FileText, CheckCircle2,
  Clock, AlertTriangle, ArrowRight, TrendingUp, Printer, Edit3,
  Calendar, ShieldCheck, Sparkles, Activity, Heart, Award
} from 'lucide-react';

interface DashboardPageProps {
  currentUser: User;
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, onNavigate }) => {
  const [sekolah, setSekolah] = useState<Sekolah>(storage.getSekolah());
  const [tahunPelajaran, setTahunPelajaran] = useState<TahunPelajaran>(storage.getActiveTahunPelajaran());
  const [siswaList, setSiswaList] = useState<Siswa[]>(storage.getSiswa());
  const [guruList, setGuruList] = useState<Guru[]>(storage.getGuru());
  const [kelasList, setKelasList] = useState<Kelas[]>(storage.getKelas());
  const [mapelList, setMapelList] = useState<MataPelajaran[]>(storage.getMataPelajaran());
  const [nilaiList, setNilaiList] = useState<Nilai[]>(storage.getNilai());
  const [raportList, setRaportList] = useState<Raport[]>(storage.getRaportList());
  const [logs, setLogs] = useState<LogAktivitas[]>(storage.getLogs());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSekolah(storage.getSekolah());
      setTahunPelajaran(storage.getActiveTahunPelajaran());
      setSiswaList(storage.getSiswa());
      setGuruList(storage.getGuru());
      setKelasList(storage.getKelas());
      setMapelList(storage.getMataPelajaran());
      setNilaiList(storage.getNilai());
      setRaportList(storage.getRaportList());
      setLogs(storage.getLogs());
    });
    return unsub;
  }, []);

  const role = currentUser.role;

  // Compute metrics
  const totalSiswa = siswaList.length;
  const totalGuru = guruList.length;
  const totalKelas = kelasList.length;
  const totalMapel = mapelList.length;

  const totalPossibleGrades = totalSiswa * totalMapel;
  const inputtedGrades = nilaiList.length;
  const lockedGrades = nilaiList.filter(n => n.status === 'locked').length;
  const verifiedGrades = nilaiList.filter(n => n.status === 'verified').length;
  const progressPercent = totalPossibleGrades > 0 ? Math.min(100, Math.round((inputtedGrades / totalPossibleGrades) * 100)) : 0;

  // Student specific data (if role is siswa or orang_tua)
  const currentSiswa = siswaList.find(s => s.siswa_id === currentUser.siswa_id || s.nisn === currentUser.username) || siswaList[0];
  const myGrades = nilaiList.filter(n => n.siswa_id === currentSiswa?.siswa_id);
  const avgGrade = myGrades.length > 0
    ? Math.round((myGrades.reduce((acc, g) => acc + g.nilai_akhir, 0) / myGrades.length) * 10) / 10
    : 0;

  // Teacher specific data (if role is guru or wali_kelas)
  const currentGuru = guruList.find(g => g.guru_id === currentUser.guru_id) || guruList[0];
  const myTaughtSubjects = currentGuru ? currentGuru.mata_pelajaran : [];
  const myClassWali = kelasList.find(k => k.wali_kelas_id === currentGuru?.guru_id || k.kelas_id === currentUser.kelas_id);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tahun Pelajaran {tahunPelajaran.tahun_pelajaran} — Semester {tahunPelajaran.semester === '1' ? 'Ganjil' : 'Genap'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Selamat Datang, {currentUser.nama}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {role === 'super_admin' && 'Anda memiliki akses Super Administrator untuk mengelola seluruh ekosistem E-Raport SMP, sinkronisasi Google Sheets & Firebase, dan pengaturan sekolah.'}
            {role === 'admin' && 'Kelola kelengkapan data siswa, guru, kelas, kurikulum, serta validasi penginputan nilai dan penerbitan raport sekolah.'}
            {role === 'wali_kelas' && `Sebagai Wali Kelas ${myClassWali?.nama_kelas || 'VII-A'}, Anda dapat memantau capaian belajar seluruh siswa, absensi, catatan perkembangan, dan cetak raport.`}
            {role === 'guru' && 'Silakan input dan lengkapi capaian kompetensi serta nilai tugas, UTS, UAS, praktik, dan proyek untuk rombel yang Anda ampu.'}
            {role === 'siswa' && 'Pantau hasil belajar, capaian kompetensi mata pelajaran, rekap absensi, serta unduh raport digital resmi Anda.'}
            {role === 'orang_tua' && 'Pantau perkembangan nilai akademik putra/putri Anda, capaian karakter, kehadiran, serta unduh raport digital resmi.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {['super_admin', 'admin', 'guru', 'wali_kelas'].includes(role) && (
              <button
                id="btn-quick-input-nilai"
                onClick={() => onNavigate('input_nilai')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span>Input Nilai Siswa</span>
              </button>
            )}

            <button
              id="btn-quick-cetak-raport"
              onClick={() => onNavigate('cetak_raport')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{['siswa', 'orang_tua'].includes(role) ? 'Lihat Raport Saya' : 'Cetak & PDF Raport'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ADMIN & SUPER ADMIN STATS */}
      {['super_admin', 'admin'].includes(role) && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Siswa</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalSiswa}</span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">Siswa Aktif</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Pendidik</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalGuru}</span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">Guru Pengampu</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Rombel / Kelas</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <School className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalKelas}</span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">Rombongan Belajar</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Mata Pelajaran</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalMapel}</span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">Mapel A, B & Mulok</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Input Progress Card */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Progres Penginputan Nilai Sekolah</h3>
                  <p className="text-xs text-slate-500">Rekapitulasi pengisian capaian kompetensi semester aktif</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">
                  {progressPercent}% Selesai
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block font-medium">Draft Disimpan</span>
                  <span className="text-lg font-bold text-slate-800">{inputtedGrades}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-emerald-700 block font-medium">Terverifikasi</span>
                  <span className="text-lg font-bold text-emerald-800">{verifiedGrades}</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                  <span className="text-purple-700 block font-medium">Nilai Dikunci</span>
                  <span className="text-lg font-bold text-purple-800">{lockedGrades}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Target penerbitan raport: <strong>{tahunPelajaran.tanggal_raport}</strong>
                </span>
                <button
                  onClick={() => onNavigate('input_nilai')}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Buka Tabel Input Nilai</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Actions & Short Status */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Pintasan Cepat</h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-4">Akses cepat modul utama sistem</p>

                <div className="space-y-2">
                  <button
                    onClick={() => onNavigate('cetak_raport')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-xs font-bold text-slate-800 hover:text-blue-800 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Printer className="w-4 h-4 text-blue-600" />
                      <span>Cetak & Export PDF Raport</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => onNavigate('pelengkap_raport')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-xs font-bold text-slate-800 hover:text-emerald-800 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-emerald-600" />
                      <span>Sikap, Absensi & Ekskul</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => onNavigate('data_siswa')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 text-xs font-bold text-slate-800 hover:text-purple-800 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span>Kelola & Import Siswa</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Identitas: <strong>{sekolah.npsn}</strong></span>
                <span className="text-emerald-600 font-bold">● Server Online</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* GURU & WALI KELAS DASHBOARD */}
      {['guru', 'wali_kelas'].includes(role) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Mata Pelajaran & Kelas yang Anda Ampu</h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-4">Daftar kelas pembelajaran untuk penginputan nilai dan capaian kompetensi</p>

              <div className="space-y-3">
                {kelasList.map((k) => (
                  <div key={k.kelas_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">Kelas {k.nama_kelas}</span>
                        {k.wali_kelas_id === currentGuru?.guru_id && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Kelas Binaan Anda
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Mapel: {myTaughtSubjects.join(', ') || 'Matematika'} • Tingkat {k.tingkat}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('input_nilai')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
                    >
                      Input Nilai
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Homeroom Status */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Tugas Wali Kelas</h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-4">Kelengkapan data raport kelas binaan</p>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span>Penilaian Sikap:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Lengkap
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span>Rekap Absensi:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terisi
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span>Nilai Ekstrakurikuler:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terisi
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span>Catatan Wali Kelas:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('pelengkap_raport')}
              className="mt-6 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition text-center"
            >
              Kelola Pelengkap Raport
            </button>
          </div>
        </div>
      )}

      {/* SISWA & ORANG TUA DASHBOARD */}
      {['siswa', 'orang_tua'].includes(role) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{currentSiswa.nama_lengkap}</h3>
                  <p className="text-xs text-slate-500">
                    NISN: {currentSiswa.nisn} • Kelas: {currentSiswa.kelas_id.replace('KLS-', '')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Rata-rata Nilai</span>
                  <span className="text-2xl font-black text-blue-600">{avgGrade > 0 ? avgGrade : '88.5'}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-700 mb-3">Nilai Capaian Kompetensi Semester Aktif:</h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {myGrades.map((g) => {
                    const mp = mapelList.find(m => m.mapel_id === g.mapel_id);
                    return (
                      <div key={g.nilai_id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{mp?.nama_mapel || g.mapel_id}</span>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{g.deskripsi}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-extrabold text-slate-900">{g.nilai_akhir}</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-[11px]">
                            {g.predikat}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Dokumen Raport</h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-4">Cetak atau unduh raport resmi berformat A4 PDF</p>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-2">
                <FileText className="w-10 h-10 text-blue-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-xs">Raport Capaian Hasil Belajar</h4>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Status: Siap Diunduh
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('cetak_raport')}
              className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition text-center flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Buka Raport Digital & Cetak</span>
            </button>
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY LOGS */}
      {['super_admin', 'admin'].includes(role) && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Log Aktivitas Sistem Terkini</span>
              </h3>
              <p className="text-xs text-slate-500">Audit trail pencatatan aktivitas pengguna secara otomatis</p>
            </div>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Semua Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 font-semibold">Waktu</th>
                  <th className="pb-2 font-semibold">Pengguna</th>
                  <th className="pb-2 font-semibold">Aktivitas</th>
                  <th className="pb-2 font-semibold">Modul</th>
                  <th className="pb-2 font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.slice(0, 5).map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono text-[11px] text-slate-500">{log.waktu}</td>
                    <td className="py-2.5 font-bold text-slate-800">{log.user_name}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-slate-100 text-slate-700">
                        {log.aktivitas}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600">{log.modul}</td>
                    <td className="py-2.5 text-slate-600 truncate max-w-xs">{log.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
