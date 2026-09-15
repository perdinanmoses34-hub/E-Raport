import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, show a subtle active badge or hide
  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Aplikasi Terpasang</span>
        <span className="sm:hidden">PWA Aktif</span>
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="btn-install-pwa"
        onClick={install}
        className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-medium shadow-sm hover:from-blue-800 hover:to-indigo-800 transition active:scale-95 ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
        }`}
        title="Pasang E-Raport SMP di perangkat Android atau Komputer Anda"
      >
        <Smartphone className="w-4 h-4 animate-bounce" />
        <span>Install Aplikasi</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition active:scale-95 ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs font-medium'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Install di iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <span>Buka menu <strong>Share</strong> (ikon kotak dengan panah ke atas) di bilah bawah Safari.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <span>Gulir ke bawah dan pilih <strong>"Add to Home Screen"</strong> (Tambahkan ke Layar Utama).</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <span>Sentuh <strong>Add</strong> di pojok kanan atas untuk menyelesaikan instalasi.</span>
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button for Android / Desktop users who haven't triggered beforeinstallprompt yet or installed
  return (
    <button
      id="btn-install-pwa-guide"
      onClick={() => alert('Untuk memasang di perangkat Android: Ketuk titik tiga (menu browser) di pojok kanan atas, lalu pilih "Tambahkan ke Layar Utama" / "Install Aplikasi".')}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 text-blue-700 hover:bg-blue-100 transition active:scale-95 ${
        compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs font-semibold'
      }`}
    >
      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
      <span>Install PWA</span>
    </button>
  );
};
