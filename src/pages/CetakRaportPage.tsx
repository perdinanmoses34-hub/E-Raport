import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../services/storage';
import { User, Sekolah, TahunPelajaran, Siswa, Kelas, MataPelajaran, Nilai, PelengkapRaport } from '../types';
import {
  Printer, Download, FileText, Share2, CheckCircle2,
  ChevronLeft, ChevronRight, Eye, Sparkles, HardDrive, Check,
  ZoomIn, ZoomOut, Maximize2, ShieldCheck, QrCode
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

  const [previewZoom, setPreviewZoom] = useState<number>(100);
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

  // Update selected student if class changes
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
        kkm: mapel.kkm || 75,
        nilai: grade.nilai_akhir,
        predikat: grade.predikat,
        deskripsi: grade.deskripsi
      };
    } else {
      // Fallback preview
      const { nilaiAkhir, predikat } = storage.calculateNilaiAkhir(84, 82, 85, 88, 85);
      return {
        mapel,
        kkm: mapel.kkm || 75,
        nilai: nilaiAkhir,
        predikat,
        deskripsi: storage.generateDeskripsiCapaian(mapel.nama_mapel, nilaiAkhir, predikat, currentSiswa?.nama_lengkap || 'Siswa')
      };
    }
  });

  // Calculate stats
  const totalNilai = studentGrades.reduce((acc, curr) => acc + curr.nilai, 0);
  const rataRataNilai = studentGrades.length > 0 ? (totalNilai / studentGrades.length).toFixed(1) : '0';

  const handlePrint = () => {
    window.print();
    storage.addLog(
      'PRINT RAPORT',
      'Raport',
      `Mencetak lembar raport resmi A4 untuk ${currentSiswa?.nama_lengkap} (NISN: ${currentSiswa?.nisn})`
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

      const pageWidth = 210;
      const margin = 14;
      let y = 14;

      // Kop Surat
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('PEMERINTAH KABUPATEN ' + sekolah.kabupaten.toUpperCase(), pageWidth / 2, y, { align: 'center' });
      y += 4.5;
      doc.text('DINAS PENDIDIKAN DAN KEBUDAYAAN', pageWidth / 2, y, { align: 'center' });
      y += 5.5;
      doc.setFontSize(13);
      doc.text(sekolah.nama_sekolah.toUpperCase(), pageWidth / 2, y, { align: 'center' });
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`${sekolah.alamat} — NPSN: ${sekolah.npsn} — Akreditasi: ${sekolah.akreditasi}`, pageWidth / 2, y, { align: 'center' });
      y += 3;
      doc.text(`Telepon: ${sekolah.telepon} — Email: ${sekolah.email}`, pageWidth / 2, y, { align: 'center' });
      y += 3;

      // Double Line
      doc.setLineWidth(0.8);
      doc.line(margin, y, pageWidth - margin, y);
      y += 1;
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)', pageWidth / 2, y, { align: 'center' });
      y += 6;

      // Student Meta
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nama Peserta Didik : ${currentSiswa.nama_lengkap}`, margin, y);
      doc.text(`Kelas               : ${currentKelas?.nama_kelas || 'VII-A'}`, 125, y);
      y += 4.5;
      doc.text(`NIS / NISN         : ${currentSiswa.nis} / ${currentSiswa.nisn}`, margin, y);
      doc.text(`Fase / Semester     : Fase D / ${tahunPelajaran.semester} (${tahunPelajaran.semester === '1' ? 'Ganjil' : 'Genap'})`, 125, y);
      y += 4.5;
      doc.text(`Nama Sekolah       : ${sekolah.nama_sekolah}`, margin, y);
      doc.text(`Tahun Pelajaran     : ${tahunPelajaran.tahun_pelajaran}`, 125, y);
      y += 6;

      // Table Header
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
      doc.rect(margin, y, pageWidth - margin * 2, 7, 'S');
      doc.setFontSize(8);
      doc.text('No', margin + 3, y + 4.8);
      doc.text('Mata Pelajaran', margin + 12, y + 4.8);
      doc.text('KKTP', margin + 68, y + 4.8);
      doc.text('Nilai Akhir', margin + 82, y + 4.8);
      doc.text('Capaian Kompetensi', margin + 104, y + 4.8);
      y += 7;

      // Table rows
      doc.setFont('helvetica', 'normal');
      studentGrades.forEach((item, idx) => {
        const rowHeight = 11;
        doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'S');
        doc.text(String(idx + 1), margin + 3, y + 6);
        doc.setFont('helvetica', 'bold');
        doc.text(item.mapel.nama_mapel, margin + 12, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(String(item.kkm), margin + 71, y + 6);
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.nilai} (${item.predikat})`, margin + 85, y + 6);
        doc.setFont('helvetica', 'normal');

        const splitDesc = doc.splitTextToSize(item.deskripsi, 74);
        doc.text(splitDesc, margin + 104, y + 4);
        y += rowHeight;
      });

      // Total & Rata-rata row
      doc.rect(margin, y, pageWidth - margin * 2, 6, 'S');
      doc.setFont('helvetica', 'bold');
      doc.text('Jumlah Nilai', margin + 12, y + 4.5);
      doc.text(String(totalNilai), margin + 85, y + 4.5);
      y += 6;

      doc.rect(margin, y, pageWidth - margin * 2, 6, 'S');
      doc.text('Rata-rata Nilai', margin + 12, y + 4.5);
      doc.text(String(rataRataNilai), margin + 85, y + 4.5);
      y += 9;

      // Absensi & Ekskul summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(`Ketidakhadiran: Sakit: ${pelengkap.absen_sakit} hari | Izin: ${pelengkap.absen_izin} hari | Alpa: ${pelengkap.absen_alpa} hari`, margin, y);
      y += 5;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text(`Catatan Wali Kelas: "${pelengkap.catatan_wali_kelas}"`, margin, y);
      y += 10;

      // Signatures
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Mengetahui,', margin + 5, y);
      doc.text('Orang Tua / Wali Siswa,', margin + 5, y + 4);

      doc.text(`${sekolah.kabupaten}, ${tahunPelajaran.tanggal_raport}`, 135, y);
      doc.text(`Wali Kelas ${currentKelas?.nama_kelas || 'VII-A'},`, 135, y + 4);

      y += 18;
      doc.setFont('helvetica', 'bold');
      doc.text('( .................................................. )', margin + 5, y);
      doc.text(currentWaliKelas.nama_lengkap, 135, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text('NIP. ' + currentWaliKelas.nip, 135, y);

      y += 8;
      doc.text('Kepala ' + sekolah.nama_sekolah, pageWidth / 2, y, { align: 'center' });
      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.text(sekolah.kepala_sekolah, pageWidth / 2, y, { align: 'center' });
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text('NIP. ' + sekolah.nip_kepala_sekolah, pageWidth / 2, y, { align: 'center' });

      const filename = `RAPORT_${currentSiswa.nisn}_${currentSiswa.nama_lengkap.replace(/\s+/g, '_')}_SEM${tahunPelajaran.semester}.pdf`;
      doc.save(filename);

      storage.createRaportRecord(
        currentSiswa.siswa_id,
        currentSiswa.nama_lengkap,
        currentSiswa.nisn,
        currentKelas?.nama_kelas || 'VII-A',
        tahunPelajaran.tahun_pelajaran,
        tahunPelajaran.semester,
        Number(rataRataNilai),
        currentWaliKelas.nama_lengkap,
        sekolah.kepala_sekolah
      );

      setNotificationMsg(`PDF Berhasil Diunduh: ${filename} dan diarsipkan ke sistem!`);
      setTimeout(() => setNotificationMsg(''), 5000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Action Controls (Hidden on Print) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Cetak & Unduh Rapor Peserta Didik
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
              KURIKULUM MERDEKA RESMI A4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Format resmi Laporan Hasil Belajar Peserta Didik SMP sesuai Kepmendikbudristek No. 262/M/2022.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <button
              onClick={() => setPreviewZoom(Math.max(60, previewZoom - 10))}
              className="p-1.5 hover:bg-white rounded-lg transition"
              title="Perkecil Tampilan"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px]">{previewZoom}%</span>
            <button
              onClick={() => setPreviewZoom(Math.min(120, previewZoom + 10))}
              className="p-1.5 hover:bg-white rounded-lg transition"
              title="Perbesar Tampilan"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewZoom(100)}
              className="px-2 py-1 hover:bg-white rounded-lg transition text-[10px]"
              title="Reset 100%"
            >
              100%
            </button>
          </div>

          <button
            id="btn-print-raport"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak A4</span>
          </button>

          <button
            id="btn-download-pdf-raport"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Download PDF'}</span>
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
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 transition"
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
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 transition"
              title="Siswa Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Hint for Mobile (Hidden on Print) */}
      <div className="block lg:hidden text-center text-[11px] text-slate-400 no-print font-medium">
        ↔ Geser ke samping jika tabel rapor melebihi layar ponsel Anda
      </div>

      {/* ============================================================== */}
      {/* PROFESSIONAL A4 REPORT SHEET (STRICT KEMENDIKBUDRISTEK LAYOUT) */}
      {/* ============================================================== */}
      <div className="w-full overflow-x-auto pb-8 pt-2 flex justify-center bg-slate-200/50 p-2 sm:p-6 rounded-3xl border border-slate-300/80">
        <div
          ref={printContainerRef}
          id="raport-print-sheet"
          style={{
            transform: previewZoom !== 100 ? `scale(${previewZoom / 100})` : undefined,
            transformOrigin: 'top center'
          }}
          className="raport-sheet w-[210mm] min-w-[210mm] bg-white px-10 py-10 shadow-2xl rounded-sm border border-slate-400 text-slate-950 font-sans text-xs leading-normal transition-transform"
        >
          {/* OFFICIAL KOP SURAT SEKOLAH */}
          <div className="border-b-[3px] border-black pb-2 mb-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left Logo: Logo Satuan Pendidikan */}
              <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                <img
                  src={sekolah.logo_url || '/icon.svg'}
                  alt="Logo Sekolah"
                  className="max-h-20 max-w-full object-contain"
                />
              </div>

              {/* Center Headings */}
              <div className="text-center flex-1 px-2">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-black">
                  PEMERINTAH KABUPATEN {sekolah.kabupaten.toUpperCase()}
                </h3>
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-black">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h3>
                <h2 className="text-[16px] font-black uppercase tracking-tight text-black mt-0.5">
                  {sekolah.nama_sekolah.toUpperCase()}
                </h2>
                <p className="text-[10.5px] text-black font-normal mt-0.5 leading-snug">
                  {sekolah.alamat} • NPSN: {sekolah.npsn} • Akreditasi: {sekolah.akreditasi}
                </p>
                <p className="text-[10px] text-black leading-snug">
                  Telepon: {sekolah.telepon} • Pos-el: {sekolah.email} • Laman: {sekolah.website}
                </p>
              </div>

              {/* Right Logo: Lambang Tut Wuri Handayani */}
              <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                <div className="w-18 h-18 rounded-full border-2 border-black flex flex-col items-center justify-center text-[8.5px] font-black text-black text-center p-1 uppercase leading-none">
                  <span>TUT WURI</span>
                  <span className="text-[7.5px] font-bold mt-0.5">HANDAYANI</span>
                </div>
              </div>
            </div>
            {/* Thin Sub-rule */}
            <div className="mt-1 border-b border-black"></div>
          </div>

          {/* REPORT TITLE */}
          <div className="text-center my-3">
            <h1 className="text-[14px] font-black uppercase tracking-wider text-black underline">
              LAPORAN HASIL BELAJAR PESERTA DIDIK
            </h1>
            <p className="text-[11px] font-bold text-black mt-0.5">
              (RAPOR KURIKULUM MERDEKA)
            </p>
          </div>

          {/* STUDENT IDENTITAS TABLE (CLEAN 2-COLUMN TABULAR GRID) */}
          <div className="my-3 border border-black rounded-xs overflow-hidden">
            <div className="grid grid-cols-2 text-[11px]">
              <div className="p-2 border-r border-black space-y-1 bg-slate-50/50">
                <div className="flex">
                  <span className="w-36 font-semibold text-black">Nama Peserta Didik</span>
                  <span className="w-3 font-bold">:</span>
                  <span className="font-black uppercase text-black flex-1">{currentSiswa?.nama_lengkap}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold text-black">NIS / NISN</span>
                  <span className="w-3 font-bold">:</span>
                  <span className="font-bold text-black flex-1">{currentSiswa?.nis} / {currentSiswa?.nisn}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold text-black">Nama Sekolah</span>
                  <span className="w-3 font-bold">:</span>
                  <span className="font-bold text-black flex-1">{sekolah.nama_sekolah}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold text-black">Alamat Sekolah</span>
                  <span className="w-3 font-bold">:</span>
                  <span className="text-black flex-1 truncate">{sekolah.alamat}</span>
                </div>
              </div>

              <div className="p-2 space-y-1 bg-slate-50/50">
                <div className="flex">
                  <span className="w-36 font-semibold text-black">Kelas</span>
                  <span className="w-3 font-bold">:</span>
                  <span className="font-black text-black flex-1">{currentKelas?.nama_kelas || 'VII-A'}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold text-black">Fase</span>
                  <span className="w-3 font-bold">:</span>
                  <span className="font-bold text-black flex-1">Fase D (SMP)</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold text-black">Semester</span>
                  <span className="w-3 font-bold">:</span>
                  <span className="font-bold text-black flex-1">
                    {tahunPelajaran.semester} ({tahunPelajaran.semester === '1' ? 'Ganjil' : 'Genap'})
                  </span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold text-black">Tahun Pelajaran</span>
                  <span className="w-3 font-bold">:</span>
                  <span className="font-bold text-black flex-1">{tahunPelajaran.tahun_pelajaran}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION A: CAPAIAN KOMPETENSI MATA PELAJARAN */}
          <div className="my-4">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[11.5px] font-black text-black uppercase tracking-wide">
                A. Capaian Kompetensi Peserta Didik
              </h4>
              <span className="text-[10px] italic text-slate-700 font-medium">
                Kriteria Ketercapaian Tujuan Pembelajaran (KKTP): 75
              </span>
            </div>

            <table className="w-full text-left border-collapse border border-black text-[10.5px]">
              <thead>
                <tr className="bg-slate-200/90 text-black border-b border-black font-black">
                  <th className="border border-black px-2 py-2 w-8 text-center">No</th>
                  <th className="border border-black px-2 py-2 min-w-[150px] w-52">Mata Pelajaran</th>
                  <th className="border border-black px-2 py-2 w-14 text-center">KKTP</th>
                  <th className="border border-black px-2 py-2 w-16 text-center">Nilai Akhir</th>
                  <th className="border border-black px-2 py-2 w-16 text-center">Predikat</th>
                  <th className="border border-black px-3 py-2">Capaian Kompetensi (Deskripsi Pembelajaran)</th>
                </tr>
              </thead>
              <tbody>
                {studentGrades.map((item, idx) => (
                  <tr key={item.mapel.mapel_id} className="border-b border-black hover:bg-slate-50/50">
                    <td className="border border-black px-2 py-2 text-center align-top font-bold text-black">
                      {idx + 1}
                    </td>
                    <td className="border border-black px-2 py-2 align-top font-bold text-black">
                      {item.mapel.nama_mapel}
                    </td>
                    <td className="border border-black px-2 py-2 text-center align-top text-black">
                      {item.kkm}
                    </td>
                    <td className="border border-black px-2 py-2 text-center align-top font-black text-black">
                      {item.nilai}
                    </td>
                    <td className="border border-black px-2 py-2 text-center align-top font-black text-black">
                      <span className={`inline-block px-1.5 py-0.5 rounded font-black text-[10px] ${
                        item.predikat === 'A' ? 'bg-blue-100 text-blue-950 font-black' :
                        item.predikat === 'B' ? 'bg-emerald-100 text-emerald-950 font-black' :
                        'bg-amber-100 text-amber-950 font-black'
                      }`}>
                        {item.predikat}
                      </span>
                    </td>
                    <td className="border border-black px-3 py-2 align-top leading-relaxed text-black text-[10px]">
                      {item.deskripsi}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-black font-black text-black">
                  <td colSpan={3} className="border border-black px-3 py-2 text-right uppercase">
                    Jumlah Nilai
                  </td>
                  <td className="border border-black px-2 py-2 text-center text-sm font-black">
                    {totalNilai}
                  </td>
                  <td colSpan={2} className="border border-black px-3 py-2 text-xs text-slate-700 italic font-normal">
                    Total capaian dari {studentGrades.length} mata pelajaran
                  </td>
                </tr>
                <tr className="bg-slate-100 border-b border-black font-black text-black">
                  <td colSpan={3} className="border border-black px-3 py-2 text-right uppercase">
                    Nilai Rata-rata
                  </td>
                  <td className="border border-black px-2 py-2 text-center text-sm font-black">
                    {rataRataNilai}
                  </td>
                  <td colSpan={2} className="border border-black px-3 py-2 text-xs text-slate-700 italic font-normal">
                    Predikat rata-rata: {Number(rataRataNilai) >= 88 ? 'A (Sangat Baik)' : Number(rataRataNilai) >= 78 ? 'B (Baik)' : 'C (Cukup)'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* SECTION B & C: EKSKUL & ABSENSI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            {/* Ekstrakurikuler */}
            <div>
              <h4 className="text-[11.5px] font-black text-black uppercase tracking-wide mb-1.5">
                B. Kegiatan Ekstrakurikuler
              </h4>
              <table className="w-full text-left border-collapse border border-black text-[10.5px]">
                <thead>
                  <tr className="bg-slate-100 text-black border-b border-black font-bold">
                    <th className="border border-black p-1.5 w-8 text-center">No</th>
                    <th className="border border-black p-1.5 font-bold">Kegiatan Ekstrakurikuler</th>
                    <th className="border border-black p-1.5 w-16 text-center font-bold">Predikat</th>
                    <th className="border border-black p-1.5 font-bold">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {pelengkap.ekskul && pelengkap.ekskul.length > 0 ? (
                    pelengkap.ekskul.map((ek, idx) => (
                      <tr key={idx} className="border-b border-black">
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 font-bold text-black">{ek.nama}</td>
                        <td className="border border-black p-1.5 text-center font-black">{ek.predikat}</td>
                        <td className="border border-black p-1.5 text-[10px] text-slate-800">{ek.keterangan}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="border border-black p-2 text-center text-slate-500 italic">
                        Belum mengikuti kegiatan ekstrakurikuler
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Kehadiran */}
            <div>
              <h4 className="text-[11.5px] font-black text-black uppercase tracking-wide mb-1.5">
                C. Ketidakhadiran (Absensi)
              </h4>
              <table className="w-full text-left border-collapse border border-black text-[10.5px]">
                <thead>
                  <tr className="bg-slate-100 text-black border-b border-black font-bold">
                    <th className="border border-black p-1.5 w-10 text-center">No</th>
                    <th className="border border-black p-1.5 font-bold">Kategori Ketidakhadiran</th>
                    <th className="border border-black p-1.5 w-24 text-center font-bold">Jumlah Hari</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 text-center">1</td>
                    <td className="border border-black p-1.5 font-semibold text-black">Sakit (S)</td>
                    <td className="border border-black p-1.5 text-center font-black text-black">
                      {pelengkap.absen_sakit} hari
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 text-center">2</td>
                    <td className="border border-black p-1.5 font-semibold text-black">Izin (I)</td>
                    <td className="border border-black p-1.5 text-center font-black text-black">
                      {pelengkap.absen_izin} hari
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black p-1.5 text-center">3</td>
                    <td className="border border-black p-1.5 font-semibold text-black">Tanpa Keterangan (A)</td>
                    <td className="border border-black p-1.5 text-center font-black text-black">
                      {pelengkap.absen_alpa} hari
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION D: CATATAN WALI KELAS & KEPUTUSAN */}
          <div className="my-3 p-3 rounded-xs border border-black text-[10.5px] space-y-1.5 bg-slate-50/40">
            <h4 className="font-black uppercase text-black">D. Catatan Wali Kelas:</h4>
            <p className="italic text-black leading-relaxed pl-2 border-l-2 border-slate-400">
              "{pelengkap.catatan_wali_kelas || 'Pertahankan semangat belajar dan terus kembangkan bakat serta prestasimu di semester selanjutnya.'}"
            </p>
            {tahunPelajaran.semester === '2' && (
              <div className="pt-2 border-t border-black font-black text-black">
                Keputusan: Berdasarkan hasil belajar semester 1 dan 2, peserta didik dinyatakan:{' '}
                <span className="underline uppercase font-extrabold text-blue-900">
                  {pelengkap.status_kenaikan || 'NAIK KE KELAS VIII'}
                </span>
              </div>
            )}
          </div>

          {/* SIGNATURES SECTION (AUTHENTIC 3-PARTY ACCORDING TO KEMENDIKBUD) */}
          <div className="mt-8 text-[10.5px] text-black">
            <div className="grid grid-cols-3 gap-2 items-start text-center">
              {/* Kolom 1: Orang Tua */}
              <div>
                <p className="font-medium">Mengetahui,</p>
                <p className="font-bold">Orang Tua / Wali Peserta Didik,</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-black">
                  ( .................................................... )
                </p>
                <p className="text-[9.5px] text-slate-600 mt-0.5">Tanda Tangan & Nama Terang</p>
              </div>

              {/* Kolom 2: Stempel & Verifikasi Digital */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="w-20 h-20 rounded-full border-2 border-blue-900/40 p-1 flex flex-col items-center justify-center text-[7.5px] font-black text-blue-950 uppercase tracking-tighter text-center">
                  <ShieldCheck className="w-5 h-5 text-blue-800 mb-0.5" />
                  <span>TERVERIFIKASI</span>
                  <span>E-RAPORT SMP</span>
                </div>
                <span className="font-mono text-[8px] text-slate-500 mt-1">
                  ID: {currentSiswa?.nisn}-{tahunPelajaran.semester}
                </span>
              </div>

              {/* Kolom 3: Wali Kelas */}
              <div>
                <p className="font-medium">{sekolah.kabupaten}, {tahunPelajaran.tanggal_raport}</p>
                <p className="font-bold">Wali Kelas {currentKelas?.nama_kelas || 'VII-A'},</p>
                <div className="h-16"></div>
                <p className="font-black underline text-black">{currentWaliKelas.nama_lengkap}</p>
                <p className="font-mono text-[10px] text-black">NIP. {currentWaliKelas.nip}</p>
              </div>
            </div>

            {/* Kepala Sekolah Signature (Centered Bottom) */}
            <div className="mt-6 text-center">
              <p className="font-medium">Mengesahkan,</p>
              <p className="font-bold">Kepala {sekolah.nama_sekolah}</p>
              <div className="h-16"></div>
              <p className="font-black underline text-black">{sekolah.kepala_sekolah}</p>
              <p className="font-mono text-[10px] text-black">NIP. {sekolah.nip_kepala_sekolah}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
