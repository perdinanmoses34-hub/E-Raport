import React from 'react';
import { User, UserRole } from '../types';
import {
  LayoutDashboard, Edit3, Award, Users, GraduationCap,
  BookOpen, School, Calendar, Sliders, Database,
  FileText, Activity, HardDriveDownload, UserCheck, X,
  CheckSquare, Smile, FileSpreadsheet, Printer
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  currentUser
}) => {
  const role = currentUser.role;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    roles: UserRole[];
    badge?: string;
  }

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'UTAMA',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
          roles: ['super_admin', 'admin', 'kepala_sekolah', 'guru', 'wali_kelas', 'siswa', 'orang_tua']
        }
      ]
    },
    {
      title: 'PENILAIAN & RAPORT',
      items: [
        {
          id: 'input_nilai',
          label: 'Input Nilai Siswa',
          icon: <Edit3 className="w-4 h-4" />,
          roles: ['super_admin', 'admin', 'kepala_sekolah', 'guru', 'wali_kelas']
        },
        {
          id: 'pelengkap_raport',
          label: 'Sikap, Absen & Ekskul',
          icon: <Smile className="w-4 h-4" />,
          roles: ['super_admin', 'admin', 'kepala_sekolah', 'wali_kelas']
        },
        {
          id: 'cetak_raport',
          label: 'Cetak & PDF Raport',
          icon: <Printer className="w-4 h-4" />,
          roles: ['super_admin', 'admin', 'kepala_sekolah', 'wali_kelas', 'siswa', 'orang_tua'],
          badge: 'A4 & PDF'
        }
      ]
    },
    {
      title: 'DATA MASTER',
      items: [
        {
          id: 'data_siswa',
          label: 'Data Siswa',
          icon: <GraduationCap className="w-4 h-4" />,
          roles: ['super_admin', 'admin', 'kepala_sekolah', 'guru', 'wali_kelas']
        },
        {
          id: 'data_guru',
          label: 'Data Guru',
          icon: <Users className="w-4 h-4" />,
          roles: ['super_admin', 'admin', 'kepala_sekolah']
        },
        {
          id: 'data_kelas',
          label: 'Data Kelas / Rombel',
          icon: <School className="w-4 h-4" />,
          roles: ['super_admin', 'admin', 'kepala_sekolah']
        },
        {
          id: 'data_mapel',
          label: 'Mata Pelajaran',
          icon: <BookOpen className="w-4 h-4" />,
          roles: ['super_admin', 'admin', 'kepala_sekolah']
        }
      ]
    },
    {
      title: 'PENGATURAN & SISTEM',
      items: [
        {
          id: 'tahun_pelajaran',
          label: 'Tahun Pelajaran',
          icon: <Calendar className="w-4 h-4" />,
          roles: ['super_admin', 'admin', 'kepala_sekolah']
        },
        {
          id: 'pengaturan_sistem',
          label: 'Format & Akun Sekolah',
          icon: <Sliders className="w-4 h-4" />,
          roles: ['super_admin', 'admin']
        },
        {
          id: 'pengaturan_database',
          label: 'Database Cloud',
          icon: <Database className="w-4 h-4" />,
          roles: ['super_admin', 'admin'],
          badge: 'Sheets/FB'
        },
        {
          id: 'backup_restore',
          label: 'Backup & Restore',
          icon: <HardDriveDownload className="w-4 h-4" />,
          roles: ['super_admin', 'admin']
        },
        {
          id: 'logs',
          label: 'Log Aktivitas Audit',
          icon: <Activity className="w-4 h-4" />,
          roles: ['super_admin', 'admin', 'kepala_sekolah']
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity no-print"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out no-print lg:static lg:inset-auto lg:h-screen lg:shrink-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              ER
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base tracking-tight leading-none">
                E-RAPORT SMP
              </h2>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                Sistem Penilaian Resmi
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white font-bold flex items-center justify-center shadow">
            {currentUser.nama.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-xs text-white truncate">{currentUser.nama}</p>
            <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((sec, idx) => {
            const visibleItems = sec.items.filter(item => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx}>
                <h3 className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                  {sec.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map(item => {
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`nav-item-${item.id}`}
                        onClick={() => {
                          onNavigate(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition active:scale-98 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={isActive ? 'text-white' : 'text-slate-400'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                              isActive
                                ? 'bg-blue-800 text-white'
                                : 'bg-slate-800 text-blue-300 border border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 text-center">
          <p className="font-bold text-slate-300">E-RAPORT SMP</p>
          <p className="text-[10px] text-slate-400">Standar Resmi Kurikulum Merdeka</p>
        </div>
      </aside>
    </>
  );
};
