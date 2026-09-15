import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { InstallAppModal } from './InstallAppModal';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isStandalone, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already running standalone / installed, hide button or keep minimal
  if (isStandalone || isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        id="pwa-install-header-btn"
        onClick={handleClick}
        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
        title="Tətbiqi telefonunuza və ya kompüterinizə quraşdırın"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tətbiqi Quraşdır</span>
        <span className="sm:hidden">Quraşdır</span>
      </button>

      {showModal && <InstallAppModal onClose={() => setShowModal(false)} />}
    </>
  );
};
