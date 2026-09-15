import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { TahunPelajaran, User } from '../types';
import { Calendar, Plus, Check, CheckCircle2, Clock } from 'lucide-react';

export const TahunPelajaranPage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [list, setList] = useState<TahunPelajaran[]>(storage.getTahunPelajaranList());
  const [notif, setNotif] = useState('');

  useEffect(() => {
    const unsub = storage.subscribe(() => setList(storage.getTahunPelajaranList()));
    return unsub;
  }, []);

  const handleActivate = (tp: TahunPelajaran) => {
    storage.setActiveTahunPelajaran(tp.tahun_id);
    setNotif(`Tahun Pelajaran ${tp.tahun_pelajaran} Semester ${tp.semester} berhasil diaktifkan!`);
    setTimeout(() => setNotif(''), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Tahun Pelajaran & Semester</h1>
        <p className="text-xs text-slate-500 mt-1">
          Atur tahun pelajaran aktif dan semester yang berlaku untuk seluruh penginputan nilai dan pencetakan raport.
        </p>
      </div>

      {notif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((tp) => (
          <div
            key={tp.tahun_id}
            className={`p-6 rounded-3xl border transition-all ${
              tp.status_aktif
                ? 'bg-blue-50/50 border-blue-300 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${tp.status_aktif ? 'text-blue-600' : 'text-slate-400'}`} />
                <h3 className="font-extrabold text-base text-slate-900">TP {tp.tahun_pelajaran}</h3>
              </div>
              {tp.status_aktif ? (
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SEDANG AKTIF
                </span>
              ) : (
                <button
                  onClick={() => handleActivate(tp)}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs transition active:scale-95"
                >
                  Aktifkan Semester Ini
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Semester:</span>
                <strong className="text-slate-900">
                  Semester {tp.semester} ({tp.semester === '1' ? 'Ganjil' : 'Genap'})
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Tanggal Titimangsa Raport:</span>
                <strong className="text-slate-900">{tp.tanggal_raport}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tempat Titimangsa:</span>
                <strong className="text-slate-900">{tp.tempat_raport}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
