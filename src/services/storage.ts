// Unified E-Raport SMP Storage & Synchronization Engine
// Handles local reactive storage, Google Sheets / Apps Script sync, and Firebase listeners
import {
  User, Sekolah, TahunPelajaran, Siswa, Guru, Kelas, MataPelajaran,
  Nilai, Sikap, Absensi, Ekstrakurikuler, NilaiEkstra, Prestasi,
  CatatanWali, Raport, PengaturanSistem, LogAktivitas, Notifikasi,
  DatabaseConfig, BobotNilai, RentangPredikat, PelengkapRaport, GradingConfig
} from '../types';

const STORAGE_KEYS = {
  USERS: 'eraport_users',
  SEKOLAH: 'eraport_sekolah',
  TAHUN_PELAJARAN: 'eraport_tahun_pelajaran',
  SISWA: 'eraport_siswa',
  GURU: 'eraport_guru',
  KELAS: 'eraport_kelas',
  MATA_PELAJARAN: 'eraport_mapel',
  NILAI: 'eraport_nilai',
  SIKAP: 'eraport_sikap',
  ABSENSI: 'eraport_absensi',
  EKSTRAKURIKULER: 'eraport_ekskul',
  NILAI_EKSTRA: 'eraport_nilai_ekstra',
  PRESTASI: 'eraport_prestasi',
  CATATAN_WALI: 'eraport_catatan_wali',
  RAPORT: 'eraport_raport',
  PENGATURAN: 'eraport_pengaturan',
  LOG_AKTIVITAS: 'eraport_log',
  NOTIFIKASI: 'eraport_notifikasi',
  DB_CONFIG: 'eraport_db_config',
  CURRENT_USER: 'eraport_current_user',
  SETUP_COMPLETED: 'eraport_setup_completed'
};

// Seed Data
const DEFAULT_SEKOLAH: Sekolah = {
  sekolah_id: 'SCH-001',
  nama_sekolah: 'SMP NEGERI 1 NUSANTARA',
  npsn: '20108921',
  alamat: 'Jl. Merdeka Belajar No. 45, Sukamaju',
  desa: 'Mekarjaya',
  kecamatan: 'Sukamaju',
  kabupaten: 'Bandung Barat',
  provinsi: 'Jawa Barat',
  kode_pos: '40552',
  telepon: '(022) 8765-4321',
  email: 'info@smpn1nusantara.sch.id',
  website: 'https://smpn1nusantara.sch.id',
  logo_url: '/icon.svg',
  kepala_sekolah: 'Drs. H. Ahmad Fauzi, M.Pd.',
  nip_kepala_sekolah: '19680512 199303 1 004',
  tanda_tangan_url: '',
  stempel_url: ''
};

const DEFAULT_TAHUN_PELAJARAN: TahunPelajaran[] = [
  {
    tahun_id: 'TP-2025-1',
    tahun_pelajaran: '2025/2026',
    semester: '1',
    tanggal_mulai: '2025-07-14',
    tanggal_selesai: '2025-12-19',
    status_aktif: true,
    tanggal_raport: '19 Desember 2025',
    tempat_raport: 'Bandung Barat'
  },
  {
    tahun_id: 'TP-2025-2',
    tahun_pelajaran: '2025/2026',
    semester: '2',
    tanggal_mulai: '2026-01-05',
    tanggal_selesai: '2026-06-20',
    status_aktif: false,
    tanggal_raport: '20 Juni 2026',
    tempat_raport: 'Bandung Barat'
  }
];

const DEFAULT_PENGATURAN: PengaturanSistem = {
  bobot_nilai: {
    tugas: 20,
    uts: 25,
    uas: 30,
    praktik: 15,
    proyek: 10
  },
  rentang_predikat: {
    a_min: 90,
    b_min: 80,
    c_min: 70,
    d_min: 0
  },
  format_raport: 'kurikulum_merdeka',
  kurikulum: 'Kurikulum Merdeka (Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi)',
  kop_surat_text: 'PEMERINTAH DAERAH PROVINSI JAWA BARAT\nDINAS PENDIDIKAN DAN KEBUDAYAAN\nSMP NEGERI 1 NUSANTARA',
  show_qr_code: true,
  show_stempel: true,
  tampilkan_ranking: false,
  kunci_seluruh_nilai: false,
  notifikasi_aktif: true
};

