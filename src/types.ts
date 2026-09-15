// E-RAPORT SMP - Master Types & Interfaces

export type UserRole = 'super_admin' | 'admin' | 'guru' | 'wali_kelas' | 'siswa' | 'orang_tua';

export interface User {
  user_id: string;
  username: string;
  nama: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  status: 'aktif' | 'nonaktif';
  guru_id?: string;
  siswa_id?: string;
  kelas_id?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Sekolah {
  sekolah_id: string;
  nama_sekolah: string;
  npsn: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;
  telepon: string;
  email: string;
  website: string;
  logo_url: string;
  kepala_sekolah: string;
  nip_kepala_sekolah: string;
  tanda_tangan_url?: string;
  stempel_url?: string;
}

export interface TahunPelajaran {
  tahun_id: string;
  tahun_pelajaran: string; // e.g. "2025/2026"
  semester: '1' | '2'; // 1=Ganjil, 2=Genap
  tanggal_mulai: string;
  tanggal_selesai: string;
  status_aktif: boolean;
  tanggal_raport: string;
  tempat_raport: string;
}

export interface Siswa {
  siswa_id: string;
  nis: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  nik: string;
  agama: string;
  alamat: string;
  nama_ayah: string;
  nama_ibu: string;
  nomor_telepon: string;
  kelas_id: string;
  status: 'aktif' | 'mutasi' | 'lulus' | 'nonaktif';
  foto_url?: string;
}

export interface Guru {
  guru_id: string;
  nip: string;
  nuptk: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  pendidikan: string;
  mata_pelajaran: string[]; // nama mapel yang diampu
  nomor_telepon: string;
  email: string;
  foto_url?: string;
  status: 'aktif' | 'nonaktif';
  kelas_wali_id?: string; // Jika merupakan wali kelas
}

export interface Kelas {
  kelas_id: string;
  nama_kelas: string; // e.g. "VII-A", "VIII-B", "IX-C"
  tingkat: 7 | 8 | 9;
  jurusan?: string; // e.g. "Umum"
  wali_kelas_id: string;
  tahun_id: string;
  status: 'aktif' | 'nonaktif';
}

export interface MataPelajaran {
  mapel_id: string;
  kode_mapel: string; // e.g. "PAI", "BIN", "MAT", "IPA"
  nama_mapel: string;
  kelompok: 'A' | 'B' | 'Muatan Lokal';
  tingkat: number; // 7, 8, 9, or 0 (semua tingkat)
  jam_pelajaran: number;
  kkm: number; // Kriteria Ketercapaian Tujuan Pembelajaran / KKM, default 75
  status: 'aktif' | 'nonaktif';
}

export type NilaiStatus = 'draft' | 'submitted' | 'verified' | 'locked';

export interface Nilai {
  nilai_id: string;
  siswa_id: string;
  mapel_id: string;
  kelas_id: string;
  guru_id: string;
  tahun_id: string;
  semester: '1' | '2';
  nilai_tugas: number;
  nilai_uts: number;
  nilai_uas: number;
  nilai_praktik: number;
  nilai_proyek: number;
  tugas?: number;
  uts?: number;
  uas?: number;
  praktik?: number;
  proyek?: number;
  nilai_akhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  deskripsi: string;
  status: NilaiStatus;
  updated_at?: string;
}

export interface Sikap {
  sikap_id: string;
  siswa_id: string;
  tahun_id: string;
  semester: '1' | '2';
  sikap_spiritual: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  sikap_sosial: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  deskripsi_spiritual: string;
  deskripsi_sosial: string;
  catatan?: string;
}

export interface Absensi {
  absensi_id: string;
  siswa_id: string;
  tahun_id: string;
  semester: '1' | '2';
  sakit: number;
  izin: number;
  alpa: number;
  jumlah_hari?: number;
}

export interface Ekstrakurikuler {
  ekskul_id: string;
  nama_ekstrakurikuler: string;
  pembina: string;
  status: 'aktif' | 'nonaktif';
}

export interface NilaiEkstra {
  id: string;
  siswa_id: string;
  ekskul_id: string;
  tahun_id: string;
  semester: '1' | '2';
  nilai: string; // 'A', 'B', 'C'
  predikat: string; // 'Sangat Baik', 'Baik'
  deskripsi: string;
}

export interface Prestasi {
  prestasi_id: string;
  siswa_id: string;
  nama_prestasi: string;
  tingkat: 'Sekolah' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  peringkat: string; // 'Juara 1', 'Juara 2', 'Medali Emas'
  tanggal: string;
  keterangan: string;
}

export interface CatatanWali {
  catatan_id: string;
  siswa_id: string;
  wali_kelas_id: string;
  tahun_id: string;
  semester: '1' | '2';
  catatan: string;
  keputusan_kenaikan?: 'Naik ke kelas berikutnya' | 'Tinggal di kelas' | 'Lulus' | 'Belum Lulus' | '-';
}

export interface Raport {
  raport_id: string;
  siswa_id: string;
  kelas_id: string;
  tahun_id: string;
  semester: '1' | '2';
  nomor_raport: string;
  tanggal_cetak: string;
  file_pdf?: string;
  drive_file_id?: string;
  drive_url?: string;
  status: 'draft' | 'diterbitkan' | 'diarsipkan';
}

export interface PelengkapRaport {
  pelengkap_id?: string;
  siswa_id: string;
  tahun_id: string;
  semester: '1' | '2';
  sikap?: Sikap;
  absensi?: Absensi;
  ekskul?: any[];
  prestasi?: any[];
  catatan_wali?: CatatanWali;
  catatan?: string;
  absen_sakit?: number;
  absen_izin?: number;
  absen_alpa?: number;
  catatan_wali_kelas?: string;
  status_kenaikan?: string;
  sikap_spiritual?: string;
  sikap_sosial?: string;
  deskripsi_spiritual?: string;
  deskripsi_sosial?: string;
  updated_at?: string;
}

export interface GradingConfig {
  bobot_tugas: number;
  bobot_uts: number;
  bobot_uas: number;
  bobot_praktik: number;
  bobot_proyek: number;
  rentang_a: number;
  rentang_b: number;
  rentang_c: number;
}

export interface BobotNilai {
  tugas: number; // default 20
  uts: number;   // default 25
  uas: number;   // default 30
  praktik: number; // default 15
  proyek: number;  // default 10
}

export interface RentangPredikat {
  a_min: number; // 90
  b_min: number; // 80
  c_min: number; // 70
  d_min: number; // 0
}

export interface PengaturanSistem {
  bobot_nilai: BobotNilai;
  rentang_predikat: RentangPredikat;
  format_raport: 'kurikulum_merdeka' | 'k13';
  kurikulum: string;
  kop_surat_text: string;
  show_qr_code: boolean;
  show_stempel: boolean;
  tampilkan_ranking: boolean;
  kunci_seluruh_nilai: boolean;
  notifikasi_aktif: boolean;
}

export interface LogAktivitas {
  log_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  aktivitas: string; // 'LOGIN', 'INPUT NILAI', 'LOCK NILAI', 'GENERATE RAPORT', etc.
  modul: string;
  waktu: string;
  ip_device: string;
  keterangan: string;
}

export interface Notifikasi {
  notification_id: string;
  user_id: string; // 'all' or specific user_id
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read_status: boolean;
  created_at: string;
}

export interface DatabaseConfig {
  sheets_id: string;
  drive_folder_id: string;
  apps_script_url: string;
  firebase_project_id: string;
  firebase_api_key: string;
  firebase_auth_domain: string;
  firebase_storage_bucket: string;
  firebase_database_id: string;
  last_sync?: string;
  is_connected_sheets: boolean;
  is_connected_drive: boolean;
  is_connected_firebase: boolean;
  is_connected_script: boolean;
}
