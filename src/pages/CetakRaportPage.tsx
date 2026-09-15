import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../services/storage';
import { User, Sekolah, TahunPelajaran, Siswa, Kelas, MataPelajaran, Nilai, PelengkapRaport } from '../types';
import {
  Printer, Download, FileText, Share2, CheckCircle2,
  ChevronLeft, ChevronRight, Eye, Sparkles, HardDrive, Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface CetakRaportPageProps {
  currentUser: User;
}

export const CetakRaportPage: React.FC<CetakRaportPageProps> = ({ currentUser }) => {
  const [sekolah, setSekolah] = useState<Sekolah>(storage.getSekolah());
  const [tahunPelajaran, setTahunPelajaran] = useState<TahunPelajaran>(storage.getActiveTahunPelajaran());
  const [kelasList, setKelasList] = useState<Kelas[]>(storage.getKelas());
  const [siswaList, setSiswaList] = useState<Siswa[]>(storage.getSiswa());
  const [mapelList, setMapelList] = useState<MataPelajaran[]>(storage.getMataPelajaran());
  const [nilaiList, setNilaiList] = useState<Nilai[]>(storage.getNilai());
  const [guruList, setGuruList] = useState(storage.getGuru());

  const [selectedKelasId, setSelectedKelasId] = useState<string>(
    currentUser.kelas_id || kelasList[0]?.kelas_id || 'KLS-7A'
  );

  const studentsInClass = siswaList.filter(s => s.kelas_id === selectedKelasId);
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>(
    currentUser.siswa_id || studentsInClass[0]?.siswa_id || 'SIS-001'
  );

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const printContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setSekolah(storage.getSekolah());
      setTahunPelajaran(storage.getActiveTahunPelajaran());
      setKelasList(storage.getKelas());
      setSiswaList(storage.getSiswa());
      setMapelList(storage.getMataPelajaran());
      setNilaiList(storage.getNilai());
      setGuruList(storage.getGuru());
    });
    return unsub;
  }, []);

  // Set default student if class changes
  useEffect(() => {
    if (studentsInClass.length > 0 && !studentsInClass.some(s => s.siswa_id === selectedSiswaId)) {
      setSelectedSiswaId(studentsInClass[0].siswa_id);
    }
  }, [selectedKelasId]);

  const currentSiswa = siswaList.find(s => s.siswa_id === selectedSiswaId) || studentsInClass[0] || siswaList[0];
  const currentKelas = kelasList.find(k => k.kelas_id === selectedKelasId);
  const currentWaliKelas = guruList.find(g => g.guru_id === currentKelas?.wali_kelas_id) || guruList[0];
  const pelengkap: PelengkapRaport = storage.getPelengkapBySiswa(currentSiswa?.siswa_id || '');

  // Get student's grades for all subjects
  const studentGrades = mapelList.map(mapel => {
    const grade = nilaiList.find(
      n => n.siswa_id === currentSiswa?.siswa_id &&
           n.mapel_id === mapel.mapel_id &&
           n.semester === tahunPelajaran.semester
    );

    if (grade) {
      return {
        mapel,
        nilai: grade.nilai_akhir,
        predikat: grade.predikat,
        deskripsi: grade.deskripsi
      };
    } else {
      // Generated fallback preview
      const { nilaiAkhir, predikat } = storage.calculateNilaiAkhir(84, 82, 85, 88, 85);
      return {
        mapel,
        nilai: nilaiAkhir,
        predikat,
        deskripsi: storage.generateDeskripsiCapaian(mapel.nama_mapel, nilaiAkhir, predikat, currentSiswa?.nama_lengkap || 'Siswa')
      };
    }
  });

  const handlePrint = () => {
    window.print();
    storage.addLog(
      'PRINT RAPORT',
      'Raport',
      `Mencetak lembar raport resmi A4 untuk siswa ${currentSiswa?.nama_lengkap} (NISN: ${currentSiswa?.nisn})`
    );
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Page dimensions
      const pageWidth = 210;
      const margin = 14;
      let y = 16;

      // Header Kop
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('PEMERINTAH KABUPATEN ' + sekolah.kabupaten.toUpperCase(), pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text('DINAS PENDIDIKAN DAN KEBUDAYAAN', pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.setFontSize(13);
      doc.text(sekolah.nama_sekolah.toUpperCase(), pageWidth / 2, y, { align: 'center' });
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(sekolah.alamat + ' — NPSN: ' + sekolah.npsn + ' — Akreditasi: ' + sekolah.akreditasi, pageWidth / 2, y, { align: 'center' });
      y += 3;
      doc.setLineWidth(0.6);
      doc.line(margin, y, pageWidth - margin, y);
      y += 1;
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPORT)', pageWidth / 2, y, { align: 'center' });
      y += 6;

      // Student Meta
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nama Peserta Didik : ${currentSiswa.nama_lengkap}`, margin, y);
      doc.text(`Kelas               : ${currentKelas?.nama_kelas || 'VII-A'}`, 125, y);
      y += 4.5;
      doc.text(`NIS / NISN         : ${currentSiswa.nis} / ${currentSiswa.nisn}`, margin, y);
      doc.text(`Fase / Semester     : D / ${tahunPelajaran.semester} (${tahunPelajaran.semester === '1' ? 'Ganjil' : 'Genap'})`, 125, y);
      y += 4.5;
      doc.text(`Nama Sekolah       : ${sekolah.nama_sekolah}`, margin, y);
      doc.text(`Tahun Pelajaran     : ${tahunPelajaran.tahun_pelajaran}`, 125, y);
      y += 6;

      // Section A: Nilai Akademik
      doc.setFont('helvetica', 'bold');
      doc.text('A. CAPAIAN KOMPETENSI MATA PELAJARAN', margin, y);
      y += 3;

      // Draw table header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, pageWidth - (margin * 2), 6, 'FD');
      doc.setFontSize(7.5);
      doc.text('No', margin + 2, y + 4.2);
      doc.text('Mata Pelajaran', margin + 10, y + 4.2);
      doc.text('Nilai', 78, y + 4.2);
      doc.text('Predikat', 90, y + 4.2);
      doc.text('Capaian Kompetensi (Deskripsi)', 106, y + 4.2);
      y += 6;

      // Iterate Grades
      studentGrades.forEach((g, idx) => {
        if (y > 235) {
          doc.addPage();
          y = 15;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(String(idx + 1), margin + 2, y + 4);
        doc.text(g.mapel.nama_mapel, margin + 10, y + 4);
        doc.text(String(g.nilai), 80, y + 4);
        doc.text(g.predikat, 94, y + 4);

        const splitDesc = doc.splitTextToSize(g.deskripsi, 86);
        doc.text(splitDesc, 106, y + 3.5);

        const rowHeight = Math.max(6, (splitDesc.length * 3) + 2);
        doc.rect(margin, y, pageWidth - (margin * 2), rowHeight);
        y += rowHeight;
      });

      // Section B & C: Ekstrakurikuler & Absensi
      y += 5;
      if (y > 230) {
        doc.addPage();
        y = 15;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('B. KEGIATAN EKSTRAKURIKULER', margin, y);
      doc.text('C. KETIDAKHADIRAN', 120, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      pelengkap.ekskul.forEach((ek, i) => {
        doc.text(`${i + 1}. ${ek.nama} (${ek.predikat}) : ${ek.keterangan}`, margin, y + (i * 4));
      });

      doc.text(`1. Sakit (S)               : ${pelengkap.absen_sakit} hari`, 120, y);
      doc.text(`2. Izin (I)                 : ${pelengkap.absen_izin} hari`, 120, y + 4);
      doc.text(`3. Tanpa Keterangan (A)    : ${pelengkap.absen_alpa} hari`, 120, y + 8);
      y += Math.max(pelengkap.ekskul.length * 4, 12) + 4;

      // Catatan Wali Kelas
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('D. CATATAN WALI KELAS', margin, y);
      y += 3.5;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      const catatanLines = doc.splitTextToSize(`"${pelengkap.catatan_wali_kelas}"`, pageWidth - (margin * 2));
      doc.text(catatanLines, margin, y);
      y += (catatanLines.length * 3.5) + 6;

      // Signatures
      if (y > 240) {
        doc.addPage();
        y = 15;
      }

      const dateStr = `${sekolah.kabupaten}, ${tahunPelajaran.tanggal_raport}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Mengetahui,', margin, y);
      doc.text(dateStr, 130, y);
      y += 4;
      doc.text('Orang Tua / Wali Peserta Didik,', margin, y);
      doc.text('Wali Kelas,', 130, y);
      y += 18;

      doc.setFont('helvetica', 'bold');
      doc.text('( .................................................... )', margin, y);
      doc.text(currentWaliKelas.nama_lengkap, 130, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`NIP. ${currentWaliKelas.nip}`, 130, y);
      y += 8;

      doc.text('Mengetahui,', pageWidth / 2, y, { align: 'center' });
      y += 4;
      doc.text('Kepala ' + sekolah.nama_sekolah, pageWidth / 2, y, { align: 'center' });
      y += 18;
      doc.setFont('helvetica', 'bold');
      doc.text(sekolah.kepala_sekolah, pageWidth / 2, y, { align: 'center' });
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text('NIP. ' + sekolah.nip_kepala_sekolah, pageWidth / 2, y, { align: 'center' });

      // Save PDF
      const filename = `RAPORT_${currentSiswa.nisn}_${currentSiswa.nama_lengkap.replace(/\s+/g, '_')}_SEM${tahunPelajaran.semester}.pdf`;
      doc.save(filename);

      // Add to Raport Archive record in storage
      storage.createRaportRecord(
        currentSiswa.siswa_id,
        currentSiswa.nama_lengkap,
        currentSiswa.nisn,
        currentKelas?.nama_kelas || 'VII-A',
        tahunPelajaran.tahun_pelajaran,
        tahunPelajaran.semester,
        studentGrades.reduce((acc, curr) => acc + curr.nilai, 0) / studentGrades.length,
        currentWaliKelas.nama_lengkap,
        sekolah.kepala_sekolah
      );

      setNotificationMsg(`PDF Berhasil Diunduh: ${filename} dan diarsipkan ke sistem cloud!`);
      setTimeout(() => setNotificationMsg(''), 5000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Control Bar (Hidden on Print) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Cetak & Unduh Raport Resmi</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold border border-blue-200">
              STANDAR KEMENDIKBUDRISTEK A4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Format resmi Laporan Hasil Belajar Peserta Didik SMP sesuai Kepmendikbudristek No. 262/M/2022.
          </p>
        </div>

        {/* Print & Download Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-print-raport"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak A4 Langsung</span>
          </button>

          <button
            id="btn-download-pdf-raport"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Download PDF Raport'}</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in no-print">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Selectors Bar (Hidden on Print) */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Pilih Kelas / Rombel
          </label>
          <select
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 bg-white focus:border-blue-600"
          >
            {kelasList.map((k) => (
              <option key={k.kelas_id} value={k.kelas_id}>
                Kelas {k.nama_kelas}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Pilih Peserta Didik
          </label>
          <select
            value={selectedSiswaId}
            onChange={(e) => setSelectedSiswaId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 bg-white focus:border-blue-600"
          >
            {studentsInClass.map((s) => (
              <option key={s.siswa_id} value={s.siswa_id}>
                {s.nama_lengkap} (NISN: {s.nisn})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 self-end">
          <div className="text-xs">
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Siswa Terpilih</span>
            <span className="font-extrabold text-slate-900 truncate max-w-[140px] block">
              {currentSiswa?.nama_lengkap}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const idx = studentsInClass.findIndex(s => s.siswa_id === selectedSiswaId);
                if (idx > 0) setSelectedSiswaId(studentsInClass[idx - 1].siswa_id);
              }}
              disabled={studentsInClass.findIndex(s => s.siswa_id === selectedSiswaId) === 0}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30"
              title="Siswa Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const idx = studentsInClass.findIndex(s => s.siswa_id === selectedSiswaId);
                if (idx < studentsInClass.length - 1) setSelectedSiswaId(studentsInClass[idx + 1].siswa_id);
              }}
              disabled={studentsInClass.findIndex(s => s.siswa_id === selectedSiswaId) === studentsInClass.length - 1}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30"
              title="Siswa Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* OFFICIAL A4 REPORT SHEET (STRICT 210mm x 297mm STYLING FOR PRINT) */}
      {/* ============================================================== */}
      <div className="flex justify-center">
        <div
          ref={printContainerRef}
          id="raport-print-sheet"
          className="raport-sheet w-full max-w-[210mm] bg-white p-8 sm:p-12 shadow-2xl rounded-2xl border border-slate-300 text-slate-900 font-sans text-xs leading-normal"
        >
          {/* OFFICIAL KOP SURAT SEKOLAH */}
          <div className="border-b-2 border-black pb-2 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                <img
                  src={sekolah.logo_url || '/icon.svg'}
                  alt="Logo Sekolah"
                  className="max-h-20 object-contain"
                />
              </div>

              <div className="text-center flex-1">
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  PEMERINTAH KABUPATEN {sekolah.kabupaten.toUpperCase()}
                </h3>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h3>
                <h2 className="text-base font-extrabold uppercase tracking-tight text-black mt-0.5">
                  {sekolah.nama_sekolah.toUpperCase()}
                </h2>
                <p className="text-[10px] text-slate-700 mt-0.5 leading-tight">
                  {sekolah.alamat} • NPSN: {sekolah.npsn} • Akreditasi: {sekolah.akreditasi}
                </p>
                <p className="text-[10px] text-slate-700 leading-tight">
                  Telepon: {sekolah.telepon} • Email: {sekolah.email} • Website: {sekolah.website}
                </p>
              </div>

              <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-slate-400 flex items-center justify-center text-[9px] font-black text-slate-500 text-center uppercase p-1">
                  TUT WURI HANDAYANI
                </div>
              </div>
            </div>
            {/* Double Border line */}
            <div className="mt-2 border-b border-black"></div>
          </div>

          {/* REPORT TITLE */}
          <div className="text-center my-3">
            <h1 className="text-sm font-black uppercase tracking-wider underline">
              LAPORAN HASIL BELAJAR PESERTA DIDIK
            </h1>
            <p className="text-[11px] font-bold text-slate-800">
              (RAPORT KURIKULUM MERDEKA)
            </p>
          </div>

          {/* STUDENT METADATA TABLE */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 my-3 text-[11px] pb-2 border-b border-slate-200">
            <div className="flex">
              <span className="w-36 text-slate-700">Nama Peserta Didik</span>
              <span className="w-4">:</span>
              <span className="font-bold uppercase text-slate-900">{currentSiswa?.nama_lengkap}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-700">Kelas</span>
              <span className="w-4">:</span>
              <span className="font-bold text-slate-900">{currentKelas?.nama_kelas || 'VII-A'}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-700">NIS / NISN</span>
              <span className="w-4">:</span>
              <span className="font-bold text-slate-900">{currentSiswa?.nis} / {currentSiswa?.nisn}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-700">Fase / Semester</span>
              <span className="w-4">:</span>
              <span className="font-bold text-slate-900">
                Fase D / {tahunPelajaran.semester} ({tahunPelajaran.semester === '1' ? 'Ganjil' : 'Genap'})
              </span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-700">Nama Sekolah</span>
              <span className="w-4">:</span>
              <span className="font-bold text-slate-900">{sekolah.nama_sekolah}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-700">Tahun Pelajaran</span>
              <span className="w-4">:</span>
              <span className="font-bold text-slate-900">{tahunPelajaran.tahun_pelajaran}</span>
            </div>
          </div>

          {/* SECTION A: CAPAIAN KOMPETENSI MATA PELAJARAN */}
          <div className="my-4">
            <h4 className="text-xs font-black text-slate-900 uppercase mb-2">
              A. Capaian Kompetensi Mata Pelajaran
            </h4>
            <table className="w-full text-left border-collapse border border-black text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-black border-b border-black">
                  <th className="border border-black p-1.5 w-8 text-center font-bold">No</th>
                  <th className="border border-black p-1.5 font-bold min-w-[130px]">Mata Pelajaran</th>
                  <th className="border border-black p-1.5 w-16 text-center font-bold">Nilai Akhir</th>
                  <th className="border border-black p-1.5 w-14 text-center font-bold">Predikat</th>
                  <th className="border border-black p-1.5 font-bold">Capaian Kompetensi (Deskripsi)</th>
                </tr>
              </thead>
              <tbody>
                {studentGrades.map((item, idx) => (
                  <tr key={item.mapel.mapel_id} className="border-b border-black">
                    <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                    <td className="border border-black p-1.5 font-bold text-slate-900">{item.mapel.nama_mapel}</td>
                    <td className="border border-black p-1.5 text-center font-black">{item.nilai}</td>
                    <td className="border border-black p-1.5 text-center font-black">{item.predikat}</td>
                    <td className="border border-black p-1.5 leading-relaxed text-slate-800">{item.deskripsi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SECTION B & C: EKSKUL & ABSENSI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {/* Ekstrakurikuler */}
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase mb-2">
                B. Kegiatan Ekstrakurikuler
              </h4>
              <table className="w-full text-left border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-black border-b border-black">
                    <th className="border border-black p-1.5 w-8 text-center font-bold">No</th>
                    <th className="border border-black p-1.5 font-bold">Kegiatan Ekstrakurikuler</th>
                    <th className="border border-black p-1.5 w-14 text-center font-bold">Predikat</th>
                    <th className="border border-black p-1.5 font-bold">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {pelengkap.ekskul.map((ek, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-black p-1.5 font-semibold">{ek.nama}</td>
                      <td className="border border-black p-1.5 text-center font-bold">{ek.predikat}</td>
                      <td className="border border-black p-1.5 text-[9px]">{ek.keterangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kehadiran */}
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase mb-2">
                C. Ketidakhadiran (Absensi)
              </h4>
              <table className="w-full text-left border-collapse border border-black text-[10px]">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 w-40 font-medium">Sakit (S)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{pelengkap.absen_sakit} hari</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 font-medium">Izin (I)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{pelengkap.absen_izin} hari</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 font-medium">Tanpa Keterangan (A)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{pelengkap.absen_alpa} hari</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION D: CATATAN WALI KELAS & KEPUTUSAN */}
          <div className="my-3 p-3 rounded border border-black text-[10px] space-y-1">
            <h4 className="font-bold uppercase text-black">D. Catatan Wali Kelas:</h4>
            <p className="italic text-slate-800 leading-relaxed">
              "{pelengkap.catatan_wali_kelas}"
            </p>
            {tahunPelajaran.semester === '2' && (
              <div className="pt-2 border-t border-slate-300 font-bold">
                Keputusan: Berdasarkan hasil belajar, peserta didik dinyatakan: <span className="underline uppercase">{pelengkap.status_kenaikan}</span>
              </div>
            )}
          </div>

          {/* SIGNATURES SECTION */}
          <div className="mt-8 text-[10px]">
            <div className="flex justify-between items-start">
              <div className="w-56 text-center">
                <p>Mengetahui,</p>
                <p>Orang Tua / Wali Peserta Didik,</p>
                <div className="h-16"></div>
                <p className="font-bold underline">( .................................................... )</p>
              </div>

              <div className="w-64 text-center">
                <p>{sekolah.kabupaten}, {tahunPelajaran.tanggal_raport}</p>
                <p>Wali Kelas {currentKelas?.nama_kelas || 'VII-A'},</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{currentWaliKelas.nama_lengkap}</p>
                <p>NIP. {currentWaliKelas.nip}</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p>Mengetahui,</p>
              <p>Kepala {sekolah.nama_sekolah}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{sekolah.kepala_sekolah}</p>
              <p>NIP. {sekolah.nip_kepala_sekolah}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
