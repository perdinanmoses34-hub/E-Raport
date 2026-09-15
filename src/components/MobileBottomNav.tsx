import React from 'react';
import { User } from '../types';
import { LayoutDashboard, Edit3, Printer, Users, MoreHorizontal } from 'lucide-react';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenMenu: () => void;
  currentUser: User;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
  onOpenMenu,
  currentUser
}) => {
  const isTeacherOrAdmin = ['super_admin', 'admin', 'guru', 'wali_kelas'].includes(currentUser.role);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg no-print">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto items-center">
        {/* Beranda */}
        <button
          id="btn-mobile-nav-dashboard"
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition active:scale-90 ${
            currentPage === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Beranda</span>
        </button>

        {/* Input Nilai (or Nilai Siswa) */}
        <button
          id="btn-mobile-nav-nilai"
          onClick={() => onNavigate(isTeacherOrAdmin ? 'input_nilai' : 'dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition active:scale-90 ${
            currentPage === 'input_nilai' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Edit3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isTeacherOrAdmin ? 'Nilai' : 'Capaian'}</span>
        </button>

        {/* Raport */}
        <button
          id="btn-mobile-nav-raport"
          onClick={() => onNavigate('cetak_raport')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition active:scale-90 ${
            currentPage === 'cetak_raport' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Printer className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Raport</span>
        </button>

        {/* Siswa */}
        <button
          id="btn-mobile-nav-siswa"
          onClick={() => onNavigate(isTeacherOrAdmin ? 'data_siswa' : 'pelengkap_raport')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition active:scale-90 ${
            currentPage === 'data_siswa' || currentPage === 'pelengkap_raport'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 font-medium'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isTeacherOrAdmin ? 'Siswa' : 'Kehadiran'}</span>
        </button>

        {/* More Drawer */}
        <button
          id="btn-mobile-nav-menu"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-500 font-medium transition active:scale-90 hover:text-slate-900"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Menu</span>
        </button>
      </div>
    </nav>
  );
};
