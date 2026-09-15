import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { User, Kelas, MataPelajaran, Siswa, Nilai, TahunPelajaran } from '../types';
import {
  Save, Send, CheckCircle2, Lock, Unlock, Download, Upload,
  Sparkles, RefreshCw, AlertCircle, FileSpreadsheet, Search, Check, Edit2
} from 'lucide-react';

interface InputNilaiPageProps {
  currentUser: User;
}

export const InputNilaiPage: React.FC<InputNilaiPageProps> = ({ currentUser }) => {
  const [kelasList, setKelasList] = useState<Kelas[]>(storage.getKelas());
  const [mapelList, setMapelList] = useState<MataPelajaran[]>(storage.getMataPelajaran());
  const [siswaList, setSiswaList] = useState<Siswa[]>(storage.getSiswa());
  const [nilaiList, setNilaiList] = useState<Nilai[]>(storage.getNilai());
  const [tahunPelajaran, setTahunPelajaran] = useState<TahunPelajaran>(storage.getActiveTahunPelajaran());
  const [gradingConfig, setGradingConfig] = useState(storage.getGradingConfig());

  // Filter states
  const [selectedKelasId, setSelectedKelasId] = useState<string>(kelasList[0]?.kelas_id || 'KLS-7A');
  const [selectedMapelId, setSelectedMapelId] = useState<string>(mapelList[0]?.mapel_id || 'MP-004'); // default Matematika
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [activeDeskripsiModal, setActiveDeskripsiModal] = useState<{ siswaId: string; nama: string; text: string } | null>(null);

  // Local draft state for the table
  interface RowState {
    siswa_id: string;
    nama_lengkap: string;
    nisn: string;
    tugas: number;
    uts: number;
    uas: number;
    praktik: number;
    proyek: number;
    nilai_akhir: number;
    predikat: 'A' | 'B' | 'C' | 'D';
    deskripsi: string;
    status: 'draft' | 'submitted' | 'verified' | 'locked';
  }

  const [tableData, setTableData] = useState<RowState[]>([]);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setKelasList(storage.getKelas());
      setMapelList(storage.getMataPelajaran());
      setSiswaList(storage.getSiswa());
      setNilaiList(storage.getNilai());
      setTahunPelajaran(storage.getActiveTahunPelajaran());
      setGradingConfig(storage.getGradingConfig());
    });
    return unsub;
  }, []);

  // Build table rows whenever filter changes
  useEffect(() => {
    const studentsInClass = siswaList.filter(s => s.kelas_id === selectedKelasId);

    const rows: RowState[] = studentsInClass.map(siswa => {
      const existing = nilaiList.find(
        n => n.siswa_id === siswa.siswa_id &&
             n.mapel_id === selectedMapelId &&
             n.semester === tahunPelajaran.semester
      );

      if (existing) {
        return {
          siswa_id: siswa.siswa_id,
          nama_lengkap: siswa.nama_lengkap,
          nisn: siswa.nisn,
          tugas: existing.tugas,
          uts: existing.uts,
          uas: existing.uas,
          praktik: existing.praktik,
          proyek: existing.proyek,
          nilai_akhir: existing.nilai_akhir,
          predikat: existing.predikat,
          deskripsi: existing.deskripsi,
          status: existing.status
        };
      } else {
        // Default initial entry
        const defTugas = 80;
        const defUts = 80;
        const defUas = 82;
        const defPraktik = 85;
        const defProyek = 85;
        const { nilaiAkhir, predikat } = storage.calculateNilaiAkhir(defTugas, defUts, defUas, defPraktik, defProyek);
        const mapelObj = mapelList.find(m => m.mapel_id === selectedMapelId);
        const defDesc = storage.generateDeskripsiCapaian(
          mapelObj?.nama_mapel || 'Mata Pelajaran',
          nilaiAkhir,
          predikat,
          siswa.nama_lengkap
        );

        return {
          siswa_id: siswa.siswa_id,
          nama_lengkap: siswa.nama_lengkap,
          nisn: siswa.nisn,
          tugas: defTugas,
          uts: defUts,
          uas: defUas,
          praktik: defPraktik,
          proyek: defProyek,
          nilai_akhir: nilaiAkhir,
          predikat: predikat,
          deskripsi: defDesc,
          status: 'draft'
        };
      }
    });

    setTableData(rows);
  }, [selectedKelasId, selectedMapelId, siswaList, nilaiList, tahunPelajaran.semester]);

  // Handle grade numeric changes
  const handleScoreChange = (
    index: number,
    field: 'tugas' | 'uts' | 'uas' | 'praktik' | 'proyek',
    value: string
  ) => {
    const num = Math.min(100, Math.max(0, Number(value) || 0));
    setTableData(prev => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: num };
      const { nilaiAkhir, predikat } = storage.calculateNilaiAkhir(
        row.tugas,
        row.uts,
        row.uas,
        row.praktik,
        row.proyek
      );
      row.nilai_akhir = nilaiAkhir;
      row.predikat = predikat;
      updated[index] = row;
      return updated;
    });
  };

  // Generate automated description for all students in the class
  const handleAutoGenerateAllDeskripsi = () => {
    const mapelObj = mapelList.find(m => m.mapel_id === selectedMapelId);
    setTableData(prev =>
      prev.map(row => ({
        ...row,
        deskripsi: storage.generateDeskripsiCapaian(
          mapelObj?.nama_mapel || 'Mata Pelajaran',
          row.nilai_akhir,
          row.predikat,
          row.nama_lengkap
        )
      }))
    );
    setSaveSuccessMsg('Deskripsi capaian kompetensi berhasil digenerate otomatis berdasarkan kriteria Kurikulum Merdeka.');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Save changes to storage
  const handleSaveDraft = (targetStatus: 'draft' | 'submitted' | 'verified' | 'locked' = 'draft') => {
    tableData.forEach(row => {
      const payload: Nilai = {
        nilai_id: `NIL-${row.siswa_id}-${selectedMapelId}-${tahunPelajaran.semester}`,
        siswa_id: row.siswa_id,
        mapel_id: selectedMapelId,
        kelas_id: selectedKelasId,
        guru_id: currentUser.guru_id || 'GURU-001',
        tahun_id: tahunPelajaran.tahun_id,
        semester: tahunPelajaran.semester,
        tugas: row.tugas,
        uts: row.uts,
        uas: row.uas,
        praktik: row.praktik,
        proyek: row.proyek,
        nilai_tugas: row.tugas,
        nilai_uts: row.uts,
        nilai_uas: row.uas,
        nilai_praktik: row.praktik,
        nilai_proyek: row.proyek,
        nilai_akhir: row.nilai_akhir,
        predikat: row.predikat,
        deskripsi: row.deskripsi,
        status: targetStatus,
        updated_at: new Date().toISOString()
      };
      storage.upsertNilai(payload);
    });

    storage.addLog(
      targetStatus === 'locked' ? 'LOCK NILAI' : targetStatus === 'verified' ? 'VERIFIKASI NILAI' : 'INPUT NILAI',
      'Nilai & Raport',
      `Menyimpan nilai ${tableData.length} siswa untuk mapel ${selectedMapelId} kelas ${selectedKelasId} dengan status [${targetStatus.toUpperCase()}]`
    );

    setSaveSuccessMsg(`Data nilai berhasil disimpan dengan status: ${targetStatus.toUpperCase()}`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleExportCSV = () => {
    const mapelObj = mapelList.find(m => m.mapel_id === selectedMapelId);
    const kelasObj = kelasList.find(k => k.kelas_id === selectedKelasId);
    const headers = ['No', 'NISN', 'Nama Siswa', 'Tugas', 'UTS', 'UAS', 'Praktik', 'Proyek', 'Nilai Akhir', 'Predikat', 'Deskripsi Capaian'];
    const rows = tableData.map((r, i) => [
      i + 1,
      r.nisn,
      `"${r.nama_lengkap}"`,
      r.tugas,
      r.uts,
      r.uas,
      r.praktik,
      r.proyek,
      r.nilai_akhir,
      r.predikat,
      `"${r.deskripsi.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NILAI_${kelasObj?.nama_kelas || 'KELAS'}_${mapelObj?.nama_mapel || 'MAPEL'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = tableData.filter(
    r => r.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
         r.nisn.includes(searchQuery)
  );

  const isClassLocked = tableData.length > 0 && tableData.every(r => r.status === 'locked');
  const canLock = ['super_admin', 'admin'].includes(currentUser.role);
  const canVerify = ['super_admin', 'admin', 'wali_kelas'].includes(currentUser.role);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Input Nilai & Capaian Belajar</h1>
            {isClassLocked ? (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold flex items-center gap-1 border border-purple-200">
                <Lock className="w-3 h-3" /> NILAI TERKUNCI
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-200">
                <Unlock className="w-3 h-3" /> FORM AKTIF
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penilaian autentik berdasarkan bobot Tugas ({gradingConfig.bobot_tugas}%), UTS ({gradingConfig.bobot_uts}%), UAS ({gradingConfig.bobot_uas}%), Praktik ({gradingConfig.bobot_praktik}%), dan Proyek ({gradingConfig.bobot_proyek}%).
          </p>
        </div>

        {/* Global Save Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAutoGenerateAllDeskripsi}
            disabled={isClassLocked}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition active:scale-95 disabled:opacity-50"
            title="Generate deskripsi capaian kompetensi otomatis untuk seluruh siswa"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Auto Deskripsi</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition active:scale-95"
            title="Download file Excel / CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => handleSaveDraft('draft')}
            disabled={isClassLocked}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Draft</span>
          </button>

          <button
            onClick={() => handleSaveDraft('submitted')}
            disabled={isClassLocked}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Ajukan Nilai</span>
          </button>

          {canVerify && (
            <button
              onClick={() => handleSaveDraft('verified')}
              disabled={isClassLocked}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verifikasi</span>
            </button>
          )}

          {canLock && (
            <button
              onClick={() => handleSaveDraft(isClassLocked ? 'draft' : 'locked')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition active:scale-95 ${
                isClassLocked
                  ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  : 'bg-purple-700 hover:bg-purple-800 text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{isClassLocked ? 'Buka Kunci' : 'Kunci Nilai'}</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Rombongan Belajar (Kelas)
          </label>
          <select
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {kelasList.map((k) => (
              <option key={k.kelas_id} value={k.kelas_id}>
                Kelas {k.nama_kelas} (Tingkat {k.tingkat})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Mata Pelajaran
          </label>
          <select
            value={selectedMapelId}
            onChange={(e) => setSelectedMapelId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            {mapelList.map((m) => (
              <option key={m.mapel_id} value={m.mapel_id}>
                {m.nama_mapel} ({m.kode_mapel}) — KKM {m.kkm}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tahun & Semester
          </label>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-slate-800">
            {tahunPelajaran.tahun_pelajaran} — Sem. {tahunPelajaran.semester}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Cari Nama / NISN
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-3 px-3 font-extrabold w-10 text-center">No</th>
                <th className="py-3 px-3 font-extrabold w-28">NISN</th>
                <th className="py-3 px-3 font-extrabold min-w-[160px]">Nama Peserta Didik</th>
                <th className="py-3 px-2 font-extrabold text-center w-20">Tugas (20%)</th>
                <th className="py-3 px-2 font-extrabold text-center w-20">UTS (25%)</th>
                <th className="py-3 px-2 font-extrabold text-center w-20">UAS (30%)</th>
                <th className="py-3 px-2 font-extrabold text-center w-20">Praktik (15%)</th>
                <th className="py-3 px-2 font-extrabold text-center w-20">Proyek (10%)</th>
                <th className="py-3 px-3 font-extrabold text-center w-24 bg-blue-50 text-blue-900">Nilai Akhir</th>
                <th className="py-3 px-2 font-extrabold text-center w-16 bg-blue-50 text-blue-900">Predikat</th>
                <th className="py-3 px-4 font-extrabold min-w-[220px]">Capaian Kompetensi / Deskripsi</th>
                <th className="py-3 px-3 font-extrabold text-center w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada data siswa ditemukan untuk kelas ini
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  return (
                    <tr key={row.siswa_id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-medium">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{row.nisn}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{row.nama_lengkap}</td>

                      {/* Tugas */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={isClassLocked}
                          value={row.tugas}
                          onChange={(e) => handleScoreChange(index, 'tugas', e.target.value)}
                          className="w-16 p-1.5 text-center font-bold rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-100"
                        />
                      </td>

                      {/* UTS */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={isClassLocked}
                          value={row.uts}
                          onChange={(e) => handleScoreChange(index, 'uts', e.target.value)}
                          className="w-16 p-1.5 text-center font-bold rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-100"
                        />
                      </td>

                      {/* UAS */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={isClassLocked}
                          value={row.uas}
                          onChange={(e) => handleScoreChange(index, 'uas', e.target.value)}
                          className="w-16 p-1.5 text-center font-bold rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-100"
                        />
                      </td>

                      {/* Praktik */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={isClassLocked}
                          value={row.praktik}
                          onChange={(e) => handleScoreChange(index, 'praktik', e.target.value)}
                          className="w-16 p-1.5 text-center font-bold rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-100"
                        />
                      </td>

                      {/* Proyek */}
                      <td className="py-2 px-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={isClassLocked}
                          value={row.proyek}
                          onChange={(e) => handleScoreChange(index, 'proyek', e.target.value)}
                          className="w-16 p-1.5 text-center font-bold rounded-lg border border-slate-300 text-xs focus:border-blue-600 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-100"
                        />
                      </td>

                      {/* Nilai Akhir */}
                      <td className="py-2.5 px-3 text-center font-black text-slate-900 bg-blue-50/50">
                        {row.nilai_akhir}
                      </td>

                      {/* Predikat Badge */}
                      <td className="py-2.5 px-2 text-center bg-blue-50/50">
                        <span className={`px-2 py-0.5 rounded-md font-black text-xs ${
                          row.predikat === 'A' ? 'bg-emerald-100 text-emerald-800' :
                          row.predikat === 'B' ? 'bg-blue-100 text-blue-800' :
                          row.predikat === 'C' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.predikat}
                        </span>
                      </td>

                      {/* Capaian Deskripsi */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed flex-1">
                            {row.deskripsi}
                          </p>
                          <button
                            onClick={() => setActiveDeskripsiModal({
                              siswaId: row.siswa_id,
                              nama: row.nama_lengkap,
                              text: row.deskripsi
                            })}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 shrink-0"
                            title="Edit deskripsi capaian"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          row.status === 'locked' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          row.status === 'verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          row.status === 'submitted' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Deskripsi Modal */}
      {activeDeskripsiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Edit Capaian Kompetensi — {activeDeskripsiModal.nama}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">
              Deskripsi naratif yang akan dicetak pada lembar raport resmi.
            </p>

            <textarea
              rows={4}
              value={activeDeskripsiModal.text}
              onChange={(e) => setActiveDeskripsiModal({ ...activeDeskripsiModal, text: e.target.value })}
              className="w-full p-3 rounded-2xl border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveDeskripsiModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setTableData(prev =>
                    prev.map(r =>
                      r.siswa_id === activeDeskripsiModal.siswaId
                        ? { ...r, deskripsi: activeDeskripsiModal.text }
                        : r
                    )
                  );
                  setActiveDeskripsiModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition"
              >
                Simpan Deskripsi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
