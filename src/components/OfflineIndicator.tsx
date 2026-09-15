import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../utils/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur text-slate-950 px-3.5 py-2 text-xs font-bold shadow-2xl border border-amber-400">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Oflayn rejim — Keşlənmiş məlumatlar göstərilir</span>
    </div>
  );
};
