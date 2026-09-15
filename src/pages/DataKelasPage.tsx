import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Kelas, Guru, Siswa, User } from '../types';
import { School, Plus, Edit2, Trash2, Users, X, Check } from 'lucide-react';

export const DataKelasPage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [kelasList, setKelasList] = useState<Kelas[]>(storage.getKelas());
  const [guruList, setGuruList] = useState<Guru[]>(storage.getGuru());
  const [siswaList, setSiswaList] = useState<Siswa[]>(storage.getSiswa());
  const [showModal, setShowModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [notif, setNotif] = useState('');

  const [formData, setFormData] = useState<Partial<Kelas>>({
    nama_kelas: '',
    tingkat: '7',
    wali_kelas_id: guruList[0]?.guru_id || 'GURU-001',
    kapasitas: 32
  });

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setKelasList(storage.getKelas());
      setGuruList(storage.getGuru());
      setSiswaList(storage.getSiswa());
    });
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingKelas(null);
    setFormData({
      nama_kelas: '',
      tingkat: '7',
      wali_kelas_id: guruList[0]?.guru_id || 'GURU-001',
      kapasitas: 32
    });
    setShowModal(true);
  };

  const handleOpenEdit = (kelas: Kelas) => {
    setEditingKelas(kelas);
    setFormData(kelas);
    setShowModal(true);
  };

  const handleDelete = (kelas: Kelas) => {
    if (window.confirm(`Hapus rombel ${kelas.nama_kelas}?`)) {
      storage.deleteKelas(kelas.kelas_id);
      setNotif(`Kelas ${kelas.nama_kelas} berhasil dihapus.`);
      setTimeout(() => setNotif(''), 3000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_kelas) {
      alert('Nama kelas wajib diisi');
      return;
    }

    const payload: Kelas = {
      kelas_id: editingKelas ? editingKelas.kelas_id : `KLS-${formData.nama_kelas.replace(/\s+/g, '')}`,
      nama_kelas: formData.nama_kelas,
      tingkat: (Number(formData.tingkat) || 7) as 7 | 8 | 9,
      wali_kelas_id: formData.wali_kelas_id || 'GURU-001',
      tahun_id: 'TP-2025-1',
      status: 'aktif'
    };

    storage.saveKelas(payload);
    setShowModal(false);
    setNotif(`Kelas ${payload.nama_kelas} berhasil disimpan.`);
    setTimeout(() => setNotif(''), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Rombongan Belajar (Kelas)</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {kelasList.length} Rombel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan rombel kelas 7, 8, dan 9 beserta penugasan wali kelas dan kapasitas siswa.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {notif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kelasList.map((k) => {
          const wali = guruList.find(g => g.guru_id === k.wali_kelas_id);
          const studentCount = siswaList.filter(s => s.kelas_id === k.kelas_id).length;

          return (
            <div key={k.kelas_id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 font-extrabold text-xs border border-blue-200">
                    Tingkat {k.tingkat} (Fase D)
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Kapasitas: {k.kapasitas} Siswa
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 mt-3">Kelas {k.nama_kelas}</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Wali Kelas: <strong className="text-slate-900">{wali?.nama_guru || 'Belum Ditetapkan'}</strong>
                </p>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Jumlah Siswa Terdaftar:</span>
                  </span>
                  <span className="font-extrabold text-sm text-blue-700">{studentCount} Siswa</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(k)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(k)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingKelas ? 'Edit Rombongan Belajar' : 'Tambah Rombel Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Rombel / Kelas (contoh: 7-A, 8-B) *</label>
                <input
                  type="text"
                  required
                  value={formData.nama_kelas}
                  onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkatan Kelas</label>
                <select
                  value={formData.tingkat}
                  onChange={(e) => setFormData({ ...formData, tingkat: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="7">Kelas 7</option>
                  <option value="8">Kelas 8</option>
                  <option value="9">Kelas 9</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Wali Kelas</label>
                <select
                  value={formData.wali_kelas_id}
                  onChange={(e) => setFormData({ ...formData, wali_kelas_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                >
                  {guruList.map(g => (
                    <option key={g.guru_id} value={g.guru_id}>{g.nama_guru} ({g.nip})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kapasitas Maksimum Siswa</label>
                <input
                  type="number"
                  value={formData.kapasitas}
                  onChange={(e) => setFormData({ ...formData, kapasitas: Number(e.target.value) || 32 })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
