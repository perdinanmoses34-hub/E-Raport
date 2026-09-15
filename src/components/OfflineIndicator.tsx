import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-between sm:justify-start gap-3 rounded-xl bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-medium text-white shadow-xl border border-amber-400"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-100 animate-pulse shrink-0" />
        <span>
          <strong>Mode Offline</strong> — Perubahan disimpan secara lokal dan akan disinkronkan saat koneksi internet kembali.
        </span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-2 py-1 rounded bg-amber-700/80 hover:bg-amber-800 text-[11px] font-semibold flex items-center gap-1 shrink-0"
      >
        <RefreshCw className="w-3 h-3" />
        Muat Ulang
      </button>
    </div>
  );
};
