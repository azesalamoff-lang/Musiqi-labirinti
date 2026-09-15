import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  Upload, 
  Trash2, 
  Camera, 
  Image as ImageIcon,
  Sparkles,
  Plus
} from 'lucide-react';
import { 
  getStoredImage, 
  saveStoredImage, 
  deleteStoredImage 
} from '../utils/imageStorage';
import { useConfirm } from './ConfirmDialog';

interface InteractiveImageSlotProps {
  imageKey: string;
  title: string;
  subtitle?: string;
  defaultIcon?: React.ReactNode;
  defaultText?: string;
  shape?: 'circle' | 'rounded' | 'banner';
  size?: 'sm' | 'md' | 'lg';
  showUploadBadge?: boolean;
  onOpenLightbox: (url: string, title: string, subtitle?: string) => void;
  className?: string;
}

export const InteractiveImageSlot: React.FC<InteractiveImageSlotProps> = ({
  imageKey,
  title,
  subtitle,
  defaultIcon,
  defaultText,
  shape = 'rounded',
  size = 'md',
  showUploadBadge = true,
  onOpenLightbox,
  className = ''
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const confirm = useConfirm();

  // Load image on mount and listen to updates
  useEffect(() => {
    let isMounted = true;
    getStoredImage(imageKey).then((data) => {
      if (isMounted) setImageUrl(data);
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; dataUrl: string | null }>;
      if (customEvent.detail?.key === imageKey) {
        setImageUrl(customEvent.detail.dataUrl);
      }
    };

    window.addEventListener('applet-image-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('applet-image-updated', handleUpdate);
    };
  }, [imageKey]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Şəkil faylının həcmi 15 MB-dan böyük olmamalıdır.');
      return;
    }

    setIsLoading(true);
    try {
      const dataUrl = await saveStoredImage(imageKey, file);
      setImageUrl(dataUrl);
    } catch (err) {
      console.error('Şəkli yaddaşda saxlamaq mümkün olmadı:', err);
      alert('Şəkli saxlamaq mümkün olmadı.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm('Bu şəkli/loqonu silmək istəyirsiniz?');
    if (ok) {
      await deleteStoredImage(imageKey);
      setImageUrl(null);
    }
  };

  const handleContainerClick = () => {
    if (imageUrl) {
      onOpenLightbox(imageUrl, title, subtitle);
    } else {
      fileInputRef.current?.click();
    }
  };

  // Dimensions based on size and shape
  const sizeClasses = {
    sm: shape === 'circle' ? 'w-8 h-8 rounded-full' : shape === 'banner' ? 'h-8 px-2 rounded-lg' : 'w-8 h-8 rounded-lg',
    md: shape === 'circle' ? 'w-12 h-12 rounded-full' : shape === 'banner' ? 'h-11 px-3 rounded-xl' : 'w-12 h-12 rounded-xl',
    lg: shape === 'circle' ? 'w-16 h-16 rounded-full' : shape === 'banner' ? 'h-16 px-4 rounded-2xl' : 'w-16 h-16 rounded-2xl',
  }[size];

  return (
    <div className={`relative group inline-flex items-center shrink-0 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Box */}
      <div
        onClick={handleContainerClick}
        className={`${sizeClasses} flex items-center justify-center cursor-pointer transition-all border overflow-hidden relative ${
          imageUrl
            ? 'bg-slate-900 border-amber-500/50 shadow-md shadow-amber-950/20 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20'
            : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/80 hover:border-amber-400/80 text-slate-300'
        }`}
        title={imageUrl ? `${title} (Böyütmək üçün klikləyin)` : `${title} üçün loqo/şəkil yüklə`}
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain p-0.5"
            />
            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-amber-300" />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5 text-center justify-center p-1">
            {defaultIcon || <ImageIcon className="w-4 h-4 text-slate-400" />}
            {defaultText && (
              <span className="text-[11px] font-semibold text-slate-300 hidden sm:inline whitespace-nowrap">
                {defaultText}
              </span>
            )}
            {showUploadBadge && !defaultText && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow">
                +
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subtle Actions Tooltip / Action Buttons on Hover */}
      <div className="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-1 z-20">
        {imageUrl && (
          <button
            onClick={handleDelete}
            className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
            title="Şəkli sil"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
          title={imageUrl ? 'Yeni şəkil ilə əvəz et' : 'Şəkil yüklə'}
        >
          <Camera className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
