import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Siswa, Kelas, User } from '../types';
import {
  GraduationCap, Plus, Search, Filter, Download, Upload,
  Edit2, Trash2, X, Check, FileSpreadsheet, Eye
} from 'lucide-react';

interface DataSiswaPageProps {
  currentUser: User;
}

export const DataSiswaPage: React.FC<DataSiswaPageProps> = ({ currentUser }) => {
  const [siswaList, setSiswaList] = useState<Siswa[]>(storage.getSiswa());
  const [kelasList, setKelasList] = useState<Kelas[]>(storage.getKelas());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [notif, setNotif] = useState('');

  // Form states
  const [formData, setFormData] = useState<Partial<Siswa>>({
    nisn: '',
    nis: '',
    nama_lengkap: '',
    jenis_kelamin: 'L',
    kelas_id: kelasList[0]?.kelas_id || 'KLS-7A',
    tempat_lahir: '',
    tanggal_lahir: '2012-01-01',
    alamat: '',
    nama_ayah: '',
    nama_ibu: '',
    status: 'aktif'
  });

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSiswaList(storage.getSiswa());
      setKelasList(storage.getKelas());
    });
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingSiswa(null);
    setFormData({
      nisn: '0089' + Math.floor(100000 + Math.random() * 900000),
      nis: '25' + Math.floor(100 + Math.random() * 900),
      nama_lengkap: '',
      jenis_kelamin: 'L',
      kelas_id: selectedClassForAdd(),
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '2012-05-15',
      alamat: 'Jl. Pemuda No. 12',
      nama_ayah: '',
      nama_ibu: '',
      status: 'aktif'
    });
    setShowModal(true);
  };

  const selectedClassForAdd = () => filterKelas !== 'all' ? filterKelas : (kelasList[0]?.kelas_id || 'KLS-7A');

  const handleOpenEdit = (siswa: Siswa) => {
    setEditingSiswa(siswa);
    setFormData(siswa);
    setShowModal(true);
  };

  const handleDelete = (siswa: Siswa) => {
    if (window.confirm(`Hapus data peserta didik ${siswa.nama_lengkap} (NISN: ${siswa.nisn})?`)) {
      storage.deleteSiswa(siswa.siswa_id);
      setNotif(`Data siswa ${siswa.nama_lengkap} berhasil dihapus.`);
      setTimeout(() => setNotif(''), 3000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_lengkap || !formData.nisn) {
      alert('Nama lengkap dan NISN wajib diisi');
      return;
    }

    const payload: Siswa = {
      siswa_id: editingSiswa ? editingSiswa.siswa_id : `SIS-${Date.now().toString().slice(-4)}`,
      nisn: formData.nisn || '',
      nis: formData.nis || '',
      nama_lengkap: formData.nama_lengkap || '',
      jenis_kelamin: (formData.jenis_kelamin as 'L' | 'P') || 'L',
      kelas_id: formData.kelas_id || 'KLS-7A',
      tempat_lahir: formData.tempat_lahir || 'Jakarta',
      tanggal_lahir: formData.tanggal_lahir || '2012-01-01',
      nik: formData.nik || '-',
      agama: formData.agama || 'Islam',
      alamat: formData.alamat || '',
      nama_ayah: formData.nama_ayah || '',
      nama_ibu: formData.nama_ibu || '',
      nomor_telepon: formData.nomor_telepon || '-',
      status: (formData.status as 'aktif' | 'mutasi' | 'lulus') || 'aktif'
    };

    storage.saveSiswa(payload);
    setShowModal(false);
    setNotif(`Data siswa ${payload.nama_lengkap} berhasil disimpan.`);
    setTimeout(() => setNotif(''), 3000);
  };

  const handleExport = () => {
    const headers = ['No', 'NISN', 'NIS', 'Nama Lengkap', 'JK', 'Kelas', 'Tempat Lahir', 'Tanggal Lahir', 'Status'];
    const rows = filteredSiswa.map((s, i) => [
      i + 1,
      s.nisn,
      s.nis,
      `"${s.nama_lengkap}"`,
      s.jenis_kelamin,
      s.kelas_id,
      s.tempat_lahir,
      s.tanggal_lahir,
      s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'DATA_SISWA_SMP.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSiswa = siswaList.filter(s => {
    const matchQuery = s.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       s.nisn.includes(searchQuery) ||
                       s.nis.includes(searchQuery);
    const matchKelas = filterKelas === 'all' || s.kelas_id === filterKelas;
    return matchQuery && matchKelas;
  });

  const canEdit = ['super_admin', 'admin'].includes(currentUser.role);

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Data Peserta Didik</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              {siswaList.length} Total Siswa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Basis data biodata siswa, NISN, NIS, rombel, dan status keaktifan peserta didik SMP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
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

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, NISN, atau NIS..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full sm:w-48 p-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 bg-white focus:border-blue-600"
          >
            <option value="all">Semua Rombel / Kelas</option>
            {kelasList.map((k) => (
              <option key={k.kelas_id} value={k.kelas_id}>
                Kelas {k.nama_kelas}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-3 px-3 w-10 text-center font-extrabold">No</th>
                <th className="py-3 px-3 font-extrabold w-28">NISN / NIS</th>
                <th className="py-3 px-3 font-extrabold">Nama Peserta Didik</th>
                <th className="py-3 px-2 font-extrabold text-center w-12">JK</th>
                <th className="py-3 px-3 font-extrabold w-24">Kelas</th>
                <th className="py-3 px-3 font-extrabold">TTL</th>
                <th className="py-3 px-3 font-extrabold">Nama Orang Tua</th>
                <th className="py-3 px-3 font-extrabold text-center w-20">Status</th>
                {canEdit && <th className="py-3 px-3 font-extrabold text-center w-20">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada data peserta didik yang cocok
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((siswa, idx) => (
                  <tr key={siswa.siswa_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span className="font-bold text-slate-900 block">{siswa.nisn}</span>
                      <span className="text-slate-400 text-[10px]">NIS: {siswa.nis}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {siswa.nama_lengkap}
                    </td>
                    <td className="py-3 px-2 text-center font-bold">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        siswa.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {siswa.jenis_kelamin}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      Kelas {siswa.kelas_id.replace('KLS-', '')}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {siswa.tempat_lahir}, {siswa.tanggal_lahir}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {siswa.nama_ayah ? `Ayah: ${siswa.nama_ayah}` : 'Ibu: ' + (siswa.nama_ibu || '-')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                        {siswa.status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(siswa)}
                            className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(siswa)}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingSiswa ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS Sekolah *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Peserta Didik *</label>
                <input
                  type="text"
                  required
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas / Rombel</label>
                  <select
                    value={formData.kelas_id}
                    onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  >
                    {kelasList.map(k => (
                      <option key={k.kelas_id} value={k.kelas_id}>Kelas {k.nama_kelas}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempat_lahir}
                    onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Ayah Kandung</label>
                  <input
                    type="text"
                    value={formData.nama_ayah}
                    onChange={(e) => setFormData({ ...formData, nama_ayah: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Ibu Kandung</label>
                  <input
                    type="text"
                    value={formData.nama_ibu}
                    onChange={(e) => setFormData({ ...formData, nama_ibu: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
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
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
