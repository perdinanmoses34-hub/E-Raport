import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { MataPelajaran, User } from '../types';
import { BookOpen, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export const DataMapelPage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [mapelList, setMapelList] = useState<MataPelajaran[]>(storage.getMataPelajaran());
  const [showModal, setShowModal] = useState(false);
  const [editingMapel, setEditingMapel] = useState<MataPelajaran | null>(null);
  const [notif, setNotif] = useState('');

  const [formData, setFormData] = useState<Partial<MataPelajaran>>({
    nama_mapel: '',
    kode_mapel: '',
    kelompok: 'A',
    kkm: 75,
    jam_per_minggu: 4,
    deskripsi_kompetensi: ''
  });

  useEffect(() => {
    const unsub = storage.subscribe(() => setMapelList(storage.getMataPelajaran()));
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingMapel(null);
    setFormData({
      nama_mapel: '',
      kode_mapel: 'MP-0' + Math.floor(10 + Math.random() * 90),
      kelompok: 'A',
      kkm: 75,
      jam_per_minggu: 4,
      deskripsi_kompetensi: 'Memahami konsep dasar pembelajaran dan penerapannya dalam kehidupan sehari-hari.'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (mapel: MataPelajaran) => {
    setEditingMapel(mapel);
    setFormData(mapel);
    setShowModal(true);
  };

  const handleDelete = (mapel: MataPelajaran) => {
    if (window.confirm(`Hapus mapel ${mapel.nama_mapel}?`)) {
      storage.deleteMataPelajaran(mapel.mapel_id);
      setNotif(`Mata pelajaran ${mapel.nama_mapel} berhasil dihapus.`);
      setTimeout(() => setNotif(''), 3000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_mapel || !formData.kode_mapel) {
      alert('Nama dan kode mapel wajib diisi');
      return;
    }

    const payload: MataPelajaran = {
      mapel_id: editingMapel ? editingMapel.mapel_id : `MP-${Date.now().toString().slice(-4)}`,
      nama_mapel: formData.nama_mapel,
      kode_mapel: formData.kode_mapel,
      kelompok: (formData.kelompok === 'Muatan Lokal' ? 'Muatan Lokal' : formData.kelompok === 'B' ? 'B' : 'A'),
      kkm: formData.kkm || 75,
      jam_pelajaran: formData.jam_per_minggu || 3,
      tingkat: 0,
      status: 'aktif'
    };

    storage.saveMataPelajaran(payload);
    setShowModal(false);
    setNotif(`Mata pelajaran ${payload.nama_mapel} berhasil disimpan.`);
    setTimeout(() => setNotif(''), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Mata Pelajaran & Kriteria Penilaian</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
              {mapelList.length} Mapel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kurikulum Nasional SMP: Kelompok A (Wajib), Kelompok B (Pengembangan), dan Muatan Lokal Daerah.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mapel Baru</span>
        </button>
      </div>

      {notif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="py-3 px-3 w-12 text-center font-extrabold">No</th>
                <th className="py-3 px-3 w-28 font-extrabold">Kode</th>
                <th className="py-3 px-3 font-extrabold">Mata Pelajaran</th>
                <th className="py-3 px-3 font-extrabold w-36">Kelompok</th>
                <th className="py-3 px-3 font-extrabold text-center w-24">KKM / Kriteria</th>
                <th className="py-3 px-3 font-extrabold text-center w-24">Jam/Minggu</th>
                <th className="py-3 px-4 font-extrabold">Capaian Pembelajaran Inti</th>
                <th className="py-3 px-3 font-extrabold text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mapelList.map((m, idx) => (
                <tr key={m.mapel_id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">{m.kode_mapel}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{m.nama_mapel}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      m.kelompok === 'A' ? 'bg-blue-100 text-blue-800' :
                      m.kelompok === 'B' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      Kelompok {m.kelompok}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-slate-900">{m.kkm}</td>
                  <td className="py-3 px-3 text-center text-slate-600">{m.jam_per_minggu} Jam</td>
                  <td className="py-3 px-4 text-slate-600 line-clamp-1">{m.deskripsi_kompetensi}</td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingMapel ? 'Edit Mata Pelajaran' : 'Tambah Mapel Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  required
                  value={formData.nama_mapel}
                  onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Mapel *</label>
                  <input
                    type="text"
                    required
                    value={formData.kode_mapel}
                    onChange={(e) => setFormData({ ...formData, kode_mapel: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelompok Mapel</label>
                  <select
                    value={formData.kelompok}
                    onChange={(e) => setFormData({ ...formData, kelompok: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  >
                    <option value="A">Kelompok A (Wajib)</option>
                    <option value="B">Kelompok B (Pengembangan)</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KKM / Kriteria Minimum</label>
                  <input
                    type="number"
                    value={formData.kkm}
                    onChange={(e) => setFormData({ ...formData, kkm: Number(e.target.value) || 75 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Pelajaran per Minggu</label>
                  <input
                    type="number"
                    value={formData.jam_per_minggu}
                    onChange={(e) => setFormData({ ...formData, jam_per_minggu: Number(e.target.value) || 3 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Capaian Pembelajaran / Standar Kompetensi</label>
                <textarea
                  rows={2}
                  value={formData.deskripsi_kompetensi}
                  onChange={(e) => setFormData({ ...formData, deskripsi_kompetensi: e.target.value })}
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
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