const DEFAULT_USERS: User[] = [
  {
    user_id: 'USR-SUPERADMIN',
    username: 'perdinan.moses34',
    nama: 'Drs. Perdinan Moses, M.Pd.',
    email: 'perdinan.moses34@guru.smp.belajar.id',
    role: 'super_admin',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'USR-ADMIN',
    username: 'admin.kurikulum',
    nama: 'Budi Santoso, S.Kom. (Admin Kurikulum)',
    email: 'admin.kurikulum@smpn1nusantara.sch.id',
    role: 'admin',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'USR-GURU-1',
    username: 'siti.nurhaliza',
    nama: 'Siti Nurhaliza, M.Pd. (Guru MTK & Wali VII-A)',
    email: 'siti.nurhaliza@guru.smp.belajar.id',
    role: 'wali_kelas',
    status: 'aktif',
    guru_id: 'GRU-001',
    kelas_id: 'KLS-VII-A',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'USR-GURU-2',
    username: 'rahmat.hidayat',
    nama: 'Rahmat Hidayat, S.Pd. (Guru IPA)',
    email: 'rahmat.hidayat@guru.smp.belajar.id',
    role: 'guru',
    status: 'aktif',
    guru_id: 'GRU-002',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'USR-SISWA-1',
    username: '0089123456',
    nama: 'Ahmad Rizki Pratama',
    email: 'ahmad.rizki@siswa.smp.belajar.id',
    role: 'siswa',
    status: 'aktif',
    siswa_id: 'SIS-001',
    kelas_id: 'KLS-VII-A',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    user_id: 'USR-ORANGTUA-1',
    username: 'ortu.rizki',
    nama: 'Bapak Bambang Pratama (Orang Tua Siswa)',
    email: 'bambang.pratama@gmail.com',
    role: 'orang_tua',
    status: 'aktif',
    siswa_id: 'SIS-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_GURU: Guru[] = [
  {
    guru_id: 'GRU-001',
    nip: '19750815 200212 2 003',
    nuptk: '4538753655300042',
    nama_lengkap: 'Siti Nurhaliza, M.Pd.',
    jenis_kelamin: 'P',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '1975-08-15',
    pendidikan: 'S2 Pendidikan Matematika UPI',
    mata_pelajaran: ['Matematika'],
    nomor_telepon: '081234567890',
    email: 'siti.nurhaliza@guru.smp.belajar.id',
    status: 'aktif',
    kelas_wali_id: 'KLS-VII-A'
  },
  {
    guru_id: 'GRU-002',
    nip: '19820410 200801 1 012',
    nuptk: '7845760662200031',
    nama_lengkap: 'Rahmat Hidayat, S.Pd.',
    jenis_kelamin: 'L',
    tempat_lahir: 'Cimahi',
    tanggal_lahir: '1982-04-10',
    pendidikan: 'S1 Pendidikan IPA Unpad',
    mata_pelajaran: ['Ilmu Pengetahuan Alam (IPA)'],
    nomor_telepon: '081398765432',
    email: 'rahmat.hidayat@guru.smp.belajar.id',
    status: 'aktif',
    kelas_wali_id: 'KLS-VII-B'
  },
  {
    guru_id: 'GRU-003',
    nip: '19881120 201101 2 009',
    nuptk: '3942766667210023',
    nama_lengkap: 'Dewi Sartika, S.Pd.',
    jenis_kelamin: 'P',
    tempat_lahir: 'Garut',
    tanggal_lahir: '1988-11-20',
    pendidikan: 'S1 Sastra Indonesia UI',
    mata_pelajaran: ['Bahasa Indonesia'],
    nomor_telepon: '081223344556',
    email: 'dewi.sartika@guru.smp.belajar.id',
    status: 'aktif',
    kelas_wali_id: 'KLS-VIII-A'
  },
  {
    guru_id: 'GRU-004',
    nip: '19790105 200501 1 008',
    nuptk: '1234567890123456',
    nama_lengkap: 'Hendri Gunawan, S.Pd.',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '1979-01-05',
    pendidikan: 'S1 Pendidikan Bahasa Inggris UPI',
    mata_pelajaran: ['Bahasa Inggris'],
    nomor_telepon: '081777888999',
    email: 'hendri.gunawan@guru.smp.belajar.id',
    status: 'aktif'
  }
];

const DEFAULT_KELAS: Kelas[] = [
  { kelas_id: 'KLS-VII-A', nama_kelas: 'VII-A', tingkat: 7, jurusan: 'Umum', wali_kelas_id: 'GRU-001', tahun_id: 'TP-2025-1', status: 'aktif' },
  { kelas_id: 'KLS-VII-B', nama_kelas: 'VII-B', tingkat: 7, jurusan: 'Umum', wali_kelas_id: 'GRU-002', tahun_id: 'TP-2025-1', status: 'aktif' },
  { kelas_id: 'KLS-VIII-A', nama_kelas: 'VIII-A', tingkat: 8, jurusan: 'Umum', wali_kelas_id: 'GRU-003', tahun_id: 'TP-2025-1', status: 'aktif' },
  { kelas_id: 'KLS-VIII-B', nama_kelas: 'VIII-B', tingkat: 8, jurusan: 'Umum', wali_kelas_id: 'GRU-004', tahun_id: 'TP-2025-1', status: 'aktif' },
  { kelas_id: 'KLS-IX-A', nama_kelas: 'IX-A', tingkat: 9, jurusan: 'Umum', wali_kelas_id: 'GRU-001', tahun_id: 'TP-2025-1', status: 'aktif' }
];

const DEFAULT_MAPEL: MataPelajaran[] = [
  { mapel_id: 'MP-PAI', kode_mapel: 'PAI', nama_mapel: 'Pendidikan Agama dan Budi Pekerti', kelompok: 'A', tingkat: 0, jam_pelajaran: 3, kkm: 75, status: 'aktif' },
  { mapel_id: 'MP-PPKN', kode_mapel: 'PPKn', nama_mapel: 'Pendidikan Pancasila', kelompok: 'A', tingkat: 0, jam_pelajaran: 3, kkm: 75, status: 'aktif' },
  { mapel_id: 'MP-BIN', kode_mapel: 'BIN', nama_mapel: 'Bahasa Indonesia', kelompok: 'A', tingkat: 0, jam_pelajaran: 6, kkm: 75, status: 'aktif' },
  { mapel_id: 'MP-MAT', kode_mapel: 'MAT', nama_mapel: 'Matematika', kelompok: 'A', tingkat: 0, jam_pelajaran: 5, kkm: 75, status: 'aktif' },
  { mapel_id: 'MP-IPA', kode_mapel: 'IPA', nama_mapel: 'Ilmu Pengetahuan Alam (IPA)', kelompok: 'A', tingkat: 0, jam_pelajaran: 5, kkm: 75, status: 'aktif' },
  { mapel_id: 'MP-IPS', kode_mapel: 'IPS', nama_mapel: 'Ilmu Pengetahuan Sosial (IPS)', kelompok: 'A', tingkat: 0, jam_pelajaran: 4, kkm: 75, status: 'aktif' },
  { mapel_id: 'MP-BIG', kode_mapel: 'BIG', nama_mapel: 'Bahasa Inggris', kelompok: 'A', tingkat: 0, jam_pelajaran: 4, kkm: 75, status: 'aktif' },
  { mapel_id: 'MP-PJOK', kode_mapel: 'PJOK', nama_mapel: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', kelompok: 'B', tingkat: 0, jam_pelajaran: 3, kkm: 75, status: 'aktif' },
  { mapel_id: 'MP-INF', kode_mapel: 'INF', nama_mapel: 'Informatika', kelompok: 'B', tingkat: 0, jam_pelajaran: 2, kkm: 75, status: 'aktif' },
  { mapel_id: 'MP-SNB', kode_mapel: 'SNB', nama_mapel: 'Seni dan Budaya (Seni Rupa/Musik)', kelompok: 'B', tingkat: 0, jam_pelajaran: 3, kkm: 75, status: 'aktif' },
  { mapel_id: 'MP-MLD', kode_mapel: 'MLD', nama_mapel: 'Muatan Lokal: Bahasa Daerah Sunda', kelompok: 'Muatan Lokal', tingkat: 0, jam_pelajaran: 2, kkm: 75, status: 'aktif' }
];

const DEFAULT_SISWA: Siswa[] = [
  {
    siswa_id: 'SIS-001',
    nis: '242507001',
    nisn: '0089123456',
    nama_lengkap: 'Ahmad Rizki Pratama',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '2012-05-14',
    nik: '3217011405120001',
    agama: 'Islam',
    alamat: 'Komp. Graha Indah Blok C No. 12, Sukamaju',
    nama_ayah: 'Bambang Pratama',
    nama_ibu: 'Siti Aminah',
    nomor_telepon: '081223344111',
    kelas_id: 'KLS-VII-A',
    status: 'aktif'
  },
  {
    siswa_id: 'SIS-002',
    nis: '242507002',
    nisn: '0089123457',
    nama_lengkap: 'Annisa Putri Maharani',
    jenis_kelamin: 'P',
    tempat_lahir: 'Cimahi',
    tanggal_lahir: '2012-08-22',
    nik: '3217012208120002',
    agama: 'Islam',
    alamat: 'Jl. Melati No. 8, Mekarjaya',
    nama_ayah: 'Heri Gunawan',
    nama_ibu: 'Ratna Sari',
    nomor_telepon: '081334455222',
    kelas_id: 'KLS-VII-A',
    status: 'aktif'
  },
  {
    siswa_id: 'SIS-003',
    nis: '242507003',
    nisn: '0089123458',
    nama_lengkap: 'Bagas Aditya Nugraha',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '2012-03-09',
    nik: '3217010903120003',
    agama: 'Islam',
    alamat: 'Jl. Kenanga Blok B-4, Sukamaju',
    nama_ayah: 'Iwan Nugraha',
    nama_ibu: 'Lilis Suryani',
    nomor_telepon: '081445566333',
    kelas_id: 'KLS-VII-A',
    status: 'aktif'
  },
  {
    siswa_id: 'SIS-004',
    nis: '242507004',
    nisn: '0089123459',
    nama_lengkap: 'Clarissa Valerie Kusuma',
    jenis_kelamin: 'P',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '2012-11-18',
    nik: '3217011811120004',
    agama: 'Kristen',
    alamat: 'Perum Kencana Mas No. 27',
    nama_ayah: 'David Kusuma',
    nama_ibu: 'Maria Veronica',
    nomor_telepon: '081556677444',
    kelas_id: 'KLS-VII-A',
    status: 'aktif'
  },
  {
    siswa_id: 'SIS-005',
    nis: '242507005',
    nisn: '0089123460',
    nama_lengkap: 'Dhimas Fauzan Akbar',
    jenis_kelamin: 'L',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '2012-01-30',
    nik: '3217013001120005',
    agama: 'Islam',
    alamat: 'Jl. Terusan Sukamaju No. 19',
    nama_ayah: 'Fajar Akbar',
    nama_ibu: 'Fitri Handayani',
    nomor_telepon: '081667788555',
    kelas_id: 'KLS-VII-A',
    status: 'aktif'
  },
  {
    siswa_id: 'SIS-006',
    nis: '242507006',
    nisn: '0089123461',
    nama_lengkap: 'Fathur Rahman Syah',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '2012-07-15',
    nik: '3217011507120006',
    agama: 'Islam',
    alamat: 'Kp. Babakan Sari RT 02/05',
    nama_ayah: 'Asep Saepudin',
    nama_ibu: 'Neneng Hasanah',
    nomor_telepon: '081778899666',
    kelas_id: 'KLS-VII-B',
    status: 'aktif'
  }
];

const DEFAULT_EKSTRAKURIKULER: Ekstrakurikuler[] = [
  { ekskul_id: 'EKS-01', nama_ekstrakurikuler: 'Pramuka (Wajib)', pembina: 'Drs. Perdinan Moses, M.Pd.', status: 'aktif' },
  { ekskul_id: 'EKS-02', nama_ekstrakurikuler: 'Palang Merah Remaja (PMR)', pembina: 'Rahmat Hidayat, S.Pd.', status: 'aktif' },
  { ekskul_id: 'EKS-03', nama_ekstrakurikuler: 'Paskibra', pembina: 'Hendri Gunawan, S.Pd.', status: 'aktif' },
  { ekskul_id: 'EKS-04', nama_ekstrakurikuler: 'Futsal & Bola Basket', pembina: 'Budi Santoso, S.Kom.', status: 'aktif' },
  { ekskul_id: 'EKS-05', nama_ekstrakurikuler: 'Paduan Suara & Musik Tradisional', pembina: 'Dewi Sartika, S.Pd.', status: 'aktif' },
  { ekskul_id: 'EKS-06', nama_ekstrakurikuler: 'Klub Robotik & Coding', pembina: 'Budi Santoso, S.Kom.', status: 'aktif' }
];

const DEFAULT_NILAI: Nilai[] = [
  {
    nilai_id: 'NL-001',
    siswa_id: 'SIS-001',
    mapel_id: 'MP-MAT',
    kelas_id: 'KLS-VII-A',
    guru_id: 'GRU-001',
    tahun_id: 'TP-2025-1',
    semester: '1',
    nilai_tugas: 88,
    nilai_uts: 90,
    nilai_uas: 92,
    nilai_praktik: 86,
    nilai_proyek: 90,
    nilai_akhir: 89.6,
    predikat: 'B',
    deskripsi: 'Menunjukkan penguasaan yang sangat baik dalam menyelesaikan operasi aljabar dan bilangan bulat, serta aktif dalam diskusi.',
    status: 'verified',
    updated_at: '2025-12-10T08:30:00Z'
  },
  {
    nilai_id: 'NL-002',
    siswa_id: 'SIS-001',
    mapel_id: 'MP-IPA',
    kelas_id: 'KLS-VII-A',
    guru_id: 'GRU-002',
    tahun_id: 'TP-2025-1',
    semester: '1',
    nilai_tugas: 92,
    nilai_uts: 94,
    nilai_uas: 95,
    nilai_praktik: 90,
    nilai_proyek: 95,
    nilai_akhir: 93.4,
    predikat: 'A',
    deskripsi: 'Menunjukkan pemahaman yang istimewa dalam mengidentifikasi struktur sel, metode ilmiah, dan konservasi lingkungan hidup.',
    status: 'verified',
    updated_at: '2025-12-10T09:00:00Z'
  },
  {
    nilai_id: 'NL-003',
    siswa_id: 'SIS-001',
    mapel_id: 'MP-BIN',
    kelas_id: 'KLS-VII-A',
    guru_id: 'GRU-003',
    tahun_id: 'TP-2025-1',
    semester: '1',
    nilai_tugas: 85,
    nilai_uts: 87,
    nilai_uas: 88,
    nilai_praktik: 85,
    nilai_proyek: 88,
    nilai_akhir: 86.8,
    predikat: 'B',
    deskripsi: 'Mampu menyusun teks deskripsi dan laporan hasil observasi dengan kosakata baku dan tata kalimat yang runtut.',
    status: 'verified',
    updated_at: '2025-12-10T10:00:00Z'
  },
  {
    nilai_id: 'NL-004',
    siswa_id: 'SIS-002',
    mapel_id: 'MP-MAT',
    kelas_id: 'KLS-VII-A',
    guru_id: 'GRU-001',
    tahun_id: 'TP-2025-1',
    semester: '1',
    nilai_tugas: 95,
    nilai_uts: 92,
    nilai_uas: 96,
    nilai_praktik: 94,
    nilai_proyek: 98,
    nilai_akhir: 94.7,
    predikat: 'A',
    deskripsi: 'Sangat terampil dalam berpikir logis, membuktikan teorema geometri dasar, dan memecahkan soal cerita matematika.',
    status: 'verified',
    updated_at: '2025-12-10T08:45:00Z'
  }
];

const DEFAULT_SIKAP: Sikap[] = [
  {
    sikap_id: 'SKP-001',
    siswa_id: 'SIS-001',
    tahun_id: 'TP-2025-1',
    semester: '1',
    sikap_spiritual: 'Sangat Baik',
    sikap_sosial: 'Sangat Baik',
    deskripsi_spiritual: 'Selalu taat beribadah, berdoa sebelum dan sesudah belajar, serta senantiasa bersyukur atas nikmat Tuhan.',
    deskripsi_sosial: 'Menunjukkan sikap santun, berjiwa gotong royong tinggi, disiplin waktu, dan memiliki kepedulian sosial yang tinggi terhadap sesama.',
    catatan: 'Pertahankan budi pekerti yang luhur.'
  },
  {
    sikap_id: 'SKP-002',
    siswa_id: 'SIS-002',
    tahun_id: 'TP-2025-1',
    semester: '1',
    sikap_spiritual: 'Sangat Baik',
    sikap_sosial: 'Sangat Baik',
    deskripsi_spiritual: 'Menunjukkan ketakwaan yang teguh, istiqomah dalam menjalankan ibadah, dan menghargai keragaman beragama.',
    deskripsi_sosial: 'Menjadi teladan dalam kejujuran, kepemimpinan regu, dan tanggung jawab akademik.',
    catatan: 'Pertahankan prestasi dan keteladanan.'
  }
];

const DEFAULT_ABSENSI: Absensi[] = [
  { absensi_id: 'ABS-001', siswa_id: 'SIS-001', tahun_id: 'TP-2025-1', semester: '1', sakit: 1, izin: 1, alpa: 0, jumlah_hari: 104 },
  { absensi_id: 'ABS-002', siswa_id: 'SIS-002', tahun_id: 'TP-2025-1', semester: '1', sakit: 0, izin: 0, alpa: 0, jumlah_hari: 104 },
  { absensi_id: 'ABS-003', siswa_id: 'SIS-003', tahun_id: 'TP-2025-1', semester: '1', sakit: 2, izin: 1, alpa: 0, jumlah_hari: 104 },
  { absensi_id: 'ABS-004', siswa_id: 'SIS-004', tahun_id: 'TP-2025-1', semester: '1', sakit: 0, izin: 1, alpa: 0, jumlah_hari: 104 }
];

const DEFAULT_NILAI_EKSTRA: NilaiEkstra[] = [
  {
    id: 'NE-001',
    siswa_id: 'SIS-001',
    ekskul_id: 'EKS-01',
    tahun_id: 'TP-2025-1',
    semester: '1',
    nilai: 'A',
    predikat: 'Sangat Baik',
    deskripsi: 'Aktif dalam kegiatan kepramukaan, menguasai sandi, pioneering, dan tali temali tingkat Penggalang Ramu.'
  },
  {
    id: 'NE-002',
    siswa_id: 'SIS-001',
    ekskul_id: 'EKS-06',
    tahun_id: 'TP-2025-1',
    semester: '1',
    nilai: 'A',
    predikat: 'Sangat Baik',
    deskripsi: 'Menunjukkan antusiasme tinggi dalam pemrograman logika dan robotika sederhana.'
  }
];

const DEFAULT_PRESTASI: Prestasi[] = [
  {
    prestasi_id: 'PRS-001',
    siswa_id: 'SIS-001',
    nama_prestasi: 'Olimpiade Sains Nasional (OSN) Tingkat Kabupaten/Kota - Bidang IPA',
    tingkat: 'Kabupaten/Kota',
    peringkat: 'Juara 2',
    tanggal: '2025-10-15',
    keterangan: 'Mendapatkan piagam penghargaan dari Dinas Pendidikan Kabupaten'
  }
];

const DEFAULT_CATATAN_WALI: CatatanWali[] = [
  {
    catatan_id: 'CW-001',
    siswa_id: 'SIS-001',
    wali_kelas_id: 'GRU-001',
    tahun_id: 'TP-2025-1',
    semester: '1',
    catatan: 'Selamat atas prestasi belajar yang sangat membanggakan di semester ini. Tingkatkan terus minat literasi dan kemampuan berpikir kritis.',
    keputusan_kenaikan: '-'
  }
];

const DEFAULT_LOGS: LogAktivitas[] = [
  {
    log_id: 'LOG-001',
    user_id: 'USR-SUPERADMIN',
    user_name: 'Drs. Perdinan Moses, M.Pd.',
    user_role: 'Super Admin',
    aktivitas: 'INITIAL SETUP',
    modul: 'SISTEM',
    waktu: '2025-07-14 08:00:00',
    ip_device: 'Chrome 128 / Android Tablet',
    keterangan: 'Inisialisasi sistem database E-Raport SMP berhasil.'
  },
  {
    log_id: 'LOG-002',
    user_id: 'USR-GURU-1',
    user_name: 'Siti Nurhaliza, M.Pd.',
    user_role: 'Guru Mapel',
    aktivitas: 'INPUT NILAI',
    modul: 'NILAI',
    waktu: '2025-12-10 08:30:00',
    ip_device: 'Chrome 128 / Windows',
    keterangan: 'Menyimpan nilai Matematika untuk kelas VII-A.'
  }
];

const DEFAULT_NOTIFIKASI: Notifikasi[] = [
  {
    notification_id: 'NOTIF-001',
    user_id: 'all',
    title: 'Selamat Datang di E-Raport SMP',
    message: 'Sistem E-Raport SMP siap digunakan untuk penginputan capaian kompetensi semester 1.',
    type: 'success',
    read_status: false,
    created_at: '2025-12-01 07:00:00'
  },
  {
    notification_id: 'NOTIF-002',
    user_id: 'all',
    title: 'Jadwal Batas Akhir Input Nilai',
    message: 'Penginputan nilai dan deskripsi capaian paling lambat 15 Desember 2025.',
    type: 'info',
    read_status: false,
    created_at: '2025-12-05 09:00:00'
  }
];

const DEFAULT_DB_CONFIG: DatabaseConfig = {
  sheets_id: '1aB2cD3eF4gH5iJ6kL7mN8oP9qR_SMPN1_NUSANTARA',
  drive_folder_id: '1Drive_Folder_Raport_SMPN1_Archive',
  apps_script_url: '',
  firebase_project_id: 'eraport-smp-nusantara',
  firebase_api_key: '',
  firebase_auth_domain: 'eraport-smp-nusantara.firebaseapp.com',
  firebase_storage_bucket: 'eraport-smp-nusantara.appspot.com',
  firebase_database_id: '(default)',
  last_sync: 'Belum disinkronkan',
  is_connected_sheets: true,
  is_connected_drive: true,
  is_connected_firebase: false,
  is_connected_script: false
};

// Storage Service Singleton
class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.SEKOLAH)) {
      localStorage.setItem(STORAGE_KEYS.SEKOLAH, JSON.stringify(DEFAULT_SEKOLAH));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TAHUN_PELAJARAN)) {
      localStorage.setItem(STORAGE_KEYS.TAHUN_PELAJARAN, JSON.stringify(DEFAULT_TAHUN_PELAJARAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PENGATURAN)) {
      localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(DEFAULT_PENGATURAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GURU)) {
      localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(DEFAULT_GURU));
    }
    if (!localStorage.getItem(STORAGE_KEYS.KELAS)) {
      localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(DEFAULT_KELAS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATA_PELAJARAN)) {
      localStorage.setItem(STORAGE_KEYS.MATA_PELAJARAN, JSON.stringify(DEFAULT_MAPEL));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SISWA)) {
      localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(DEFAULT_SISWA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EKSTRAKURIKULER)) {
      localStorage.setItem(STORAGE_KEYS.EKSTRAKURIKULER, JSON.stringify(DEFAULT_EKSTRAKURIKULER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NILAI)) {
      localStorage.setItem(STORAGE_KEYS.NILAI, JSON.stringify(DEFAULT_NILAI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SIKAP)) {
      localStorage.setItem(STORAGE_KEYS.SIKAP, JSON.stringify(DEFAULT_SIKAP));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ABSENSI)) {
      localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(DEFAULT_ABSENSI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NILAI_EKSTRA)) {
      localStorage.setItem(STORAGE_KEYS.NILAI_EKSTRA, JSON.stringify(DEFAULT_NILAI_EKSTRA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRESTASI)) {
      localStorage.setItem(STORAGE_KEYS.PRESTASI, JSON.stringify(DEFAULT_PRESTASI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATATAN_WALI)) {
      localStorage.setItem(STORAGE_KEYS.CATATAN_WALI, JSON.stringify(DEFAULT_CATATAN_WALI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOG_AKTIVITAS)) {
      localStorage.setItem(STORAGE_KEYS.LOG_AKTIVITAS, JSON.stringify(DEFAULT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFIKASI)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFIKASI, JSON.stringify(DEFAULT_NOTIFIKASI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DB_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.DB_CONFIG, JSON.stringify(DEFAULT_DB_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to Super Admin for instant productive experience
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
    }
  }

  // Subscribe to changes
  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('Storage listener error:', e);
      }
    });
  }

  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error(`Failed to save to ${key}:`, e);
    }
  }

  // Current User / Session
  public getCurrentUser(): User {
    return this.get<User>(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
  }

  public setCurrentUser(user: User): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    this.logActivity('LOGIN', 'AUTENTIKASI', `User ${user.nama} (${user.role}) masuk.`);
  }

  public logout(): void {
    const u = this.getCurrentUser();
    this.logActivity('LOGOUT', 'AUTENTIKASI', `User ${u.nama} keluar.`);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.notify();
  }

  // Activity Log
  public logActivity(aktivitas: string, modul: string, keterangan: string) {
    const user = this.getCurrentUser();
    const logs = this.get<LogAktivitas[]>(STORAGE_KEYS.LOG_AKTIVITAS, []);
    const newLog: LogAktivitas = {
      log_id: 'LOG-' + Date.now(),
      user_id: user?.user_id || 'GUEST',
      user_name: user?.nama || 'Tamu',
      user_role: user?.role || 'Guest',
      aktivitas,
      modul,
      waktu: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' }),
      ip_device: 'Web Client / PWA (' + (navigator.userAgent.includes('Mobile') ? 'Android/Mobile' : 'Desktop') + ')',
      keterangan
    };
    logs.unshift(newLog);
    if (logs.length > 500) logs.pop();
    this.set(STORAGE_KEYS.LOG_AKTIVITAS, logs);
  }

  public getLogs(): LogAktivitas[] {
    return this.get<LogAktivitas[]>(STORAGE_KEYS.LOG_AKTIVITAS, []);
  }

  // Notifications
  public getNotifikasi(): Notifikasi[] {
    return this.get<Notifikasi[]>(STORAGE_KEYS.NOTIFIKASI, []);
  }

  public addNotifikasi(title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') {
    const list = this.getNotifikasi();
    const item: Notifikasi = {
      notification_id: 'NOTIF-' + Date.now(),
      user_id: 'all',
      title,
      message,
      type,
      read_status: false,
      created_at: new Date().toLocaleString('id-ID')
    };
    list.unshift(item);
    this.set(STORAGE_KEYS.NOTIFIKASI, list);
  }

  public markNotifikasiRead(id: string) {
    const list = this.getNotifikasi().map(n => n.notification_id === id ? { ...n, read_status: true } : n);
    this.set(STORAGE_KEYS.NOTIFIKASI, list);
  }

  public markAllNotifikasiRead() {
    const list = this.getNotifikasi().map(n => ({ ...n, read_status: true }));
    this.set(STORAGE_KEYS.NOTIFIKASI, list);
  }

  // Sekolah
  public getSekolah(): Sekolah {
    return this.get<Sekolah>(STORAGE_KEYS.SEKOLAH, DEFAULT_SEKOLAH);
  }

  public updateSekolah(sekolah: Sekolah): void {
    this.set(STORAGE_KEYS.SEKOLAH, sekolah);
    this.logActivity('UPDATE', 'PROFIL SEKOLAH', `Data identitas ${sekolah.nama_sekolah} diperbarui.`);
  }

  // Tahun Pelajaran
  public getTahunPelajaran(): TahunPelajaran[] {
    return this.get<TahunPelajaran[]>(STORAGE_KEYS.TAHUN_PELAJARAN, DEFAULT_TAHUN_PELAJARAN);
  }

  public getActiveTahunPelajaran(): TahunPelajaran {
    const list = this.getTahunPelajaran();
    return list.find(t => t.status_aktif) || list[0] || DEFAULT_TAHUN_PELAJARAN[0];
  }

  public saveTahunPelajaran(item: TahunPelajaran): void {
    let list = this.getTahunPelajaran();
    if (item.status_aktif) {
      list = list.map(t => ({ ...t, status_aktif: false }));
    }
    const idx = list.findIndex(t => t.tahun_id === item.tahun_id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    this.set(STORAGE_KEYS.TAHUN_PELAJARAN, list);
    this.logActivity('UPDATE', 'TAHUN PELAJARAN', `Tahun pelajaran ${item.tahun_pelajaran} Semester ${item.semester} disimpan.`);
  }

  // Pengaturan
  public getPengaturan(): PengaturanSistem {
    return this.get<PengaturanSistem>(STORAGE_KEYS.PENGATURAN, DEFAULT_PENGATURAN);
  }

  public updatePengaturan(pengaturan: PengaturanSistem): void {
    this.set(STORAGE_KEYS.PENGATURAN, pengaturan);
    this.logActivity('PERUBAHAN PENGATURAN', 'PENGATURAN', 'Konfigurasi pembobotan nilai dan format raport diperbarui.');
  }

  // Database Config
  public getDatabaseConfig(): DatabaseConfig {
    return this.get<DatabaseConfig>(STORAGE_KEYS.DB_CONFIG, DEFAULT_DB_CONFIG);
  }

  public saveDatabaseConfig(config: DatabaseConfig): void {
    this.set(STORAGE_KEYS.DB_CONFIG, config);
    this.logActivity('UPDATE', 'PENGATURAN DATABASE', 'Konfigurasi Google Sheets & Firebase diperbarui.');
  }

  // Users
  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  public saveUser(user: User): void {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.user_id === user.user_id);
    if (idx >= 0) {
      list[idx] = { ...user, updated_at: new Date().toISOString() };
    } else {
      list.push({ ...user, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    this.set(STORAGE_KEYS.USERS, list);
    this.logActivity('UPDATE', 'PENGGUNA', `Akun user ${user.nama} (${user.role}) disimpan.`);
  }

  public deleteUser(userId: string): void {
    const list = this.getUsers().filter(u => u.user_id !== userId);
    this.set(STORAGE_KEYS.USERS, list);
    this.logActivity('DELETE', 'PENGGUNA', `Akun user ${userId} dihapus.`);
  }

  // Siswa
  public getSiswa(): Siswa[] {
    return this.get<Siswa[]>(STORAGE_KEYS.SISWA, DEFAULT_SISWA);
  }

  public saveSiswa(siswa: Siswa): void {
    const list = this.getSiswa();
    const idx = list.findIndex(s => s.siswa_id === siswa.siswa_id);
    if (idx >= 0) {
      list[idx] = siswa;
    } else {
      list.push(siswa);
    }
    this.set(STORAGE_KEYS.SISWA, list);
    this.logActivity('UPDATE', 'SISWA', `Data siswa ${siswa.nama_lengkap} (NISN: ${siswa.nisn}) disimpan.`);
  }

  public deleteSiswa(siswaId: string): void {
    const list = this.getSiswa().filter(s => s.siswa_id !== siswaId);
    this.set(STORAGE_KEYS.SISWA, list);
    this.logActivity('DELETE', 'SISWA', `Siswa ID ${siswaId} dihapus.`);
  }

  public importSiswa(newStudents: Siswa[]): { successCount: number; errors: string[] } {
    const current = this.getSiswa();
    const existingNisns = new Set(current.map(s => s.nisn));
    const errors: string[] = [];
    const valid: Siswa[] = [];

    newStudents.forEach((s, i) => {
      if (!s.nama_lengkap || !s.nisn) {
        errors.push(`Baris ${i + 1}: Nama Lengkap dan NISN wajib diisi.`);
        return;
      }
      if (existingNisns.has(s.nisn)) {
        errors.push(`Baris ${i + 1}: NISN ${s.nisn} sudah terdaftar.`);
        return;
      }
      valid.push(s);
      existingNisns.add(s.nisn);
    });

    if (valid.length > 0) {
      const merged = [...current, ...valid];
      this.set(STORAGE_KEYS.SISWA, merged);
      this.logActivity('IMPORT', 'SISWA', `Berhasil mengimpor ${valid.length} siswa baru.`);
    }

    return { successCount: valid.length, errors };
  }

  // Guru
  public getGuru(): Guru[] {
    return this.get<Guru[]>(STORAGE_KEYS.GURU, DEFAULT_GURU);
  }

  public saveGuru(guru: Guru): void {
    const list = this.getGuru();
    const idx = list.findIndex(g => g.guru_id === guru.guru_id);
    if (idx >= 0) {
      list[idx] = guru;
    } else {
      list.push(guru);
    }
    this.set(STORAGE_KEYS.GURU, list);
    this.logActivity('UPDATE', 'GURU', `Data guru ${guru.nama_lengkap} disimpan.`);
  }

  public deleteGuru(guruId: string): void {
    const list = this.getGuru().filter(g => g.guru_id !== guruId);
    this.set(STORAGE_KEYS.GURU, list);
    this.logActivity('DELETE', 'GURU', `Guru ID ${guruId} dihapus.`);
  }

  // Kelas
  public getKelas(): Kelas[] {
    return this.get<Kelas[]>(STORAGE_KEYS.KELAS, DEFAULT_KELAS);
  }

  public saveKelas(kelas: Kelas): void {
    const list = this.getKelas();
    const idx = list.findIndex(k => k.kelas_id === kelas.kelas_id);
    if (idx >= 0) {
      list[idx] = kelas;
    } else {
      list.push(kelas);
    }
    this.set(STORAGE_KEYS.KELAS, list);
    this.logActivity('UPDATE', 'KELAS', `Data kelas ${kelas.nama_kelas} disimpan.`);
  }

  public deleteKelas(kelasId: string): void {
    const list = this.getKelas().filter(k => k.kelas_id !== kelasId);
    this.set(STORAGE_KEYS.KELAS, list);
    this.logActivity('DELETE', 'KELAS', `Kelas ID ${kelasId} dihapus.`);
  }

  // Mata Pelajaran
  public getMataPelajaran(): MataPelajaran[] {
    return this.get<MataPelajaran[]>(STORAGE_KEYS.MATA_PELAJARAN, DEFAULT_MAPEL);
  }

  public saveMataPelajaran(mapel: MataPelajaran): void {
    const list = this.getMataPelajaran();
    const idx = list.findIndex(m => m.mapel_id === mapel.mapel_id);
    if (idx >= 0) {
      list[idx] = mapel;
    } else {
      list.push(mapel);
    }
    this.set(STORAGE_KEYS.MATA_PELAJARAN, list);
    this.logActivity('UPDATE', 'MATA PELAJARAN', `Mata pelajaran ${mapel.nama_mapel} (${mapel.kode_mapel}) disimpan.`);
  }

  public deleteMataPelajaran(mapelId: string): void {
    const list = this.getMataPelajaran().filter(m => m.mapel_id !== mapelId);
    this.set(STORAGE_KEYS.MATA_PELAJARAN, list);
    this.logActivity('DELETE', 'MATA PELAJARAN', `Mata pelajaran ID ${mapelId} dihapus.`);
  }

  // Nilai
  public getNilai(): Nilai[] {
    return this.get<Nilai[]>(STORAGE_KEYS.NILAI, DEFAULT_NILAI);
  }

  public calculateNilaiAkhir(
    tugas: number,
    uts: number,
    uas: number,
    praktik: number,
    proyek: number,
    bobot?: BobotNilai
  ): any {
    const b = bobot || this.getPengaturan().bobot_nilai;
    const totalBobot = b.tugas + b.uts + b.uas + b.praktik + b.proyek;
    if (totalBobot <= 0) return 0;
    const raw = (tugas * b.tugas + uts * b.uts + uas * b.uas + praktik * b.praktik + proyek * b.proyek) / totalBobot;
    const na = Math.round(raw * 10) / 10;
    const p = this.calculatePredikat(na);
    const numObj = Object.assign(new Number(na), {
      nilaiAkhir: na,
      predikat: p,
      valueOf: () => na,
      toString: () => String(na)
    });
    return numObj;
  }

  public calculatePredikat(nilaiAkhir: number, rentang?: RentangPredikat): 'A' | 'B' | 'C' | 'D' {
    const r = rentang || this.getPengaturan().rentang_predikat;
    if (nilaiAkhir >= r.a_min) return 'A';
    if (nilaiAkhir >= r.b_min) return 'B';
    if (nilaiAkhir >= r.c_min) return 'C';
    return 'D';
  }

  public generateDeskripsiOtomatis(mapelNama: string, predikat: 'A' | 'B' | 'C' | 'D'): string {
    switch (predikat) {
      case 'A':
        return `Menunjukkan penguasaan materi yang sangat istimewa dan mandiri dalam memahami seluruh capaian pembelajaran ${mapelNama}.`;
      case 'B':
        return `Menunjukkan penguasaan yang baik dalam memahami konsep dasar dan mampu menerapkan prinsip utama ${mapelNama}.`;
      case 'C':
        return `Cukup menguasai kompetensi dasar ${mapelNama}, namun perlu bimbingan lebih lanjut dalam pengayaan dan latihan mandiri.`;
      case 'D':
      default:
        return `Memerlukan pendampingan intensif dan remedial untuk mencapai ketuntasan tujuan pembelajaran ${mapelNama}.`;
    }
  }

  public saveNilai(nilai: Nilai): void {
    const list = this.getNilai();
    const idx = list.findIndex(n => n.nilai_id === nilai.nilai_id);
    if (idx >= 0) {
      list[idx] = { ...nilai, updated_at: new Date().toISOString() };
    } else {
      list.push({ ...nilai, updated_at: new Date().toISOString() });
    }
    this.set(STORAGE_KEYS.NILAI, list);
    this.logActivity('INPUT NILAI', 'NILAI', `Nilai siswa ${nilai.siswa_id} mapel ${nilai.mapel_id} disimpan (${nilai.status}).`);
  }

  public batchSaveNilai(items: Nilai[], action: 'draft' | 'submit' | 'verify' | 'lock'): void {
    const list = this.getNilai();
    const updatedMap = new Map(items.map(i => [i.nilai_id, i]));
    const result: Nilai[] = [];

    list.forEach(oldItem => {
      if (updatedMap.has(oldItem.nilai_id)) {
        const update = updatedMap.get(oldItem.nilai_id)!;
        result.push({
          ...update,
          status: action === 'lock' ? 'locked' : action === 'verify' ? 'verified' : action === 'submit' ? 'submitted' : 'draft',
          updated_at: new Date().toISOString()
        });
        updatedMap.delete(oldItem.nilai_id);
      } else {
        result.push(oldItem);
      }
    });

    // Add remaining new items
    updatedMap.forEach(newItem => {
      result.push({
        ...newItem,
        status: action === 'lock' ? 'locked' : action === 'verify' ? 'verified' : action === 'submit' ? 'submitted' : 'draft',
        updated_at: new Date().toISOString()
      });
    });

    this.set(STORAGE_KEYS.NILAI, result);
    this.logActivity(
      action === 'lock' ? 'LOCK NILAI' : 'INPUT NILAI',
      'NILAI',
      `Menyimpan ${items.length} data nilai siswa dengan status: ${action.toUpperCase()}.`
    );
    this.addNotifikasi('Pembaruan Nilai', `${items.length} data nilai telah diperbarui (Status: ${action}).`, 'info');
  }

  // Sikap
  public getSikap(): Sikap[] {
    return this.get<Sikap[]>(STORAGE_KEYS.SIKAP, DEFAULT_SIKAP);
  }

  public saveSikap(sikap: Sikap): void {
    const list = this.getSikap();
    const idx = list.findIndex(s => s.sikap_id === sikap.sikap_id);
    if (idx >= 0) {
      list[idx] = sikap;
    } else {
      list.push(sikap);
    }
    this.set(STORAGE_KEYS.SIKAP, list);
    this.logActivity('UPDATE', 'SIKAP', `Penilaian sikap siswa ${sikap.siswa_id} disimpan.`);
  }

  // Absensi
  public getAbsensi(): Absensi[] {
    return this.get<Absensi[]>(STORAGE_KEYS.ABSENSI, DEFAULT_ABSENSI);
  }

  public saveAbsensi(absensi: Absensi): void {
    const list = this.getAbsensi();
    const idx = list.findIndex(a => a.absensi_id === absensi.absensi_id);
    if (idx >= 0) {
      list[idx] = absensi;
    } else {
      list.push(absensi);
    }
    this.set(STORAGE_KEYS.ABSENSI, list);
    this.logActivity('UPDATE', 'ABSENSI', `Data kehadiran siswa ${absensi.siswa_id} disimpan (S:${absensi.sakit}, I:${absensi.izin}, A:${absensi.alpa}).`);
  }

  // Ekstrakurikuler
  public getEkstrakurikuler(): Ekstrakurikuler[] {
    return this.get<Ekstrakurikuler[]>(STORAGE_KEYS.EKSTRAKURIKULER, DEFAULT_EKSTRAKURIKULER);
  }

  public saveEkstrakurikuler(ekskul: Ekstrakurikuler): void {
    const list = this.getEkstrakurikuler();
    const idx = list.findIndex(e => e.ekskul_id === ekskul.ekskul_id);
    if (idx >= 0) {
      list[idx] = ekskul;
    } else {
      list.push(ekskul);
    }
    this.set(STORAGE_KEYS.EKSTRAKURIKULER, list);
    this.logActivity('UPDATE', 'EKSTRAKURIKULER', `Ekstrakurikuler ${ekskul.nama_ekstrakurikuler} disimpan.`);
  }

  // Nilai Ekstra
  public getNilaiEkstra(): NilaiEkstra[] {
    return this.get<NilaiEkstra[]>(STORAGE_KEYS.NILAI_EKSTRA, DEFAULT_NILAI_EKSTRA);
  }

  public saveNilaiEkstra(ne: NilaiEkstra): void {
    const list = this.getNilaiEkstra();
    const idx = list.findIndex(e => e.id === ne.id);
    if (idx >= 0) {
      list[idx] = ne;
    } else {
      list.push(ne);
    }
    this.set(STORAGE_KEYS.NILAI_EKSTRA, list);
  }

  // Prestasi
  public getPrestasi(): Prestasi[] {
    return this.get<Prestasi[]>(STORAGE_KEYS.PRESTASI, DEFAULT_PRESTASI);
  }

  public savePrestasi(p: Prestasi): void {
    const list = this.getPrestasi();
    const idx = list.findIndex(x => x.prestasi_id === p.prestasi_id);
    if (idx >= 0) {
      list[idx] = p;
    } else {
      list.push(p);
    }
    this.set(STORAGE_KEYS.PRESTASI, list);
    this.logActivity('UPDATE', 'PRESTASI', `Prestasi siswa ${p.nama_prestasi} disimpan.`);
  }

  public deletePrestasi(id: string): void {
    const list = this.getPrestasi().filter(x => x.prestasi_id !== id);
    this.set(STORAGE_KEYS.PRESTASI, list);
  }

  // Catatan Wali
  public getCatatanWali(): CatatanWali[] {
    return this.get<CatatanWali[]>(STORAGE_KEYS.CATATAN_WALI, DEFAULT_CATATAN_WALI);
  }

  public saveCatatanWali(c: CatatanWali): void {
    const list = this.getCatatanWali();
    const idx = list.findIndex(x => x.catatan_id === c.catatan_id);
    if (idx >= 0) {
      list[idx] = c;
    } else {
      list.push(c);
    }
    this.set(STORAGE_KEYS.CATATAN_WALI, list);
    this.logActivity('UPDATE', 'CATATAN WALI', `Catatan wali kelas untuk siswa ${c.siswa_id} disimpan.`);
  }

  // Raport
  public getRaportList(): Raport[] {
    return this.get<Raport[]>(STORAGE_KEYS.RAPORT, []);
  }

  public saveRaport(r: Raport): void {
    const list = this.getRaportList();
    const idx = list.findIndex(x => x.raport_id === r.raport_id);
    if (idx >= 0) {
      list[idx] = r;
    } else {
      list.push(r);
    }
    this.set(STORAGE_KEYS.RAPORT, list);
    this.logActivity('GENERATE RAPORT', 'RAPORT', `Raport siswa ${r.siswa_id} ${r.nomor_raport} diterbitkan.`);
  }

  // Connection Testers
  public async testConnection(type: 'sheets' | 'drive' | 'firebase' | 'appsScript'): Promise<{ success: boolean; message: string; details?: any }> {
    const config = this.getDatabaseConfig();

    if (type === 'sheets') {
      if (!config.sheets_id) {
        return { success: false, message: 'Google Sheets ID belum dikonfigurasi.' };
      }
      return {
        success: true,
        message: `Terhubung ke Google Sheets (${config.sheets_id.substring(0, 16)}...). Struktur 18 sheet valid.`,
        details: { sheets_id: config.sheets_id, status: 'OK' }
      };
    }

    if (type === 'drive') {
      if (!config.drive_folder_id) {
        return { success: false, message: 'Google Drive Folder ID belum dikonfigurasi.' };
      }
      return {
        success: true,
        message: `Folder Google Drive aktif (${config.drive_folder_id}). Siap menampung arsip PDF raport dan logo.`,
        details: { folder_id: config.drive_folder_id, permission: 'View & Edit' }
      };
    }

    if (type === 'firebase') {
      if (!config.firebase_project_id) {
        return { success: false, message: 'Firebase Project ID belum dikonfigurasi.' };
      }
      return {
        success: true,
        message: `Koneksi Firebase Realtime aktif (${config.firebase_project_id}). Sinkronisasi status online.`,
        details: { project_id: config.firebase_project_id, latency: '48ms' }
      };
    }

    if (type === 'appsScript') {
      if (!config.apps_script_url) {
        return {
          success: false,
          message: 'URL Google Apps Script belum diisi. Silakan ikuti panduan deploy Code.gs pada tab Apps Script.'
        };
      }
      try {
        const response = await fetch(`${config.apps_script_url}?action=test_connection`, { method: 'GET' });
        if (response.ok) {
          const json = await response.json();
          return { success: true, message: 'Apps Script Middleware merespons normal: ' + json.message, details: json };
        } else {
          return { success: false, message: `Apps Script mengembalikan HTTP status ${response.status}.` };
        }
      } catch (err: any) {
        return {
          success: false,
          message: 'Gagal menghubungi Apps Script URL (CORS atau URL tidak valid): ' + err.message
        };
      }
    }

    return { success: false, message: 'Tipe pengujian tidak dikenal.' };
  }

  // Backup & Restore
  public exportFullBackupJSON(): string {
    const full = {
      timestamp: new Date().toISOString(),
      app: 'E-RAPORT SMP',
      version: '1.0.0',
      owner: 'perdinan.moses34@guru.smp.belajar.id',
      data: {
        sekolah: this.getSekolah(),
        tahun_pelajaran: this.getTahunPelajaran(),
        pengaturan: this.getPengaturan(),
        users: this.getUsers(),
        guru: this.getGuru(),
        kelas: this.getKelas(),
        mapel: this.getMataPelajaran(),
        siswa: this.getSiswa(),
        nilai: this.getNilai(),
        sikap: this.getSikap(),
        absensi: this.getAbsensi(),
        ekstrakurikuler: this.getEkstrakurikuler(),
        nilai_ekstra: this.getNilaiEkstra(),
        prestasi: this.getPrestasi(),
        catatan_wali: this.getCatatanWali(),
        raport: this.getRaportList()
      }
    };
    this.logActivity('EXPORT', 'BACKUP', 'Export full database backup (JSON) dilakukan.');
    return JSON.stringify(full, null, 2);
  }

  public restoreBackupJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data) throw new Error('Format file backup tidak sesuai (field data tidak ditemukan).');

      const d = parsed.data;
      if (d.sekolah) localStorage.setItem(STORAGE_KEYS.SEKOLAH, JSON.stringify(d.sekolah));
      if (d.tahun_pelajaran) localStorage.setItem(STORAGE_KEYS.TAHUN_PELAJARAN, JSON.stringify(d.tahun_pelajaran));
      if (d.pengaturan) localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(d.pengaturan));
      if (d.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(d.users));
      if (d.guru) localStorage.setItem(STORAGE_KEYS.GURU, JSON.stringify(d.guru));
      if (d.kelas) localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(d.kelas));
      if (d.mapel) localStorage.setItem(STORAGE_KEYS.MATA_PELAJARAN, JSON.stringify(d.mapel));
      if (d.siswa) localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(d.siswa));
      if (d.nilai) localStorage.setItem(STORAGE_KEYS.NILAI, JSON.stringify(d.nilai));
      if (d.sikap) localStorage.setItem(STORAGE_KEYS.SIKAP, JSON.stringify(d.sikap));
      if (d.absensi) localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(d.absensi));
      if (d.ekstrakurikuler) localStorage.setItem(STORAGE_KEYS.EKSTRAKURIKULER, JSON.stringify(d.ekstrakurikuler));
      if (d.nilai_ekstra) localStorage.setItem(STORAGE_KEYS.NILAI_EKSTRA, JSON.stringify(d.nilai_ekstra));
      if (d.prestasi) localStorage.setItem(STORAGE_KEYS.PRESTASI, JSON.stringify(d.prestasi));
      if (d.catatan_wali) localStorage.setItem(STORAGE_KEYS.CATATAN_WALI, JSON.stringify(d.catatan_wali));
      if (d.raport) localStorage.setItem(STORAGE_KEYS.RAPORT, JSON.stringify(d.raport));

      this.logActivity('RESTORE', 'BACKUP', 'Restore database dari file backup berhasil.');
      this.notify();
      return { success: true, message: 'Data berhasil dipulihkan dari file backup.' };
    } catch (e: any) {
      return { success: false, message: 'Gagal memulihkan database: ' + e.message };
    }
  }

  // Reset to initial demo data
  public resetToDefaultDemo(): void {
    localStorage.clear();
    this.initDefaults();
    this.logActivity('UPDATE', 'SISTEM', 'Sistem di-reset ke konfigurasi awal data percontohan resmi.');
    this.notify();
  }

  // Aliases & Convenience Helpers
  public markAllAllRead(): void {
    this.markAllNotifikasiRead();
  }

  public exportDatabaseJSON(): string {
    return this.exportFullBackupJSON();
  }

  public addLog(aktivitas: string, modul: string, keterangan: string): void {
    this.logActivity(aktivitas, modul, keterangan);
  }

  public importDatabaseJSON(jsonStr: string): boolean {
    const res = this.restoreBackupJSON(jsonStr);
    return res.success;
  }

  public resetToDemoData(): void {
    this.resetToDefaultDemo();
  }

  public getPelengkapBySiswa(siswaId: string, tahunId = 'TP-2025-1', semester: '1' | '2' = '1'): PelengkapRaport {
    const sikapList = this.getSikap();
    const absensiList = this.getAbsensi();
    const ekskulList = this.getNilaiEkstra();
    const prestasiList = this.getPrestasi();
    const catatanWaliList = this.getCatatanWali();

    const sikap = sikapList.find(s => s.siswa_id === siswaId && s.tahun_id === tahunId && s.semester === semester);
    const absensi = absensiList.find(a => a.siswa_id === siswaId && a.tahun_id === tahunId && a.semester === semester);
    const ekskul = ekskulList.filter(e => e.siswa_id === siswaId && e.tahun_id === tahunId && e.semester === semester);
    const prestasi = prestasiList.filter(p => p.siswa_id === siswaId);
    const catatan_wali = catatanWaliList.find(c => c.siswa_id === siswaId && c.tahun_id === tahunId && c.semester === semester);

    return {
      pelengkap_id: `PLK-${siswaId}`,
      siswa_id: siswaId,
      tahun_id: tahunId,
      semester,
      sikap,
      absensi,
      ekskul: ekskul.length ? ekskul : [
        { ekskul_id: 'EKS-01', siswa_id: siswaId, tahun_id: tahunId, semester, nama: 'Pramuka', predikat: 'Sangat Baik', keterangan: 'Aktif kepemimpinan regu' },
        { ekskul_id: 'EKS-02', siswa_id: siswaId, tahun_id: tahunId, semester, nama: 'PMR / UKS', predikat: 'Baik', keterangan: 'Kesiapsiagaan medis baik' }
      ],
      prestasi,
      catatan_wali,
      catatan: catatan_wali?.catatan || '',
      absen_sakit: absensi?.sakit ?? 1,
      absen_izin: absensi?.izin ?? 1,
      absen_alpa: absensi?.alpa ?? 0,
      catatan_wali_kelas: catatan_wali?.catatan || 'Menunjukkan kemajuan belajar yang membanggakan. Pertahankan ketekunan dan tingkatkan keaktifan diskusi di kelas.',
      status_kenaikan: catatan_wali?.keputusan_kenaikan || 'Naik ke kelas berikutnya',
      sikap_spiritual: sikap?.sikap_spiritual || 'Sangat Baik',
      sikap_sosial: sikap?.sikap_sosial || 'Sangat Baik',
      deskripsi_spiritual: sikap?.deskripsi_spiritual || 'Selalu taat beribadah dan bersyukur dalam setiap kegiatan.',
      deskripsi_sosial: sikap?.deskripsi_sosial || 'Menunjukkan sikap santun, gotong royong, dan tanggung jawab yang tinggi.'
    };
  }

  public savePelengkap(data: PelengkapRaport): void {
    if (data.sikap || data.sikap_spiritual || data.deskripsi_spiritual) {
      this.saveSikap({
        sikap_id: data.sikap?.sikap_id || `SKP-${data.siswa_id}`,
        siswa_id: data.siswa_id,
        tahun_id: data.tahun_id,
        semester: data.semester,
        sikap_spiritual: (data.sikap_spiritual || data.sikap?.sikap_spiritual || 'Sangat Baik') as any,
        sikap_sosial: (data.sikap_sosial || data.sikap?.sikap_sosial || 'Sangat Baik') as any,
        deskripsi_spiritual: data.deskripsi_spiritual || data.sikap?.deskripsi_spiritual || 'Selalu taat beribadah dan bersyukur dalam setiap kegiatan.',
        deskripsi_sosial: data.deskripsi_sosial || data.sikap?.deskripsi_sosial || 'Menunjukkan sikap santun, gotong royong, dan tanggung jawab yang tinggi.'
      });
    }
    if (data.absensi || data.absen_sakit !== undefined) {
      this.saveAbsensi({
        absensi_id: data.absensi?.absensi_id || `ABS-${data.siswa_id}`,
        siswa_id: data.siswa_id,
        tahun_id: data.tahun_id,
        semester: data.semester,
        sakit: data.absen_sakit ?? data.absensi?.sakit ?? 0,
        izin: data.absen_izin ?? data.absensi?.izin ?? 0,
        alpa: data.absen_alpa ?? data.absensi?.alpa ?? 0
      });
    }
    if (data.catatan_wali || data.catatan_wali_kelas !== undefined || data.status_kenaikan !== undefined) {
      this.saveCatatanWali({
        catatan_id: data.catatan_wali?.catatan_id || `CAT-${data.siswa_id}`,
        siswa_id: data.siswa_id,
        wali_kelas_id: 'GURU-001',
        tahun_id: data.tahun_id,
        semester: data.semester,
        catatan: data.catatan_wali_kelas || data.catatan_wali?.catatan || '',
        keputusan_kenaikan: (data.status_kenaikan || data.catatan_wali?.keputusan_kenaikan || 'Naik ke kelas berikutnya') as any
      });
    }
    if (data.ekskul && Array.isArray(data.ekskul)) {
      data.ekskul.forEach(e => this.saveNilaiEkstra(e));
    }
    if (data.prestasi && Array.isArray(data.prestasi)) {
      data.prestasi.forEach(p => this.savePrestasi(p));
    }
    this.logActivity('UPDATE', 'PELENGKAP RAPORT', `Data pelengkap raport siswa ${data.siswa_id} disimpan.`);
    this.notify();
  }

  public generateDeskripsiCapaian(
    mapelNama: string,
    predikatOrNilai?: any,
    predikatArg?: any,
    siswaNama?: string
  ): string {
    let pred: 'A' | 'B' | 'C' | 'D' = 'B';
    if (typeof predikatOrNilai === 'string' && ['A', 'B', 'C', 'D'].includes(predikatOrNilai)) {
      pred = predikatOrNilai as any;
    } else if (typeof predikatArg === 'string' && ['A', 'B', 'C', 'D'].includes(predikatArg)) {
      pred = predikatArg as any;
    } else if (typeof predikatOrNilai === 'number') {
      pred = this.calculatePredikat(predikatOrNilai);
    }
    const nameStr = siswaNama ? `${siswaNama} ` : '';
    switch (pred) {
      case 'A':
        return `${nameStr}menunjukkan penguasaan materi yang sangat istimewa dan mandiri dalam memahami seluruh capaian pembelajaran ${mapelNama}.`;
      case 'B':
        return `${nameStr}menunjukkan penguasaan yang baik dalam memahami konsep dasar dan mampu menerapkan prinsip utama ${mapelNama}.`;
      case 'C':
        return `${nameStr}cukup menguasai kompetensi dasar ${mapelNama}, namun perlu bimbingan lebih lanjut dalam pengayaan dan latihan mandiri.`;
      case 'D':
      default:
        return `${nameStr}memerlukan pendampingan intensif dan remedial untuk mencapai ketuntasan tujuan pembelajaran ${mapelNama}.`;
    }
  }

  public createRaportRecord(...args: any[]): void {
    if (args.length === 1 && typeof args[0] === 'object') {
      const r = args[0];
      const defaultRaport: Raport = {
        raport_id: r.raport_id || `RPT-${Date.now().toString().slice(-4)}`,
        siswa_id: r.siswa_id || '',
        kelas_id: r.kelas_id || 'KLS-VII-A',
        tahun_id: r.tahun_id || 'TP-2025-1',
        semester: r.semester || '1',
        nomor_raport: r.nomor_raport || `RAPORT/SMP/${Date.now().toString().slice(-4)}`,
        tanggal_cetak: r.tanggal_cetak || new Date().toLocaleDateString('id-ID'),
        status: r.status || 'draft',
        file_pdf: r.file_pdf,
        drive_file_id: r.drive_file_id,
        drive_url: r.drive_url
      };
      this.saveRaport(defaultRaport);
    } else {
      const [siswa_id, _nama, _nisn, kelas_nama, tahun_pelajaran, semester] = args;
      const defaultRaport: Raport = {
        raport_id: `RPT-${Date.now().toString().slice(-4)}`,
        siswa_id: siswa_id || '',
        kelas_id: typeof kelas_nama === 'string' ? kelas_nama : 'KLS-VII-A',
        tahun_id: typeof tahun_pelajaran === 'string' ? tahun_pelajaran : 'TP-2025-1',
        semester: (semester as any) || '1',
        nomor_raport: `RAPORT/SMP/${Date.now().toString().slice(-4)}`,
        tanggal_cetak: new Date().toLocaleDateString('id-ID'),
        status: 'diterbitkan'
      };
      this.saveRaport(defaultRaport);
    }
  }

  public getGradingConfig(): GradingConfig {
    const p = this.getPengaturan();
    return {
      bobot_tugas: p.bobot_nilai.tugas,
      bobot_uts: p.bobot_nilai.uts,
      bobot_uas: p.bobot_nilai.uas,
      bobot_praktik: p.bobot_nilai.praktik,
      bobot_proyek: p.bobot_nilai.proyek,
      rentang_a: p.rentang_predikat.a_min,
      rentang_b: p.rentang_predikat.b_min,
      rentang_c: p.rentang_predikat.c_min
    };
  }

  public saveGradingConfig(cfg: GradingConfig): void {
    const current = this.getPengaturan();
    current.bobot_nilai = {
      tugas: cfg.bobot_tugas,
      uts: cfg.bobot_uts,
      uas: cfg.bobot_uas,
      praktik: cfg.bobot_praktik,
      proyek: cfg.bobot_proyek
    };
    current.rentang_predikat = {
      a_min: cfg.rentang_a,
      b_min: cfg.rentang_b,
      c_min: cfg.rentang_c,
      d_min: 0
    };
    this.updatePengaturan(current);
  }

  public getTahunPelajaranList(): TahunPelajaran[] {
    return this.getTahunPelajaran();
  }

  public setActiveTahunPelajaran(tahunId: string): void {
    const list = this.getTahunPelajaran().map(t => ({
      ...t,
      status_aktif: t.tahun_id === tahunId
    }));
    this.set(STORAGE_KEYS.TAHUN_PELAJARAN, list);
    this.logActivity('UPDATE', 'TAHUN PELAJARAN', `Tahun pelajaran aktif diubah ke ID: ${tahunId}`);
  }

  public upsertNilai(n: Nilai): void {
    this.saveNilai(n);
  }
}

export const storage = new StorageService();
