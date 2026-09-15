import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Sekolah, GradingConfig, User } from '../types';
import { Sliders, School, Save, Check, ShieldCheck, RefreshCw } from 'lucide-react';

export const PengaturanSistemPage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [sekolah, setSekolah] = useState<Sekolah>(storage.getSekolah());
  const [grading, setGrading] = useState<GradingConfig>(storage.getGradingConfig());
  const [notif, setNotif] = useState('');

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSekolah(storage.getSekolah());
      setGrading(storage.getGradingConfig());
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

  return (
    <div className="space-y-6 pb-16">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Pengaturan Format & Bobot Penilaian</h1>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi bobot komponen nilai rapor dan skala rentang predikat Kurikulum Merdeka.
        </p>
      </div>

      {notif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

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
                  onChange={(e) => setGrading({ ...grading, bobot_tugas: Number(e.target.value) || 0 })}
                  className="w-16 p-1 text-center font-bold rounded-lg border border-slate-300"
                />
                <span className="font-bold text-slate-500">%</span>
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
                  onChange={(e) => setGrading({ ...grading, bobot_uts: Number(e.target.value) || 0 })}
                  className="w-16 p-1 text-center font-bold rounded-lg border border-slate-300"
                />
                <span className="font-bold text-slate-500">%</span>
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
                  onChange={(e) => setGrading({ ...grading, bobot_uas: Number(e.target.value) || 0 })}
                  className="w-16 p-1 text-center font-bold rounded-lg border border-slate-300"
                />
                <span className="font-bold text-slate-500">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <label className="font-semibold text-slate-700">Ujian Praktik / Unjuk Kerja</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={grading.bobot_praktik}
                  onChange={(e) => setGrading({ ...grading, bobot_praktik: Number(e.target.value) || 0 })}
                  className="w-16 p-1 text-center font-bold rounded-lg border border-slate-300"
                />
                <span className="font-bold text-slate-500">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <label className="font-semibold text-slate-700">Proyek P5 / Pembelajaran Berbasis Proyek</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={grading.bobot_proyek}
                  onChange={(e) => setGrading({ ...grading, bobot_proyek: Number(e.target.value) || 0 })}
                  className="w-16 p-1 text-center font-bold rounded-lg border border-slate-300"
                />
                <span className="font-bold text-slate-500">%</span>
              </div>
            </div>

            <div className="pt-3">
              <h4 className="font-bold text-slate-800 mb-2">Rentang Batas Predikat Nilai Akhir:</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="font-extrabold text-emerald-800 block">Predikat A</span>
                  <span className="text-[11px] text-emerald-600">≥ {grading.rentang_a}</span>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="font-extrabold text-blue-800 block">Predikat B</span>
                  <span className="text-[11px] text-blue-600">≥ {grading.rentang_b}</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-extrabold text-amber-800 block">Predikat C</span>
                  <span className="text-[11px] text-amber-600">≥ {grading.rentang_c}</span>
                </div>
                <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                  <span className="font-extrabold text-red-800 block">Predikat D</span>
                  <span className="text-[11px] text-red-600">&lt; {grading.rentang_c}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition active:scale-98"
            >
              Simpan Konfigurasi Bobot & Predikat
            </button>
          </form>
        </div>

        {/* School Profile Form */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">Identitas Satuan Pendidikan</h3>
            <p className="text-xs text-slate-500">Kop raport, nama kepala sekolah, dan NIP</p>
          </div>

          <form onSubmit={handleSaveSekolah} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                value={sekolah.nama_sekolah}
                onChange={(e) => setSekolah({ ...sekolah, nama_sekolah: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
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
                  className="w-full p-2.5 rounded-xl border border-slate-300"
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
    </div>
  );
};
