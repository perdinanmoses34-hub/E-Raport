import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Guru, User } from '../types';
import { Users, Plus, Search, Edit2, Trash2, X, Check, Mail, Phone } from 'lucide-react';

export const DataGuruPage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [guruList, setGuruList] = useState<Guru[]>(storage.getGuru());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [notif, setNotif] = useState('');

  const [formData, setFormData] = useState<Partial<Guru>>({
    nama_lengkap: '',
    nip: '',
    nuptk: '',
    email: '',
    nomor_telepon: '',
    mata_pelajaran: ['Matematika'],
    status: 'aktif'
  });

  useEffect(() => {
    const unsub = storage.subscribe(() => setGuruList(storage.getGuru()));
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingGuru(null);
    setFormData({
      nama_lengkap: '',
      nip: '1985' + Math.floor(10000000000000 + Math.random() * 9000000000000),
      nuptk: '3456' + Math.floor(100000000000 + Math.random() * 900000000000),
      email: '',
      nomor_telepon: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      mata_pelajaran: ['Matematika'],
      status: 'aktif'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (guru: Guru) => {
    setEditingGuru(guru);
    setFormData(guru);
    setShowModal(true);
  };

  const handleDelete = (guru: Guru) => {
    if (window.confirm(`Hapus guru ${guru.nama_lengkap}?`)) {
      storage.deleteGuru(guru.guru_id);
      setNotif(`Data guru ${guru.nama_lengkap} berhasil dihapus.`);
      setTimeout(() => setNotif(''), 3000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_lengkap || !formData.email) {
      alert('Nama guru dan email wajib diisi');
      return;
    }

    const payload: Guru = {
      guru_id: editingGuru ? editingGuru.guru_id : `GURU-${Date.now().toString().slice(-4)}`,
      nama_lengkap: formData.nama_lengkap || '',
      nip: formData.nip || '-',
      nuptk: formData.nuptk || '-',
      email: formData.email || '',
      nomor_telepon: formData.nomor_telepon || '-',
      jenis_kelamin: formData.jenis_kelamin || 'L',
      tempat_lahir: formData.tempat_lahir || 'Bandung',
      tanggal_lahir: formData.tanggal_lahir || '1985-05-12',
      pendidikan: formData.pendidikan || 'S1 Pendidikan',
      mata_pelajaran: formData.mata_pelajaran || [],
      status: (formData.status as 'aktif' | 'nonaktif') || 'aktif'
    };

    storage.saveGuru(payload);
    setShowModal(false);
    setNotif(`Data guru ${payload.nama_lengkap} berhasil disimpan.`);
    setTimeout(() => setNotif(''), 3000);
  };

  const filtered = guruList.filter(g =>
    g.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    g.nip.includes(search) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Data Tenaga Pendidik (Guru)</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              {guruList.length} Guru
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar guru pengampu mata pelajaran, NIP, kontak, dan penugasan wali kelas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Guru Baru</span>
        </button>
      </div>

      {notif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      {/* Search */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari guru berdasarkan nama atau NIP..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((guru) => (
          <div key={guru.guru_id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center">
                  {guru.nama_lengkap.charAt(0)}
                </div>
                {guru.kelas_wali_id && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Wali Kelas
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 mt-3">{guru.nama_lengkap}</h3>
              <p className="text-xs text-slate-500 font-mono">NIP. {guru.nip}</p>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{guru.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{guru.nomor_telepon}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mata Pelajaran:</span>
                <div className="flex flex-wrap gap-1">
                  {guru.mata_pelajaran.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(guru)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(guru)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingGuru ? 'Edit Tenaga Pendidik' : 'Tambah Guru Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP</label>
                <input
                  type="text"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Belajar.id / Resmi *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / Telepon</label>
                <input
                  type="text"
                  value={formData.nomor_telepon}
                  onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran yang Diampu</label>
                <input
                  type="text"
                  value={formData.mata_pelajaran?.join(', ')}
                  onChange={(e) => setFormData({ ...formData, mata_pelajaran: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="contoh: IPA, Prakarya"
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
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
