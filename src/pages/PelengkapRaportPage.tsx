import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { User, Kelas, Siswa, TahunPelajaran, PelengkapRaport } from '../types';
import {
  Smile, UserCheck, CalendarCheck, Award, Heart,
  Save, Check, Search, CheckCircle2, AlertCircle, Plus, Trash2
} from 'lucide-react';

interface PelengkapRaportPageProps {
  currentUser: User;
}

export const PelengkapRaportPage: React.FC<PelengkapRaportPageProps> = ({ currentUser }) => {
  const [kelasList, setKelasList] = useState<Kelas[]>(storage.getKelas());
  const [siswaList, setSiswaList] = useState<Siswa[]>(storage.getSiswa());
  const [tahunPelajaran, setTahunPelajaran] = useState<TahunPelajaran>(storage.getActiveTahunPelajaran());
  const [selectedKelasId, setSelectedKelasId] = useState<string>(kelasList[0]?.kelas_id || 'KLS-7A');
  const [activeTab, setActiveTab] = useState<'sikap' | 'absensi' | 'ekskul' | 'prestasi' | 'catatan'>('sikap');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setKelasList(storage.getKelas());
      setSiswaList(storage.getSiswa());
      setTahunPelajaran(storage.getActiveTahunPelajaran());
    });
    return unsub;
  }, []);

  const studentsInClass = siswaList.filter(s => s.kelas_id === selectedKelasId);

  const handleUpdatePelengkap = (siswaId: string, partial: Partial<PelengkapRaport>) => {
    const existing = storage.getPelengkapBySiswa(siswaId);
    storage.savePelengkap({
      ...existing,
      ...partial,
      siswa_id: siswaId,
      updated_at: new Date().toISOString()
    });
    setSaveMsg('Data pelengkap raport berhasil diperbarui secara otomatis.');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Pelengkap Raport Siswa
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Penilaian Sikap (Profil Pelajar Pancasila), Absensi Kehadiran, Ekstrakurikuler, Prestasi, dan Catatan Wali Kelas.
          </p>
        </div>

        {/* Kelas selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Kelas:</label>
          <select
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 bg-white focus:border-blue-600"
          >
            {kelasList.map((k) => (
              <option key={k.kelas_id} value={k.kelas_id}>
                Kelas {k.nama_kelas} ({studentsInClass.length} Siswa)
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('sikap')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
            activeTab === 'sikap'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>1. Penilaian Karakter & Sikap</span>
        </button>

        <button
          onClick={() => setActiveTab('absensi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
            activeTab === 'absensi'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>2. Kehadiran & Absensi</span>
        </button>

        <button
          onClick={() => setActiveTab('ekskul')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
            activeTab === 'ekskul'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>3. Ekstrakurikuler</span>
        </button>

        <button
          onClick={() => setActiveTab('prestasi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
            activeTab === 'prestasi'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>4. Prestasi Siswa</span>
        </button>

        <button
          onClick={() => setActiveTab('catatan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
            activeTab === 'catatan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>5. Catatan Wali & Kenaikan</span>
        </button>
      </div>

      {/* TAB 1: SIKAP */}
      {activeTab === 'sikap' && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Penilaian Sikap Spiritual & Sosial</h3>
              <p className="text-xs text-slate-500">Keterangan sikap berpedoman pada dimensi Profil Pelajar Pancasila</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3">Nama Siswa</th>
                  <th className="py-3 px-3 w-32">Predikat Spiritual</th>
                  <th className="py-3 px-3">Deskripsi Sikap Spiritual</th>
                  <th className="py-3 px-3 w-32">Predikat Sosial</th>
                  <th className="py-3 px-3">Deskripsi Sikap Sosial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsInClass.map((siswa, idx) => {
                  const p = storage.getPelengkapBySiswa(siswa.siswa_id);
                  return (
                    <tr key={siswa.siswa_id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{siswa.nama_lengkap}</td>
                      <td className="py-3 px-3">
                        <select
                          value={p.sikap_spiritual}
                          onChange={(e) => handleUpdatePelengkap(siswa.siswa_id, { sikap_spiritual: e.target.value as any })}
                          className="p-1.5 rounded-lg border border-slate-300 font-semibold text-xs text-slate-800"
                        >
                          <option value="Sangat Baik">Sangat Baik</option>
                          <option value="Baik">Baik</option>
                          <option value="Cukup">Cukup</option>
                          <option value="Kurang">Kurang</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={p.deskripsi_spiritual}
                          onChange={(e) => handleUpdatePelengkap(siswa.siswa_id, { deskripsi_spiritual: e.target.value })}
                          className="w-full p-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={p.sikap_sosial}
                          onChange={(e) => handleUpdatePelengkap(siswa.siswa_id, { sikap_sosial: e.target.value as any })}
                          className="p-1.5 rounded-lg border border-slate-300 font-semibold text-xs text-slate-800"
                        >
                          <option value="Sangat Baik">Sangat Baik</option>
                          <option value="Baik">Baik</option>
                          <option value="Cukup">Cukup</option>
                          <option value="Kurang">Kurang</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={p.deskripsi_sosial}
                          onChange={(e) => handleUpdatePelengkap(siswa.siswa_id, { deskripsi_sosial: e.target.value })}
                          className="w-full p-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ABSENSI */}
      {activeTab === 'absensi' && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Rekapitulasi Kehadiran Siswa Semester Ini</h3>
            <p className="text-xs text-slate-500">Jumlah hari ketidakhadiran (Sakit, Izin, dan Tanpa Keterangan)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3">Nama Siswa</th>
                  <th className="py-3 px-3 w-28 text-center">Sakit (S)</th>
                  <th className="py-3 px-3 w-28 text-center">Izin (I)</th>
                  <th className="py-3 px-3 w-28 text-center">Tanpa Keterangan (A)</th>
                  <th className="py-3 px-3 w-32 text-center">Total Absen</th>
                  <th className="py-3 px-3 text-center w-32">Persentase Hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsInClass.map((siswa, idx) => {
                  const p = storage.getPelengkapBySiswa(siswa.siswa_id);
                  const totalAbsen = p.absen_sakit + p.absen_izin + p.absen_alpa;
                  const totalHariSekolah = 110;
                  const hadirPercent = Math.max(0, Math.round(((totalHariSekolah - totalAbsen) / totalHariSekolah) * 100));

                  return (
                    <tr key={siswa.siswa_id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{siswa.nama_lengkap}</td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={p.absen_sakit}
                          onChange={(e) => handleUpdatePelengkap(siswa.siswa_id, { absen_sakit: Number(e.target.value) || 0 })}
                          className="w-16 p-1 text-center rounded border border-slate-300 font-bold"
                        />
                        <span className="ml-1 text-[11px] text-slate-400">hari</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={p.absen_izin}
                          onChange={(e) => handleUpdatePelengkap(siswa.siswa_id, { absen_izin: Number(e.target.value) || 0 })}
                          className="w-16 p-1 text-center rounded border border-slate-300 font-bold"
                        />
                        <span className="ml-1 text-[11px] text-slate-400">hari</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={p.absen_alpa}
                          onChange={(e) => handleUpdatePelengkap(siswa.siswa_id, { absen_alpa: Number(e.target.value) || 0 })}
                          className="w-16 p-1 text-center rounded border border-slate-300 font-bold text-red-600"
                        />
                        <span className="ml-1 text-[11px] text-slate-400">hari</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {totalAbsen} hari
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-extrabold text-[11px] ${
                          hadirPercent >= 90 ? 'bg-emerald-100 text-emerald-800' :
                          hadirPercent >= 75 ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {hadirPercent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EKSKUL */}
      {activeTab === 'ekskul' && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Kegiatan Ekstrakurikuler Siswa</h3>
            <p className="text-xs text-slate-500">Mencatat kegiatan ekskul wajib (Pramuka) dan ekskul pilihan beserta predikat</p>
          </div>

          <div className="p-4 space-y-4">
            {studentsInClass.map((siswa) => {
              const p = storage.getPelengkapBySiswa(siswa.siswa_id);
              return (
                <div key={siswa.siswa_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                    <span className="font-extrabold text-slate-900 text-sm">{siswa.nama_lengkap}</span>
                    <button
                      onClick={() => {
                        const updated = [...p.ekskul, { nama: 'PMR', predikat: 'A', keterangan: 'Sangat aktif dalam kegiatan pertolongan pertama' }];
                        handleUpdatePelengkap(siswa.siswa_id, { ekskul: updated });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Ekskul</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {p.ekskul.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Nama Ekskul"
                          value={item.nama}
                          onChange={(e) => {
                            const updated = [...p.ekskul];
                            updated[idx].nama = e.target.value;
                            handleUpdatePelengkap(siswa.siswa_id, { ekskul: updated });
                          }}
                          className="p-1.5 rounded-lg border border-slate-300 w-44 font-semibold text-slate-800"
                        />
                        <select
                          value={item.predikat}
                          onChange={(e) => {
                            const updated = [...p.ekskul];
                            updated[idx].predikat = e.target.value as any;
                            handleUpdatePelengkap(siswa.siswa_id, { ekskul: updated });
                          }}
                          className="p-1.5 rounded-lg border border-slate-300 font-bold text-slate-800 w-24"
                        >
                          <option value="Sangat Baik">A (Sangat Baik)</option>
                          <option value="Baik">B (Baik)</option>
                          <option value="Cukup">C (Cukup)</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Keterangan capaian kegiatan"
                          value={item.keterangan}
                          onChange={(e) => {
                            const updated = [...p.ekskul];
                            updated[idx].keterangan = e.target.value;
                            handleUpdatePelengkap(siswa.siswa_id, { ekskul: updated });
                          }}
                          className="p-1.5 rounded-lg border border-slate-300 flex-1 text-slate-700"
                        />
                        <button
                          onClick={() => {
                            const updated = p.ekskul.filter((_, i) => i !== idx);
                            handleUpdatePelengkap(siswa.siswa_id, { ekskul: updated });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PRESTASI */}
      {activeTab === 'prestasi' && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Prestasi & Penghargaan Siswa</h3>
            <p className="text-xs text-slate-500">Pencatatan prestasi lomba sains, seni, olahraga, dan keagamaan</p>
          </div>

          <div className="p-4 space-y-4">
            {studentsInClass.map((siswa) => {
              const p = storage.getPelengkapBySiswa(siswa.siswa_id);
              return (
                <div key={siswa.siswa_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                    <span className="font-extrabold text-slate-900 text-sm">{siswa.nama_lengkap}</span>
                    <button
                      onClick={() => {
                        const updated = [...p.prestasi, { jenis: 'Akademik', keterangan: 'Juara 1 Olimpiade Sains Matematika Tingkat Kota' }];
                        handleUpdatePelengkap(siswa.siswa_id, { prestasi: updated });
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Prestasi</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {p.prestasi.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Belum ada catatan prestasi yang dimasukkan</p>
                    ) : (
                      p.prestasi.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Jenis Prestasi (Akademik / Seni / Olahraga)"
                            value={item.jenis}
                            onChange={(e) => {
                              const updated = [...p.prestasi];
                              updated[idx].jenis = e.target.value;
                              handleUpdatePelengkap(siswa.siswa_id, { prestasi: updated });
                            }}
                            className="p-1.5 rounded-lg border border-slate-300 w-44 font-semibold text-slate-800"
                          />
                          <input
                            type="text"
                            placeholder="Keterangan prestasi dan kejuaraan"
                            value={item.keterangan}
                            onChange={(e) => {
                              const updated = [...p.prestasi];
                              updated[idx].keterangan = e.target.value;
                              handleUpdatePelengkap(siswa.siswa_id, { prestasi: updated });
                            }}
                            className="p-1.5 rounded-lg border border-slate-300 flex-1 text-slate-700"
                          />
                          <button
                            onClick={() => {
                              const updated = p.prestasi.filter((_, i) => i !== idx);
                              handleUpdatePelengkap(siswa.siswa_id, { prestasi: updated });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: CATATAN WALI & KENAIKAN */}
      {activeTab === 'catatan' && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Catatan Wali Kelas & Keputusan Kenaikan / Kelulusan</h3>
            <p className="text-xs text-slate-500">Pesan motivasi pribadi wali kelas serta status kelulusan / kenaikan kelas</p>
          </div>

          <div className="p-4 space-y-4">
            {studentsInClass.map((siswa) => {
              const p = storage.getPelengkapBySiswa(siswa.siswa_id);
              return (
                <div key={siswa.siswa_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                    <span className="font-extrabold text-slate-900 text-sm">{siswa.nama_lengkap}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">Keputusan:</span>
                      <select
                        value={p.status_kenaikan}
                        onChange={(e) => handleUpdatePelengkap(siswa.siswa_id, { status_kenaikan: e.target.value as any })}
                        className="p-1 rounded-lg border border-slate-300 font-bold text-xs text-slate-800"
                      >
                        <option value="Naik Kelas">Naik Kelas</option>
                        <option value="Tinggal di Kelas">Tinggal di Kelas</option>
                        <option value="Lulus">Lulus</option>
                        <option value="Belum Lulus">Belum Lulus</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Catatan Motivasi Wali Kelas untuk Lembar Raport:
                    </label>
                    <textarea
                      rows={2}
                      value={p.catatan_wali_kelas}
                      onChange={(e) => handleUpdatePelengkap(siswa.siswa_id, { catatan_wali_kelas: e.target.value })}
                      className="w-full p-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-blue-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
