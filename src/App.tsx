import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { User } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LoginModal } from './components/LoginModal';
import { InitialSetupWizard } from './components/InitialSetupWizard';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { InputNilaiPage } from './pages/InputNilaiPage';
import { PelengkapRaportPage } from './pages/PelengkapRaportPage';
import { CetakRaportPage } from './pages/CetakRaportPage';
import { DataSiswaPage } from './pages/DataSiswaPage';
import { DataGuruPage } from './pages/DataGuruPage';
import { DataKelasPage } from './pages/DataKelasPage';
import { DataMapelPage } from './pages/DataMapelPage';
import { TahunPelajaranPage } from './pages/TahunPelajaranPage';
import { PengaturanSistemPage } from './pages/PengaturanSistemPage';
import { PengaturanDatabasePage } from './pages/PengaturanDatabasePage';
import { BackupRestorePage } from './pages/BackupRestorePage';
import { LogAktivitasPage } from './pages/LogAktivitasPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(storage.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setCurrentUser(storage.getCurrentUser());
    });

    // Check if initial setup wizard should prompt
    const setupDone = localStorage.getItem('eraport_setup_completed');
    if (!setupDone && currentUser.role === 'super_admin') {
      setIsSetupWizardOpen(true);
    }

    return unsub;
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'input_nilai':
        return <InputNilaiPage currentUser={currentUser} />;
      case 'pelengkap_raport':
        return <PelengkapRaportPage currentUser={currentUser} />;
      case 'cetak_raport':
        return <CetakRaportPage currentUser={currentUser} />;
      case 'data_siswa':
        return <DataSiswaPage currentUser={currentUser} />;
      case 'data_guru':
        return <DataGuruPage currentUser={currentUser} />;
      case 'data_kelas':
        return <DataKelasPage currentUser={currentUser} />;
      case 'data_mapel':
        return <DataMapelPage currentUser={currentUser} />;
      case 'tahun_pelajaran':
        return <TahunPelajaranPage currentUser={currentUser} />;
      case 'pengaturan_sistem':
        return <PengaturanSistemPage currentUser={currentUser} />;
      case 'pengaturan_database':
        return <PengaturanDatabasePage currentUser={currentUser} />;
      case 'backup_restore':
        return <BackupRestorePage currentUser={currentUser} />;
      case 'logs':
        return <LogAktivitasPage currentUser={currentUser} />;
      default:
        return <DashboardPage currentUser={currentUser} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Drawer / Desktop Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          currentUser={currentUser}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 lg:pl-72 p-3 sm:p-6 transition-all">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Mobile Touch Navigation (Android PWA optimized) */}
      <MobileBottomNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenMenu={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
      />

      {/* Realtime Offline Banner Indicator */}
      <OfflineIndicator />

      {/* Unified Login & Role Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentPage('dashboard');
        }}
      />

      {/* Super Admin First Setup Wizard */}
      <InitialSetupWizard
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
        onFinish={() => setIsSetupWizardOpen(false)}
      />
    </div>
  );
}
